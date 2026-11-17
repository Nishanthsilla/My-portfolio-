"""
Two original sounds for the face sticker (composed here, no samples):
  swag  — a quick bright two-note "bling" when the pixel glasses appear (hover)
  talk  — a soft bubble pop when the chat opens (click / tap)

  python3 scripts/audio/compose_sticker_sounds.py
Writes public/audio/sfx/{swag,talk}.{ogg,mp3}.
"""
import subprocess, tempfile, wave
from pathlib import Path
import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[2] / "public" / "audio" / "sfx"

def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.minimum(1, t / attack)
    return a * np.exp(-t / decay)

def bell(freq, dur, decay):
    n = int(SR * dur); t = np.arange(n) / SR
    # a soft bell: fundamental + gentle inharmonic partials
    s = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / (decay * 0.4)) + 0.18 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t / (decay * 0.2))
    return s * env(n, 0.002, decay)

def swag():
    n = int(SR * 0.42); out = np.zeros(n)
    for start, f, g in ((0.0, 1318.5, 0.55), (0.075, 1975.5, 0.7)):  # E6 then B6
        b = bell(f, 0.42 - start, 0.11) * g
        i = int(start * SR); out[i:i + len(b)] += b[: n - i]
    # a whisper of shimmer
    t = np.arange(n) / SR
    noise = np.random.default_rng(3).standard_normal(n)
    hp = noise - np.convolve(noise, np.ones(6) / 6, "same")
    out += 0.05 * hp * np.exp(-t / 0.05) * (t > 0.07)
    return out

def talk():
    n = int(SR * 0.16); t = np.arange(n) / SR
    f = 260 + 900 * (1 - np.exp(-t / 0.018))  # quick upward sweep: a bubble
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, 0.0015, 0.045)
    click = np.zeros(n); click[:80] = np.hanning(160)[80:] * 0.35
    return s + click

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
    write("swag", swag(), 0.7)
    write("talk", talk(), 0.75)
