/**
 * The film's single clock (seconds). Every visual and audio cue is in this
 * table so pacing can be tuned in one place. ~36 s, seven chapters:
 *   Prologue + 1 (intro) · 2 complexity · 3 clarity · 4 proof ·
 *   5 Figma · 6 AI-assisted code · 7 finished product + reveal
 */
export const T = {
  // Prologue — Hello / Name
  typeStart: 0.1, typeEnd: 0.6,
  marksOut: [0.85, 1.1], collapse: [1.05, 1.45], dotIn: [1.25, 1.55],
  dotToPeriod: [1.45, 2.05], nameIn: [1.6, 2.2], pillIn: [2.3, 2.7],
  nameOut: [3.15, 3.5], dotToCard: [3.2, 3.75],
  // 1 — I make things that help others do their …
  lines: [3.45, 3.55, 3.65], lineDur: 0.55, cardIn: [3.8, 4.25],
  verbs: [4.25, 4.82, 5.39, 5.96, 6.53, 7.1], verbStep: 0.57, thing: 7.67,
  highlight: [7.8, 8.1], cardToDot: [7.67, 8.0], headOut: [8.55, 8.85],
  // 2 — Even when it's complex,
  scatter: [8.7, 9.5], complexIn: [9.0, 9.5], links: [10.5, 11.2], gather: [11.1, 12.0], complexOut: [11.95, 12.25],
  // 3 — I make it clear.  chaos (both sides) → the transform frame → clarity
  spread: [12.05, 12.8], extrasIn: [12.25, 13.05], gateIn: [12.2, 12.85], clearIn: [12.35, 12.9],
  flowStart: 13.2, flowStagger: 0.17, flowTravel: 0.72,
  clearOut: [16.6, 16.9], wireOut: [16.6, 17.0],
  // 4 — proof: all three together
  accentToRule: [16.65, 17.3], statsIn: [17.0, 17.4], roll: [17.1, 18.5], labelsIn: [18.0, 18.4], statsOut: [20.0, 20.35],
  // 5 — Figma: whole sentence → reading pause → cursor to "Figma" → canvas
  sent1In: [20.25, 20.8], cursorToFigma: [21.75, 22.4], figmaReveal: [22.45, 22.95],
  edits: [[23.0, 23.4], [23.45, 23.85], [23.9, 24.3], [24.35, 24.75]],
  // 6 — code: whole sentence → reading pause → cursor to "code" → editor + preview
  sent2In: [25.05, 25.55], cursorToCode: [26.45, 27.1], codeReveal: [27.15, 27.65],
  code: [27.65, 28.55], ghost: [28.65, 29.05], accept: 29.1, codeHold: 29.55,
  // 7 — the product: wireframe → polished; hover, click, success; pull back to the whole product
  toLive: [29.55, 30.15], polish: [[30.25, 30.65], [30.55, 30.95], [30.85, 31.25], [31.15, 31.55]],
  draftDone: [31.5, 31.95], cursorIn: [31.85, 32.5], pushIn: [31.85, 32.55], hover: [32.4, 32.6], click: 32.7,
  flowDone: [32.8, 33.25], pullBack: [32.95, 33.95],
  sweep: [34.55, 35.05], handoff: [35.15, 35.95],
  end: 36.0,
} as const;

/** The level-clear sound's held note lands as the orange dot reaches the logo. */
export const VICTORY_AT = T.handoff[1] - 0.62;
/** No full-dark chapter any more (the editor is a dark panel on warm white). */
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
