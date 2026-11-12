/**
 * Responsive layout for the film. Everything is derived from the live
 * viewport: a 16:9 "frame" on landscape screens, the full width on portrait.
 * Font sizes are fitted to the space they have (measured with the real font),
 * so no line ever overflows — on any screen size.
 */
import { film } from "./content";

export type Layout = {
  vw: number;
  vh: number;
  land: boolean;
  frameL: number;
  frameW: number;
  u: number;
  pad: number;
  cx: number;
  cy: number;
  hello: { font: number; x: number; y: number };
  name: { font: number; x: number; y: number };
  pill: { font: number; x: number; y: number };
  head: { font: number; x: number; y: number; captionFont: number; captionW: number };
  card: { cx: number; cy: number; maxW: number; maxH: number };
  bigDot: number;
  center: { font: number; x: number; y: number };
  stats: { numFont: number; labelFont: number; pos: { x: number; y: number }[] };
  dark: { font: number; x: number; y1: number; y2: number };
  grid: { tile: number; gap: number };
  shape: number;
};

let ctx: CanvasRenderingContext2D | null = null;
function measure(text: string, weight: number, family: string, size = 100) {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${weight} ${size}px ${family}`;
  return ctx.measureText(text).width;
}

/** Largest font size (≤ max) at which `text` fits in `width`. */
function fit(text: string, weight: number, family: string, width: number, max: number, tracking = 0) {
  const w100 = measure(text, weight, family) + tracking * 100 * text.length;
  return Math.max(10, Math.min(max, (width / w100) * 100));
}

export function computeLayout(vw: number, vh: number, sans: string, mono: string): Layout {
  const land = vw / vh >= 1.05;
  const frameW = land ? Math.min(vw, vh * (16 / 9)) : vw;
  const frameL = (vw - frameW) / 2;
  const u = frameW / 100;
  const pad = Math.max(16, land ? 6 * u : 7 * u);
  const cx = vw / 2;
  const cy = vh / 2;
  const inner = frameW - pad * 2;

  const helloFont = fit(`/* ${film.hello} */`, 560, sans, inner * 0.92, land ? 6.8 * u : 9 * u);
  const nameFont = fit(`${film.name}.`, 600, sans, land ? frameW * 0.74 : inner, land ? 13 * u : 17 * u, -0.04);
  const longestVerb = [...film.verbs.map((v) => v.verb), film.finalVerb].sort((a, b) => b.length - a.length)[0];
  const headFont = fit(`${film.lines[2]} ${longestVerb}`, 560, sans, land ? frameW * 0.5 : inner, land ? 5.2 * u : 9.5 * u, -0.03);
  const longestCaption = film.verbs.map((v) => v.caption).sort((a, b) => b.length - a.length)[0];
  const captionW = land ? frameW * 0.44 : inner;
  const captionFont = fit(longestCaption, 400, mono, captionW, land ? 1.05 * u : 2.7 * u);
  const centerFont = fit(film.complex, 560, sans, inner * 0.92, land ? 6 * u : 9.5 * u, -0.03);
  const darkFont = fit(`then ship it in ${film.dark.code}`, 560, sans, land ? frameW * 0.7 : inner, land ? 6.2 * u : 9.5 * u, -0.03);

  // Headline block (3 lines + caption): left column on landscape, top on portrait.
  const headBlockH = headFont * 1.12 * 3 + captionFont * 3;
  const headY = land ? cy - headBlockH / 2 : Math.max(vh * 0.14, 56);
  const headBottom = headY + headBlockH;

  const card = land
    ? { cx: frameL + frameW * 0.77, cy, maxW: frameW * 0.33, maxH: Math.min(vh * 0.6, frameW * 0.36) }
    : (() => {
        const top = headBottom + vh * 0.04;
        const bottom = vh - Math.max(72, vh * 0.1); // leave room for the controls
        const maxH = Math.max(120, bottom - top);
        return { cx, cy: top + maxH / 2, maxW: inner, maxH: Math.min(maxH, inner * 1.05) };
      })();

  let stats;
  if (land) {
    const numFont = Math.min(8 * u, fit("+15%", 600, sans, frameW * 0.2, 999));
    stats = { numFont, labelFont: Math.max(10, 1.1 * u), pos: [0.25, 0.5, 0.75].map((f) => ({ x: frameL + frameW * f, y: cy })) };
  } else {
    const numFont = Math.min(18 * u, vh * 0.1);
    const step = Math.min(vh * 0.22, numFont * 2.1);
    stats = { numFont, labelFont: Math.max(11, 3.2 * u), pos: [-1, 0, 1].map((k) => ({ x: cx, y: cy + k * step })) };
  }

  const tile = land ? Math.max(38, vh * 0.115) : Math.max(38, vw * 0.15);

  return {
    vw, vh, land, frameL, frameW, u, pad, cx, cy,
    hello: { font: helloFont, x: cx, y: cy - (land ? vh * 0.04 : 0) },
    name: { font: nameFont, x: cx, y: cy - (land ? vh * 0.04 : 0) },
    pill: { font: Math.max(11, nameFont * 0.15), x: cx, y: cy - (land ? vh * 0.04 : 0) + nameFont * 0.78 },
    head: { font: headFont, x: frameL + pad, y: headY, captionFont, captionW },
    card,
    bigDot: land ? 4.6 * u : 11 * u,
    center: { font: centerFont, x: cx, y: cy },
    stats,
    dark: { font: darkFont, x: frameL + pad, y1: cy - darkFont * 0.62, y2: cy + darkFont * 0.62 },
    grid: { tile, gap: tile * 0.17 },
    shape: land ? u : u * 1.7,
  };
}
