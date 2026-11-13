"""
The website's sounds (everything except the intro film, which has its own score).

  python3 scripts/audio/compose_site_sounds.py [path/to/kenney/packs]

1. Short effects taken from Kenney's audio packs — CC0 1.0 (public domain),
   kenney.nl — trimmed, normalised and encoded (see docs/sound-credits.md).
2. Original sounds composed here from scratch (no samples): the note-posted
   "pop + done", the cat's "mrrp?" and indignant meow, the rubber duck's squeak,
   the bath splash, and the calm ambient piece for the Photography gallery.

Writes public/audio/sfx/*.{ogg,mp3} and public/audio/ambient/*.{ogg,mp3}
(Ogg Opus first; MP3 for browsers without Opus).
"""
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parents[2]
SFX = ROOT / "public" / "audio" / "sfx"
AMB = ROOT / "public" / "audio" / "ambient"
rng = np.random.default_rng(7)

# Kenney CC0 files used, and what each one becomes on the site
KENNEY = {
    "folder-1": "book_flip_2.ogg",   # a folder opens: pages slide out
    "pick": "book_flip_3.ogg",       # the Wall: a note is picked up
    "drop": "handle_small_leather.ogg",  # the Wall: a note lands (soft tap)
    "open": "book_flip_2.ogg",       # a case study opens (page flip)
    "tink": "metal_click.ogg",       # the cat: the cord's ring is pulled
    "blind": "cloth_belt.ogg",       # the cat: the blind rolls down
}


# ---------------------------------------------------------------- helpers
def write_wav(path, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(pcm.shape[1])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def encode(wav, out_base, kbps_opus=48, kbps_mp3=96):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libopus", "-b:a", f"{kbps_opus}k", str(out_base) + ".ogg"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", f"{kbps_mp3}k", str(out_base) + ".mp3"], check=True)


def normalise(x, peak_db=-3.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * 10 ** (peak_db / 20)


def fade(x, a=0.004, r=0.02):
    x = x.copy()
    A, R = int(a * SR), int(r * SR)
    if A:
        x[:A] *= np.linspace(0, 1, A)[:, None] if x.ndim > 1 else np.linspace(0, 1, A)
    if R:
        x[-R:] *= np.linspace(1, 0, R)[:, None] if x.ndim > 1 else np.linspace(1, 0, R)
    return x


def fft_filter(x, lo=None, hi=None):
    """Zero-phase band-limit (gentle: cosine skirts) without scipy."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= np.clip((f - lo * 0.7) / (lo * 0.3), 0, 1) ** 2
    if hi:
        g *= np.clip((hi * 1.4 - f) / (hi * 0.4), 0, 1) ** 2
    return np.fft.irfft(X * g, n)


def formant_voice(f0, formants, dur, breath=0.04, harmonics=24):
    """A voiced sound: harmonics of f0(t), weighted by moving formant peaks [(F(t), bw, gain), ...]."""
    n = len(f0)
    phase = 2 * np.pi * np.cumsum(f0) / SR
    out = np.zeros(n)
    for k in range(1, harmonics + 1):
        fk = f0 * k
        w = np.zeros(n)
        for F, bw, g in formants:
            w += g * np.exp(-0.5 * ((fk - F) / bw) ** 2)
        w *= fk < SR / 2 - 1000
        out += w * np.sin(k * phase) / k ** 0.3
    out += breath * fft_filter(rng.standard_normal(n), 1500, 7000)
    return out


def curve(points, n):
    """Piecewise-linear contour from [(t0, v0), (t1, v1), ...] over n samples (t in 0..1)."""
    t = np.linspace(0, 1, n)
    ts, vs = zip(*points)
    return np.interp(t, ts, vs)


# ---------------------------------------------------------------- the cat
def mrrp():
    """A curious trill: "mrrp?" rising at the end."""
    d = 0.42
    n = int(d * SR)
    f0 = curve([(0, 420), (0.55, 470), (1, 720)], n)
    trill = 1 - 0.55 * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * np.arange(n) / SR)) * curve([(0, 1), (0.6, 1), (0.75, 0), (1, 0)], n)
    F1 = curve([(0, 650), (0.6, 700), (1, 900)], n)
    F2 = curve([(0, 1300), (0.6, 1500), (1, 2100)], n)
    v = formant_voice(f0, [(F1, 160, 1.0), (F2, 260, 0.55), (3300, 400, 0.18)], d)
    env = curve([(0, 0), (0.05, 1), (0.8, 0.9), (1, 0)], n)
    return normalise(fade(v * trill * env, 0.006, 0.05), -4)


def meow():
    """An indignant "mi-AOW!" (caught in the bath)."""
    d = 0.62
    n = int(d * SR)
    f0 = curve([(0, 560), (0.25, 820), (0.55, 760), (1, 470)], n)
    f0 *= 1 + 0.012 * np.sin(2 * np.pi * 6.5 * np.arange(n) / SR)
    F1 = curve([(0, 330), (0.3, 950), (0.7, 820), (1, 480)], n)   # i -> a -> ow
    F2 = curve([(0, 2300), (0.3, 1500), (0.7, 1150), (1, 850)], n)
    v = formant_voice(f0, [(F1, 150, 1.0), (F2, 240, 0.6), (3100, 380, 0.2)], d, breath=0.06)
    env = curve([(0, 0), (0.06, 0.8), (0.3, 1), (0.75, 0.75), (1, 0)], n)
    return normalise(fade(v * env, 0.008, 0.08), -4)


def squeak():
    """A rubber duck: two quick squeaks."""
    parts = []
    for d, a, b in [(0.11, 1900, 2500), (0.15, 2100, 2650)]:
        n = int(d * SR)
        f = curve([(0, a), (0.4, b), (1, b * 0.94)], n)
        ph = np.cumsum(f) / SR
        buzz = np.tanh(3 * np.sin(2 * np.pi * ph)) + 0.35 * np.sin(4 * np.pi * ph)
        env = curve([(0, 0), (0.12, 1), (0.7, 0.8), (1, 0)], n)
        parts += [buzz * env, np.zeros(int(0.045 * SR))]
    x = fft_filter(np.concatenate(parts), 900, 6500)
    return normalise(fade(x, 0.002, 0.01), -7)


def splash():
    """Water: a soft whoosh of filtered noise, then a few droplets."""
    d = 0.75
    n = int(d * SR)
    t = np.arange(n) / SR
    body = fft_filter(rng.standard_normal(n), 300, 5200) * np.exp(-t / 0.13) * (1 - np.exp(-t / 0.006))
    hiss = fft_filter(rng.standard_normal(n), 2500, 9000) * 0.35 * np.exp(-t / 0.22)
    drops = np.zeros(n)
    for at in rng.uniform(0.08, 0.6, 7):
        i = int(at * SR)
        m = int(0.05 * SR)
        if i + m >= n:
            continue
        tt = np.arange(m) / SR
        f = rng.uniform(900, 2200) * (1 + 1.8 * tt / 0.05)          # water drops chirp upwards
        drops[i:i + m] += 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.012)
    return normalise(fade(body + hiss + drops, 0.002, 0.08), -6)


# ---------------------------------------------------------------- the Wall: posting a note
def sticky_pop():
    """A soft 'pop' as the note sticks, then a gentle two-note 'done' (E6 → A6)."""
    d = 0.55
    n = int(d * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    m = int(0.05 * SR)
    tt = t[:m]
    x[:m] += np.sin(2 * np.pi * (420 + 900 * np.exp(-tt / 0.01)) * tt) * np.exp(-tt / 0.015)
    for at, f in [(0.07, 1318.5), (0.16, 1760.0)]:
        i = int(at * SR)
        tt = t[: n - i]
        x[i:] += 0.32 * (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt / 0.12) * (1 - np.exp(-tt / 0.002))
    return normalise(fade(x, 0.001, 0.05), -6)


# ---------------------------------------------------------------- photography ambience
def reverb(x, secs=3.2, mix=0.35, seed=3):
    """Convolution with a decaying-noise impulse (stereo, via FFT)."""
    r = np.random.default_rng(seed)
    m = int(secs * SR)
    t = np.arange(m) / SR
    out = np.zeros((len(x) + m - 1, 2))
    for c in range(2):
        ir = r.standard_normal(m) * np.exp(-t / (secs / 6.5))
        ir = fft_filter(ir, 150, 6000)
        ir /= np.sqrt(np.sum(ir ** 2))
        L = 1 << int(np.ceil(np.log2(len(x) + m)))
        wet = np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir, L), L)[: len(x) + m - 1]
        out[:, c] = wet
    dry = np.zeros_like(out)
    dry[: len(x)] = x
    return (1 - mix) * dry + mix * out * 0.8


def ambient_photography(loop=64.0):
    """Calm, warm pads and a few soft bell notes; a seamless 64 s loop."""
    chords = [  # midi notes, 16 s each: Fmaj9 · Am7add11 · Dm9 · B♭maj9(#11)
        [41, 53, 57, 60, 64, 67],
        [45, 52, 55, 60, 62, 67],
        [38, 50, 53, 57, 60, 64],
        [46, 53, 57, 62, 64, 69],
    ]
    seg = loop / len(chords)
    tail = 6.0
    n = int((loop + tail) * SR)
    t = np.arange(n) / SR
    mix = np.zeros((n, 2))
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for i, ch in enumerate(chords):
        start = i * seg - 1.5            # overlap so chords breathe into each other
        length = seg + 4.0
        a, b = int(max(0, start) * SR), int(min(n / SR, start + length) * SR)
        tt = t[a:b] - start
        env = np.clip(tt / 3.5, 0, 1) ** 1.5 * np.clip((length - tt) / 4.0, 0, 1) ** 1.5
        for j, m in enumerate(ch):
            for c, det in enumerate((-0.0018, 0.0018)):
                f = hz(m) * (1 + det * (1 if j % 2 else -1))
                ph = 2 * np.pi * f * tt + j
                tone = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.07 * np.sin(3 * ph)
                lfo = 0.75 + 0.25 * np.sin(2 * np.pi * (0.07 + 0.013 * j) * tt + c)
                mix[a:b, c] += tone * env * lfo * (0.55 if m < 48 else 0.32)
    # soft bell-like notes (pentatonic over the harmony), placed sparsely
    scale = [65, 67, 69, 72, 74, 76, 79, 81]
    at = 1.5
    while at < loop - 1.0:
        m = int(rng.choice(scale))
        d = 4.5
        a = int(at * SR)
        b = min(n, a + int(d * SR))
        tt = t[a:b] - at
        f = hz(m)
        bell = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2.01 * f * tt) * np.exp(-tt / 0.6) + 0.12 * np.sin(2 * np.pi * 3.0 * f * tt) * np.exp(-tt / 0.3))
        bell *= np.exp(-tt / 1.6) * (1 - np.exp(-tt / 0.004)) * 0.42
        pan = rng.uniform(0.3, 0.7)
        mix[a:b, 0] += bell * (1 - pan)
        mix[a:b, 1] += bell * pan
        at += rng.uniform(2.2, 4.8)
    for c in range(2):
        mix[:, c] = fft_filter(mix[:, c], 60, 5200)
    wet = reverb(mix, 3.6, 0.45)
    # wrap the tail onto the start: the loop point is seamless
    L = int(loop * SR)
    out = wet[:L].copy()
    rest = wet[L:]
    out[: len(rest)] += rest[: L]
    return normalise(out, -9)


# ---------------------------------------------------------------- build
def main():
    packs = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    SFX.mkdir(parents=True, exist_ok=True)
    AMB.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        if packs:
            for name, file in KENNEY.items():
                src = next(packs.rglob(file))
                wav = tmp / f"{name}.wav"
                # trim silence, normalise (–4 dBFS peak), mono, 48 kHz
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ac", "1", "-ar", str(SR),
                                "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-20:TP=-4:LRA=7",
                                str(wav)], check=True)
                encode(wav, SFX / name)
                print("kenney  ", name, "<-", file)
        for name, fn in [("mrrp", mrrp), ("meow", meow), ("squeak", squeak), ("splash", splash), ("post", sticky_pop)]:
            wav = tmp / f"{name}.wav"
            write_wav(wav, fn())
            encode(wav, SFX / name)
            print("composed", name)
        wav = tmp / "photography.wav"
        write_wav(wav, ambient_photography())
        encode(wav, AMB / "photography", kbps_opus=64, kbps_mp3=112)
        print("composed photography ambience")


if __name__ == "__main__":
    main()
