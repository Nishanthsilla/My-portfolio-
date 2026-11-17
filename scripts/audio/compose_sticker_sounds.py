"""
Two original sounds for the face sticker (composed here, no samples):
  swag  — a soft, round bubble pop (hover)
  talk  — a screen sliding open: an airy upward whoosh and a soft landing (the chat opens and closes)

  python3 scripts/audio/compose_sticker_sounds.py
Writes public/audio/sfx/{swag,talk}.{ogg,mp3}.
"""
import subprocess, tempfile, wave
from pathlib import Path
import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[2] / "public" / "audio" / "sfx"

rng = np.random.default_rng(11)

def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / attack) * np.exp(-t / decay)

def sweep_noise(n, f0, f1, q=1.2, curve=1.0):
    """white noise through a band-pass whose centre glides from f0 to f1 (a state-variable filter)"""
    x = rng.standard_normal(n)
    out = np.zeros(n); low = band = 0.0
    for i in range(n):
        k = (i / max(1, n - 1)) ** curve
        f = f0 * (f1 / f0) ** k
        g = 2 * np.sin(np.pi * f / SR)
        high = x[i] - low - band / q
        band += g * high
        low += g * band
        out[i] = band
    return out

def swag():
    """hover: a soft, round bubble pop"""
    n = int(SR * 0.11); t = np.arange(n) / SR
    f = 520 + 380 * (1 - np.exp(-t / 0.012))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.028)

def talk():
    """a screen sliding open: an airy whoosh that sweeps up, settling with a soft low thud"""
    n = int(SR * 0.52); t = np.arange(n) / SR
    w = sweep_noise(n, 500, 3600, q=0.9, curve=0.8)
    shape = np.clip(t / 0.22, 0, 1) ** 1.5 * np.exp(-np.clip(t - 0.24, 0, None) / 0.09)
    out = 0.8 * w / np.max(np.abs(w)) * shape
    # the panel lands
    i = int(0.25 * SR); m = int(SR * 0.12); tt = np.arange(m) / SR
    thud = np.sin(2 * np.pi * (95 + 40 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.035)
    out[i:i + m] += 0.45 * thud
    return out

def write(name, x, peak=0.8):
    x = x / np.max(np.abs(x)) * peak
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with tempfile.TemporaryDirectory() as d:
        w = Path(d) / f"{name}.wav"
        with wave.open(str(w), "wb") as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(w), "-c:a", "libopus", "-b:a", "48k", str(OUT / f"{name}.ogg")], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(w), "-c:a", "libmp3lame", "-b:a", "96k", str(OUT / f"{name}.mp3")], check=True)
    print(name, f"{len(x) / SR:.2f}s")

if __name__ == "__main__":
    write("swag", swag(), 0.6)
    write("talk", talk(), 0.7)
