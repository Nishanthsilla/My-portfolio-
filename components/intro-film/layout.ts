/**
 * Responsive layout for the film, recomputed from the live viewport. A 16:9
 * "frame" on landscape screens; full width (recomposed) on portrait. Type is
 * fitted to the space it has, measured with the real font.
 */
import { film } from "./content";

type Pt = { x: number; y: number };
export type Layout = {
  vw: number; vh: number; land: boolean; frameL: number; frameW: number; u: number; pad: number; cx: number; cy: number;
  hello: { font: number; x: number; y: number };
  name: { font: number; x: number; y: number };
  pill: { font: number };
  head: { font: number; x: number; y: number; captionFont: number; captionW: number };
  card: { cx: number; cy: number; maxW: number; maxH: number };
  bigDot: number;
  /** Chapter 4: headline position and the frame the fragments assemble into. */
  ch4: { font: number; x: number; y: number };
  sys: { cx: number; cy: number; w: number; h: number };
  stats: { heroFont: number; heroX: number; heroY: number; rowScale: number; labelFont: number; stage: Pt[]; slots: Pt[] };
  dark: { font: number; x: number; y1: number; y2: number };
};

let ctx: CanvasRenderingContext2D | null = null;
function measure(text: string, weight: number, family: string, size = 100) {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${weight} ${size}px ${family}`;
  return ctx.measureText(text).width;
}
function fit(text: string, weight: number, family: string, width: number, max: number, tracking = 0) {
  const w100 = measure(text, weight, family) + tracking * 100 * text.length;
  return Math.max(11, Math.min(max, (width / w100) * 100));
}

export function computeLayout(vw: number, vh: number, sans: string, mono: string): Layout {
  const land = vw / vh >= 1.05;
  const frameW = land ? Math.min(vw, vh * (16 / 9)) : vw;
  const frameL = (vw - frameW) / 2;
  const u = frameW / 100;
  const pad = Math.max(18, land ? 6.5 * u : 7 * u);
  const cx = vw / 2, cy = vh / 2;
  const inner = frameW - pad * 2;
  const controls = Math.max(76, vh * 0.1);

  const helloFont = fit(`/* ${film.hello} */`, 540, sans, inner * 0.9, land ? 6.2 * u : 9 * u);
  const nameFont = fit(`${film.name}.`, 600, sans, land ? frameW * 0.72 : inner, land ? 12 * u : 17 * u, -0.045);
  const longestVerb = [...film.verbs.map((v) => v.verb), film.finalVerb].sort((a, b) => b.length - a.length)[0];
  const headFont = fit(`${film.lines[2]} ${longestVerb}`, 540, sans, land ? frameW * 0.48 : inner, land ? 5 * u : 9.5 * u, -0.03);
  const longestCaption = film.verbs.map((v) => v.caption).sort((a, b) => b.length - a.length)[0];
  const captionW = land ? frameW * 0.46 : inner;
  const captionFont = fit(longestCaption, 400, mono, captionW, land ? 1.15 * u : 2.8 * u);
  const ch4Font = fit(film.complex, 540, sans, inner * 0.9, land ? 5.2 * u : 9.5 * u, -0.03);
  const darkFont = fit(`then ship it in ${film.dark.code}`, 540, sans, land ? frameW * 0.66 : inner, land ? 5.8 * u : 9.5 * u, -0.03);

  // Chapter 3: headline column (left on landscape, top on portrait) + card.
  const headBlockH = headFont * 1.12 * 3 + captionFont * 3.4;
  const headY = land ? cy - headBlockH / 2 : Math.max(vh * 0.13, 56);
  const headBottom = headY + headBlockH;
  const card = land
    ? { cx: frameL + frameW * 0.765, cy, maxW: frameW * 0.33, maxH: Math.min(vh * 0.58, frameW * 0.36) }
    : (() => {
        const top = headBottom + vh * 0.04;
        const maxH = Math.max(120, vh - controls - top);
        return { cx, cy: top + maxH / 2, maxW: inner, maxH: Math.min(maxH, inner * 1.05) };
      })();

  // Chapter 4: headline in the upper band, the system frame beneath it with clear air.
  const ch4Y = land ? vh * 0.17 : vh * 0.14;
  const sysTop = ch4Y + ch4Font * 1.75;
  const sysW = land ? Math.min(frameW * 0.56, (vh - controls - sysTop) / 0.66) : inner;
  const sysH = sysW * 0.6;
  const sys = { cx, cy: sysTop + sysH * 0.55, w: sysW, h: sysH };

  // Chapter 5: each number is presented large (upper area), then joins a row
  // forming below it; once all three are in, the row rises to the centre.
  const heroFont = land ? Math.min(vh * 0.3, frameW * 0.18) : Math.min(vw * 0.34, vh * 0.17);
  const rowScale = land ? 0.42 : 0.46;
  const labelFont = Math.max(13, land ? 1.75 * u : 3.8 * u);
  const rowStep = land ? frameW * 0.27 : heroFont * rowScale * 1.05 + labelFont * 2.2;
  const heroY = land ? cy - vh * 0.13 : vh * 0.24;
  const stageY = land ? cy + vh * 0.24 : heroY + heroFont * 0.9 + labelFont * 2.5;
  const stage = [-1, 0, 1].map((k) => (land ? { x: cx + k * rowStep, y: stageY } : { x: cx, y: stageY + (k + 1) * rowStep }));
  const slots = [-1, 0, 1].map((k) => (land ? { x: cx + k * rowStep, y: cy - vh * 0.03 } : { x: cx, y: cy - labelFont + k * rowStep }));

  return {
    vw, vh, land, frameL, frameW, u, pad, cx, cy,
    hello: { font: helloFont, x: cx, y: cy - (land ? vh * 0.03 : 0) },
    name: { font: nameFont, x: cx, y: cy - (land ? vh * 0.05 : vh * 0.02) },
    pill: { font: Math.max(12, nameFont * 0.15) },
    head: { font: headFont, x: frameL + pad, y: headY, captionFont, captionW },
    card,
    bigDot: land ? 3.4 * u : 8 * u,
    ch4: { font: ch4Font, x: cx, y: ch4Y },
    sys,
    stats: { heroFont, heroX: cx, heroY, rowScale, labelFont, stage, slots },
    dark: { font: darkFont, x: frameL + pad, y1: cy - darkFont * 0.65, y2: cy + darkFont * 0.6 },
  };
}
