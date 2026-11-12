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
DUR = 37.6
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


# ---------- Ch1: Hello (0 – 2.6) ----------
place(pad([midi(n) for n in DM9[:4]], 3.2, 0.045, 1.2, 0.8, 1400), 0.0)
for i in range(17):
    place(click(0.13 + 0.04 * rng.random(), 5000 + 1600 * rng.random()), 0.15 + i * 0.047, pan=rng.uniform(-0.2, 0.2))
place(swoosh(0.4, 2800, 900, 0.07, "down"), 1.62)
place(swoosh(0.45, 3200, 700, 0.08, "down"), 1.98)
place(pop(1180, 0.22, 0.12), 2.3)

# ---------- Ch2: Name (2.75 – 6.5) ----------
place(swoosh(0.7, 500, 2200, 0.08), 2.78)
place(pop(1480, 0.16, 0.1), 3.48)
place(pad([midi(n) for n in DM9], 2.6, 0.05, 0.4, 0.8, 2000), 3.0)
place(pluck(midi(74), 0.12, 1.0), 3.05)
groove(4.0, 15.0, kick_g=0.5, bass_g=0.24, pluck_g=0.075)
place(click(0.08, 6500), 4.02)
place(swoosh(0.45, 1800, 500, 0.08, "down"), 5.6)
place(swoosh(0.7, 600, 2600, 0.07), 5.78)

# ---------- Ch3: What I make (6.2 – 15.1) ----------
for k, s in enumerate([6.2, 6.34, 6.48]):
    place(pop(640 + 90 * k, 0.1, 0.08), s + 0.05)
place(pop(520, 0.16, 0.14), 6.6)
for k, v in enumerate([7.2, 8.25, 9.3, 10.35, 11.4, 12.45, 13.5]):
    place(pop(900 + 70 * k, 0.17, 0.09), v + 0.14)
    place(click(0.07, 5200), v + 0.16, pan=0.35)
place(swoosh(0.35, 2400, 5200, 0.07), 13.78)
place(swoosh(0.4, 1600, 400, 0.08, "down"), 14.7)

# ---------- Ch4: complexity → clarity (15.0 – 22.2) ----------
place(swoosh(0.9, 900, 5200, 0.1), 15.0)
place(pad([midi(n) for n in BB7], 3.4, 0.065, 0.6, 1.0, 1300), 15.0)
place(pop(560, 0.12, 0.12), 15.8)
for k in range(12):  # quiet clockwork under the tangle — tension without noise
    place(hat(0.035 + 0.003 * k, 0.03), 16.2 + k * 0.15, pan=0.3 if k % 2 else -0.3)
place(swoosh(0.6, 900, 4800, 0.06), 18.05)  # guide line
place(riser(1.3, 0.14), 18.55)
snap = [72, 74, 77, 79, 81, 84, 86, 89]
for k in range(19):  # one soft snap per fragment landing
    place(pop(midi(snap[k % len(snap)]) * 0.5, 0.06, 0.06), 19.0 + k * 0.05, pan=-0.5 + k / 19)
place(impact(0.5), 19.85)
groove(19.85, 22.3, kick_g=0.65, bass_g=0.3, pluck_g=0.09, every_beat=True, bar0=2)
place(pad([midi(n) for n in FMAJ7[:4]], 2.4, 0.045, 0.05, 0.6), 19.85)
place(swoosh(0.5, 1400, 400, 0.07, "down"), 21.55)
place(pop(1300, 0.14, 0.1), 22.18)

# ---------- Ch5: proof (22.3 – 28.9) ----------
place(pad([midi(n) for n in FMAJ7], 6.6, 0.05, 0.6, 1.2, 1500), 22.3)
for k in range(3):
    S = 22.3 + k * 1.75
    place(kick(0.45), S)
    # digits roll once: ticks that slow down as the number settles
    tt_ = 0.0
    for i in range(9):
        place(click(0.06, 6200 + 200 * (i % 3)), S + 0.05 + tt_, pan=0.15)
        tt_ += 0.035 + i * 0.014
    place(bass(midi([41, 43, 45][k]), 0.26, 1.1), S + 0.95)
    place(pluck(midi([77, 79, 81][k]), 0.1, 1.2, 3600), S + 0.95)
    place(swoosh(0.45, 1500, 600, 0.04, "down"), S + 1.55)
place(pluck(midi(84), 0.08, 1.4, 4000), 27.6)
place(swoosh(0.45, 1600, 400, 0.08, "down"), 28.9)
place(swoosh(0.65, 300, 2600, 0.16), 29.3)
place(impact(0.32), 29.93)

# ---------- Ch6: craft (29.95 – 34.1) ----------
place(pad([midi(n) for n in [50, 57, 62, 65]], 4.3, 0.05, 0.4, 0.6, 1100), 29.95)
t = 30.0
k = 0
while t < 34.1 - 1e-6:
    place(bass(midi(38 if t < 32.0 else 41), 0.3 if k % 2 == 0 else 0.18, 0.24), t)
    if k % 2 == 0:
        place(kick(0.5), t)
    t += 0.25
    k += 1
for i in range(22):
    place(click(0.11, 4600 + 300 * (i % 3)), 30.1 + i * 0.041, pan=-0.2)
place(pop(1400, 0.14, 0.09), 31.08)
for i in range(16):
    place(click(0.11, 4600 + 300 * (i % 3)), 31.95 + i * 0.041, pan=-0.1)
for i in range(5):
    place(click(0.13, 6200), 32.6 + i * 0.07, pan=0.15)
place(swoosh(0.45, 1200, 2600, 0.06), 33.0)

# ---------- Ch7: finale (34.1 – 36.0) ----------
place(pop(700, 0.18, 0.14), 34.12)
place(swoosh(0.6, 500, 6000, 0.2), 34.4)
place(impact(0.35), 34.95)
place(pad([midi(n) for n in [53, 60, 64, 67, 69, 76]], 2.6, 0.09, 0.05, 1.6, 2800), 34.95)
# (the level-clear jingle plays separately at the dot's landing)

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
