"""
The opener's track: 8 s for the logo reel before "Hello World" (see
components/intro-film/montage.ts). Original, synthesised from scratch (NumPy
only), in the spirit of a fast brand-reel beat: 150 BPM, heavy 808, crisp hats,
a bright phonk-style bell riff. D minor, the same key as the film's score, and
it finishes with a proper ending (a final hit and a ringing tail) so the score
can begin underneath without a cut.

One beat = 0.4 s, one bar = 1.6 s:
  0.0 – 1.6  intro: a sub swell, a tick per screen, a filtered riser
  1.6 – 8.0  the beat (4 bars): 808 + kick, half-time clap, 8th hats with rolls,
             the bell riff, a shutter click on every cut (0.2 s)
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


def track():
    n = int(MONTAGE_DUR * SR) + int(1.5 * SR)  # the last tail rings past 10 s, under the score
    L, R = np.zeros(n), np.zeros(n)
    bL, bR = np.zeros(n), np.zeros(n)

    def put(sig, t, g=1.0, pan=0.0, bus=None):
        i = int(t * SR)
        sig = sig[: n - i] * g
        a = (pan + 1) * np.pi / 4
        l, r = bus if bus else (L, R)
        l[i : i + len(sig)] += sig * np.cos(a)
        r[i : i + len(sig)] += sig * np.sin(a)

    D1, F1, C1, A0, BB0 = 26, 29, 24, 21, 22
    # ---- 0 – 1.6: intro ----
    put(b808(D1, 1.6, 0.55), 0.0)
    put(pad([50, 53, 57, 62], 1.7, 0.09, 1200), 0.0)
    for k in range(4):
        put(tick(midi(81 + 2 * k)), k * BEAT, pan=-0.3 + 0.2 * k)
    put(riser(1.0, 0.2), 0.6)
    for k, at in enumerate(np.arange(1.2, 1.6, 0.05)):           # a quick roll into the drop
        put(hat(0.05 + 0.02 * k), at, pan=0.2)

    # ---- 1.6 – 8.0: the beat (4 bars of 4 beats) ----
    roots = [D1, D1, F1, C1]                                     # one per bar
    riff = [74, 77, 81, 77, 74, 72, 74, 69]                      # the bell, on 8th notes
    for bar in range(4):
        b0 = 1.6 + bar * 1.6
        root = roots[bar]
        # 808: long on 1, a quick hit on the "and" of 2, a glide on 4
        put(b808(root, 0.75, 0.9), b0, bus=(bL, bR))
        put(b808(root, 0.3, 0.75), b0 + 1.5 * BEAT, bus=(bL, bR))
        put(b808(root + 12 if bar % 2 else root + 7, 0.45, 0.8, glide_from=root), b0 + 3 * BEAT, bus=(bL, bR))
        # kick with the 808 hits
        for at in (0, 1.5 * BEAT, 3 * BEAT):
            put(kick(0.9), b0 + at)
        # half-time clap on beat 3
        put(clap(0.55), b0 + 2 * BEAT, pan=0.04)
        # hats: 8ths, a 16th/triplet roll at the end of every bar, an open hat on bar 4
        for s in range(8):
            put(hat(0.09 if s % 2 else 0.06), b0 + s * 0.2, pan=0.25 if s % 2 else -0.25)
        roll = 0.1 if bar % 2 == 0 else 0.4 / 6
        for k, at in enumerate(np.arange(b0 + 1.2, b0 + 1.6, roll)):
            put(hat(0.05 + 0.012 * k, 0.025), at, pan=0.3)
        if bar == 3:
            put(hat(0.08, open_=True), b0 + 0.6, pan=-0.2)
        # the bell riff (bars 2–4, an octave up on the last)
        if bar >= 1:
            for s, note in enumerate(riff):
                put(bell(note + (12 if bar == 3 and s % 2 else 0), 0.16), b0 + s * 0.2, pan=-0.35 + 0.1 * (s % 7))
    # a shutter on every cut (montage.ts FAST: most screens last one 1/8 note, a few hold for two)
    holds = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1]
    at = 1.6
    for k, h in enumerate(holds):
        put(shutter(0.1), at, pan=-0.2 + 0.4 * (k % 2))
        at += h * 0.2
    # duck the 808 under the kick
    duck = np.ones(n)
    for bar in range(4):
        for at in (0, 1.5 * BEAT, 3 * BEAT):
            i = int((1.6 + bar * 1.6 + at) * SR)
            m = min(n - i, int(0.06 * SR))
            duck[i : i + m] = 0.55 + 0.45 * (np.arange(m) / m)
    L += bL * duck
    R += bR * duck
    # the last bar builds: a clap roll speeding up, a riser
    for k, at in enumerate(np.concatenate([np.arange(7.2, 7.6, 0.1), np.arange(7.6, 8.0, 0.05)])):
        put(clap(0.12 + 0.03 * k), at, pan=0.1)
    put(riser(1.2, 0.24), 6.8)

    # ---- 8.0: the final hit, as the film cuts in on "Hello World"; it rings out underneath ----
    put(impact(0.85), 8.0)
    put(b808(D1, 1.6, 1.0), 8.0)
    put(stab([62, 65, 69, 72, 76], 0.34, 1.8), 8.0, pan=-0.12)
    put(stab([74, 77, 81], 0.16, 1.8), 8.02, pan=0.2)
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
    # about as loud as the score that follows (a touch hotter), so the energy carries on into the film
    ref = score[:, int(2.0 * SR) : int(8.0 * SR)]
    m *= (np.sqrt(np.mean(ref ** 2)) * 1.25) / (np.sqrt(np.mean(m[:, int(1.6 * SR) : int(8.0 * SR)] ** 2)) + 1e-9)
    m = np.tanh(m * 1.15) / np.tanh(1.15) * 0.92
    before, after = score[:, :i].copy(), score[:, i:].copy()
    f = min(int(0.06 * SR), before.shape[1])
    if f:
        before[:, -f:] *= np.linspace(1, 0, f)
    out = np.concatenate([before, np.zeros((2, gap)), after], axis=1)
    tail = m.shape[1]
    out[:, i : i + tail] += m[:, : out.shape[1] - i]
    return out / max(1.0, np.abs(out).max() / 0.95)
