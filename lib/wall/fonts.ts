/**
 * The Wall — the handwriting a visitor can pick for their note (Google Fonts,
 * loaded only on the wall). The server accepts these ids and nothing else.
 */
export type WallFont = { id: string; label: string; family: string; scale: number; weight?: number };

export const FONTS: WallFont[] = [
  { id: "scribble", label: "Scribble", family: '"Caveat", cursive', scale: 1.28, weight: 600 },
  { id: "marker", label: "Marker", family: '"Permanent Marker", cursive', scale: 1.02 },
  { id: "bubbly", label: "Bubbly", family: '"Chewy", system-ui, sans-serif', scale: 1.08 },
  { id: "typewriter", label: "Typewriter", family: '"Special Elite", "Courier New", monospace', scale: 0.98 },
  { id: "serif", label: "Serif", family: '"Instrument Serif", Georgia, serif', scale: 1.22 },
  { id: "sans", label: "Sans", family: '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif', scale: 1, weight: 500 },
];

export const DEFAULT_FONT = "scribble";
export const FONT_IDS = new Set(FONTS.map((f) => f.id));
export const fontById = (id?: string) => FONTS.find((f) => f.id === id) ?? FONTS[0];

/** One stylesheet for all of them (display=swap: text shows at once in a fallback). */
export const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Chewy&family=Instrument+Serif&family=Permanent+Marker&family=Special+Elite&display=swap";
