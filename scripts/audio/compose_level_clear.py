"""
Original retro "level clear" sound (Game Boy-style: two pulse voices + noise
drum, ~1.3 s). Composed from scratch — not taken from any game.

    python3 scripts/audio/compose_level_clear.py  ->  public/audio/level-clear.mp3
The last (held) note starts 0.62 s in; the film starts it so that note lands
exactly as the orange dot reaches the logo (VICTORY_AT in timeline.ts).
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parents[2] / "public" / "audio"
rng = np.random.default_rng(3)


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def env(n, a=0.003, r=0.03):
    e = np.ones(n)
    A, R = max(1, int(a * SR)), max(1, min(n, int(r * SR)))
    e[:A] = np.linspace(0, 1, A)
    e[-R:] *= np.linspace(1, 0, R)
    return e


def pulse(f, d, duty=0.5, vib=0.0, vr=6):
    n = int(d * SR)
    t = np.arange(n) / SR
    ph = np.cumsum(f * (1 + vib * np.sin(2 * np.pi * vr * t))) / SR
    return np.where((ph % 1) < duty, 1.0, -1.0)


def noise(d, decay):
    n = int(d * SR)
    return rng.standard_normal(n) * np.exp(-np.arange(n) / SR / decay)


x = np.zeros(int(1.4 * SR))


def put(sig, t, g):
    i = int(t * SR)
    x[i : i + len(sig)] += sig[: len(x) - i] * g


for m, t, d in [(76, 0.00, 0.10), (79, 0.11, 0.10), (81, 0.22, 0.10), (83, 0.33, 0.10), (84, 0.48, 0.12), (88, 0.62, 0.55)]:
    put(pulse(note(m), d, 0.25, vib=0.01 if d > 0.3 else 0) * env(int(d * SR), 0.003, 0.06 if d < 0.3 else 0.3), t, 0.45)
for m, t, d in [(60, 0.0, 0.2), (64, 0.22, 0.2), (65, 0.48, 0.12), (67, 0.62, 0.55)]:
    put(pulse(note(m), d, 0.5) * env(int(d * SR), 0.003, 0.08), t, 0.22)
for t in [0.0, 0.22, 0.48, 0.62]:
    put(noise(0.06, 0.012), t, 0.25)

x = x / np.abs(x).max() * 0.5
OUT.mkdir(parents=True, exist_ok=True)
wav = OUT / "level-clear.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-b:a", "192k", str(OUT / "level-clear.mp3")], check=True)
wav.unlink()
print("wrote", OUT / "level-clear.mp3")
