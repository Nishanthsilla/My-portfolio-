/**
 * Zoom Through — a page transition. After the click, the camera dives into the
 * product's Approve & send button and the button's surface opens into a window
 * onto the real website underneath the film; the window grows past every edge
 * of the screen and the film is gone (adapted from the vawe.dev "zoom-through"
 * video component, supplied as reference code).
 *
 *  · One camera: the whole dashboard is a single plane. Scale follows a log
 *    path (constant perceived speed) while the dive point drifts to the middle
 *    of the screen, so the rest of the dashboard leaves the frame on its own.
 *  · Stacked exposure: N copies of the shot, each sampled at a slightly
 *    different moment inside a 180° shutter (half a frame of travel) and laid
 *    over each other at opacity 1/(j+1), which averages them into real motion
 *    blur. When the camera is slow the copies coincide (no blur).
 *  · The page transition: once the camera is inside the button, its orange
 *    fills the whole screen for a beat; then the orange lifts away upward like
 *    a page (a soft curved lower edge that flattens as it settles), revealing
 *    the live website underneath the film, which rises gently into place.
 */
import { onIntroDone } from "@/lib/introState";
import { T, bezier, settle, span } from "./timeline";

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
/** The page transition: gathers, travels, and settles softly. */
const lift = bezier(0.62, 0, 0.3, 1);

export class ZoomThrough {
  private layers: { el: HTMLDivElement; a: HTMLElement | null; inB: boolean | null }[] = [];
  private g: ZoomGeo | null = null;
  private dive: Spec | null = null;
  private built = false;
  private ground = "#FF4938";
  private warm = "#FAF9F6";
  private film: HTMLElement | null;

  constructor(private wrap: HTMLElement, private source: HTMLElement) {
    wrap.textContent = "";
    for (let j = 0; j < N; j++) {
      const el = document.createElement("div");
      el.className = "zl";
      el.style.cssText = `position:absolute;inset:0;overflow:hidden;opacity:${(1 / (j + 1)).toFixed(4)};`;
      wrap.appendChild(el);
      this.layers.push({ el, a: null, inB: null });
    }
    // display (not visibility): the copies inside carry inline visibility, which would
    // override a hidden ancestor
    wrap.style.display = "none";
    this.film = wrap.closest<HTMLElement>("[data-intro-film]");
    // never leave the website scaled, whatever happens (skip, end)
    onIntroDone(() => this.site(null));
  }

  /** The live website under the film: rises into place during the reveal (null = at rest). */
  private site(dy: number | null) {
    const el = document.querySelector<HTMLElement>("[data-site]");
    if (!el) return;
    if (dy === null || dy < 0.05) {
      if (el.style.transform) el.style.transform = "";
      return;
    }
    el.style.transform = `translate3d(0,${dy.toFixed(2)}px,0)`;
  }

  layout(g: ZoomGeo, colors: { ground: string; warm: string }) {
    this.g = g;
    this.ground = colors.ground;
    this.warm = colors.warm;
    const b = g.btn;
    // dive point: on the surface between the left edge and "✓ Sent", so we never fly into the type
    const lx = g.label ? g.label.x : b.x + b.w * 0.34;
    // the camera travels a little past the point where the button fills the screen
    this.dive = this.solve((b.x + g.radius * 0.6 + lx) / 2, b.y + b.h / 2, 1.15);
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
    for (let it = 0; it < 6; it++) {
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

  /** Camera path position (0 = at rest, 1 = through the button). */
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

  /**
   * The page transition: the full-screen orange lifts away upward. The film layer is clipped to
   * the part still covering the page; its lower edge bows downward while it moves fastest and
   * flattens as it settles.
   */
  private clip(r: number) {
    const film = this.film, g = this.g;
    if (!film || !g) return;
    const e = r < T.reveal[0] ? 0 : lift(span(r, T.reveal));
    if (e <= 0.0005) {
      if (film.style.clipPath) film.style.clipPath = "";
      this.site(null);
      return;
    }
    const W = g.vw, H = g.vh;
    const bow = Math.sin(Math.PI * e) * H * 0.12; // how far the middle of the edge trails below its sides
    const edge = (H + bow) * (1 - e) - bow; // the sides of the lower edge (reaches -bow, so the bow clears too)
    const f = (n: number) => n.toFixed(1);
    film.style.clipPath = `path("M-2 -2 H${f(W + 2)} V${f(edge)} Q${f(W / 2)} ${f(edge + bow * 2)} -2 ${f(edge)} Z")`;
    // the page rises into place underneath
    this.site(48 * (1 - e) * (1 - e));
  }

  render(r: number) {
    const g = this.g;
    const on = !!g && this.layered(r);
    const d = on ? "block" : "none";
    if (this.wrap.style.display !== d) this.wrap.style.display = d;
    this.clip(on ? r : -1);
    if (!on || !g) return;
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
  }
}
