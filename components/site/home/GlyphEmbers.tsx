"use client";

import { useEffect, useRef } from "react";

/**
 * Glyph embers: a quiet field of type characters that warms up from the
 * bottom of the screen and drifts upward like embers off a fire. Brighter
 * characters for hotter spots, a few loose sparks rising and fading, and a
 * little extra warmth wherever the pointer moves. Drawn on a canvas, kept very
 * faint (it is background), paused when off screen, and a still frame for
 * people who prefer reduced motion.
 */
const GLYPHS = " ·.:;-+*×✦#%@";
const HOT: [number, number, number] = [255, 73, 56]; // #FF4938
const WARM: [number, number, number] = [255, 160, 64];

export default function GlyphEmbers({ className, cell = 15, rise = 0.62 }: { className?: string; cell?: number; rise?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // smooth value noise (seeded, cheap)
    const P = new Uint8Array(512);
    for (let i = 0; i < 256; i++) P[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [P[i], P[j]] = [P[j], P[i]];
    }
    for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    const fade = (t: number) => t * t * (3 - 2 * t);
    const hash = (x: number, y: number) => P[(P[x & 255] + y) & 511] / 255;
    const noise = (x: number, y: number) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = fade(x - xi), yf = fade(y - yi);
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
    };

    let w = 0, h = 0, cols = 0, rows = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = host.clientWidth;
      h = host.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
    };

    type Spark = { x: number; y: number; vy: number; vx: number; life: number; g: string };
    const sparks: Spark[] = [];
    const pointer = { x: -1e4, y: -1e4, heat: 0 };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `500 ${cell * 0.86}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const s = t * 0.00045; // the field rises slowly
      const band = rows * rise;
      for (let r = rows - 1; r >= rows - band - 1 && r >= 0; r--) {
        const fromBottom = (rows - 1 - r) / band; // 0 at the bottom, 1 at the top of the band
        const base = Math.pow(1 - Math.min(1, fromBottom), 1.6);
        if (base <= 0.02) continue;
        for (let c = 0; c < cols; c++) {
          const n = noise(c * 0.11, r * 0.16 + s * 6) * 0.65 + noise(c * 0.29 + 40, r * 0.33 + s * 11) * 0.35;
          const cx = c * cell + cell / 2, cy = r * cell + cell / 2;
          const near = pointer.heat * Math.max(0, 1 - Math.hypot(cx - pointer.x, cy - pointer.y) / 160);
          const heat = Math.min(1, base * (0.35 + n * 1.05) + near * 0.5 - 0.12);
          if (heat <= 0.06) continue;
          const g = GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(heat * GLYPHS.length))];
          if (g === " ") continue;
          const k = Math.min(1, heat * 1.2);
          const col = WARM.map((v, i) => Math.round(v + (HOT[i] - v) * k));
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${(0.25 + heat * 0.75).toFixed(3)})`;
          ctx.fillText(g, cx, cy);
        }
      }
      // loose sparks drifting up out of the field
      for (const p of sparks) {
        const a = Math.max(0, Math.min(1, p.life)) * 0.9;
        ctx.fillStyle = `rgba(255,${Math.round(90 + 70 * (1 - p.life))},56,${a.toFixed(3)})`;
        ctx.fillText(p.g, p.x, p.y);
      }
    };

    let raf = 0, last = 0, visible = true;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 33) return; // ~30 fps is plenty for embers
      const dt = Math.min(64, t - last);
      last = t;
      if (sparks.length < Math.max(8, cols / 3) && Math.random() < 0.35) {
        sparks.push({ x: Math.random() * w, y: h - Math.random() * h * 0.2, vy: 0.02 + Math.random() * 0.035, vx: (Math.random() - 0.5) * 0.012, life: 1, g: "·.*✦+"[Math.floor(Math.random() * 5)] });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.y -= p.vy * dt;
        p.x += p.vx * dt + Math.sin((t + i * 300) * 0.002) * 0.25;
        p.life -= dt * 0.00045;
        if (p.life <= 0 || p.y < h * 0.15) sparks.splice(i, 1);
      }
      pointer.heat *= 0.96;
      draw(t);
    };

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.heat = Math.min(1, pointer.heat + 0.12);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (calm) draw(0);
    });
    ro.observe(host);
    if (calm) {
      draw(0);
      return () => ro.disconnect();
    }
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(host);
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", vis);
    host.addEventListener("pointermove", move);
    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      host.removeEventListener("pointermove", move);
    };
  }, [cell, rise]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
