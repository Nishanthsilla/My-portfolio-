"""
Two original sounds for the face sticker (composed here, no samples):
  swag  — two quick rising pops, "pop-pop" (hover)
  chat-open / chat-close — a crisp swipe that lands on a tiny click (and the same in reverse)

  python3 scripts/audio/compose_sticker_sounds.py
Writes public/audio/sfx/{swag,chat-open,chat-close}.{ogg,mp3}.
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

def _pop(f0, f1, rise, dur, decay):
    n = int(SR * dur); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-t / rise))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, decay)

def swag():
    """hover: two quick rising pops (pop-pop)"""
    out = np.zeros(int(SR * 0.17))
    for at, x, g in ((0.0, _pop(480, 820, 0.01, 0.09, 0.022), 0.8), (0.065, _pop(620, 1050, 0.01, 0.09, 0.022), 1.0)):
        i = int(at * SR); out[i:i + len(x)] += g * x[: len(out) - i]
    return out

def _swish(dur, f0, f1, q=2.0):
    n = int(SR * dur)
    w = sweep_noise(n, f0, f1, q=q)
    return w / np.max(np.abs(w)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2

def _click(f):
    n = int(SR * 0.02); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.003)

def _mix(parts, dur):
    out = np.zeros(int(SR * dur))
    for at, x, g in parts:
        i = int(at * SR); out[i:i + len(x)] += g * x[: len(out) - i]
    return out

def chat_open():
    """the chat slides in: a crisp, short swipe that lands on a tiny click"""
    return _mix([(0, _swish(0.10, 1200, 4200), 0.55), (0.085, _click(2400), 0.6)], 0.14)

def chat_close():
    """the chat slides away: the same swipe in reverse, a slightly lower click"""
    return _mix([(0, _swish(0.10, 4200, 1200), 0.55), (0.085, _click(1900), 0.5)], 0.14)

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
    write("chat-open", chat_open(), 0.6)
    write("chat-close", chat_close(), 0.6)
