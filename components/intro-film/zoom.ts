/**
 * Zoom Through — the camera dives into the product's Approve & send button and
 * the website emerges from inside its orange surface (adapted from the
 * vawe.dev "zoom-through" video component, supplied as reference code).
 *
 *  · One camera: the whole dashboard is a single plane. Scale follows a log
 *    path (constant perceived speed) while the dive point drifts to the
 *    middle of the screen, so the rest of the dashboard leaves the frame on
 *    its own and the button surface overruns all four edges.
 *  · Stacked exposure: N copies of the shot, each sampled at a slightly
 *    different moment inside a 180° shutter (half a frame of travel) and laid
 *    over each other at opacity 1/(j+1), which averages them into real motion
 *    blur. When the camera is slow the copies coincide (no blur); at full
 *    speed they streak.
 *  · Ground swap: once a copy's button fills the frame, that copy shows the
 *    button colour instead of the dashboard, so dashboard → orange is itself
 *    blurred across the shutter, never a cut.
 *  · Shot B: the website, held inside the surface at 1/R scale, fades up as the
 *    camera approaches and lands at exactly full frame.
 *
 */
import { T, clamp01, settle, span } from "./timeline";

type Place = { cx: number; cy: number; s: number };
type Rect = { x: number; y: number; w: number; h: number };
type Spec = { fx: number; fy: number; fill: number; S: number; lnS: number };

export type ZoomGeo = {
  rest: Place; // the product at rest, in board units
  crW: number;
  crH: number;
  bx: number;
  by: number;
  bs: number;
  vw: number;
  vh: number;
  btn: Rect; // the button, in product units
  label: Rect | null; // "✓ Sent", in product units
  radius: number; // button corner radius, product units
};

const N = 8; // exposures
const FRAME = 1 / 60; // shutter reference: one frame at 60 fps
const SHUTTER = 0.5; // 180°

export class ZoomThrough {
  private layers: { el: HTMLDivElement; a: HTMLElement | null; inB: boolean | null }[] = [];
  private b: HTMLDivElement;
  private bInner: HTMLElement | null = null;
  private g: ZoomGeo | null = null;
  private dive: Spec | null = null;
  private built = false;
  private ground = "#FF4938";
  private warm = "#FAF9F6";

  constructor(private wrap: HTMLElement, private source: HTMLElement) {
    wrap.textContent = "";
    for (let j = 0; j < N; j++) {
      const el = document.createElement("div");
      el.className = "zl";
      el.style.cssText = `position:absolute;inset:0;overflow:hidden;opacity:${(1 / (j + 1)).toFixed(4)};`;
      wrap.appendChild(el);
      this.layers.push({ el, a: null, inB: null });
    }
    this.b = document.createElement("div");
    this.b.setAttribute("data-zoom-b", "");
    this.b.style.cssText = "position:absolute;left:0;top:0;overflow:hidden;transform-origin:50% 50%;opacity:0;will-change:transform,opacity;";
    wrap.appendChild(this.b);
    // display (not visibility): the copies inside carry inline visibility:visible, which would
    // override a hidden ancestor
    wrap.style.display = "none";
  }

  layout(g: ZoomGeo, colors: { ground: string; warm: string }) {
    this.g = g;
    this.ground = colors.ground;
    this.warm = colors.warm;
    const b = g.btn;
    // dive point: on the surface between the left edge and "✓ Sent", so we never fly into the type
    const lx = g.label ? g.label.x : b.x + b.w * 0.34;
    const dive = this.solve((b.x + g.radius * 0.6 + lx) / 2, b.y + b.h / 2, 1.6);
    this.dive = dive;
    this.b.style.width = `${g.vw}px`;
    this.b.style.height = `${g.vh}px`;
    this.built = false;
  }

  /** Screen position of a point of the product (product units) when the camera is at rest. */
  restPoint(x: number, y: number) {
    const g = this.g!;
    const x0 = g.rest.cx - (g.crW * g.rest.s) / 2, y0 = g.rest.cy - (g.crH * g.rest.s) / 2;
    return { x: g.bx + (x0 + x * g.rest.s) * g.bs, y: g.by + (y0 + y * g.rest.s) * g.bs };
  }

  /**
   * Zoom factor at which the button (corners included) covers the whole viewport,
   * found together with the path length S (the drift depends on S).
   */
  private solve(fx: number, fy: number, overshoot: number): Spec {
    const g = this.g!;
    let S = 40, fill = 20;
    for (let it = 0; it < 5; it++) {
      const lnS = Math.log(S);
      let k = 1;
      while (k < 4000) {
        const c = this.cam({ fx, fy, fill, S, lnS }, Math.log(k) / lnS);
        const r = g.radius * c.sc;
        const L = c.x + g.btn.x * c.sc + r, Rr = c.x + (g.btn.x + g.btn.w) * c.sc - r;
        const Tt = c.y + g.btn.y * c.sc + r, B = c.y + (g.btn.y + g.btn.h) * c.sc - r;
        if (L <= 0 && Rr >= g.vw && Tt <= 0 && B >= g.vh) break;
        k *= 1.01;
      }
      fill = k;
      S = fill * overshoot;
    }
    return { fx, fy, fill, S, lnS: Math.log(S) };
  }

  /** The camera at path position pj (0 = rest, 1 = end): the product's top-left and scale on screen. */
  private cam(sp: Spec, pj: number) {
    const g = this.g!;
    const k = Math.exp(sp.lnS * pj);
    const f0 = this.restPoint(sp.fx, sp.fy);
    const d = Math.max(0, Math.min(1, pj));
    const px = f0.x + (g.vw / 2 - f0.x) * d, py = f0.y + (g.vh / 2 - f0.y) * d;
    const sc = g.rest.s * g.bs * k;
    return { x: px - sp.fx * sc, y: py - sp.fy * sc, sc, k };
  }

  private toBoard(c: { x: number; y: number; sc: number }): Place {
    const g = this.g!;
    const s = c.sc / g.bs;
    const x0 = (c.x - g.bx) / g.bs, y0 = (c.y - g.by) / g.bs;
    return { cx: x0 + (g.crW * s) / 2, cy: y0 + (g.crH * s) / 2, s };
  }

  /** Camera path position (0 = at rest, 1 = the website at full frame). */
  private path(r: number) {
    return settle(span(r, T.push));
  }

  /** Board-space place of the product for the live (single) element. */
  place(r: number): Place {
    if (!this.g) return { cx: 0, cy: 0, s: 1 };
    if (r < T.push[0]) return this.g.rest;
    return this.toBoard(this.cam(this.dive!, this.path(r)));
  }

  /** Whether the stacked layers are carrying the picture (the live product is hidden). */
  layered(r: number) {
    return !!this.g && r >= T.approved[1] + 0.04 && r < T.end + 1;
  }

  private build() {
    this.built = true;
    this.layers.forEach((l) => {
      l.el.textContent = "";
      const a = this.source.cloneNode(true) as HTMLElement;
      a.removeAttribute("data-cr");
      a.style.position = "absolute";
      a.style.left = "0";
      a.style.top = "0";
      a.style.opacity = "1";
      a.style.visibility = "inherit";
      a.style.willChange = "auto"; // no forced GPU layer: at 30× it would be rasterised enormous
      l.el.appendChild(a);
      l.a = a;
      l.inB = null;
    });
  }

  /** Shot B: a still copy of the website, made ahead of the dive (while the cursor travels) so the dive never waits on it. */
  private ensureB() {
    if (this.bInner) return;
    const site = document.querySelector<HTMLElement>("[data-site]");
    if (!site) return;
    const c = site.cloneNode(true) as HTMLElement;
    c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    c.removeAttribute("data-site");
    c.setAttribute("aria-hidden", "true");
    c.style.pointerEvents = "none";
    this.b.style.background = getComputedStyle(site).backgroundColor || this.warm;
    this.b.appendChild(c);
    this.bInner = c;
  }

  render(r: number) {
    const g = this.g;
    if (g && r >= T.cursorIn[0] && !this.bInner) this.ensureB();
    const on = !!g && this.layered(r);
    const d = on ? "block" : "none";
    if (this.wrap.style.display !== d) this.wrap.style.display = d;
    if (!on || !g) {
      if (this.b.style.opacity !== "0") this.b.style.opacity = "0";
      return;
    }
    if (!this.built) this.build();

    const sp = this.dive!;
    const p = this.path(r);
    const p2 = this.path(r + FRAME);
    const spread = SHUTTER * (p2 - p);
    // how far the shot moves within the shutter (px): below ~half a pixel the exposures coincide,
    // so only the first is drawn (the average of identical copies is the copy itself)
    const ca = this.cam(sp, p - spread / 2), cb = this.cam(sp, p + spread / 2);
    const blurPx = Math.abs(ca.x - cb.x) + Math.abs(ca.y - cb.y) + Math.abs(ca.sc - cb.sc) * g.crW;
    const n = blurPx < 0.5 ? 1 : N;
    this.layers.forEach((l, j) => {
      const ld = j < n ? "" : "none";
      if (l.el.style.display !== ld) l.el.style.display = ld;
      if (j >= n) return;
      const pj = p + (j / (N - 1) - 0.5) * spread;
      const c = this.cam(sp, pj);
      const inB = c.k >= sp.fill;
      if (l.inB !== inB) {
        l.inB = inB;
        l.el.style.background = inB ? this.ground : this.warm;
        if (l.a) l.a.style.visibility = inB ? "hidden" : "inherit";
      }
      if (!inB && l.a) {
        l.a.style.transform = `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px) scale(${c.sc.toFixed(5)})`;
      }
    });

    // shot B — the website — inside the surface
    if (this.bInner) {
      const k = Math.exp(sp.lnS * p);
      const q = k / sp.S;
      const a = clamp01((k - 0.52 * sp.fill) / (0.2 * sp.fill));
      this.b.style.opacity = a > 0.001 ? a.toFixed(3) : "0";
      if (a > 0.001) {
        this.b.style.transform = q >= 0.9995 ? "none" : `scale(${q.toFixed(5)})`;
        this.b.style.borderRadius = q >= 0.9995 ? "0" : `${((18 * (1 - q)) / Math.max(q, 0.02)).toFixed(2)}px`;
      }
    } else if (this.b.style.opacity !== "0") this.b.style.opacity = "0";
  }
}
