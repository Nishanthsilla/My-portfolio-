/**
 * The film's single clock (seconds). Every visual and audio cue is in this
 * table so pacing can be tuned in one place. ~33 s, seven chapters:
 *   Prologue + 1 (intro) · 2 complexity · 3 clarity · 4 proof ·
 *   5–6 Figma, then code (typography + selection) · 7 finished product + reveal
 */
export const T = {
  // Prologue — /* Hello World */ types in light, then settles to Semibold as the marks part
  typeStart: 0.1, typeEnd: 0.6, settle: [0.7, 1.12],
  collapse: [1.3, 1.6], dotIn: [1.42, 1.66],
  dotToPeriod: [1.55, 2.1], nameIn: [1.6, 2.2], pillIn: [2.3, 2.7],
  nameOut: [3.15, 3.5], dotToCard: [3.2, 3.75],
  // 1 — I make things that help others do their …
  lines: [3.45, 3.55, 3.65], lineDur: 0.55, cardIn: [3.8, 4.25],
  verbs: [4.25, 4.82, 5.39, 5.96, 6.53, 7.1], verbStep: 0.57, thing: 7.67,
  highlight: [7.8, 8.1], cardToDot: [7.67, 8.0], headOut: [8.55, 8.85],
  // 2 — Even when it's complex,  (documents and data, some from the sides)
  scatter: [8.7, 9.6], complexIn: [9.0, 9.5], links: [10.4, 11.2], gather: [11.1, 12.0], complexOut: [11.95, 12.25],
  // 3 — I make it clear.  chaos (both sides) → the transform frame → clarity
  spread: [12.05, 12.8], extrasIn: [12.25, 13.05], gateIn: [12.2, 12.85], clearIn: [12.35, 12.9],
  flowStart: 13.2, flowStagger: 0.17, flowTravel: 0.72,
  clearOut: [16.6, 16.9], wireOut: [16.6, 17.0],
  // 4 — proof: all three together
  accentToRule: [16.65, 17.3], statsIn: [17.0, 17.4], roll: [17.1, 18.5], labelsIn: [18.0, 18.4], statsOut: [20.0, 20.35],
  // 5 + 6 — both sentences; the cursor hovers "Figma" (design state), then "code" (code state)
  sent1In: [20.25, 20.8], sent2In: [20.4, 20.95], cursorIn5: [21.0, 21.6],
  figmaAt: 21.55, toCode: [23.15, 23.7], codeAt: 23.65, sentOut: [26.15, 26.55],
  // 7 — "…ship it in code." clears to a full-screen Gradient ASCII; its characters turn #FF4938
  //     (asciiTint), then it fades away to the finished product (crIn); the cursor approaches and clicks Approve & send once; the camera zooms
  //     through the button and the website emerges from inside its surface (zoom.ts).
  asciiMount: 25.6, asciiIn: [26.3, 26.55], asciiTint: [27.45, 27.7],
  crIn: [27.95, 28.35],
  draftDone: [29.55, 30.05],
  cursorIn: [30.1, 30.95], hover: [30.8, 31.0], click: 31.35,
  approved: [31.43, 31.68], flowDone: [31.45, 31.95],
  push: [31.5, 32.35], reveal: [31.98, 32.68],
  handoff: [31.8, 32.68],
  end: 32.72,
} as const;

/** The level-clear sound's held note lands as the website settles. */
export const VICTORY_AT = T.handoff[1] - 0.62;
/** No full-dark chapter. */
export const DARK_RANGE = [-1, -1] as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const prog = (r: number, a: number, b: number) => clamp01((r - a) / (b - a));
export const span = (r: number, s: readonly number[]) => prog(r, s[0], s[1]);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* One easing family: quintic for travel, cubic for small moves. No overshoot. */
export const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const inCubic = (t: number) => t * t * t;
export const outQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const inQuint = (t: number) => t ** 5;
export const inOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
export const inOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** cubic-bezier(x1,y1,x2,y2) as a function of t (Newton solve on x). */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (X(t) - x) / d;
    }
    t = Math.min(1, Math.max(0, t));
    return ((ay * t + by) * t + cy) * t;
  };
}
/** The camera's move: eases in from rest, travels, and lands softly (no overshoot). */
export const settle = bezier(0.7, 0, 0.16, 1);
export const inOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Film colours, read from the shared brand tokens (styles/brand.css) at layout time. */
export const COLORS = {
  orange: "#FF4938",
  charcoal: "#242424",
  warm: "#FAF9F6",
  grey: "#E8E5E1",
  white: "#FFFFFF",
  muted: "#66615B",
  helloGrey: "#C9C5BF",
  ink: "#242424",
};
export function readBrandColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  COLORS.orange = v("--brand-orange", COLORS.orange);
  COLORS.charcoal = COLORS.ink = v("--brand-charcoal", COLORS.charcoal);
  COLORS.warm = v("--brand-warm", COLORS.warm);
  COLORS.grey = v("--brand-grey", COLORS.grey);
  COLORS.white = v("--brand-white", COLORS.white);
  COLORS.muted = v("--brand-muted", COLORS.muted);
}
