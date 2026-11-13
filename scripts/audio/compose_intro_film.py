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
DUR = 34.0
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
place(swoosh(0.45, 700, 2600, 0.05), 0.7)                   # settles to Semibold; the marks part
place(swoosh(0.35, 2800, 800, 0.07, "down"), 1.3)
place(pop(1180, 0.2, 0.11), 1.45)
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

# ---------- 2: Even when it's complex, (8.7 – 12.05) ----------
place(swoosh(0.8, 900, 5200, 0.09), 8.7)
place(pad([midi(n) for n in BB7], 3.6, 0.06, 0.5, 0.9, 1300), 8.75)
place(pop(560, 0.11, 0.11), 9.05)
for k in range(10):  # quiet clockwork: many things happening
    place(hat(0.032 + 0.003 * k, 0.03), 9.6 + k * 0.17, pan=0.3 if k % 2 else -0.3)
for k in range(6):  # each relationship line connects
    place(pop(midi([72, 74, 77, 79, 81, 84][k]) * 0.5, 0.05, 0.06), 10.55 + k * 0.1, pan=-0.4 + k * 0.16)
place(riser(1.0, 0.1), 11.1)

# ---------- 3: I make it clear. chaos → transform frame → clarity (12.05 – 16.9) ----------
place(swoosh(0.7, 3200, 700, 0.08, "down"), 12.05)        # the mess parts to both sides
place(pop(520, 0.12, 0.1), 12.4)                           # headline + frame
for k, x in enumerate([12.3, 12.42]):                      # extra pieces slide in from the edges
    place(swoosh(0.5, 700, 2600, 0.045), x, pan=-0.6 + 1.2 * k)
place(pad([midi(n) for n in DM9[:4]], 1.4, 0.04, 0.3, 0.5, 1200), 12.2)
NOTES = [69, 72, 74, 76, 77, 79, 81, 84, 86, 88, 89, 91]
for i in range(12):                                        # each piece transformed: a soft rising pluck
    land = 13.2 + i * 0.17 + 0.72
    side = -0.45 if i % 2 == 0 else 0.45
    place(swoosh(0.4, 1200, 3000, 0.022), land - 0.45, pan=side)
    place(pluck(midi(NOTES[i]), 0.065, 0.7, 4200), land - 0.04, pan=side * 0.5)
groove(13.95, 16.6, kick_g=0.5, bass_g=0.24, pluck_g=0.05, hats=True, bar0=2)
place(pad([midi(n) for n in FMAJ7[:4]], 2.8, 0.045, 0.5, 0.8), 14.0)
for k, n in enumerate([77, 81, 84]):                        # clean: resolves
    place(pluck(midi(n), 0.08, 1.2, 3600), 16.05 + k * 0.06, pan=-0.4 + 0.4 * k)
place(swoosh(0.4, 1400, 400, 0.06, "down"), 16.6)

# ---------- 4: proof — all three roll together (16.65 – 20.35) ----------
place(pop(1250, 0.13, 0.1), 16.75)                          # the button becomes the rule
place(pad([midi(n) for n in FMAJ7], 3.4, 0.05, 0.4, 0.9, 1500), 17.0)
place(kick(0.45), 17.1)
tt_ = 0.0
for i in range(12):  # rolling ticks that slow as the numbers settle
    place(click(0.07, 6200 + 200 * (i % 3)), 17.12 + tt_, pan=-0.3 + 0.3 * (i % 3))
    tt_ += 0.03 + i * 0.012
place(bass(midi(41), 0.28, 1.2), 18.5)
for k, n in enumerate([77, 81, 84]):
    place(pluck(midi(n), 0.09, 1.2, 3600), 18.5 + k * 0.05, pan=-0.4 + 0.4 * k)
place(swoosh(0.4, 1500, 500, 0.06, "down"), 20.0)

# ---------- 5–6: hover "Figma" (design), then "code" (code) (20.25 – 26.55) ----------
place(swoosh(0.5, 500, 2000, 0.06), 20.2)
place(pop(760, 0.09, 0.08), 20.3)                           # both sentences rise
place(pop(840, 0.09, 0.07), 20.45)
place(pad([midi(n) for n in DM9[:4]], 6.3, 0.04, 0.4, 0.9, 1300), 20.3)
groove(20.5, 26.0, kick_g=0.4, bass_g=0.19, pluck_g=0.05, hats=True, bar0=1)
place(swoosh(0.5, 600, 1800, 0.03), 21.0)                   # the cursor glides in
place(click(0.08, 3200), 21.55, pan=0.15)                   # hover "Figma": selected
place(pop(1400, 0.09, 0.08), 21.58)
for k, d in enumerate([0.3, 0.5, 0.7, 0.85, 1.05]):         # tools, ruler, spacing, guides, layer
    place(pop(1500 + 120 * k, 0.05, 0.05), 21.55 + d, pan=-0.3 + 0.15 * k)
place(swoosh(0.55, 1400, 700, 0.04, "down"), 23.15)         # design state clears, cursor moves
place(click(0.07, 4200), 23.7, pan=0.2)                     # text cursor on "code"
for k in range(4):                                          # </>  #  { }  /
    place(pluck(midi([81, 84, 86, 88][k]), 0.06, 0.6, 4200), 23.95 + k * 0.12, pan=-0.3 + 0.2 * k)
for i in range(30):                                         # the snippet being written
    place(click(0.045, 5400 + 250 * (i % 4)), 24.65 + i * 0.033, pan=0.2)
place(swoosh(0.4, 1500, 500, 0.06, "down"), 26.15)

# ---------- 7: Gradient ASCII → the product → one click → zoom through (26.25 – 32.7) ----------
for k in range(16):                                         # characters forming
    place(hat(0.022 + 0.002 * (k % 5), 0.03), 26.3 + k * 0.1, pan=-0.6 + (k % 7) * 0.2)
place(pad([midi(n) for n in [53, 60, 64, 67, 69, 76]], 1.9, 0.06, 0.25, 0.5, 2600), 26.3)
place(swoosh(0.3, 900, 2600, 0.05), 27.42)                  # the characters turn orange
place(swoosh(0.5, 2600, 700, 0.06, "down"), 27.92)          # the ASCII clears to the product
place(pad([midi(n) for n in FMAJ7], 3.0, 0.055, 0.4, 0.9, 2200), 28.0)
groove(28.6, 31.5, kick_g=0.48, bass_g=0.23, pluck_g=0.065, bar0=2)
place(pop(1100, 0.1, 0.09), 29.98)                          # Draft done
place(swoosh(0.7, 700, 1700, 0.03), 30.1)                   # the cursor sets off for the button
place(click(0.06, 2800), 30.82, pan=0.2)                    # hover
place(click(0.24, 3300), 31.35)                             # the click — once
place(pop(900, 0.12, 0.07), 31.37)
for k, n in enumerate([76, 81, 84, 88]):                    # approved & sent
    place(pluck(midi(n), 0.1, 1.0, 4600), 31.45 + k * 0.06, pan=-0.3 + 0.2 * k)
place(riser(0.7, 0.14), 31.5)                               # the camera dives into the button
place(swoosh(0.75, 300, 4800, 0.12), 31.55)
place(impact(0.2), 31.97)                                   # inside the button
place(swoosh(0.7, 3400, 600, 0.09, "down"), 32.17)          # the orange lifts away like a page
place(pad([midi(n) for n in [53, 60, 64, 67, 69, 76]], 1.4, 0.06, 0.1, 1.0, 2800), 32.4)   # the website is revealed
# (the level-clear jingle plays separately as the website settles)

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
