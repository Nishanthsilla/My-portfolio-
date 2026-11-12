/**
 * One shared clock drives every layer of the intro. All visual values are pure
 * functions of elapsed time, so nothing can drift out of sync.
 */

export const T = {
  bgIn: [0, 500],
  line1: [450, 1450],
  line2: [600, 1600],
  holdEnd: 2000,
  /** Zoom + homepage reveal share one progress value z over this window. */
  zoom: [2000, 3700],
} as const;

export const T_REDUCED = {
  bgIn: [0, 300],
  text: [250, 850],
  holdEnd: 1700,
  out: [1700, 2200],
} as const;

/** Longest we will hold for the homepage to become ready before forcing the reveal. */
export const MAX_READY_WAIT = 2500;
/** Hard ceiling: the loader always gets out of the way. */
export const FAILSAFE_MS = 9000;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const range = (t: number, [a, b]: readonly [number, number]) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const smoothstep = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/**
 * Final aperture size relative to the letter's counter. Slightly over 1 so the
 * soft edge tucks under the letter's stroke (the type layer sits above it).
 */
export const APERTURE_FIT_END = 1.06;

/** Zoom curve shaping, all expressed against the shared z in [0, 1]. */
export const zoomCurves = (z: number) => {
  // Scale is interpolated in log space so the push-in reads as a camera move
  // with steady perceived velocity, easing in and settling out.
  const scaleE = easeInOutCubic(clamp01(z / 0.8));
  // Camera drifts the focal letter towards the viewport centre.
  const travel = easeInOutCubic(clamp01(z / 0.62));
  // Aperture inside the letter counter opens once the zoom has momentum and
  // widens towards the counter's edge as we pass through it.
  const aperture = smoothstep(0.22, 0.5, z);
  const apertureFit = lerp(0.72, APERTURE_FIT_END, smoothstep(0.24, 0.6, z));
  // Homepage settles from slightly enlarged to its natural scale as it emerges.
  const settle = easeOutCubic(clamp01((z - 0.35) / 0.65));
  return { scaleE, travel, aperture, apertureFit, settle };
};
