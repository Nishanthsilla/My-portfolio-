/**
 * The Wall — the sticky note a visitor writes on: its shape and its paper colour.
 * The server accepts these ids and nothing else.
 */
export const SHAPES = [
  { id: "square", label: "Classic" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "blob", label: "Blob" },
  { id: "torn", label: "Torn" },
] as const;
export const COLORS = [
  { id: "yellow", label: "Lemon", paper: "#FFE98F" },
  { id: "pink", label: "Bubblegum", paper: "#FFC8D5" },
  { id: "blue", label: "Sky", paper: "#C3E2FF" },
  { id: "green", label: "Mint", paper: "#CDEFC4" },
  { id: "lilac", label: "Lilac", paper: "#DFD4FF" },
  { id: "peach", label: "Peach", paper: "#FFD3B5" },
] as const;
export type ShapeId = (typeof SHAPES)[number]["id"];
export type ColorId = (typeof COLORS)[number]["id"];
export const DEFAULT_SHAPE: ShapeId = "square";
export const DEFAULT_COLOR: ColorId = "yellow";
export const SHAPE_IDS = new Set<string>(SHAPES.map((s) => s.id));
export const COLOR_IDS = new Set<string>(COLORS.map((c) => c.id));
export const paperOf = (id?: string) => (COLORS.find((c) => c.id === id) ?? COLORS[0]).paper;
