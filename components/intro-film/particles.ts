/**
 * Scenes S9–S13 on one canvas: the square bursts into shapes ("Even when it's
 * complex,"), the shapes snap into a tile grid ("I make it clear."), the grid
 * holds behind the stats, then clears from the outside in, leaving the centre
 * tile, which turns charcoal and is handed to the DOM blob.
 * Everything is a pure function of the reference time r.
 */
import { COLORS, clamp01, inOutCubic, lerp, outExpo, prog, rng } from "./timeline";
import type { Layout } from "./layout";

type Kind = 0 | 1 | 2 | 3; // rounded square, circle, diamond, chevron
type Shape = {
  kind: Kind;
  color: string;
  size: number; // in layout.shape units
  bx: number; by: number; // burst target, 0..1 of viewport
  ex: number; ey: number; // burst target adjusted to keep the centre text clear
  rot: number; vr: number;
  dx: number; dy: number; // drift, viewport fraction per second
  tile: number; // index into grid tiles
};
type Tile = { x: number; y: number; color: string; dist: number };

const N = 92;
const PALETTE: [string, number][] = [
  [COLORS.charcoal, 0.18],
  ["#D9D9D9", 0.2],
  ["#E6E6E6", 0.16],
  ["#BDBDBD", 0.08],
  [COLORS.orangeTint, 0.2], // replaces the reference's lavender
  [COLORS.orange, 0.1],
  [COLORS.orange2, 0.08],
];
const TILE = "#F0F0F0";
const TILE_DASH = "#DDDDDD";

function pick(r: () => number) {
  let x = r();
  for (const [c, w] of PALETTE) {
    if ((x -= w) <= 0) return c;
  }
  return PALETTE[0][0];
}

function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
}

export class Particles {
  private shapes: Shape[] = [];
  private tiles: Tile[] = [];
  private centerTile = 0;
  private lines: [number, number][] = [];
  private L!: Layout;
  private dpr = 1;
  constructor(private canvas: HTMLCanvasElement) {
    const r = rng(20261104);
    for (let i = 0; i < N; i++) {
      let bx = 0, by = 0;
      do {
        bx = 0.03 + r() * 0.94;
        by = 0.06 + r() * 0.88;
      } while (Math.abs(bx - 0.5) < 0.33 && Math.abs(by - 0.5) < 0.1); // keep the line of text readable
      this.shapes.push({
        kind: (r() < 0.45 ? 0 : r() < 0.55 ? 1 : r() < 0.6 ? 2 : 3) as Kind,
        color: pick(r),
        size: 2.4 + r() * 5.6,
        bx, by, ex: bx, ey: by,
        rot: (r() - 0.5) * 1.6,
        vr: (r() - 0.5) * 0.25,
        dx: (r() - 0.5) * 0.012,
        dy: (r() - 0.5) * 0.012,
        tile: 0,
      });
    }
    for (let i = 0; i < 12; i++) this.lines.push([Math.floor(r() * N), Math.floor(r() * N)]);
  }

  /** Centre of the centre tile (where the charcoal circle grows from). */
  get center() {
    const t = this.tiles[this.centerTile];
    return t ? { x: t.x, y: t.y, size: this.L.grid.tile } : { x: 0, y: 0, size: 0 };
  }

  /** band: half-size of the centre text in px (kept clear of shapes). */
  layout(L: Layout, band = { hw: 0, hh: 0 }) {
    this.L = L;
    this.shapes.forEach((s) => {
      const half = (s.size * L.shape) / 2 + 8;
      const x = s.bx * L.vw, y = s.by * L.vh;
      s.ex = s.bx;
      s.ey = s.by;
      if (Math.abs(x - L.cx) < band.hw + half && Math.abs(y - L.cy) < band.hh + half) {
        const edge = band.hh + half + 4;
        s.ey = (L.cy + (y < L.cy ? -edge : edge) + (y - L.cy) * 0.6) / L.vh;
        s.ey = Math.min(0.97, Math.max(0.03, s.ey));
      }
    });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(L.vw * this.dpr);
    this.canvas.height = Math.round(L.vh * this.dpr);
    // Grid aligned so one tile sits exactly at the centre of the screen.
    const { tile, gap } = L.grid;
    const step = tile + gap;
    const cols = Math.ceil(L.vw / step / 2) + 1;
    const rows = Math.ceil(L.vh / step / 2) + 1;
    const r = rng(77);
    this.tiles = [];
    let maxDist = 1;
    for (let gy = -rows; gy <= rows; gy++) {
      for (let gx = -cols; gx <= cols; gx++) {
        const x = L.cx + gx * step, y = L.cy + gy * step;
        const roll = r();
        const color = gx === 0 && gy === 0 ? TILE : roll < 0.025 ? "#D2D2D2" : roll < 0.045 ? COLORS.orangeTint : TILE;
        const dist = Math.hypot(x - L.cx, y - L.cy);
        maxDist = Math.max(maxDist, dist);
        if (gx === 0 && gy === 0) this.centerTile = this.tiles.length;
        this.tiles.push({ x, y, color, dist });
      }
    }
    this.tiles.forEach((t) => (t.dist /= maxDist));
    // Each shape snaps to a distinct visible tile near its burst position.
    const taken = new Set<number>([this.centerTile]);
    this.shapes.forEach((s) => {
      let best = -1, bd = Infinity;
      this.tiles.forEach((t, i) => {
        if (taken.has(i) || t.x < 0 || t.y < 0 || t.x > L.vw || t.y > L.vh) return;
        const d = Math.hypot(t.x - s.ex * L.vw, t.y - s.ey * L.vh);
        if (d < bd) { bd = d; best = i; }
      });
      if (best < 0) best = Math.floor(s.bx * this.tiles.length) % this.tiles.length;
      taken.add(best);
      s.tile = best;
    });
  }

  private shapePath(c: CanvasRenderingContext2D, kind: Kind, s: number, radius: number) {
    c.beginPath();
    if (kind === 1 && radius >= 0.49) {
      c.arc(0, 0, s / 2, 0, Math.PI * 2);
    } else if (kind === 3 && radius < 0.2) {
      c.moveTo(-s / 2, -s / 2); c.lineTo(s / 4, -s / 2); c.lineTo(s / 2, 0); c.lineTo(s / 4, s / 2); c.lineTo(-s / 2, s / 2); c.lineTo(-s / 4, 0); c.closePath();
    } else {
      const rr = s * Math.min(0.5, radius);
      if (typeof c.roundRect === "function") c.roundRect(-s / 2, -s / 2, s, s, rr);
      else c.rect(-s / 2, -s / 2, s, s);
    }
  }

  /** Draws the canvas for reference time r. Returns false when nothing is visible. */
  render(r: number): boolean {
    const c = this.canvas.getContext("2d");
    if (!c || !this.L) return false;
    const L = this.L;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, L.vw, L.vh);
    if (r < 6.43 || r > 10.7) return false;

    const { tile } = L.grid;
    const k = L.shape;
    const burst = outExpo(prog(r, 6.45, 6.85));
    const snap = inOutCubic(prog(r, 7.95, 8.2));
    const origin = { x: L.card.cx, y: L.card.cy };
    const clearStart = 10.0;

    // Tiles (fade in as the shapes land; clear outside-in from 10.0)
    if (r >= 8.0) {
      this.tiles.forEach((t, i) => {
        const appear = clamp01((r - 8.02 - ((i * 37) % 11) * 0.012) / 0.16);
        const isTarget = this.shapes.some((s) => s.tile === i);
        let sc = isTarget ? (r >= 8.2 ? 1 : 0) : appear;
        let color = t.color;
        if (r >= clearStart) {
          if (i === this.centerTile) {
            color = mix(TILE, COLORS.charcoal, prog(r, 10.03, 10.12));
            if (r > 10.12) return; // handed over to the DOM blob
          } else {
            sc *= 1 - inOutCubic(prog(r, clearStart + (1 - t.dist) * 0.32, clearStart + (1 - t.dist) * 0.32 + 0.22));
          }
        }
        if (sc <= 0.01) return;
        const s = tile * sc;
        c.save();
        c.translate(t.x, t.y);
        c.fillStyle = color;
        this.shapePath(c, 0, s, 0.22);
        c.fill();
        if (sc > 0.6 && color === TILE) {
          c.fillStyle = TILE_DASH;
          c.globalAlpha = (sc - 0.6) / 0.4;
          if (typeof c.roundRect === "function") {
            c.beginPath();
            c.roundRect(-s * 0.16, -s * 0.03, s * 0.32, s * 0.06, s * 0.03);
            c.fill();
          }
        }
        c.restore();
      });
    }

    if (r >= 8.2) return true;

    // Connecting lines during the burst
    const linesA = prog(r, 6.6, 6.9) * (1 - prog(r, 7.85, 7.98));
    const pos = this.shapes.map((s) => {
      const drift = Math.max(0, r - 6.8);
      const bx = s.ex * L.vw + s.dx * L.vw * drift;
      const by = s.ey * L.vh + s.dy * L.vh * drift;
      const t = this.tiles[s.tile];
      const x0 = lerp(origin.x, bx, burst), y0 = lerp(origin.y, by, burst);
      return { x: lerp(x0, t.x, snap), y: lerp(y0, t.y, snap) };
    });
    if (linesA > 0) {
      c.strokeStyle = "rgba(150,150,150,0.45)";
      c.lineWidth = 1;
      c.globalAlpha = linesA;
      this.lines.forEach(([a, b], i) => {
        const p = pos[a], q = pos[b];
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.bezierCurveTo(p.x + 80 * Math.sin(i), p.y - 120, q.x - 60, q.y + 90 * Math.cos(i), q.x, q.y);
        c.stroke();
      });
      c.globalAlpha = 1;
    }

    // Shapes, with a motion-blur trail while they move fast
    const fast = (r < 6.8 ? 1 - burst : 0) + (r > 7.95 ? Math.sin(Math.PI * snap) : 0);
    const ghosts = fast > 0.08 ? 4 : 1;
    this.shapes.forEach((s, i) => {
      const t = this.tiles[s.tile];
      const p = pos[i];
      const size = lerp(lerp(s.size * k * 0.25, s.size * k, burst), tile, snap);
      const rot = lerp(s.rot * burst + s.vr * Math.max(0, r - 6.8), 0, snap);
      const radius = lerp(s.kind === 1 ? 0.5 : s.kind === 0 ? 0.22 : 0.05, 0.22, snap);
      const kind: Kind = snap > 0.5 ? 0 : s.kind;
      const color = snap > 0 ? mix(s.color.startsWith("#") ? s.color : "#DDDDDD", t.color, snap) : s.color;
      for (let g = ghosts - 1; g >= 0; g--) {
        const back = g * 0.045 * fast;
        const gx = lerp(p.x, r < 6.8 ? origin.x : this.shapes[i].ex * L.vw, back);
        const gy = lerp(p.y, r < 6.8 ? origin.y : this.shapes[i].ey * L.vh, back);
        c.save();
        c.globalAlpha = g === 0 ? 1 : 0.18;
        c.translate(gx, gy);
        c.rotate(rot + (kind === 2 ? Math.PI / 4 : 0));
        c.fillStyle = color;
        this.shapePath(c, kind, size, radius);
        c.fill();
        c.restore();
      }
    });
    return true;
  }
}
