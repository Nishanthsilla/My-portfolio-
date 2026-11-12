"""
Original score + sound design for the intro film — synthesised from scratch
(NumPy only, no samples), on a 120 BPM grid, cued to every beat of the
film's storyboard.

    python3 scripts/audio/compose_intro_film.py
    -> public/audio/intro-film.{wav,mp3,ogg}

Cue times mirror components/intro-film/timeline.ts (film seconds). The
level-clear sound is a separate file (compose_level_clear.py) so it only
plays when the film completes.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48000
DUR = 33.4
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "audio"
rng = np.random.default_rng(7)

L = np.zeros(int(SR * DUR))
R = np.zeros(int(SR * DUR))


def place(sig, t, gain=1.0, pan=0.0):
    """Mix a mono signal at time t (s) with constant-power pan (-1..1)."""
    i = int(t * SR)
    if i >= len(L):
        return
    sig = sig[: len(L) - i]
    a = (pan + 1) * np.pi / 4
    L[i : i + len(sig)] += sig * gain * np.cos(a)
    R[i : i + len(sig)] += sig * gain * np.sin(a)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def band(x, lo=None, hi=None):
    """Zero-phase FFT band filter with soft edges."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, n)


def env(n, a=0.002, d=0.1, curve=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d) ** curve
    return e


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------- voices ----------
def click(gain=0.25, bright=6000):
    n = int(0.012 * SR)
    s = band(rng.standard_normal(n), lo=bright * 0.5, hi=bright * 2) * env(n, 0.0005, 0.003)
    s += np.sin(2 * np.pi * bright * 0.6 * tt(0.012)) * env(n, 0.0005, 0.002) * 0.3
    return s * gain


def pop(f=900, gain=0.4, dur=0.09):
    t = tt(dur)
    freq = f * (1 + 1.2 * np.exp(-t / 0.012))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * env(len(t), 0.001, dur / 4) * gain


def kick(gain=0.9):
    t = tt(0.45)
    freq = 46 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(ph) * env(len(t), 0.001, 0.16)
    tick = band(rng.standard_normal(len(t)), lo=2000, hi=8000) * env(len(t), 0.0005, 0.004) * 0.25
    return (np.tanh(body * 1.6) + tick) * gain


def hat(gain=0.12, dur=0.05):
    n = int(dur * SR)
    return band(rng.standard_normal(n), lo=7000, hi=16000) * env(n, 0.0005, dur / 4) * gain


def pluck(f, gain=0.18, dur=0.6, bright=3200):
    t = tt(dur)
    s = sum((1 / k) * np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (6 + k * 3)) for k in range(1, 7))
    s = band(s, hi=bright)
    return s * env(len(t), 0.002, dur / 3) * gain


def bass(f, gain=0.35, dur=0.45):
    t = tt(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sign(np.sin(2 * np.pi * f * t))
    s = band(s, hi=900)
    e = np.minimum(1, t / 0.006) * np.exp(-t / (dur * 0.55))
    return np.tanh(s * e * 1.3) * gain


def pad(freqs, dur, gain=0.08, attack=0.4, release=0.6, hi=2200):
    t = tt(dur)
    s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.08, 0.0, 0.08):
            ff = f * 2 ** (det / 12)
            s += 2 * ((ff * t + rng.random()) % 1) - 1
    s = band(s / (len(freqs) * 3), hi=hi)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    return s * np.clip(e, 0, 1) * gain


def swoosh(dur, f0, f1, gain=0.25, shape="up"):
    """Band-limited noise whose centre frequency glides f0 -> f1."""
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    hop = 1024
    win = np.hanning(hop * 2)
    for i in range(0, n - hop * 2, hop):
        p = i / n
        fc = f0 * (f1 / f0) ** p
        seg = band(noise[i : i + hop * 2] * win, lo=fc * 0.6, hi=fc * 1.6)
        out[i : i + hop * 2] += seg
    t = np.arange(n) / n
    e = np.sin(np.pi * t) ** (0.8 if shape == "up" else 1.4)
    if shape == "up":
        e *= t ** 0.6 + 0.2
    return out / (np.abs(out).max() + 1e-9) * e * gain


def riser(dur, gain=0.22):
    t = tt(dur)
    f = 180 * (8 ** (t / dur))
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    s = band(saw, hi=3500) * 0.5 + swoosh(dur, 400, 7000, 1.0)
    return s * (t / dur) ** 2 * gain


def impact(gain=0.8):
    t = tt(1.4)
    freq = 38 + 70 * np.exp(-t / 0.05)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(ph) * env(len(t), 0.001, 0.45)
    air = band(rng.standard_normal(len(t)), lo=300, hi=6000) * env(len(t), 0.001, 0.12) * 0.35
    return np.tanh((body + air) * 1.4) * gain


# ---------- harmony (D minor, resolving to F major at the reveal) ----------
DM9 = [62, 65, 69, 72, 76]
BB7 = [58, 62, 65, 69, 74]
FMAJ7 = [53, 57, 60, 64, 69]
CSUS = [60, 62, 67, 72, 74]
PROG = [(DM9, 38), (BB7, 34), (FMAJ7, 41), (CSUS, 36)]
BEAT = 0.5


def groove(t0, t1, kick_g=0.6, bass_g=0.28, pluck_g=0.09, hats=True, every_beat=False, bar0=0):
    """Gentle 120 BPM groove: kick on 1 & 3 (or every beat), bass on the bar root, soft plucks."""
    t, step = t0, 0
    while t < t1 - 1e-6:
        bar = (int((t - t0) // 2) + bar0) % 4
        chord, root = PROG[bar]
        beat = step % 4  # 8th-note steps within a 2 s bar = 8; we use quarter-beat steps of 0.25 s
        if step % 2 == 0 and (every_beat or step % 4 == 0):
            place(kick(kick_g if step % 8 == 0 else kick_g * 0.8), t)
        if step % 8 == 0 or step % 8 == 4:
            place(bass(midi(root), bass_g, 0.9), t)
        if hats and step % 2 == 1:
            place(hat(0.06), t, pan=0.25)
        if step % 2 == 0:
            place(pluck(midi(chord[(step // 2) % len(chord)]), pluck_g), t, pan=-0.3 + 0.6 * ((step // 2) % 3) / 2)
        t += 0.25
        step += 1


# Cue times mirror components/intro-film/timeline.ts (T).
# ---------- Prologue (0 – 3.5) ----------
place(pad([midi(n) for n in DM9[:4]], 2.6, 0.045, 0.8, 0.6, 1400), 0.0)
for i in range(17):
    place(click(0.12 + 0.04 * rng.random(), 5000 + 1600 * rng.random()), 0.1 + i * 0.029, pan=rng.uniform(-0.2, 0.2))
place(swoosh(0.35, 2800, 800, 0.07, "down"), 1.05)
place(pop(1180, 0.2, 0.11), 1.35)
place(swoosh(0.55, 500, 2200, 0.07), 1.45)
place(pop(1480, 0.15, 0.09), 2.05)
place(pluck(midi(74), 0.11, 0.9), 1.65)
place(click(0.07, 6500), 2.32)
groove(2.0, 8.7, kick_g=0.5, bass_g=0.24, pluck_g=0.075)
place(swoosh(0.35, 1800, 500, 0.07, "down"), 3.15)

# ---------- 1: I make things … (3.45 – 8.85) ----------
for k, s in enumerate([3.45, 3.55, 3.65]):
    place(pop(640 + 90 * k, 0.09, 0.07), s + 0.04)
place(pop(520, 0.14, 0.12), 3.85)
for k, v in enumerate([4.25, 4.82, 5.39, 5.96, 6.53, 7.1, 7.67]):
    place(pop(900 + 70 * k, 0.15, 0.08), v + 0.08)
place(swoosh(0.3, 2400, 5200, 0.06), 7.8)
place(swoosh(0.35, 1600, 400, 0.07, "down"), 8.55)

# ---------- 2: Even when it's complex, (8.7 – 12.5) ----------
place(swoosh(0.8, 900, 5200, 0.09), 8.7)
place(pad([midi(n) for n in BB7], 3.6, 0.06, 0.5, 0.9, 1300), 8.75)
place(pop(560, 0.11, 0.11), 9.05)
for k in range(10):  # quiet clockwork: many things happening
    place(hat(0.032 + 0.003 * k, 0.03), 9.6 + k * 0.17, pan=0.3 if k % 2 else -0.3)
for k in range(6):  # each relationship line connects
    place(pop(midi([72, 74, 77, 79, 81, 84][k]) * 0.5, 0.05, 0.06), 10.55 + k * 0.1, pan=-0.4 + k * 0.16)
place(riser(1.1, 0.12), 11.15)

# ---------- 3: I make it clear. (12.2 – 15.6) ----------
for k in range(10):  # pieces landing in place
    place(pop(midi([72, 74, 77, 79, 81][k % 5]) * 0.5, 0.055, 0.06), 12.6 + k * 0.07, pan=-0.5 + k / 10)
place(impact(0.45), 13.15)
groove(13.15, 15.6, kick_g=0.6, bass_g=0.28, pluck_g=0.085, every_beat=True, bar0=2)
place(pad([midi(n) for n in FMAJ7[:4]], 2.4, 0.045, 0.05, 0.6), 13.15)
place(swoosh(0.45, 1400, 400, 0.06, "down"), 15.2)

# ---------- 4: proof — all three roll together (15.6 – 18.95) ----------
place(pop(1250, 0.13, 0.1), 15.3)
place(pad([midi(n) for n in FMAJ7], 3.4, 0.05, 0.4, 0.9, 1500), 15.6)
place(kick(0.45), 15.7)
tt_ = 0.0
for i in range(12):  # rolling ticks that slow as the numbers settle
    place(click(0.07, 6200 + 200 * (i % 3)), 15.72 + tt_, pan=-0.3 + 0.3 * (i % 3))
    tt_ += 0.03 + i * 0.012
place(bass(midi(41), 0.28, 1.2), 17.1)
for k, n in enumerate([77, 81, 84]):
    place(pluck(midi(n), 0.09, 1.2, 3600), 17.1 + k * 0.05, pan=-0.4 + 0.4 * k)
place(swoosh(0.4, 1500, 500, 0.06, "down"), 18.6)

# ---------- 5: Figma (18.85 – 22.6) ----------
place(swoosh(0.5, 500, 2000, 0.06), 18.85)
place(pad([midi(n) for n in DM9[:4]], 4.0, 0.04, 0.4, 0.8, 1300), 18.9)
groove(19.0, 22.6, kick_g=0.42, bass_g=0.2, pluck_g=0.06, hats=True, bar0=1)
place(click(0.07, 3000), 19.9, pan=0.15)                  # cursor settles on "Figma"
place(pop(1320, 0.1, 0.09), 19.98)                        # hover → canvas opens
place(swoosh(0.45, 900, 3600, 0.06), 20.0)
for k, ed in enumerate([20.55, 21.0, 21.45, 21.9]):       # design activity (select + snap)
    place(pop(1400 + 110 * k, 0.08, 0.07), ed)
    place(click(0.08, 3800), ed + 0.28, pan=0.25)

# ---------- 6: code (22.6 – 25.9) ----------
place(pop(760, 0.08, 0.08), 22.65)                        # second sentence rises
place(click(0.07, 3000), 23.4, pan=0.15)                  # cursor settles on "code"
place(swoosh(0.55, 400, 3800, 0.11), 23.45)               # Figma → code transition
place(impact(0.18), 23.98)
t = 24.0
k = 0
while t < 25.9 - 1e-6:
    place(bass(midi(38 if t < 25.45 else 41), 0.26 if k % 2 == 0 else 0.15, 0.24), t)
    if k % 2 == 0:
        place(kick(0.42), t)
    t += 0.25
    k += 1
for i in range(26):                                       # code being written
    place(click(0.05, 5400 + 250 * (i % 4)), 24.0 + i * 0.034, pan=0.2)
place(pop(1900, 0.08, 0.07), 25.0)                        # AI suggestion appears
place(pop(1500, 0.13, 0.1), 25.45)                        # accepted

# ---------- 7: the product (25.9 – 30.4) ----------
place(swoosh(0.5, 2200, 600, 0.07, "down"), 25.9)
place(pad([midi(n) for n in FMAJ7], 4.4, 0.055, 0.4, 0.8, 2200), 26.3)
for k, pp in enumerate([26.6, 26.9, 27.2, 27.5]):          # wireframe → polished, one region at a time
    place(pop(midi([72, 76, 79, 84][k]) * 0.5, 0.06, 0.08), pp + 0.1, pan=-0.3 + 0.2 * k)
groove(26.6, 30.4, kick_g=0.5, bass_g=0.24, pluck_g=0.07, bar0=2)
place(pop(1100, 0.1, 0.09), 28.3)                          # Draft done
place(click(0.06, 2800), 28.82, pan=0.2)                   # hover
place(click(0.2, 3300), 29.05)                             # the click
place(pop(900, 0.12, 0.06), 29.07)
for k, n in enumerate([76, 81, 84, 88]):                    # completion chime
    place(pluck(midi(n), 0.11, 1.1, 4600), 29.2 + k * 0.085, pan=-0.3 + 0.2 * k)
place(swoosh(0.9, 600, 2400, 0.06), 29.35)                  # the camera pushes in

# ---------- Finale (30.4 – 31.85) ----------
place(swoosh(0.5, 500, 6000, 0.16), 30.4)
place(impact(0.3), 30.9)
place(pad([midi(n) for n in [53, 60, 64, 67, 69, 76]], 2.6, 0.075, 0.05, 1.5, 2800), 30.9)
# (the level-clear jingle plays separately as the dot lands)

# ---------- master ----------
mix = np.stack([L, R])
mix = np.stack([band(mix[0], lo=28), band(mix[1], lo=28)])
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
fade = int(1.2 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
mix *= 0.89 / np.abs(mix).max()

OUT.mkdir(parents=True, exist_ok=True)
wav = OUT / "intro-film.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "256k", str(OUT / "intro-film.mp3")], check=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-c:a", "libvorbis", "-q:a", "7", str(OUT / "intro-film.ogg")], check=True)
wav.unlink()
print("wrote", OUT / "intro-film.mp3", OUT / "intro-film.ogg")
