/**
 * The film's single clock (seconds). Every visual and audio cue is in this
 * table so pacing can be tuned in one place. ~32 s, seven chapters:
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
  scatter: [8.7, 9.5], complexIn: [9.0, 9.5], links: [10.5, 11.2], gather: [11.1, 12.3], complexOut: [12.2, 12.5],
  // 3 — I make it clear.
  assemble: [12.2, 13.4], wireIn: [13.2, 13.6], clearIn: [13.1, 13.6], clearOut: [15.2, 15.5], wireOut: [15.2, 15.6],
  // 4 — proof: all three together
  accentToRule: [15.25, 15.9], statsIn: [15.6, 16.0], roll: [15.7, 17.1], labelsIn: [16.6, 17.0], statsOut: [18.6, 18.95],
  // 5 — Figma: the sentence is set, the cursor finds "Figma", the canvas opens
  sent1In: [18.85, 19.4], cursorToFigma: [19.3, 19.95], figmaReveal: [20.0, 20.5],
  edits: [[20.55, 20.95], [21.0, 21.4], [21.45, 21.85], [21.9, 22.3]],
  // 6 — code: the second sentence, the cursor moves to "code", editor + preview
  sent2In: [22.6, 23.1], cursorToCode: [22.8, 23.45], codeReveal: [23.5, 24.0],
  code: [24.0, 24.9], ghost: [25.0, 25.4], accept: 25.45, codeHold: 25.9,
  // 7 — the product: wireframe → polished, hover, click, success, camera zoom
  toLive: [25.9, 26.5], polish: [[26.6, 27.0], [26.9, 27.3], [27.2, 27.6], [27.5, 27.9]],
  draftDone: [27.85, 28.3], cursorIn: [28.2, 28.85], hover: [28.75, 28.95], click: 29.05,
  flowDone: [29.15, 29.6], zoom: [29.35, 30.3],
  sweep: [30.4, 30.9], handoff: [31.0, 31.8],
  end: 31.85,
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
