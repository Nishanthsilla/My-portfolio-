/**
 * Finds the enclosed counter (the hole) of a glyph, e.g. the bowl of "p", and
 * returns its centre and elliptical radii in viewport coordinates. The zoom
 * uses this as its focal point and as the shape of the homepage aperture, so
 * the camera travels through the actual letter on any viewport size.
 */
export type Focal = { x: number; y: number; rx: number; ry: number; measured: boolean };

const SAMPLE_PX = 160;

export function measureCounter(glyphEl: HTMLElement, baselineEl: HTMLElement): Focal {
  const rect = glyphEl.getBoundingClientRect();
  const cs = getComputedStyle(glyphEl);
  const fontSize = parseFloat(cs.fontSize);
  const fallback: Focal = {
    x: rect.left + rect.width * 0.55,
    y: baselineEl.getBoundingClientRect().top - fontSize * 0.26,
    rx: fontSize * 0.11,
    ry: fontSize * 0.15,
    measured: false,
  };

  try {
    const char = glyphEl.textContent ?? "";
    const k = fontSize / SAMPLE_PX;
    const pad = Math.ceil(SAMPLE_PX * 0.25);
    const w = Math.ceil(SAMPLE_PX * 1.2) + pad * 2;
    const h = Math.ceil(SAMPLE_PX * 1.6) + pad * 2;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !char) return fallback;

    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${SAMPLE_PX}px ${cs.fontFamily}`;
    ctx.textBaseline = "alphabetic";
    const baseY = pad + SAMPLE_PX * 1.05;
    ctx.fillStyle = "#000";
    ctx.fillText(char, pad, baseY);

    const data = ctx.getImageData(0, 0, w, h).data;
    const ink = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) ink[i] = data[i * 4 + 3] > 110 ? 1 : 0;

    // Flood-fill the outside; any untouched empty pixel is inside a counter.
    const outside = new Uint8Array(w * h);
    const stack: number[] = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const i = stack.pop()!;
      if (outside[i] || ink[i]) continue;
      outside[i] = 1;
      const x = i % w;
      if (x > 0) stack.push(i - 1);
      if (x < w - 1) stack.push(i + 1);
      if (i >= w) stack.push(i - w);
      if (i < w * (h - 1)) stack.push(i + w);
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let count = 0;
    for (let i = 0; i < w * h; i++) {
      if (ink[i] || outside[i]) continue;
      const x = i % w;
      const y = (i / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      count++;
    }
    if (count < 20) return fallback;
    const bx = (minX + maxX + 1) / 2;
    const by = (minY + maxY + 1) / 2;

    const baselineY = baselineEl.getBoundingClientRect().top;
    return {
      x: rect.left + (bx - pad) * k,
      y: baselineY + (by - baseY) * k,
      rx: ((maxX - minX + 1) / 2) * k,
      ry: ((maxY - minY + 1) / 2) * k,
      measured: true,
    };
  } catch {
    return fallback;
  }
}
