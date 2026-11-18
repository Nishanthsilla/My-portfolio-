"""
The opener's track: 8 s for the logo reel before "Hello World" (see
components/intro-film/montage.ts). Original, synthesised from scratch (NumPy
only): a dark, beat-switching trap beat in the spirit of a stadium rap anthem
(no samples, no melody taken from any song). 150 BPM, D minor, the same key as
the film's score.

One beat = 0.4 s, one bar = 1.6 s:
  0.0 – 1.6  dark and eerie: a low pad, three lonely lead notes, a hiccup
  1.6 – 4.8  switch 1: a long distorted 808 that slides between notes,
             half-time snare, 8th hats with triplet rolls, a sparse dark lead
  4.6 – 4.8  the stop: everything winds down for one 8th note
  4.8 – 8.0  switch 2: harder: busier kicks, back-beat snares, 16th hats,
             the 808 jumping octaves, the lead an octave up; a snare roll in
  8.0        the final hit, as the film cuts in on "Hello World"; its tail
             rings out underneath the score's first notes

It is spliced in at MONTAGE_AT (the very start), so the film's score plays
exactly as before, only MONTAGE_DUR seconds later.
"""
import numpy as np

SR = 48000
MONTAGE_AT, MONTAGE_DUR = 0.0, 8.0  # it opens the intro
BEAT = 0.4
rng = np.random.default_rng(23)


def tt(d):
    return np.arange(int(d * SR)) / SR


def band(x, lo=None, hi=None):
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, n)


def env(n, a=0.002, d=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def kick(g=1.0):
    t = tt(0.35)
    f = 50 + 160 * np.exp(-t / 0.025)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.09)
    click = band(rng.standard_normal(len(t)), lo=3000, hi=10000) * env(len(t), 0.0004, 0.002) * 0.5
    return np.tanh((body + click) * 2.5) * g


def b808(note, d, g=1.0, glide_from=None):
    """A long, slightly distorted 808 that can glide in from another note."""
    t = tt(d)
    f1 = midi(note)
    f = f1 if glide_from is None else midi(glide_from) + (f1 - midi(glide_from)) * (1 - np.exp(-t / 0.06))
    f = f * (1 + 0.8 * np.exp(-t / 0.012))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(1, t / 0.003) * np.exp(-t / (d * 0.7)) * np.minimum(1, (d - t) / 0.03)
    return np.tanh(s * e * 3.0) * g


def clap(g=0.5):
    n = int(0.35 * SR)
    noise = band(rng.standard_normal(n), lo=1000, hi=7000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.009, 0.018, 0.027]):
        i = int(off * SR)
        e[i:] += env(n - i, 0.0005, 0.005 if k < 3 else 0.09)
    snap = np.sin(2 * np.pi * 190 * tt(0.35)) * env(n, 0.001, 0.03) * 0.4
    return (noise * e + snap) * g


def hat(g=0.1, d=0.035, open_=False):
    n = int((0.25 if open_ else d) * SR)
    return band(rng.standard_normal(n), lo=7000, hi=17000) * env(n, 0.0004, (0.08 if open_ else d / 4)) * g


def bell(note, g=0.18, d=0.32):
    """A bright, slightly detuned square bell (the phonk 'cowbell' colour)."""
    t = tt(d)
    s = np.zeros(len(t))
    for ratio, amp in ((1, 1), (1.505, 0.7)):
        ph = midi(note) * ratio * t
        s += amp * np.sign(np.sin(2 * np.pi * ph))
    s = band(s, lo=400, hi=5200)
    return s * env(len(t), 0.001, d * 0.28) * g


def shutter(g=0.1):
    n = int(0.03 * SR)
    a = band(rng.standard_normal(n), lo=3000, hi=11000) * env(n, 0.0003, 0.002)
    b = np.zeros(n)
    i = int(0.011 * SR)
    b[i:] = band(rng.standard_normal(n - i), lo=2000, hi=8000) * env(n - i, 0.0003, 0.003)
    return (a + b * 0.7) * g


def tick(f, g=0.14):
    t = tt(0.1)
    fr = f * (1 + 0.8 * np.exp(-t / 0.01))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(t), 0.0008, 0.025) * g


def riser(d, g=0.25, up=True):
    t = tt(d)
    p = t / d if up else 1 - t / d
    f = 150 * (20 ** p)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    noise = rng.standard_normal(len(t))
    s = band(saw, hi=4500) * 0.5 + band(noise, lo=1500, hi=10000) * 0.6 * p
    return s * (t / d) ** 2.5 * g


def pad(notes, d, g=0.1, hi=1800):
    t = tt(d)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.1, 0, 0.1):
            ff = midi(n) * 2 ** (det / 12)
            s += 2 * ((ff * t + rng.random()) % 1) - 1
    s = band(s / (len(notes) * 3), lo=150, hi=hi)
    e = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.5)
    return s * np.clip(e, 0, 1) * g


def stab(notes, g=0.35, d=1.6):
    t = tt(d)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.12, 0, 0.12):
            ff = midi(n) * 2 ** (det / 12)
            s += 2 * ((ff * t + rng.random()) % 1) - 1
    s = band(s / (len(notes) * 3), lo=120, hi=4200)
    return s * env(len(t), 0.003, d * 0.3) * g


def impact(g=0.9):
    t = tt(2.0)
    f = 32 + 90 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.7)
    air = band(rng.standard_normal(len(t)), lo=200, hi=6000) * env(len(t), 0.001, 0.25) * 0.5
    return np.tanh((body + air) * 1.6) * g


def slide808(notes, d, g=1.0):
    """The long, distorted 808 that slides between notes: notes = [(time, midi), …] within d seconds."""
    t = tt(d)
    f = np.full(len(t), midi(notes[0][1]))
    for (t0, n0), (t1, n1) in zip(notes, notes[1:]):
        i = int(t1 * SR)
        glide = np.exp(-np.maximum(0, t[i:] - t1) / 0.045)
        f[i:] = midi(n1) + (midi(n0) - midi(n1)) * glide
    f = f * (1 + 0.6 * np.exp(-t / 0.01))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.04) * (0.75 + 0.25 * np.exp(-t / 0.4))
    return np.tanh(s * e * 4.0) * g


def snare(g=0.6):
    """A dark trap snare with a short roomy tail."""
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 185 * t) * env(n, 0.001, 0.04)
    noise = band(rng.standard_normal(n), lo=1200, hi=8000) * (env(n, 0.0008, 0.06) + 0.18 * env(n, 0.005, 0.25))
    return np.tanh((body * 0.7 + noise) * 1.5) * g


def flute(note, d, g=0.14):
    """A dark, breathy lead (sine, a little vibrato and air)."""
    t = tt(d)
    f = midi(note) * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.2))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    air = band(rng.standard_normal(len(t)), lo=midi(note) * 0.8, hi=midi(note) * 3) * 0.12
    e = np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06)
    return (s + air) * e * g


def tape_stop(d, g=0.5, note=38):
    """Everything winding down for a split second (the beat-switch stop)."""
    t = tt(d)
    f = midi(note) * (1 - t / d) ** 2
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return band(s, hi=2000) * (1 - t / d) * g


def track():
    """An original beat in the spirit of a dark, beat-switching trap anthem (150 BPM, D minor)."""
    n = int(MONTAGE_DUR * SR) + int(1.5 * SR)  # the last tail rings past 8 s, under the score
    L, R = np.zeros(n), np.zeros(n)
    bL, bR = np.zeros(n), np.zeros(n)

    def put(sig, t, g=1.0, pan=0.0, bus=None):
        i = int(t * SR)
        sig = sig[: n - i] * g
        a = (pan + 1) * np.pi / 4
        l, r = bus if bus else (L, R)
        l[i : i + len(sig)] += sig * np.cos(a)
        r[i : i + len(sig)] += sig * np.sin(a)

    D1, F1, G1, A1, C1, BB0 = 26, 29, 31, 33, 24, 22
    TRIP = BEAT / 3

    # ---- 0 – 1.6: dark and eerie, holding back ----
    put(pad([50, 53, 57, 60], 1.7, 0.1, 900), 0.0)                 # Dm7, filtered and low
    for k, note in enumerate([74, 72, 69]):                         # three lonely lead notes
        put(flute(note, 0.38, 0.12), 0.05 + k * 0.4, pan=-0.2 + 0.2 * k)
    put(tick(midi(86), 0.1), 1.2)
    put(riser(0.5, 0.16), 1.1)
    put(tape_stop(0.15, 0.25), 1.45)                                # a hiccup into the switch

    # ---- 1.6 – 4.8: switch 1: the 808 lands, half-time and heavy ----
    put(slide808([(0, D1), (0.6, D1 + 12), (0.8, D1), (1.2, F1), (1.6, D1), (2.4, C1), (2.8, D1)], 3.2, 0.95), 1.6, bus=(bL, bR))
    for bar in range(2):
        b0 = 1.6 + bar * 1.6
        for at in (0, 1.5 * BEAT, 2.5 * BEAT):
            put(kick(0.95), b0 + at)
        put(snare(0.62), b0 + 2 * BEAT, pan=0.03)                   # half-time snare on 3
        for s_ in range(8):                                         # 8th hats…
            put(hat(0.085 if s_ % 2 else 0.055), b0 + s_ * 0.2, pan=0.25 if s_ % 2 else -0.25)
        for k in range(3):                                          # …a triplet roll at the end of each bar
            put(hat(0.07 + 0.015 * k, 0.025), b0 + 3 * BEAT + k * TRIP, pan=0.3)
        for k in range(6):
            put(hat(0.05 + 0.01 * k, 0.02), b0 + 3.5 * BEAT + k * TRIP / 2, pan=-0.3)
    lead = [(1.6, 74, 0.35), (2.0, 77, 0.2), (2.2, 76, 0.2), (2.4, 74, 0.55), (3.2, 72, 0.35), (3.6, 74, 0.2), (3.8, 69, 0.75)]
    for at, note, d in lead:                                        # the dark lead, sparse
        put(flute(note, d, 0.13), at, pan=-0.15)

    # ---- 4.8: the stop: everything winds down for one 8th note ----
    put(tape_stop(0.2, 0.45), 4.6)
    put(riser(0.2, 0.12), 4.6)

    # ---- 4.8 – 8.0: switch 2: harder, faster, the 808 jumping ----
    put(impact(0.5), 4.8)
    put(slide808([(0, G1), (0.4, G1 + 12), (0.6, F1), (0.8, D1), (1.2, D1 + 12), (1.4, D1), (1.6, BB0), (2.0, C1), (2.4, D1), (2.8, D1 + 12)], 3.2, 1.0), 4.8, bus=(bL, bR))
    for bar in range(2):
        b0 = 4.8 + bar * 1.6
        for at in (0, 0.5 * BEAT, 1.5 * BEAT, 2.5 * BEAT, 3.25 * BEAT):
            put(kick(0.95), b0 + at)
        put(snare(0.66), b0 + BEAT, pan=0.03)                       # back-beat snare: it gets busier
        put(snare(0.66), b0 + 3 * BEAT, pan=-0.03)
        for s_ in range(16):                                        # 16th hats
            put(hat(0.08 if s_ % 2 else 0.05, 0.025), b0 + s_ * 0.1, pan=0.25 if s_ % 2 else -0.25)
        for k in range(6):                                          # triplet rolls
            put(hat(0.05 + 0.012 * k, 0.02), b0 + 1.5 * BEAT + k * TRIP / 2, pan=0.35)
        put(hat(0.09, open_=True), b0 + 2.5 * BEAT, pan=-0.2)
    for k, note in enumerate([81, 79, 77, 76, 74, 72, 74, 77]):     # the lead, now an octave up and moving
        put(flute(note, 0.18, 0.11), 4.8 + k * 0.4 + (0.2 if k % 2 else 0), pan=0.2)
    for k, at in enumerate(np.arange(7.4, 8.0, 0.05)):              # a snare roll into the hit
        put(snare(0.08 + 0.025 * k), at, pan=0.1)
    put(riser(0.9, 0.2), 7.1)

    # a shutter on every cut (montage.ts FAST: most screens last one 1/8 note, a few hold for two)
    holds = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1]
    at = 1.6
    for k, h in enumerate(holds):
        put(shutter(0.08), at, pan=-0.2 + 0.4 * (k % 2))
        at += h * 0.2
    # duck the 808 under every kick
    duck = np.ones(n)
    kicks = [1.6 + bar * 1.6 + x for bar in range(2) for x in (0, 1.5 * BEAT, 2.5 * BEAT)]
    kicks += [4.8 + bar * 1.6 + x for bar in range(2) for x in (0, 0.5 * BEAT, 1.5 * BEAT, 2.5 * BEAT, 3.25 * BEAT)]
    for k_ in kicks:
        i = int(k_ * SR)
        m = min(n - i, int(0.05 * SR))
        duck[i : i + m] = 0.6 + 0.4 * (np.arange(m) / m)
    L += bL * duck
    R += bR * duck

    # ---- 8.0: the final hit, as the film cuts in on "Hello World"; it rings out underneath ----
    put(impact(0.85), 8.0)
    put(b808(D1, 1.6, 1.0), 8.0)
    put(stab([62, 65, 69, 72, 76], 0.3, 1.8), 8.0, pan=-0.12)
    put(flute(74, 1.0, 0.1), 8.05, pan=0.2)
    mix = np.stack([L, R])
    mix = np.stack([band(mix[0], lo=24), band(mix[1], lo=24)])
    # the tail fades away by ~9.8 s, under the score's first notes ("Hello World" typing)
    t = np.arange(n) / SR
    mix *= np.clip(1 - (t - 8.9) / 0.9, 0, 1)
    return mix


def splice(score):
    """score: the mastered (2, n) score. Returns it with the opener's track at MONTAGE_AT."""
    i = int(MONTAGE_AT * SR)
    gap = int(MONTAGE_DUR * SR)
    m = track()
    # as loud as the score's busiest moments, a touch hotter (it should hit)
    ref = score[:, int(2.0 * SR) : int(8.0 * SR)]
    m *= (np.sqrt(np.mean(ref ** 2)) * 1.9) / (np.sqrt(np.mean(m[:, int(1.6 * SR) : int(8.0 * SR)] ** 2)) + 1e-9)
    m = np.tanh(m * 1.15) / np.tanh(1.15) * 0.92
    before, after = score[:, :i].copy(), score[:, i:].copy()
    f = min(int(0.06 * SR), before.shape[1])
    if f:
        before[:, -f:] *= np.linspace(1, 0, f)
    out = np.concatenate([before, np.zeros((2, gap)), after], axis=1)
    tail = m.shape[1]
    out[:, i : i + tail] += m[:, : out.shape[1] - i]
    return out / max(1.0, np.abs(out).max() / 0.95)
