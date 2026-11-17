"""
"Garden": a calm, game-style ambient loop for the website (composed here, no samples).
Soft pad chords, a sparse music-box melody and birdsong; seamless 48 s loop.

  python3 scripts/audio/compose_garden.py
Writes public/audio/ambient/garden.{ogg,mp3}.
"""
import subprocess, tempfile, wave
from pathlib import Path
import numpy as np

SR = 44100
BPM = 80
BEAT = 60 / BPM
BARS = 16                      # 4 chords x 4 bars... 16 bars of 4/4 = 48 s
N = int(SR * BEAT * 4 * BARS)
OUT = Path(__file__).resolve().parents[2] / "public" / "audio" / "ambient"
rng = np.random.default_rng(42)
L = np.zeros(N); R = np.zeros(N)

def add(sig, start, pan=0.0):
    """mix into the loop, wrapping the tail around so the loop is seamless"""
    i = int(start * SR) % N
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    for k in range(0, len(sig), N):
        chunk = sig[k:k + N]
        j = (i + k) % N
        a = min(len(chunk), N - j)
        L[j:j + a] += gl * chunk[:a]; R[j:j + a] += gr * chunk[:a]
        if a < len(chunk):
            L[:len(chunk) - a] += gl * chunk[a:]; R[:len(chunk) - a] += gr * chunk[a:]

def hz(m): return 440 * 2 ** ((m - 69) / 12)

# chords (MIDI): Cmaj7, Am7, Fmaj7, G6 — each two bars, played twice
CHORDS = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 53, 57, 64], [43, 50, 59, 64]]
bar = BEAT * 4
for c in range(8):
    notes = CHORDS[c % 4]
    dur = bar * 2
    n = int(SR * (dur + 2.5)); t = np.arange(n) / SR
    env = np.minimum(1, t / 1.2) * np.where(t < dur, 1, np.exp(-(t - dur) / 0.9))
    for m in notes:
        f = hz(m)
        s = np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
        add(0.035 * s * env, c * dur, pan=rng.uniform(-0.4, 0.4))

# music box: sparse pentatonic notes over the chords
SCALE = [72, 74, 76, 79, 81, 84, 86, 88]
def pluck(f, d=1.6):
    n = int(SR * d); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-t / 0.15) + 0.15 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-t / 0.05)
    return s * np.minimum(1, t / 0.003) * np.exp(-t / 0.55)
phrase = []
for beat in range(BARS * 4):
    if rng.random() < 0.42:
        phrase.append((beat * BEAT + (0.5 * BEAT if rng.random() < 0.3 else 0), SCALE[rng.integers(len(SCALE))]))
for at, m in phrase:
    add(0.11 * pluck(hz(m)), at, pan=rng.uniform(-0.6, 0.6))
    add(0.03 * pluck(hz(m)), at + 0.32, pan=rng.uniform(-0.8, 0.8))  # a soft echo

# birds: short chirps in little groups, far left and right
def chirp(f0, f1, d):
    n = int(SR * d); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (t / d) ** 0.7 + 180 * np.sin(2 * np.pi * 38 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
t0 = 1.0
while t0 < N / SR:
    kind = rng.integers(3); pan = rng.choice([-0.85, -0.6, 0.6, 0.85]); g = rng.uniform(0.012, 0.03)
    k = rng.integers(2, 6)
    for j in range(k):
        if kind == 0: s = chirp(3200, 4600, 0.06)
        elif kind == 1: s = chirp(4800, 2900, 0.09)
        else: s = chirp(2600, 3800, 0.045)
        add(g * s, t0 + j * rng.uniform(0.09, 0.16), pan=pan)
    t0 += rng.uniform(2.2, 5.5)

# a whisper of breeze
noise = rng.standard_normal(N)
breeze = np.convolve(noise, np.ones(400) / 400, "same")
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * np.arange(N) / N * 3)
L += 0.05 * breeze * lfo; R += 0.05 * np.roll(breeze, 3000) * lfo

mix = np.stack([L, R], 1)
mix /= np.max(np.abs(mix)) / 0.6
pcm = (mix * 32767).astype("<i2")
with tempfile.TemporaryDirectory() as d:
    w = Path(d) / "garden.wav"
    with wave.open(str(w), "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(w), "-c:a", "libopus", "-b:a", "64k", str(OUT / "garden.ogg")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(w), "-c:a", "libmp3lame", "-b:a", "112k", str(OUT / "garden.mp3")], check=True)
print("garden", N / SR, "s")
