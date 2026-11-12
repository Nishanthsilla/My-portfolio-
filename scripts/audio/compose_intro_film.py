"""
Original score + sound design for the intro film — synthesised from scratch
(NumPy only, no samples), on the same 120 BPM grid and cue points as the
reference film's edit.

    python3 scripts/audio/compose_intro_film.py
    -> public/audio/intro-film.{wav,mp3,ogg}

Times below are FILM seconds (= reference seconds + 0.2 s typing pre-roll).
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48000
DUR = 15.6
OFF = 0.2  # film time = reference time + OFF
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "audio"
rng = np.random.default_rng(7)

L = np.zeros(int(SR * DUR))
R = np.zeros(int(SR * DUR))


def ref(t):
    return t + OFF


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


# ---------- harmony ----------
# D minor colour: Dm9 · Bbmaj7 · Fmaj7 · Csus — one chord per bar (2 s at 120 BPM)
CHORDS = [[62, 65, 69, 72, 76], [58, 62, 65, 69, 74], [53, 57, 60, 64, 69], [60, 62, 67, 72, 74]]
BASS = [38, 34, 41, 36]
BEAT = 0.5


def chord_at(t):
    bar = int(max(0, t - ref(1.0)) // 2) % 4
    return CHORDS[bar], BASS[bar]


# ---------- S1: typing (film 0.00–0.53) ----------
for i in range(17):
    place(click(0.16 + 0.05 * rng.random(), 5200 + 1800 * rng.random()), 0.0 + i * 0.031, pan=rng.uniform(-0.2, 0.2))

# ---------- S2: collapse → dot ----------
place(swoosh(0.38, 3500, 900, 0.10, "down"), ref(0.42))
place(pop(1250, 0.30), ref(0.83))

# ---------- S3/S4: name, pill typing ----------
for k in range(8):  # letters of the name pop up
    place(click(0.10, 4200), ref(0.92) + k * 0.04, pan=-0.3 + k * 0.08)
place(pop(1500, 0.25), ref(1.25))  # dot lands as the full stop
for k in range(12):
    place(click(0.07, 7000), ref(1.33) + k * 0.028, pan=0.15)
for k in range(8):
    place(click(0.05, 7500), ref(2.0) + k * 0.025, pan=0.15)

# ---------- groove A (ref 1.0 – 6.45) ----------
t = ref(1.0)
step = 0
while t < ref(6.45) - 1e-6:
    chord, broot = chord_at(t)
    if step % 2 == 0:
        place(kick(0.75 if step % 4 == 0 else 0.55), t)
        place(bass(midi(broot), 0.30), t)
    else:
        place(hat(0.10), t, pan=0.25)
    # quiet arpeggiated plucks on 8ths
    note = chord[(step * 2) % len(chord)]
    place(pluck(midi(note), 0.09 if step % 2 else 0.12), t, pan=-0.35 + 0.7 * ((step * 3) % 5) / 4)
    t += BEAT / 2
    step += 1

# S5/S6: name drops out, headline rises
place(swoosh(0.3, 1200, 300, 0.12, "down"), ref(2.25))
for k, tt_ in enumerate([2.67, 2.75, 2.83]):
    place(pop(700 + 120 * k, 0.16, 0.07), ref(tt_))
# S7: six word swaps + card morphs
for k, s in enumerate([3.0, 3.5, 4.0, 4.5, 5.0, 5.5]):
    place(pop(1000 + 90 * k, 0.26), ref(s))
    place(click(0.14, 5000), ref(s) + 0.012, pan=0.4)
# S8: "thing." highlighter + square
place(swoosh(0.18, 2500, 6000, 0.12), ref(6.0))
place(pop(520, 0.30, 0.12), ref(6.25))

# ---------- S9: burst + breakdown ----------
place(impact(0.55), ref(6.45))
place(swoosh(0.45, 6000, 800, 0.22, "down"), ref(6.45), pan=0.2)
place(pad([midi(n) for n in [62, 65, 69, 72]], 1.6, 0.07, 0.3, 0.3, 1600), ref(6.5))
for k, s in enumerate([6.83, 6.92, 7.0, 7.08]):  # "Even when it's complex," words
    place(pop(820 + 60 * k, 0.12, 0.06), ref(s))
place(riser(0.9, 0.24), ref(7.05))
for k in range(4):
    place(hat(0.05 + 0.02 * k), ref(7.55) + k * 0.1, pan=0.3)

# ---------- S10/S11: drop on "I make it clear." ----------
place(impact(0.75), ref(8.0))
place(swoosh(0.22, 5000, 1500, 0.15, "down"), ref(7.95))
t = ref(8.0)
step = 0
while t < ref(10.25) - 1e-6:
    chord, broot = CHORDS[2] if t < ref(9.0) else CHORDS[3], BASS[2] if t < ref(9.0) else BASS[3]
    if step % 2 == 0:
        place(kick(0.8 if step % 4 == 0 else 0.6), t)
        place(bass(midi(broot), 0.34), t)
    else:
        place(hat(0.11), t, pan=0.25)
    place(pluck(midi(chord[(step * 2) % len(chord)]), 0.11), t, pan=-0.3 + 0.6 * (step % 3) / 2)
    t += BEAT / 2
    step += 1
place(pad([midi(n) for n in CHORDS[2][:4]], 1.0, 0.05, 0.05, 0.4), ref(8.0))
for k, s in enumerate([8.2, 8.3, 8.4, 8.48]):
    place(pop(900 + 80 * k, 0.12, 0.06), ref(s))
# S12: stats roll in — fast digit ticks
for k in range(16):
    place(click(0.09, 6500 + 300 * (k % 3)), ref(9.0) + k * 0.025, pan=-0.4 + 0.4 * (k % 3))

# ---------- S13/S14: grid clears → circle fills dark ----------
for k in range(14):
    place(pop(2600 - 90 * k, 0.08, 0.05), ref(10.1) + k * 0.035, pan=rng.uniform(-0.6, 0.6))
place(swoosh(0.5, 300, 2400, 0.22), ref(10.55))
place(impact(0.32), ref(11.03))

# ---------- S16: the dark section ----------
place(pad([midi(n) for n in [50, 57, 62, 65]], 1.9, 0.06, 0.25, 0.5, 1200), ref(11.05))
t = ref(11.5)
k = 0
while t < ref(12.95) - 1e-6:  # sub-bass pulse on 8ths, kick on beats
    place(bass(midi(38 if t < ref(12.5) else 41), 0.36 if k % 2 == 0 else 0.22, 0.24), t)
    if k % 2 == 0:
        place(kick(0.65), t)
    t += BEAT / 2
    k += 1
for s in [11.42, 11.5, 11.58, 11.67, 11.75]:  # "I design it in Figma,"
    place(click(0.14, 4800), ref(s), pan=-0.2)
place(pop(1400, 0.18, 0.08), ref(11.78))  # selection box lands
for s in [12.08, 12.25, 12.33, 12.42]:  # "then ship it in"
    place(click(0.14, 4800), ref(s), pan=-0.1)
for k in range(3):  # "Thinking" chip blips
    place(pop(1900, 0.06, 0.05), ref(12.28) + k * 0.06, pan=0.3)
for k in range(10):  # rapid run as "code." types + box hops
    place(click(0.12, 5500 + 200 * (k % 4)), ref(12.5) + k * 0.045, pan=0.2)
place(pop(1700, 0.2, 0.08), ref(12.67))

# ---------- S17: the orange wipe → homepage ----------
place(swoosh(0.55, 500, 6500, 0.30), ref(12.9))
place(impact(0.5), ref(13.42))
place(pad([midi(n) for n in [53, 60, 64, 67, 69, 76]], 2.2, 0.12, 0.02, 1.4, 3200), ref(13.42))
for k, n in enumerate([72, 76, 79, 84]):  # warm resolving arpeggio as the page appears
    place(pluck(midi(n), 0.10, 1.2, 4500), ref(13.5) + k * 0.09, pan=-0.3 + 0.2 * k)

# ---------- master ----------
mix = np.stack([L, R])
mix = band(mix[0], lo=28), band(mix[1], lo=28)
mix = np.stack(mix)
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
fade = int(0.9 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 2
mix *= 0.89 / np.abs(mix).max()  # ≈ -1 dBFS peak

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
