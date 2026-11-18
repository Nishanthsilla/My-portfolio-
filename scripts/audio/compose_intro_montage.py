"""
The 5-second track for the logo match cut that opens the intro (see
components/intro-film/montage.ts), synthesised from scratch (NumPy only).

It is spliced into the finished score at MONTAGE_AT (the very start), so the
score itself plays exactly as it did, only MONTAGE_DUR seconds later. Called from
compose_intro_film.py; the cue times below are seconds into the montage:

  0.0 – 1.5  slow: a sub swell, a tick for each background swap, a roll that speeds up
  1.5        the drop: impact + 808 sub, when the NS mark lands
  1.5 – 4.5  fast and bassy: four-on-the-floor kick, rolling 16th-note bass
             (ducked under the kick), claps on 2 and 4, a shutter click per cut
  4.5 – 5.0  the final hit on the still logo, ringing into the score
"""
import numpy as np

SR = 48000
MONTAGE_AT, MONTAGE_DUR = 0.0, 5.0  # it opens the intro
rng = np.random.default_rng(11)


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


def kick(g=1.0, tail=0.18):
    t = tt(0.5)
    f = 44 + 130 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, tail)
    click = band(rng.standard_normal(len(t)), lo=2500, hi=9000) * env(len(t), 0.0005, 0.003) * 0.35
    return np.tanh((body + click) * 2.2) * g


def sub808(f0, d=1.2, g=1.0):
    t = tt(d)
    f = f0 * (1 + 1.5 * np.exp(-t / 0.02))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return np.tanh(s * 2.5 * env(len(t), 0.002, d * 0.45)) * g


def bass16(f, g=0.5, d=0.12):
    t = tt(d)
    saw = 2 * ((f * t) % 1) - 1
    sq = np.sign(np.sin(2 * np.pi * f * 0.5 * t)) * 0.5
    s = band(saw + sq, hi=700) + np.sin(2 * np.pi * f * 0.5 * t) * 0.8
    return np.tanh(s * env(len(t), 0.002, d * 0.5) * 2.0) * g


def hat(g=0.1, d=0.04):
    n = int(d * SR)
    return band(rng.standard_normal(n), lo=7500, hi=16000) * env(n, 0.0004, d / 4) * g


def clap(g=0.4):
    n = int(0.25 * SR)
    noise = band(rng.standard_normal(n), lo=900, hi=5000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += env(n - i, 0.0005, 0.006 if k < 2 else 0.07)
    return noise * e * g


def shutter(g=0.12):
    n = int(0.03 * SR)
    a = band(rng.standard_normal(n), lo=3000, hi=11000) * env(n, 0.0003, 0.002)
    b = np.zeros(n)
    i = int(0.012 * SR)
    b[i:] = band(rng.standard_normal(n - i), lo=2000, hi=8000) * env(n - i, 0.0003, 0.003)
    return (a + b * 0.7) * g


def tick(f, g=0.16):
    t = tt(0.12)
    fr = f * (1 + 0.8 * np.exp(-t / 0.01))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(len(t), 0.0008, 0.03) * g


def riser(d, g=0.25):
    t = tt(d)
    f = 120 * (16 ** (t / d))
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    noise = rng.standard_normal(len(t))
    s = band(saw, hi=4000) * 0.6 + band(noise, lo=1500, hi=9000) * 0.5 * (t / d)
    return s * (t / d) ** 2.2 * g


def stab(notes, g=0.35, d=0.7):
    t = tt(d)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.1, 0, 0.1):
            ff = midi(n) * 2 ** (det / 12)
            s += 2 * ((ff * t + rng.random()) % 1) - 1
    s = band(s / (len(notes) * 3), lo=120, hi=3800)
    return s * env(len(t), 0.003, d * 0.35) * g


def impact(g=0.9):
    t = tt(1.6)
    f = 34 + 80 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.6)
    air = band(rng.standard_normal(len(t)), lo=200, hi=5000) * env(len(t), 0.001, 0.2) * 0.45
    return np.tanh((body + air) * 1.6) * g


def track():
    n = int(MONTAGE_DUR * SR) + int(1.5 * SR)  # tails ring past the end, into the score
    L, R = np.zeros(n), np.zeros(n)
    bassL, bassR = np.zeros(n), np.zeros(n)

    def put(sig, t, g=1.0, pan=0.0, bus=None):
        i = int(t * SR)
        sig = sig[: n - i] * g
        a = (pan + 1) * np.pi / 4
        l, r = (bus if bus else (L, R))
        l[i : i + len(sig)] += sig * np.cos(a)
        r[i : i + len(sig)] += sig * np.sin(a)

    D2, F2, C2, BB1 = 38, 41, 36, 34
    # ---- 0 – 1.5: slow ----
    put(sub808(midi(26), 1.5, 0.55), 0.0)                       # a deep D swell under the first logo
    put(stab([62, 65, 69, 72], 0.12, 1.4), 0.0, pan=-0.1)
    for k, at in enumerate([0.5, 0.875, 1.125, 1.3]):            # each background swap
        put(tick(midi(74 + 3 * k), 0.2), at, pan=-0.3 + 0.2 * k)
        put(kick(0.35, 0.08), at)
    for at in np.concatenate([np.arange(0.5, 1.0, 0.125), np.arange(1.0, 1.25, 0.0625), np.arange(1.25, 1.5, 0.03125)]):
        put(clap(0.07 + 0.12 * (at - 0.5)), at, pan=0.15)      # the roll speeds up into the drop
    put(riser(1.0, 0.22), 0.5)
    # ---- 1.5: the drop ----
    put(impact(0.75), 1.5)
    put(sub808(midi(D2 - 12), 1.0, 0.7), 1.5)
    put(stab([62, 65, 69, 72, 76], 0.3, 0.5), 1.5)
    # ---- 1.5 – 4.5: fast and bassy ----
    roots = [D2, D2, F2, F2, C2, BB1 + 12]                      # one per beat
    octs = [0, 0, 12, 0, 0, 12, 0, 12]
    for b in range(6):
        t0 = 1.5 + b * 0.5
        if b > 0:
            put(kick(0.95), t0)
        if b % 2 == 1:
            put(clap(0.42), t0, pan=0.05)
        for s in range(4):
            st = t0 + s * 0.125
            put(bass16(midi(roots[b] + octs[(b * 4 + s) % 8]), 0.5), st, bus=(bassL, bassR))
            put(hat(0.11 if s % 2 else 0.05), st + (0.0 if s % 2 else 0.0625 * 0), pan=0.3 if s % 2 else -0.3)
    for k in range(22):                                          # a shutter for every cut
        put(shutter(0.11), 1.75 + k * 0.125, pan=-0.2 + 0.4 * (k % 2))
    for k in range(4):                                           # the orange frame: a quick fill
        put(clap(0.18 + 0.05 * k), 4.375 + k * 0.03125)
    # duck the bass under each kick
    duck = np.ones(n)
    for b in range(6):
        i = int((1.5 + b * 0.5) * SR)
        m = min(n - i, int(0.16 * SR))
        duck[i : i + m] = 0.35 + 0.65 * (np.arange(m) / m) ** 1.5
    L += bassL * duck
    R += bassR * duck
    # ---- 4.5: the hit, the logo holds ----
    put(impact(0.8), 4.5)
    put(sub808(midi(D2 - 12), 1.3, 0.6), 4.5)
    put(stab([62, 65, 69, 72, 76], 0.32, 1.2), 4.5, pan=-0.15)
    put(stab([74, 77, 81], 0.16, 1.2), 4.52, pan=0.2)
    mix = np.stack([L, R])
    return np.stack([band(mix[0], lo=25), band(mix[1], lo=25)])


def splice(score):
    """score: the mastered (2, n) score. Returns it with the montage track inserted at MONTAGE_AT."""
    i = int(MONTAGE_AT * SR)
    gap = int(MONTAGE_DUR * SR)
    m = track()
    # match loudness to the score around the cut, a touch hotter (it should hit)
    ref = score[:, int(1.0 * SR) : int(8.0 * SR)]
    m *= (np.sqrt(np.mean(ref ** 2)) * 1.7) / (np.sqrt(np.mean(m[:, :gap] ** 2)) + 1e-9)
    m = np.tanh(m * 1.2) / np.tanh(1.2) * 0.9
    before, after = score[:, :i].copy(), score[:, i:].copy()
    # the score fades out quickly as the montage starts…
    f = min(int(0.06 * SR), before.shape[1])
    if f:
        before[:, -f:] *= np.linspace(1, 0, f)
    # …and comes back in on the hit, under the montage's ringing tail
    f2 = int(0.04 * SR)
    after[:, :f2] *= np.linspace(0, 1, f2)
    out = np.concatenate([before, np.zeros((2, gap)), after], axis=1)
    tail = m.shape[1]
    out[:, i : i + tail] += m[:, : out.shape[1] - i]
    return out / max(1.0, np.abs(out).max() / 0.95)
