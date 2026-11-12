/**
 * The film's single clock (seconds). Every visual and audio cue is listed
 * here, so pacing can be tuned in one place. Rhythm per beat: introduce the
 * visual → let it read → present the message → hold → transition.
 */
export const T = {
  // Ch1 — Hello
  typeStart: 0.15, typeEnd: 0.95,
  marksOut: [1.6, 1.95], collapse: [1.95, 2.5], dotIn: [2.3, 2.7],
  // Ch2 — Name
  dotToPeriod: [2.75, 3.5], nameIn: [3.0, 3.8], pillIn: [4.0, 4.55],
  nameOut: [5.6, 6.05], dotToCard: [5.75, 6.5],
  // Ch3 — What I make
  lines: [6.2, 6.34, 6.48], lineDur: 0.7, cardIn: [6.55, 7.2],
  verbs: [7.2, 8.25, 9.3, 10.35, 11.4, 12.45], thing: 13.5,
  highlight: [13.78, 14.18], cardToDot: [13.5, 14.0], headOut: [14.7, 15.1],
  // Ch4 — Complexity → clarity
  unfurl: [15.0, 15.9], complexIn: [15.75, 16.45], complexOut: [17.95, 18.35],
  guide: [18.05, 18.65], grid: [18.25, 18.75], assemble: [18.5, 19.95],
  clearIn: [19.85, 20.55], clearOut: [21.5, 21.85], systemOut: [21.55, 22.05], accentToDot: [21.6, 22.2],
  // Ch5 — Proof (stats)
  statStart: 22.3, statEvery: 1.75, statToRow: 1.55, rowSettle: [27.95, 28.45], rowHoldEnd: 28.9,
  // Ch6 — Craft
  pullBack: [28.9, 29.4], darkGrow: [29.3, 29.95],
  type1: [30.1, 31.0], selIn: [31.05, 31.45], type2: [31.95, 32.6], typeCode: [32.6, 32.95], selToCode: [33.0, 33.45],
  // Ch7 — Finale
  blockToCircle: [34.1, 34.4], sweep: [34.4, 34.95], handoff: [35.05, 35.95],
  end: 36.0,
} as const;

/** The level-clear sound's last note lands as the orange dot reaches the logo. */
export const VICTORY_AT = T.handoff[1] - 0.62;
export const DARK_RANGE = [29.75, 34.6] as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const prog = (r: number, a: number, b: number) => clamp01((r - a) / (b - a));
export const span = (r: number, s: readonly [number, number] | readonly number[]) => prog(r, s[0], s[1]);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* One easing family: quintic for travel, cubic for small moves. No overshoot. */
export const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const inCubic = (t: number) => t * t * t;
export const outQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const inQuint = (t: number) => t * t * t * t * t;
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

/** Approved palette. Orange on light = #C65D35; #E47B45 only on charcoal. */
export const COLORS = {
  warm: "#FAF9F6",
  charcoal: "#242424",
  grey: "#E8E5E1",
  greyDeep: "#D6D2CC",
  orange: "#C65D35",
  orangeOnDark: "#E47B45",
  ink: "#242424",
  muted: "#8C8781",
  helloGrey: "#C9C5BF",
};
