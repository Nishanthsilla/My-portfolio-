/**
 * Shared film clock. All scene times are in REFERENCE seconds (the reference
 * film's own timestamps); the film adds a 0.2 s typing pre-roll, so
 *   film seconds = reference seconds + PREROLL.
 * The audio file is authored in film seconds.
 */
export const PREROLL = 0.2;
/** Reference time when the orange wipe covers the screen. */
export const WIPE_FULL = 13.42;
/** Handoff: orange shrinks into the header's logo dot. */
export const HANDOFF = [13.5, 14.3] as const;
export const FILM_END = HANDOFF[1];
export const VERB_TIMES = [3.0, 3.5, 4.0, 4.5, 5.0, 5.5];

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const prog = (r: number, a: number, b: number) => clamp01((r - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const inCubic = (t: number) => t * t * t;
export const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const outExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const inExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const outBack = (t: number) => {
  const c1 = 1.5, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Seeded RNG so every visitor (and every frame) sees the same burst. */
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

export const COLORS = {
  white: "#FFFFFF",
  charcoal: "#222222",
  grey: "#EDEDED",
  orange: "#D96B2F",
  orange2: "#E98243",
  orangeDeep: "#A84920",
  orangeTint: "#F6DCCB",
  ink: "#222222",
  helloGrey: "#C4C4C4",
  caption: "#9B9B9B",
};
