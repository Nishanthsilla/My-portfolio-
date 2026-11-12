"""Easter-egg sticker artwork for the homepage (used by React Bits Sticker Peel).

Irregular die-cut circle, matte #FF4938 with a faint paper grain and a subtle cut
edge; "PSSST! YOU FOUND ME." in Geist Bold, white. Transparent outside the cut, so
Sticker Peel derives its die-cut outline and hit area from the alpha channel.
Run: python3 scripts/stickers/make_easter_sticker.py
"""
import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf"
OUT = ROOT / "public/images/easter/sticker.png"
S = 4                       # supersampling
N = 360                     # final size (px), shown at ~120 CSS px => sharp at 3x
W = N * S
rng = np.random.default_rng(7)

# irregular die-cut outline
cx = cy = W / 2
R = W * 0.455
pts = []
for i in range(720):
    t = i / 720 * 2 * math.pi
    r = R * (1 + 0.022 * math.sin(3 * t + 0.8) + 0.014 * math.sin(5 * t + 2.1) + 0.008 * math.sin(11 * t + 0.3))
    pts.append((cx + r * math.cos(t), cy + r * math.sin(t)))
mask = Image.new("L", (W, W), 0)
ImageDraw.Draw(mask).polygon(pts, fill=255)

# matte orange with paper grain (fine noise + a few soft fibres)
base = np.zeros((W, W, 3), np.float32)
base[:] = (255, 73, 56)
grain = rng.normal(0, 1, (W // 2, W // 2)).astype(np.float32)
grain = np.array(Image.fromarray(((grain * 18) + 128).clip(0, 255).astype(np.uint8)).resize((W, W), Image.BILINEAR).filter(ImageFilter.GaussianBlur(S * 0.6)), np.float32) - 128
fib = Image.new("L", (W, W), 0)
d = ImageDraw.Draw(fib)
for _ in range(90):
    x, y = rng.uniform(0, W, 2)
    a = rng.uniform(0, math.pi)
    L = rng.uniform(W * 0.02, W * 0.06)
    d.line([(x, y), (x + L * math.cos(a), y + L * math.sin(a))], fill=int(rng.uniform(20, 45)), width=S)
fib = np.array(fib.filter(ImageFilter.GaussianBlur(S * 0.8)), np.float32)
shade = grain * 0.22 - fib * 0.10
img = (base + shade[..., None]).clip(0, 255)

# subtle cut edge: a slightly lighter rim just inside the outline
inner = mask.filter(ImageFilter.MinFilter(S * 5 + 1))
rim = (np.array(mask, np.float32) - np.array(inner, np.float32)) / 255
rim = np.array(Image.fromarray((rim * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S * 1.2)), np.float32) / 255
img = img * (1 - rim[..., None] * 0.10) + np.array([255, 235, 228], np.float32) * rim[..., None] * 0.10

im = Image.fromarray(img.astype(np.uint8), "RGB").convert("RGBA")

# type: Geist Bold, white, three centred lines
draw = ImageDraw.Draw(im)
lines = [("PSSST!", 0.205), ("YOU FOUND", 0.118), ("ME.", 0.118)]
fonts = [ImageFont.truetype(str(FONT), int(W * sz)) for _, sz in lines]
heights = [f.getbbox(t)[3] - f.getbbox(t)[1] for (t, _), f in zip(lines, fonts)]
gap = W * 0.035
total = sum(heights) + gap * (len(lines) - 1)
y = cy - total / 2
for (t, _), f, h in zip(lines, fonts, heights):
    bb = f.getbbox(t)
    tw = bb[2] - bb[0]
    # slight letter-spacing by drawing per character
    track = W * 0.004
    widths = [f.getlength(ch) for ch in t]
    full = sum(widths) + track * (len(t) - 1)
    x = cx - full / 2
    for ch, cw in zip(t, widths):
        draw.text((x, y - bb[1]), ch, font=f, fill=(255, 255, 255, 255))
        x += cw + track
    y += h + gap

im.putalpha(mask)
im = im.resize((N, N), Image.LANCZOS)
OUT.parent.mkdir(parents=True, exist_ok=True)
im.save(OUT, optimize=True)
print("wrote", OUT, im.size, OUT.stat().st_size, "bytes")
