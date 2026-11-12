/**
 * Which introduction plays before the portfolio.
 *  - "motion-film":   the ~36 s motion film (components/intro-film) — ACTIVE
 *  - "gradient-mesh": the cinematic gradient-mesh loader (components/legacy-loader) — kept, inactive
 *  - "none":          no intro
 * Only one intro is ever mounted.
 */
export type IntroKind = "motion-film" | "gradient-mesh" | "none";
export const ACTIVE_INTRO: IntroKind = "motion-film";

/**
 * When the motion film plays.
 *  - "every-load":       every full page load (current, convenient while reviewing)
 *  - "once-per-session": first load of a browser session only (sessionStorage)
 */
export type FilmReplay = "every-load" | "once-per-session";
export const FILM_REPLAY: FilmReplay = "every-load";

/** Audio track for the film (original score). Swap for a licensed file here. */
export const FILM_AUDIO_SRC = { mp3: "/audio/intro-film.mp3", ogg: "/audio/intro-film.ogg" };

/** Original retro "level clear" sound — plays only when the film completes (never on skip). */
export const FILM_VICTORY_SRC = "/audio/level-clear.mp3";
