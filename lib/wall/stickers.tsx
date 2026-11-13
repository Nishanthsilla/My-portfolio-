/**
 * The Wall's sticker library. Each sticker is original SVG artwork (or, later,
 * an image file): add an entry to STICKERS to extend the set — the toolbar,
 * the wall, the composer and the server's allowed list all read from here.
 *
 *   { id: "my-sticker", label: "My sticker", src: "/images/wall/stickers/my-sticker.png" }
 */
import type { ReactNode } from "react";

export const ORANGE = "#FF4938";
const INK = "#222222";
const PAPER = { butter: "#FFE58A", blush: "#FFD3DA", sky: "#CFE3FF", mint: "#D6F0C9", lilac: "#E3D9FF", cream: "#FFF6E8" };

export type Sticker = { id: string; label: string; group: "Shapes" | "Faces" | "Words" | "Paper"; svg?: ReactNode; src?: string };

/** Die-cut white edge + a little depth, shared by every SVG sticker. */
const cut = { stroke: "#FFFFFF", strokeWidth: 6, strokeLinejoin: "round" as const, paintOrder: "stroke" as const };

const star = (fill: string) => (
  <path {...cut} fill={fill} d="M50 6l12.6 27.4 29.9 3.4-22.2 20.3 6 29.5L50 71.8 23.7 86.6l6-29.5L7.5 36.8l29.9-3.4z" />
);
const heart = (fill: string) => (
  <path {...cut} fill={fill} d="M50 88S10 63 10 35c0-13 10-23 22-23 8 0 14 4 18 10 4-6 10-10 18-10 12 0 22 10 22 23 0 28-40 53-40 53z" />
);
const flower = (fill: string, center: string) => (
  <g>
    <g {...cut} fill={fill}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="50" cy="26" rx="15" ry="21" transform={`rotate(${a} 50 50)`} />
      ))}
    </g>
    <circle cx="50" cy="50" r="14" fill={center} />
  </g>
);
const smiley = (fill: string) => (
  <g>
    <circle {...cut} cx="50" cy="50" r="40" fill={fill} />
    <ellipse cx="37" cy="42" rx="4.5" ry="7" fill={INK} />
    <ellipse cx="63" cy="42" rx="4.5" ry="7" fill={INK} />
    <path d="M32 58c5 11 31 11 36 0" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
  </g>
);
const word = (text: string, fill: string, ink: string, size = 26, w = 92) => (
  <g>
    <rect {...cut} x={(100 - w) / 2} y="30" width={w} height="40" rx="20" fill={fill} />
    <text x="50" y="58" textAnchor="middle" fontFamily="var(--font-geist-sans), Arial, sans-serif" fontWeight="800" fontSize={size} letterSpacing="-0.5" fill={ink}>
      {text}
    </text>
  </g>
);

export const STICKERS: Sticker[] = [
  { id: "star", label: "Star", group: "Shapes", svg: star(ORANGE) },
  { id: "heart", label: "Heart", group: "Shapes", svg: heart(ORANGE) },
  { id: "flower", label: "Flower", group: "Shapes", svg: flower(ORANGE, PAPER.butter) },
  { id: "smiley", label: "Smiley", group: "Faces", svg: smiley(ORANGE) },
  {
    id: "wink",
    label: "Wink",
    group: "Faces",
    svg: (
      <g>
        <circle {...cut} cx="50" cy="50" r="40" fill={PAPER.butter} />
        <ellipse cx="37" cy="42" rx="4.5" ry="7" fill={INK} />
        <path d="M57 43h13" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path d="M33 58c6 10 28 10 34 0" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: "burst",
    label: "Burst",
    group: "Shapes",
    svg: (
      <path
        {...cut}
        fill={ORANGE}
        d={Array.from({ length: 24 }, (_, i) => {
          const r = i % 2 ? 30 : 44, a = (Math.PI * 2 * i) / 24 - Math.PI / 2;
          return `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
        }).join("") + "Z"}
      />
    ),
  },
  {
    id: "sparkle",
    label: "Sparkle",
    group: "Shapes",
    svg: <path {...cut} fill={ORANGE} d="M50 6c4 26 18 40 44 44-26 4-40 18-44 44-4-26-18-40-44-44 26-4 40-18 44-44z" />,
  },
  {
    id: "blob",
    label: "Blob",
    group: "Shapes",
    svg: <path {...cut} fill={PAPER.lilac} d="M71 14c14 8 22 26 17 42s-17 33-36 32-36-12-39-30 5-34 20-42 24-10 38-2z" />,
  },
  {
    id: "half-moon",
    label: "Half circle",
    group: "Shapes",
    svg: (
      <g>
        <path {...cut} fill={ORANGE} d="M10 58a40 40 0 0 1 80 0z" />
        <rect {...cut} x="10" y="62" width="80" height="14" rx="7" fill={INK} />
      </g>
    ),
  },
  {
    id: "arrow",
    label: "Arrow",
    group: "Shapes",
    svg: (
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 72C30 30 62 22 84 30" stroke="#FFFFFF" strokeWidth="16" />
        <path d="M68 16l17 14-16 15" stroke="#FFFFFF" strokeWidth="16" />
        <path d="M14 72C30 30 62 22 84 30" stroke={ORANGE} strokeWidth="8" />
        <path d="M68 16l17 14-16 15" stroke={ORANGE} strokeWidth="8" />
      </g>
    ),
  },
  {
    id: "squiggle",
    label: "Squiggle",
    group: "Shapes",
    svg: (
      <g fill="none" strokeLinecap="round">
        <path d="M10 56c8-16 16-16 20 0s12 16 20 0 12-16 20 0 12 16 20 0" stroke="#FFFFFF" strokeWidth="16" />
        <path d="M10 56c8-16 16-16 20 0s12 16 20 0 12-16 20 0 12 16 20 0" stroke={ORANGE} strokeWidth="8" />
      </g>
    ),
  },
  { id: "hi", label: "Hi!", group: "Words", svg: word("HI!", ORANGE, "#FFFFFF", 28, 70) },
  { id: "wow", label: "Wow", group: "Words", svg: word("WOW", INK, "#FFFFFF", 26, 84) },
  { id: "yes", label: "Yes!", group: "Words", svg: word("YES!", PAPER.mint, INK, 26, 84) },
  { id: "love-it", label: "Love it", group: "Words", svg: word("LOVE IT", ORANGE, "#FFFFFF", 18, 94) },
  { id: "hello", label: "Hello", group: "Words", svg: word("hello", PAPER.sky, INK, 24, 88) },
  {
    id: "note-butter",
    label: "Yellow note",
    group: "Paper",
    svg: <rect {...cut} x="14" y="14" width="72" height="72" rx="3" fill={PAPER.butter} />,
  },
  {
    id: "note-blush",
    label: "Pink note",
    group: "Paper",
    svg: <rect {...cut} x="14" y="14" width="72" height="72" rx="3" fill={PAPER.blush} />,
  },
  {
    id: "note-sky",
    label: "Blue note",
    group: "Paper",
    svg: <rect {...cut} x="14" y="14" width="72" height="72" rx="3" fill={PAPER.sky} />,
  },
];

export const stickerById = (id: string) => STICKERS.find((s) => s.id === id);
export const STICKER_IDS = new Set(STICKERS.map((s) => s.id));

/** The note card colour that goes with a sticker (paper stickers carry their own colour). */
export function noteColor(id: string) {
  if (id === "note-blush") return PAPER.blush;
  if (id === "note-sky") return PAPER.sky;
  if (id === "wink" || id === "note-butter") return PAPER.butter;
  if (id === "yes") return PAPER.mint;
  if (id === "blob") return PAPER.lilac;
  if (id === "hello") return PAPER.sky;
  return PAPER.cream;
}

/** Render a sticker at any size. */
export function StickerArt({ id, size = 64, title }: { id: string; size?: number; title?: string }) {
  const st = stickerById(id);
  if (!st) return null;
  if (st.src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={st.src} alt={title ?? ""} width={size} height={size} draggable={false} style={{ display: "block", objectFit: "contain" }} />;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 2px 2px rgba(34,34,34,.16))" }}>
      {st.svg}
    </svg>
  );
}
