/**
 * Chapter 4 — "fragments become a system".
 * Real interface fragments unfurl from a dot into one slowly turning tangle
 * ("Even when it's complex,"). A guide line and a grid appear, then each
 * fragment straightens and glides into its slot, nearest first, assembling a
 * clean screen ("I make it clear."). Everything fades back except the orange
 * primary button, which becomes a dot and carries us into the stats.
 * Pure function of time; drawn on one canvas.
 */
import { COLORS, T, clamp01, inOutQuint, lerp, outQuint, prog, rng, span } from "./timeline";
import type { Layout } from "./layout";

type Kind = "bar" | "dot" | "pill" | "card" | "chart" | "toggle" | "input" | "avatar" | "tag" | "check" | "slider" | "btn" | "primary";
type Frag = { kind: Kind; slot: [number, number, number, number]; tx: number; ty: number; rot: number; sc: number; delay: number };

// Slots on a 12 × 7 grid inside the system frame.
const FRAGS: [Kind, [number, number, number, number]][] = [
  ["bar", [0, 0, 12, 0.9]],
  ["dot", [0.45, 0.22, 0.46, 0.46]],
  ["pill", [9.3, 0.24, 2.3, 0.42]],
  ["bar", [0.45, 1.5, 2.1, 0.4]],
  ["bar", [0.45, 2.15, 1.7, 0.4]],
  ["bar", [0.45, 2.8, 1.9, 0.4]],
  ["card", [2.95, 1.4, 4.5, 3.05]],
  ["chart", [3.45, 2.15, 3.5, 1.95]],
  ["card", [7.8, 1.4, 3.75, 3.05]],
  ["toggle", [8.2, 1.85, 1.25, 0.58]],
  ["input", [8.2, 2.72, 2.95, 0.62]],
  ["avatar", [8.2, 3.6, 0.62, 0.62]],
  ["bar", [9.05, 3.76, 1.9, 0.3]],
  ["tag", [2.95, 4.95, 1.55, 0.55]],
  ["tag", [4.7, 4.95, 1.85, 0.55]],
  ["check", [2.95, 5.95, 0.55, 0.55]],
  ["slider", [3.85, 6.1, 3.1, 0.24]],
  ["btn", [7.4, 5.8, 1.95, 0.78]],
  ["primary", [9.6, 5.8, 1.95, 0.78]],
];
const LINKS: [number, number][] = [[6, 8], [7, 10], [9, 18], [13, 17], [3, 6]];
const PRIMARY = FRAGS.length - 1;

export class SystemScene {
  private frags: Frag[];
  private L!: Layout;
  private dpr = 1;
  constructor(private canvas: HTMLCanvasElement) {
    const r = rng(1104);
    const n = FRAGS.length;
    this.frags = FRAGS.map(([kind, slot], i) => {
      // Tangle: an overlapping cluster around the frame centre, angled pieces.
      const a = (i / n) * Math.PI * 2 + r() * 0.9;
      const rad = 0.12 + r() * 0.26;
      // Wide pieces are compacted in the tangle so no single slab dominates it.
      const wide = slot[2] > 4 ? 0.55 : slot[2] > 3 ? 0.8 : 1;
      return { kind, slot, tx: Math.cos(a) * rad, ty: Math.sin(a) * rad * 0.7, rot: (r() - 0.5) * 0.7, sc: (0.88 + r() * 0.25) * wide, delay: 0 };
    });
    // Assembly order: nearest to the centre first.
    const maxD = Math.max(...this.frags.map((f) => Math.hypot(f.tx, f.ty)));
    this.frags.forEach((f) => (f.delay = (Math.hypot(f.tx, f.ty) / maxD) * 0.55));
  }

  layout(L: Layout) {
    this.L = L;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(L.vw * this.dpr);
    this.canvas.height = Math.round(L.vh * this.dpr);
  }

  private slotRect(f: Frag) {
    const { sys } = this.L;
    const cw = sys.w / 12, rh = sys.h / 7;
    const [c, r, w, h] = f.slot;
    return { x: sys.cx - sys.w / 2 + (c + w / 2) * cw, y: sys.cy - sys.h / 2 + (r + h / 2) * rh, w: w * cw, h: h * rh };
  }

  private rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    c.beginPath();
    if (typeof c.roundRect === "function") c.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
    else c.rect(x, y, w, h);
  }

  private drawFrag(c: CanvasRenderingContext2D, f: Frag, w: number, h: number, accent: number) {
    const C = COLORS;
    const x = -w / 2, y = -h / 2, m = Math.min(w, h);
    switch (f.kind) {
      case "bar": c.fillStyle = C.grey; this.rr(c, x, y, w, h, h / 2); c.fill(); break;
      case "dot": c.fillStyle = C.charcoal; c.beginPath(); c.arc(0, 0, m / 2, 0, Math.PI * 2); c.fill(); break;
      case "pill": c.fillStyle = C.greyDeep; this.rr(c, x, y, w, h, h / 2); c.fill(); break;
      case "card":
        c.fillStyle = "#FFFFFF"; c.strokeStyle = C.greyDeep; c.lineWidth = 1.2;
        this.rr(c, x, y, w, h, m * 0.09); c.fill(); c.stroke(); break;
      case "chart": {
        const bars = [0.45, 0.7, 0.55, 0.9, 0.75];
        const bw = w / (bars.length * 1.6);
        bars.forEach((b, i) => {
          c.fillStyle = i === 3 ? C.charcoal : C.greyDeep;
          this.rr(c, x + i * bw * 1.6, y + h * (1 - b), bw, h * b, bw * 0.25); c.fill();
        });
        break;
      }
      case "toggle":
        c.fillStyle = C.charcoal; this.rr(c, x, y, w, h, h / 2); c.fill();
        c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(x + w - h / 2, 0, h * 0.36, 0, Math.PI * 2); c.fill(); break;
      case "input":
        c.fillStyle = "#FFFFFF"; c.strokeStyle = C.greyDeep; c.lineWidth = 1.2;
        this.rr(c, x, y, w, h, h * 0.25); c.fill(); c.stroke();
        c.fillStyle = C.grey; this.rr(c, x + h * 0.35, -h * 0.09, w * 0.45, h * 0.18, h * 0.09); c.fill(); break;
      case "avatar": c.fillStyle = C.greyDeep; c.beginPath(); c.arc(0, 0, m / 2, 0, Math.PI * 2); c.fill(); break;
      case "tag":
        c.strokeStyle = C.greyDeep; c.lineWidth = 1.2; this.rr(c, x, y, w, h, h / 2); c.stroke();
        c.fillStyle = C.grey; this.rr(c, x + h * 0.4, -h * 0.1, w - h * 0.8, h * 0.2, h * 0.1); c.fill(); break;
      case "check":
        c.fillStyle = C.charcoal; this.rr(c, x, y, w, h, m * 0.2); c.fill();
        c.strokeStyle = "#FFFFFF"; c.lineWidth = Math.max(1.5, m * 0.12); c.beginPath();
        c.moveTo(x + w * 0.25, 0); c.lineTo(x + w * 0.45, y + h * 0.7); c.lineTo(x + w * 0.78, y + h * 0.3); c.stroke(); break;
      case "slider":
        c.fillStyle = C.grey; this.rr(c, x, y, w, h, h / 2); c.fill();
        c.fillStyle = C.charcoal; this.rr(c, x, y, w * 0.6, h, h / 2); c.fill();
        c.beginPath(); c.arc(x + w * 0.6, 0, h * 1.25, 0, Math.PI * 2); c.fill(); break;
      case "btn":
        c.strokeStyle = C.charcoal; c.lineWidth = 1.4; this.rr(c, x, y, w, h, h * 0.3); c.stroke();
        c.fillStyle = C.charcoal; this.rr(c, x + w * 0.28, -h * 0.07, w * 0.44, h * 0.14, h * 0.07); c.fill(); break;
      case "primary": {
        // morphs into a circle at the end (accent 0 → 1)
        const r0 = h * 0.3, rad = lerp(r0, m / 2, accent);
        c.fillStyle = C.orange; this.rr(c, x, y, w, h, rad); c.fill();
        if (accent < 0.5) {
          c.globalAlpha *= 1 - accent * 2;
          c.fillStyle = "#FFFFFF"; this.rr(c, x + w * 0.28, -h * 0.07, w * 0.44, h * 0.14, h * 0.07); c.fill();
        }
        break;
      }
    }
  }

  render(r: number) {
    const c = this.canvas.getContext("2d");
    if (!c || !this.L) return;
    const L = this.L, sys = L.sys;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, L.vw, L.vh);
    if (r < T.unfurl[0] || r > T.accentToDot[1] + 0.12) return;

    // Whole-tangle motion: one slow, coherent turn (not individual floating).
    const turn = inOutQuint(span(r, [T.unfurl[0], T.assemble[0] + 0.4])) * 0.16 - 0.08;
    const breathe = 1 + 0.015 * Math.sin(Math.max(0, r - T.unfurl[1]) * 1.4);
    const origin = { x: L.card.cx, y: L.card.cy };
    const fadeAll = 1 - span(r, T.systemOut);

    // Frame + grid (the order arriving)
    const gridA = span(r, T.grid) * (1 - span(r, [T.assemble[1] - 0.2, T.assemble[1] + 0.4])) * 0.55;
    const frameA = span(r, T.grid) * fadeAll;
    if (frameA > 0) {
      const x0 = sys.cx - sys.w / 2, y0 = sys.cy - sys.h / 2;
      c.save();
      c.globalAlpha = frameA;
      c.fillStyle = "#FFFFFF";
      c.strokeStyle = COLORS.greyDeep;
      c.lineWidth = 1.2;
      this.rr(c, x0 - sys.w * 0.03, y0 - sys.h * 0.05, sys.w * 1.06, sys.h * 1.1, sys.w * 0.025);
      c.fill(); c.stroke();
      if (gridA > 0) {
        c.globalAlpha = gridA;
        c.strokeStyle = COLORS.grey;
        c.lineWidth = 1;
        for (let i = 1; i < 12; i++) {
          const x = x0 + (sys.w / 12) * i;
          c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + sys.h); c.stroke();
        }
      }
      c.restore();
    }
    // Guide line: one thin orange line draws across, then recedes.
    const g = outQuint(span(r, T.guide)) ;
    const gA = 1 - span(r, [T.assemble[1] - 0.65, T.clearIn[0] - 0.05]); // gone before the headline rises
    if (g > 0 && gA > 0) {
      const y = sys.cy - sys.h / 2 - sys.h * 0.05;
      c.save();
      c.strokeStyle = COLORS.orange;
      c.globalAlpha = gA;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(lerp(L.cx, 0, g), y);
      c.lineTo(lerp(L.cx, L.vw, g), y);
      c.stroke();
      c.restore();
    }

    // Fragment positions
    const pos = this.frags.map((f, i) => {
      const s = this.slotRect(f);
      const ang = Math.atan2(f.ty, f.tx) + turn;
      const d = Math.hypot(f.tx, f.ty);
      const tx = sys.cx + Math.cos(ang) * d * sys.w * breathe;
      const ty = sys.cy + Math.sin(ang) * d * sys.w * breathe;
      const u = outQuint(prog(r, T.unfurl[0] + i * 0.022, T.unfurl[0] + i * 0.022 + 0.75));
      // unfurl along a gentle arc from the dot
      const arc = Math.sin(Math.PI * u) * sys.h * 0.08 * (i % 2 ? 1 : -1);
      let x = lerp(origin.x, tx, u), y = lerp(origin.y, ty, u) + arc;
      let rot = (f.rot + turn) * u, sc = f.sc * u;
      const a = inOutQuint(prog(r, T.assemble[0] + f.delay, T.assemble[0] + f.delay + 0.85));
      x = lerp(x, s.x, a); y = lerp(y, s.y, a); rot = lerp(rot, 0, a); sc = lerp(sc, 1, a);
      return { x, y, rot, sc, s, a };
    });

    // Connectors: tangled curves that straighten as the system assembles.
    const linkA = span(r, [T.unfurl[0] + 0.4, T.unfurl[1]]) * (1 - span(r, [T.assemble[1] - 0.1, T.assemble[1] + 0.35]));
    if (linkA > 0) {
      c.save();
      c.strokeStyle = COLORS.muted;
      c.globalAlpha = 0.45 * linkA * fadeAll;
      c.lineWidth = 1;
      LINKS.forEach(([i, j], k) => {
        const p = pos[i], q = pos[j];
        const tangle = 1 - Math.min(p.a, q.a);
        const bend = sys.h * 0.35 * tangle * (k % 2 ? 1 : -1);
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.bezierCurveTo(p.x + bend, p.y - bend, q.x - bend, q.y + bend, q.x, q.y);
        c.stroke();
      });
      c.restore();
    }

    // Fragments (cards first so their contents sit on top)
    const order = this.frags.map((_, i) => i).sort((a, b) => (this.frags[a].kind === "card" ? -1 : 0) - (this.frags[b].kind === "card" ? -1 : 0));
    const accent = inOutQuint(span(r, T.accentToDot));
    order.forEach((i) => {
      const f = this.frags[i], p = pos[i];
      if (p.sc <= 0.01) return;
      const isPrimary = i === PRIMARY;
      let alpha = isPrimary ? 1 : fadeAll;
      let { x, y } = p;
      let w = p.s.w, h = p.s.h;
      if (isPrimary && accent > 0) {
        const d = Math.min(p.s.h, L.vh * 0.04);
        x = lerp(x, L.stats.heroX, accent);
        y = lerp(y, L.stats.heroY, accent);
        w = lerp(w, d, accent);
        h = lerp(h, d, accent);
        alpha = 1 - span(r, [T.accentToDot[1] - 0.02, T.accentToDot[1] + 0.12]);
      }
      if (alpha <= 0) return;
      c.save();
      c.globalAlpha = clamp01(alpha);
      c.translate(x, y);
      c.rotate(p.rot);
      c.scale(p.sc, p.sc);
      this.drawFrag(c, f, w, h, accent);
      c.restore();
    });
  }
}
