/**
 * The film's single clock (seconds). Every visual and audio cue is in this
 * table so pacing can be tuned in one place. ~38.5 s, seven chapters:
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
  // one word every 1.5 s (three beats at 120 BPM) so each project card can be read
  verbs: [4.25, 5.75, 7.25, 8.75, 10.25, 11.75], verbStep: 1.5, thing: 13.25,
  highlight: [13.38, 13.68], cardToDot: [13.25, 13.58], headOut: [14.13, 14.43],
  // 2 — Even when it's complex,  (documents and data, some from the sides)
  scatter: [14.28, 15.18], complexIn: [14.58, 15.08], links: [15.98, 16.78], gather: [16.68, 17.58], complexOut: [17.53, 17.83],
  // 3 — I make it clear.  chaos (both sides) → the transform frame → clarity
  spread: [17.63, 18.38], extrasIn: [17.83, 18.63], gateIn: [17.78, 18.43], clearIn: [17.93, 18.48],
  flowStart: 18.78, flowStagger: 0.17, flowTravel: 0.72,
  clearOut: [22.18, 22.48], wireOut: [22.18, 22.58],
  // 4 — proof: all three together
  accentToRule: [22.23, 22.88], statsIn: [22.58, 22.98], roll: [22.68, 24.08], labelsIn: [23.58, 23.98], statsOut: [25.58, 25.93],
  // 5 + 6 — both sentences; the cursor hovers "Figma" (design state), then "code" (code state)
  sent1In: [25.83, 26.38], sent2In: [25.98, 26.53], cursorIn5: [26.58, 27.18],
  figmaAt: 27.13, toCode: [28.73, 29.28], codeAt: 29.23, sentOut: [31.73, 32.13],
  // 7 — "…ship it in code." clears to a full-screen Gradient ASCII; its characters turn #FF4938
  //     (asciiTint), then it fades away to the finished product (crIn); the cursor approaches and clicks Approve & send once; the camera zooms
  //     through the button and the website emerges from inside its surface (zoom.ts).
  asciiMount: 31.18, asciiIn: [31.88, 32.13], asciiTint: [33.03, 33.28],
  crIn: [33.53, 33.93],
  draftDone: [35.13, 35.63],
  cursorIn: [35.68, 36.53], hover: [36.38, 36.58], click: 36.93,
  approved: [37.01, 37.26], flowDone: [37.03, 37.53],
  push: [37.08, 37.93], reveal: [37.73, 38.48],
  handoff: [37.38, 38.48],
  end: 38.53,
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
