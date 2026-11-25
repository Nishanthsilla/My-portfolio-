"use client";

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
import { fineSoundtrack, notifySound, primeNotify, type Notify } from "@/lib/sound/notify";
import f from "./fine.module.css";

/**
 * "This is fine — designer edition": a 12.5 s cartoon at the very bottom of the footer.
 * It waits until it's on screen, plays once, and holds the last frame (the skeleton, still
 * chilling with his coffee). All motion is CSS on one timeline: no React updates per frame.
 * Reduced motion: the final frame, still.
 *
 * Scene timings (seconds): 01 0–1.5 · 02 1.5–3 · 03 3–4.5 · 04 4.5–6 · 05 6–7 · 06 7–8 · 07 8–9 ·
 * 08 9–10 · 09 10–11 · 10 11–11.5 · 11 11.5–12 · 12 12–12.5 (then hold).
 */

const INK = "#2b1809";
const FUR = "#f2a33a";
const BONE = "#f1e8d2";

/* the stage is 1440 × 250 with the dog at x = 660; the viewBox follows the box's shape (see fit) */
const DOG_X = 660;

type V = CSSProperties & Record<`--${string}`, string | number>;

// a tiny seeded random so the server and the browser draw the same fire
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function flames(seed: number, from: number, to: number, step: number, base: number, minH: number, maxH: number) {
  const r = rng(seed);
  const out: { x: number; y: number; w: number; h: number; d: number; o: number }[] = [];
  for (let x = from; x <= to; x += step * (0.7 + r() * 0.6)) {
    const h = minH + r() * (maxH - minH);
    out.push({ x, y: base, w: h * (0.42 + r() * 0.16), h, d: 0.55 + r() * 0.6, o: -r() * 2 });
  }
  return out;
}

/** the last frame: everything in the room is burning (he isn't bothered) — [base x, base y, flame height] per object */
const BURNING: { name: string; at: number; flames: [number, number, number][] }[] = [
  { name: "window", at: 0.2, flames: [[-60, 34, 40], [-22, 28, 54], [10, 36, 38]] },
  { name: "shelf", at: 0.05, flames: [[232, 46, 36], [262, 40, 46], [298, 46, 32], [332, 44, 38]] },
  { name: "frame", at: 0, flames: [[446, 38, 42], [470, 30, 56], [494, 40, 36]] },
  { name: "plant", at: 0.3, flames: [[558, 104, 42], [586, 98, 50]] },
  { name: "laptop", at: 0, flames: [[858, 106, 58], [886, 102, 76], [916, 108, 52]] },
  { name: "books", at: 0.15, flames: [[954, 142, 34], [980, 144, 30]] },
  { name: "table", at: 0.25, flames: [[792, 162, 36], [988, 162, 32]] },
  { name: "clock", at: 0.1, flames: [[1118, 50, 32], [1144, 48, 40]] },
  { name: "poster", at: 0.35, flames: [[1218, 46, 42], [1246, 40, 56], [1272, 48, 36]] },
];

/* ---------- lip sync: his mouth follows the voice in the soundtrack ---------- */
const DUR = 12.5;
/** how open his mouth is, 20 times a second (measured from the voice in /audio/sfx/fine-bgm.mp3) */
const TALK: number[] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.14, 0.54, 0.9, 1.0, 0.99, 0.93, 0.77, 0.47, 0.14, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.21, 0.66, 0.92, 0.96, 0.93, 0.63, 0.19, 0.0, 0.22, 0.66, 0.73, 0.52, 0.36, 0.18, 0.14, 0.44, 0.7, 0.49, 0.38, 0.74, 0.85, 0.47, 0.13, 0.01, 0.25, 0.75, 0.98, 0.95, 0.96, 0.78, 0.33, 0.04, 0.06, 0.37, 0.81, 0.79, 0.35, 0.1, 0.07, 0.03, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.02, 0.29, 0.68, 0.57, 0.16, 0.21, 0.45, 0.28, 0.04, 0.21, 0.63, 0.7, 0.38, 0.09, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.72, 0.83, 0.54, 0.44, 0.49, 0.47, 0.67, 0.76, 0.51, 0.28, 0.38, 0.67, 0.88, 0.93, 0.64, 0.2, 0.0, 0.05, 0.1, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0];
/** when he speaks: "This is fine." · "I'm okay with the events that are unfolding currently." · the last line */
const SPEAK: [number, number][] = [[4.4, 4.95], [5.5, 7.5], [10.0, 10.8], [11.2, 12.25]];
/** which mouth / eyes show when (seconds) */
const FACE: Record<string, [number, number][]> = {
  mSmile: [[0, 3], [8, 10]],
  mFlat: [[3, 4.4], [7.5, 8]],
  mWavy: [[4.95, 5.5]],
  mGrin: [[10.8, 11.2]],
  mTalk: SPEAK,
  eOpen: [[0, 3], [4.4, 7.5], [9, 12.5]],
  eHalf: [[3, 4.4], [7.5, 8]],
  eShut: [[8, 9]],
};
const pct = (s: number) => ((s / DUR) * 100).toFixed(2);
/** on/off keyframes for a list of time windows (a hard cut, like a cel swap) */
function onOff(name: string, wins: [number, number][]) {
  const k: string[] = [`0%{opacity:${wins.some(([a]) => a <= 0) ? 1 : 0}}`];
  for (const [a, b] of wins) {
    if (a > 0) k.push(`${pct(a - 0.01)}%{opacity:0}`, `${pct(a)}%{opacity:1}`);
    if (b < DUR) k.push(`${pct(b - 0.01)}%{opacity:1}`, `${pct(b)}%{opacity:0}`);
  }
  k.push(`100%{opacity:${wins.some(([, b]) => b >= DUR) ? 1 : 0}}`);
  return `@keyframes fine-${name}{${k.join("")}}`;
}
const FACE_CSS =
  Object.entries(FACE).map(([n, w]) => onOff(n, w)).join("") +
  `@keyframes fine-jaw{${TALK.map((o, i) => `${((i / (TALK.length - 1)) * 100).toFixed(2)}%{transform:scaleY(${(0.1 + 0.9 * o).toFixed(2)})}`).join("")}}`;
const anim = (n: string): CSSProperties => ({ animationName: `fine-${n}` });

/** subtitles for the dialogue (seconds on the cartoon's clock) */
const SUBS: [number, number, string][] = [
  [4.3, 5.2, "This is fine."],
  [5.45, 7.65, "I'm okay with the events that are unfolding currently."],
  [9.95, 10.9, "That's okay."],
  [11.25, 12.35, "Things are going to be okay."],
];
const SUB_CSS = SUBS.map(([a, b], i) => onOff(`sub${i}`, [[a, b]])).join("");

const FIRE = {
  left: flames(11, 360, 600, 26, 230, 26, 58),
  right: flames(23, 760, 1010, 28, 230, 26, 60),
  back: flames(37, -260, 1700, 44, 232, 90, 190),
  // shorter right in front of him, so he stays visible in the blaze
  front: flames(51, -260, 1700, 40, 262, 70, 135).map((p) => (p.x > 590 && p.x < 770 ? { ...p, h: p.h * 0.55, w: p.w * 0.8 } : p)),
};

/** a white chat card (client messages) */
function Card({ x, y, mx, my, t, d, w, title, lines, icon, tag }: { x: number; y: number; mx: number; my: number; t: number; d: number; w: number; title?: string; lines: string[]; icon?: ReactNode; tag?: string }) {
  const h = 22 + (title ? 18 : 0) + lines.length * 17;
  const tx = icon ? 40 : 14;
  return (
    <g className={f.pos} style={{ "--x": x, "--y": y, "--mx": mx, "--my": my } as V}>
      <g className={`${f.tl} ${f.pop}`} style={{ "--t": t, "--d": d } as V} data-sfx={tag ? "alarm" : "ding"}>
        <rect x={4} y={5} width={w} height={h} rx={12} fill={INK} />
        <rect width={w} height={h} rx={12} fill="#fffdf6" stroke={INK} strokeWidth={2.5} />
        {icon && <g transform={`translate(12 ${title ? 12 : 10})`}>{icon}</g>}
        <text className={f.cardText} x={tx} y={title ? 22 : 24}>
          {title && <tspan className={f.cardTitle} x={tx}>{title}</tspan>}
          {lines.map((l, i) => (
            <tspan key={i} x={tx} dy={i === 0 && !title ? 0 : 17}>{l}</tspan>
          ))}
        </text>
        {tag && (
          <g transform={`translate(${w / 2 - 30} -16) rotate(-3)`}>
            <rect width={60} height={24} rx={5} fill="#e8322a" stroke={INK} strokeWidth={2} />
            <text className={f.tag} x={30} y={17} textAnchor="middle">{tag}</text>
          </g>
        )}
      </g>
    </g>
  );
}

/** a yellow sticky note with a red pin */
function Sticky({ x, y, mx, my, r, t, d, lines, w = 118 }: { x: number; y: number; mx: number; my: number; r: number; t: number; d: number; lines: string[]; w?: number }) {
  const h = 26 + lines.length * 17;
  return (
    <g className={f.pos} style={{ "--x": x, "--y": y, "--mx": mx, "--my": my, "--r": `${r}deg` } as V}>
      <g className={`${f.tl} ${f.drop}`} style={{ "--t": t, "--d": d } as V} data-sfx="pop">
        <rect x={3} y={4} width={w} height={h} fill="rgba(43,24,9,0.35)" />
        <rect width={w} height={h} fill="#ffe36a" stroke={INK} strokeWidth={2} />
        <circle cx={w / 2} cy={7} r={5} fill="#e8322a" stroke={INK} strokeWidth={1.5} />
        <text className={f.stickyText} x={w / 2} y={28} textAnchor="middle">
          {lines.map((l, i) => (
            <tspan key={i} x={w / 2} dy={i === 0 ? 0 : 17}>{l}</tspan>
          ))}
        </text>
      </g>
    </g>
  );
}

/* little app marks for the cards (generic shapes, no brand logos) */
const ChatMark = (
  <g>
    <rect x={0} y={4} width={8} height={4} rx={2} fill="#36c5f0" />
    <rect x={10} y={0} width={4} height={8} rx={2} fill="#2eb67d" />
    <rect x={6} y={10} width={8} height={4} rx={2} fill="#ecb22e" />
    <rect x={0} y={6} width={4} height={8} rx={2} fill="#e01e5a" />
  </g>
);
const DesignMark = (
  <g>
    <circle cx={5} cy={4} r={4} fill="#f24e1e" />
    <circle cx={13} cy={4} r={4} fill="#ff7262" />
    <circle cx={5} cy={12} r={4} fill="#a259ff" />
    <circle cx={13} cy={12} r={4} fill="#1abcfe" />
    <circle cx={5} cy={20} r={4} fill="#0acf83" />
  </g>
);
const MailMark = (
  <g>
    <rect x={0} y={2} width={20} height={14} rx={2} fill="#fff" stroke="#e8322a" strokeWidth={2} />
    <path d="M1 3l9 7 9-7" fill="none" stroke="#e8322a" strokeWidth={2} />
  </g>
);
const Sparkle = <path d="M10 0c1 6 3 8 10 10-7 2-9 4-10 10-1-6-3-8-10-10 7-2 9-4 10-10z" fill="#8b5cf6" />;

/** the hat, the mug: shared by the dog and the skeleton so they're clearly the same fellow */
function Hat() {
  return (
    <g transform="rotate(-7 0 40)">
      <path d="M-34 47C-35 18-17 7 0 7s35 11 34 40z" fill="#c8702b" stroke={INK} strokeWidth={3} />
      <path d="M-34 38h68v9h-68z" fill="#6a3414" stroke={INK} strokeWidth={2} />
      <ellipse cx={0} cy={49} rx={49} ry={8.5} fill="#b65f20" stroke={INK} strokeWidth={3} />
    </g>
  );
}
function Mug() {
  return (
    <g>
      <path d="M62 126c10 0 12 14 1 16" fill="none" stroke={INK} strokeWidth={3} />
      <rect x={40} y={119} width={25} height={30} rx={4} fill="#fbf4e2" stroke={INK} strokeWidth={3} />
      <path d="M43 127h19" stroke="#e8322a" strokeWidth={3} />
      <g className={f.lp} style={{ opacity: 0.9 }}>
        <path className={`${f.lp} ${f.steam}`} d="M47 113c-4-6 4-9 0-16" fill="none" stroke="#fffaf0" strokeWidth={2.5} strokeLinecap="round" />
        <path className={`${f.lp} ${f.steam} ${f.steam2}`} d="M57 113c-4-6 4-9 0-16" fill="none" stroke="#fffaf0" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  );
}
function Shades() {
  return (
    <g>
      <path d="M6 60h32l-3 17c-1 5-24 5-27 0z" fill="#111" stroke={INK} strokeWidth={2} />
      <path d="M38 60h32l-3 16c-1 5-24 5-27 0z" fill="#111" stroke={INK} strokeWidth={2} />
      <path d="M36 62h4M-6 58l12 2" stroke="#111" strokeWidth={3} />
      <path d="M12 64l8 0M44 64l8 0" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

export default function DesignerChaosFooterAnimation({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = root.current, s = svg.current;
    if (!el || !s) return;
    // keep the dog and the messages in view at any width: scale to the height, or to a 470-wide core on phones
    const fit = () => {
      const { width: W, height: H } = s.getBoundingClientRect();
      if (!W || !H) return;
      const k = Math.min(H / 250, W / 470);
      const vw = W / k, vh = H / k;
      s.setAttribute("viewBox", `${(DOG_X + 60 - vw / 2).toFixed(1)} ${(250 - vh).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(s);
    // plays once, when most of it is on screen; loops (flicker, steam) only run while visible
    const html = document.documentElement;
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    let fire: { stop: () => void } | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        el.classList.toggle(f.vis, e.isIntersecting);
        if (e.intersectionRatio >= 0.55 && !el.classList.contains(f.play)) {
          el.classList.add(f.play);
          // the fire's sound starts with the cartoon (frame 0)
          if (!calm.matches) fire = fineSoundtrack();
        }
        // the chat face steps aside so the cartoon is clear
        if (e.isIntersecting) html.dataset.footerFine = "";
        else delete html.dataset.footerFine;
        // scrolled away: the fire's sound dies down (the cartoon pauses too)
        if (!e.isIntersecting && fire) {
          fire.stop();
          fire = null;
        }
      },
      { threshold: [0, 0.55] },
    );
    io.observe(el);
    // a notification sound as each message pops in (not with reduced motion: the frames jump straight to the end)
    primeNotify();
    const onStart = (e: AnimationEvent) => {
      const kind = (e.target as Element).getAttribute?.("data-sfx") as Notify | null;
      if (kind && !calm.matches) notifySound(kind);
    };
    el.addEventListener("animationstart", onStart);
    return () => {
      el.removeEventListener("animationstart", onStart);
      ro.disconnect();
      io.disconnect();
      fire?.stop();
      delete html.dataset.footerFine;
    };
  }, []);

  const fl = `${uid}fl`, glow = `${uid}gl`, wall = `${uid}wl`;
  const flame = (p: { x: number; y: number; w: number; h: number; d: number; o: number }, i: number) => (
    <use key={i} href={`#${fl}`} x={p.x - p.w / 2} y={p.y - p.h} width={p.w} height={p.h} className={`${f.lp} ${f.flick}`} style={{ "--fd": `${p.d.toFixed(2)}s`, "--fo": `${p.o.toFixed(2)}s` } as V} />
  );

  return (
    <div ref={root} className={`${f.root} ${className}`} role="img" aria-label="A cartoon dog in a hat calmly drinks coffee while client requests pile up and the room catches fire. He ends up a skeleton in sunglasses, still holding his coffee and saying he is okay with the events that are unfolding.">
      <style>{FACE_CSS + SUB_CSS}</style>
      <svg ref={svg} className={f.svg} viewBox="0 0 1440 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id={wall} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b4ae45" />
            <stop offset="1" stopColor="#8f8a2c" />
          </linearGradient>
          <radialGradient id={glow} cx="0.5" cy="1" r="0.9">
            <stop offset="0" stopColor="#ff7a1a" />
            <stop offset="1" stopColor="#c2260f" stopOpacity="0.35" />
          </radialGradient>
          <linearGradient id={`${fl}g`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#d62f12" />
            <stop offset="0.55" stopColor="#f26a1b" />
            <stop offset="1" stopColor="#ffb02e" />
          </linearGradient>
          <symbol id={fl} viewBox="0 0 40 80" preserveAspectRatio="none">
            <path d="M20 80C5 80-1 64 5 50c4-9 2-18 7-30 2 11 7 15 8 15 0-12 6-24 2-35 13 13 19 33 15 51 4-5 4-11 2-15 6 14 4 44-19 44z" fill={`url(#${fl}g)`} />
            <path d="M20 79c-8 0-11-9-8-17 2-5 3-9 5-14 2 6 4 8 5 8 1-5 4-9 3-14 6 8 9 18 6 26-2 7-5 11-11 11z" fill="#ffd34d" />
          </symbol>
        </defs>

        {/* ---------- the room ---------- */}
        <rect x={-2000} y={-600} width={5440} height={834} fill={`url(#${wall})`} />
        <rect x={-2000} y={-600} width={5440} height={834} fill="#3a1606" className={`${f.tl} ${f.char}`} />
        {/* shelf with books */}
        <g transform="translate(220 0)">
          <rect x={0} y={84} width={130} height={8} fill="#6b3a17" stroke={INK} strokeWidth={2.5} />
          {[["#c4452b", 0, 34], ["#e3b341", 16, 40], ["#4a7c59", 30, 30], ["#d36b2a", 44, 38], ["#7a4a8c", 92, 34]].map(([c, x, h], i) => (
            <rect key={i} x={10 + (x as number)} y={84 - (h as number)} width={13} height={h as number} fill={c as string} stroke={INK} strokeWidth={2} />
          ))}
          <path d="M70 84l16-30 9 5-14 25z" fill="#e8d7a8" stroke={INK} strokeWidth={2} />
        </g>
        {/* the framed "n" */}
        <g transform="translate(430 34)">
          <rect width={72} height={82} rx={3} fill="#7a461a" stroke={INK} strokeWidth={3} />
          <rect x={9} y={9} width={54} height={64} fill="#efe0b9" stroke={INK} strokeWidth={2} />
          <text x={36} y={58} textAnchor="middle" className={f.frameN}>n</text>
        </g>
        {/* plant */}
        <g transform="translate(540 0)">
          <path d="M16 160c-14-24-22-40-8-62 6 20 10 32 12 50 2-30 8-46 22-60 4 26-4 44-12 66 12-14 24-22 38-22-6 18-22 26-38 34z" fill="#4f7a2f" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M6 160h52l-7 66H13z" fill="#c4622a" stroke={INK} strokeWidth={3} />
          <path d="M3 160h58v10H3z" fill="#a84f1f" stroke={INK} strokeWidth={2.5} />
        </g>
        {/* clock, poster, second plant: the rest of the wall on wide screens */}
        <g transform="translate(1130 70)">
          <circle r={24} fill="#fff6dc" stroke={INK} strokeWidth={3} />
          <path d="M0 0V-14M0 0l10 6" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>
        <g transform="translate(1210 40)">
          <rect width={66} height={84} fill="#f4e7c4" stroke={INK} strokeWidth={3} transform="rotate(3)" />
          <circle cx={34} cy={38} r={16} fill="#e8322a" opacity={0.85} transform="rotate(3)" />
          <path d="M14 66h40M14 74h28" stroke={INK} strokeWidth={3} transform="rotate(3)" />
        </g>
        <g transform="translate(1330 0)">
          <path d="M24 170c-16-30-18-48-4-66 4 22 8 32 6 50 10-26 20-38 34-44-2 24-12 40-28 60z" fill="#4f7a2f" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M10 170h44l-6 56H16z" fill="#c4622a" stroke={INK} strokeWidth={3} />
        </g>
        <g transform="translate(-70 30)">
          <rect width={90} height={110} fill="#d7e3c6" stroke={INK} strokeWidth={3} />
          <path d="M45 0v110M0 55h90" stroke={INK} strokeWidth={3} />
        </g>

        {/* floor + skirting */}
        <rect x={-2000} y={226} width={5440} height={300} fill="#5f3518" />
        <rect x={-2000} y={222} width={5440} height={7} fill="#3e2210" />

        {/* ---------- fire behind everything ---------- */}
        <g className={f.tall}>
          <g className={`${f.tl} ${f.grow} ${f.gBack}`}>{FIRE.back.map(flame)}</g>
        </g>
        <rect x={-2000} y={-600} width={5440} height={900} fill={`url(#${glow})`} className={`${f.tl} ${f.glow}`} />

        {/* smoke near the ceiling */}
        <g className={`${f.tl} ${f.smoke}`}>
          {[[300, 10], [520, -10], [760, 0], [980, -14], [1220, 6], [140, -20], [1380, -8]].map(([x, y], i) => (
            <g key={i} className={`${f.lp} ${f.drift}`} style={{ "--sd": `${7 + (i % 3) * 2}s`, "--so": `${-i * 1.3}s` } as V}>
              <circle cx={x} cy={y} r={34} fill="#3d3532" opacity={0.78} />
              <circle cx={x + 30} cy={y - 10} r={26} fill="#4a413d" opacity={0.75} />
              <circle cx={x - 28} cy={y + 4} r={22} fill="#332c2a" opacity={0.75} />
            </g>
          ))}
        </g>

        {/* table, laptop, books */}
        <g>
          <rect x={770} y={160} width={230} height={12} rx={3} fill="#8a4b22" stroke={INK} strokeWidth={3} />
          <path d="M784 172v56M986 172v56" stroke={INK} strokeWidth={7} />
          <path d="M784 172v56M986 172v56" stroke="#8a4b22" strokeWidth={3} />
          {/* the laptop: open, a design file on screen */}
          <g>
            {/* screen glow on the wall */}
            <ellipse cx={892} cy={118} rx={62} ry={40} fill="#fff7d6" opacity={0.35} />
            {/* lid */}
            <path d="M846 147l-8-60c-.4-3 1.6-5.6 4.6-5.6h92c3 0 5.4 2.3 5.6 5.3l3.6 60.3z" fill="#bdb8ae" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <path d="M851 141l-6.4-49c-.2-1.8 1-3.2 2.8-3.2h83.2c1.8 0 3.2 1.4 3.3 3.2l2.8 49z" fill="#1f2433" />
            {/* the design tool: toolbar, layers, canvas, a frame, the cursor */}
            <path d="M845.4 92.6h88.4l.5 6h-88.1z" fill="#2c3245" />
            <circle cx={850.5} cy={95.6} r={1.4} fill="#ff5f57" />
            <circle cx={855} cy={95.6} r={1.4} fill="#febc2e" />
            <circle cx={859.5} cy={95.6} r={1.4} fill="#28c840" />
            <path d="M846.2 99.4h14.5l5.1 41.4h-14.8z" fill="#283044" />
            {[104, 110, 116, 122].map((y, i) => (
              <rect key={y} x={849 + i * 0.4} y={y} width={i === 1 ? 7 : 10} height={2.4} rx={1} fill={i === 1 ? "#7b83eb" : "#56607a"} />
            ))}
            <path d="M864 103h52l3.5 33h-51.6z" fill="#f2f1ec" />
            <path d="M872 109h22l1.6 16h-22.1z" fill="#ff4938" opacity={0.9} />
            <path d="M898 110h14l1 9h-14.3z" fill="#ffd166" />
            <path d="M899 122h14l.8 8h-14.1z" fill="#7b83eb" />
            <path d="M906 124l5 11 1.6-4.6 4.4-1.6z" fill="#111" stroke="#fff" strokeWidth={0.8} />
            {/* base: keyboard deck, keys, trackpad */}
            <path d="M816 160l30-13h102l20 13z" fill="#d8d4cb" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            {[0, 1, 2].map((r) => (
              <path key={r} d={`M${846 - r * 7} ${149.5 + r * 2.8}h${96 + r * 9}`} stroke="#8f8a80" strokeWidth={1.6} strokeDasharray="5 2" />
            ))}
            <path d="M876 157.4h32l2 2.4h-36z" fill="#b9b4aa" />
            <path d="M814 160h156" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
          <rect x={950} y={140} width={40} height={9} fill="#4a7c59" stroke={INK} strokeWidth={2} />
          <rect x={946} y={149} width={46} height={11} fill="#c4452b" stroke={INK} strokeWidth={2} />
          <g className={`${f.tl} ${f.lapFire}`}>
            <use href={`#${fl}`} x={862} y={70} width={22} height={40} className={`${f.lp} ${f.flick}`} style={{ "--fd": "0.6s", "--fo": "0s" } as V} />
            <use href={`#${fl}`} x={890} y={78} width={18} height={32} className={`${f.lp} ${f.flick}`} style={{ "--fd": "0.7s", "--fo": "-0.3s" } as V} />
          </g>
        </g>

        {/* flames that creep in early: by the plant, under the table */}
        <g className={`${f.tl} ${f.grow} ${f.gLeft}`}>{FIRE.left.map(flame)}</g>
        <g className={`${f.tl} ${f.grow} ${f.gRight}`}>{FIRE.right.map(flame)}</g>

        {/* ---------- him ---------- */}
        <g transform={`translate(${DOG_X} 0)`}>
          {/* chair (stays through everything) */}
          <rect x={-80} y={92} width={62} height={118} rx={16} fill="#b7472b" stroke={INK} strokeWidth={3} />
          <rect x={-86} y={180} width={124} height={20} rx={8} fill="#a03c22" stroke={INK} strokeWidth={3} />
          <path d="M-74 200v28M26 200v28" stroke={INK} strokeWidth={8} strokeLinecap="round" />

          {/* the dog */}
          <g className={`${f.tl} ${f.dog}`}>
            <g className={`${f.lp} ${f.bob}`}>
              <ellipse cx={-18} cy={156} rx={40} ry={46} fill={FUR} stroke={INK} strokeWidth={3} />
              <ellipse cx={10} cy={182} rx={33} ry={13} fill={FUR} stroke={INK} strokeWidth={3} />
              <path d="M34 186l6 30" stroke={INK} strokeWidth={15} strokeLinecap="round" />
              <path d="M34 186l6 30" stroke={FUR} strokeWidth={9} strokeLinecap="round" />
              <ellipse cx={46} cy={221} rx={14} ry={6} fill={FUR} stroke={INK} strokeWidth={3} />
              <path d="M-8 132q22 18 46 8" fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
              <path d="M-8 132q22 18 46 8" fill="none" stroke={FUR} strokeWidth={11} strokeLinecap="round" />
              {/* the mug sits in front of the arm, the paw wraps round its side */}
              <Mug />
              <circle cx={42} cy={138} r={8} fill={FUR} stroke={INK} strokeWidth={2.5} />
              {/* under the fur: cartoon muscle (anatomy-chart style), shown once the soot flakes off */}
              <g className={`${f.tl} ${f.muscle}`}>
                <ellipse cx={-18} cy={156} rx={38.5} ry={44.5} fill="#b8443a" />
                <ellipse cx={10} cy={182} rx={31.5} ry={11.5} fill="#b8443a" />
                <path d="M34 186l6 30" stroke="#b8443a" strokeWidth={9} strokeLinecap="round" />
                <path d="M-8 132q22 18 46 8" fill="none" stroke="#b8443a" strokeWidth={11} strokeLinecap="round" />
                <circle cx={42} cy={138} r={6.8} fill="#b8443a" />
                <g fill="none" stroke="#e88a74" strokeWidth={1.6} strokeLinecap="round" opacity={0.85}>
                  <path d="M-44 132q10 24 4 52M-34 120q12 30 6 70M-20 114q10 34 4 82M-6 118q8 30 2 70M8 130q6 22 0 44" />
                  <path d="M-16 176q14 4 28 2q12-2 22 4M-14 186q16 4 30 2q10-2 20 4" />
                  <path d="M-2 134q18 10 36 4M2 140q16 8 30 2" />
                </g>
                <path d="M-18 112v88" stroke="#8f2f27" strokeWidth={1.4} opacity={0.6} />
              </g>
              {/* burning: the fur chars to soot before he goes to bones (eyes, shades and grin stay on top) */}
              <g className={`${f.tl} ${f.soot}`}>
                <ellipse cx={-18} cy={156} rx={38.5} ry={44.5} fill="#2b1b12" />
                <ellipse cx={10} cy={182} rx={31.5} ry={11.5} fill="#2b1b12" />
                <path d="M34 186l6 30" stroke="#2b1b12" strokeWidth={9} strokeLinecap="round" />
                <path d="M-8 132q22 18 46 8" fill="none" stroke="#2b1b12" strokeWidth={11} strokeLinecap="round" />
                <circle cx={42} cy={138} r={6.8} fill="#2b1b12" />
                {[[-30, 140], [-8, 170], [-36, 178], [6, 152], [18, 184], [-20, 196]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={2.6} fill="#ff8a1e" className={`${f.lp} ${f.ember}`} style={{ "--ed": `${0.5 + i * 0.13}s` } as V} />
                ))}
              </g>
              {/* head */}
              <g className={`${f.lp} ${f.nod}`}>
                <path d="M-30 70c-22 8-20 48-6 54 8-8 10-28 14-42z" fill="#c9752a" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                <circle cx={0} cy={86} r={38} fill={FUR} stroke={INK} strokeWidth={3} />
                <path d="M20 79c30-9 66-1 66 17s-34 21-64 14z" fill={FUR} stroke={INK} strokeWidth={3} />
                <circle cx={17} cy={94} r={14} fill={FUR} />
                <ellipse cx={84} cy={90} rx={8.5} ry={6.5} fill="#1d120a" />
                <g className={`${f.tl} ${f.muscle}`}>
                  <path d="M-30 70c-22 8-20 48-6 54 8-8 10-28 14-42z" fill="#a33a31" />
                  <circle cx={0} cy={86} r={36.5} fill="#b8443a" />
                  <path d="M21.5 80.5c30-9 63-1 63 15.5s-33 20-62 13z" fill="#b8443a" />
                  <g fill="none" stroke="#e88a74" strokeWidth={1.5} strokeLinecap="round" opacity={0.85}>
                    <path d="M-24 76q8-20 30-22M-28 92q10-26 40-28M-22 108q14-20 40-20M-8 118q14-10 30-10" />
                    <path d="M30 88q24-6 46 0M32 98q22-4 44 2M36 106q18-2 30 0" />
                  </g>
                  <ellipse cx={84} cy={90} rx={8.5} ry={6.5} fill="#5a1a14" />
                </g>
                <g className={`${f.tl} ${f.soot}`}>
                  <path d="M-30 70c-22 8-20 48-6 54 8-8 10-28 14-42z" fill="#24160e" />
                  <circle cx={0} cy={86} r={36.5} fill="#2b1b12" />
                  <path d="M21.5 80.5c30-9 63-1 63 15.5s-33 20-62 13z" fill="#2b1b12" />
                  {[[-18, 70], [6, 104], [30, 86]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={2.3} fill="#ff8a1e" className={`${f.lp} ${f.ember}`} style={{ "--ed": `${0.6 + i * 0.17}s` } as V} />
                  ))}
                </g>
                {/* mouth: content smile / flat / nervous wobble / the big forced "I am fine" grin */}
                <path className={f.tl} style={anim("mSmile")} d="M50 106q14 5 26-2" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
                <path className={f.tl} style={anim("mFlat")} d="M52 107q11-2 22 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
                <path className={f.tl} style={anim("mWavy")} d="M48 107q3-4 6 0t6 0t6 0t6 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                {/* talking: the mouth opens and closes with each word of the voice */}
                <g className={f.tl} style={anim("mTalk")}>
                  <g className={`${f.tl} ${f.jaw}`} style={anim("jaw")}>
                    <path d="M46 102c10 3 21 3 31-2-1 9-7 15-15 15s-14-5-16-13z" fill="#3a1610" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
                    <path d="M54 111c4-3 10-3 14 0-3 3-11 3-14 0z" fill="#e0605a" />
                    <path d="M50 102.6h8v3.4h-7z" fill="#fff" />
                  </g>
                </g>
                <g className={f.tl} style={anim("mGrin")}>
                  <path d="M38 98q24 24 48-2q-24 8-48 2z" fill="#fff" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" />
                  <path d="M47 101v10M55 102v12M63 103v12M71 102v11M79 100v8" stroke={INK} strokeWidth={1.8} />
                </g>
                {/* a sweat drop when it gets tense */}
                <g className={`${f.tl} ${f.sweat}`}>
                  <g className={`${f.lp} ${f.drip}`}>
                    <path d="M-16 52c-7 11-10 16-10 20a10 10 0 0 0 20 0c0-4-3-9-10-20z" fill="#5ec4f2" stroke={INK} strokeWidth={2.5} />
                    <path d="M-20 70a4 4 0 0 0 3 5" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                  </g>
                </g>
                {/* eyes: open (blinking, glancing) / tired / shut */}
                <g className={f.tl} style={anim("eOpen")}>
                  <g className={`${f.lp} ${f.blink}`}>
                    <circle cx={22} cy={70} r={14} fill="#fff" stroke={INK} strokeWidth={2.5} />
                    <circle cx={48} cy={68} r={13} fill="#fff" stroke={INK} strokeWidth={2.5} />
                    <g className={`${f.tl} ${f.pupils}`}>
                      <circle cx={26} cy={72} r={4.6} fill="#111" />
                      <circle cx={51} cy={70} r={4.3} fill="#111" />
                    </g>
                  </g>
                </g>
                <g className={f.tl} style={anim("eHalf")}><g className={`${f.tl} ${f.twitch}`}>
                  <circle cx={22} cy={70} r={14} fill="#fff" stroke={INK} strokeWidth={2.5} />
                  <circle cx={48} cy={68} r={13} fill="#fff" stroke={INK} strokeWidth={2.5} />
                  <circle cx={25} cy={76} r={4.4} fill="#111" />
                  <circle cx={50} cy={74} r={4.1} fill="#111" />
                  <path d="M7 71a15 15 0 0 1 30 0z" fill={FUR} stroke={INK} strokeWidth={2.5} />
                  <path d="M34 69a14 14 0 0 1 28 0z" fill={FUR} stroke={INK} strokeWidth={2.5} />
                </g></g>
                <g className={f.tl} style={anim("eShut")}>
                  <path d="M10 72q12 8 24 0M37 70q11 8 22 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
                </g>
                <Hat />
                <g className={`${f.tl} ${f.shades}`}>
                  <Shades />
                </g>
              </g>
            </g>
          </g>

          {/* he catches fire: little flames on his hat, shoulders and back (then the puff, then bones) */}
          <g className={`${f.tl} ${f.onHim}`}>
            {[[-14, 44, 30], [12, 40, 24], [-44, 126, 34], [-50, 160, 30], [6, 140, 26], [-26, 112, 22], [24, 176, 24]].map(([x, y, h], i) => (
              <use key={i} href={`#${fl}`} x={x - h * 0.28} y={y - h} width={h * 0.56} height={h} className={`${f.lp} ${f.flick}`} style={{ "--fd": `${0.45 + (i % 3) * 0.12}s`, "--fo": `${-i * 0.2}s` } as V} />
            ))}
          </g>
          {/* the skeleton: same pose, same hat, same mug */}
          <g className={`${f.tl} ${f.skel}`}>
            <g className={`${f.lp} ${f.bob}`}>
              <path d="M-16 122l-3 74" stroke={INK} strokeWidth={11} strokeLinecap="round" />
              <path d="M-16 122l-3 74" stroke={BONE} strokeWidth={6} strokeLinecap="round" />
              {[136, 150, 164, 178].map((y, i) => (
                <path key={y} d={`M-17 ${y}c-22-6-30 4-28 12M-17 ${y}c18-6 26 2 24 10`} fill="none" stroke={INK} strokeWidth={7 - i * 0.6} strokeLinecap="round" />
              ))}
              {[136, 150, 164, 178].map((y, i) => (
                <path key={`b${y}`} d={`M-17 ${y}c-22-6-30 4-28 12M-17 ${y}c18-6 26 2 24 10`} fill="none" stroke={BONE} strokeWidth={3.5 - i * 0.3} strokeLinecap="round" />
              ))}
              <ellipse cx={-14} cy={194} rx={22} ry={9} fill={BONE} stroke={INK} strokeWidth={3} />
              <path d="M-4 190l38-4 6 30" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M-4 190l38-4 6 30" fill="none" stroke={BONE} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx={46} cy={221} rx={12} ry={5} fill={BONE} stroke={INK} strokeWidth={2.5} />
              <path d="M-12 128q22 22 50 12" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
              <path d="M-12 128q22 22 50 12" fill="none" stroke={BONE} strokeWidth={4.5} strokeLinecap="round" />
              <Mug />
              <circle cx={40} cy={136} r={4} fill={BONE} stroke={INK} strokeWidth={2} />
              <circle cx={41} cy={145} r={4} fill={BONE} stroke={INK} strokeWidth={2} />
              <g className={`${f.lp} ${f.nod}`}>
                <path d="M-6 116v10" stroke={INK} strokeWidth={10} strokeLinecap="round" />
                <path d="M-6 116v10" stroke={BONE} strokeWidth={5} strokeLinecap="round" />
                <circle cx={0} cy={86} r={36} fill={BONE} stroke={INK} strokeWidth={3} />
                <path d="M20 80c30-9 64-1 64 15s-32 20-62 13z" fill={BONE} stroke={INK} strokeWidth={3} />
                <circle cx={17} cy={93} r={13} fill={BONE} />
                <ellipse cx={22} cy={72} rx={10} ry={12} fill="#2a160a" />
                <ellipse cx={48} cy={70} rx={9} ry={11} fill="#2a160a" />
                <path d="M78 86l6 8h-10z" fill="#2a160a" />
                <g className={f.tl} style={anim("mTalk")}>
                  <g className={`${f.tl} ${f.jaw}`} style={anim("jaw")}>
                    <path d="M32 104h44c-2 10-10 14-22 14s-20-4-22-14z" fill="#2a160a" />
                  </g>
                </g>
                <path d="M30 104h48M38 99v10M46 99v10M54 99v10M62 99v10M70 99v10" stroke={INK} strokeWidth={2} />
                <path d="M-18 104q8 6 16 2" fill="none" stroke={INK} strokeWidth={2} />
                <Hat />
                <g className={`${f.tl} ${f.skShades}`}>
                  <Shades />
                </g>
              </g>
            </g>
          </g>

          {/* the puff that turns one into the other */}
          <g className={`${f.tl} ${f.puff}`}>
            {[[-30, 120, 46], [20, 90, 50], [60, 140, 40], [-10, 60, 40], [40, 190, 36], [-50, 180, 34]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? "#5b4f49" : "#7a6c63"} />
            ))}
          </g>
        </g>

        {/* papers flying in the heat */}
        <g className={`${f.tl} ${f.papers}`}>
          {[[560, 70, -12], [820, 40, 14], [1000, 90, -6], [420, 120, 20]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <g className={`${f.lp} ${f.flutter}`} style={{ "--pd": `${2.4 + i * 0.5}s` } as V}>
                <path d="M0 0h28l6 6v30H0z" fill="#fff8e6" stroke={INK} strokeWidth={2} transform={`rotate(${r})`} />
                <path d="M5 12h20M5 18h18M5 24h20" stroke="#9a8c74" strokeWidth={1.5} transform={`rotate(${r})`} />
              </g>
            </g>
          ))}
        </g>

        {/* the last frame: the laptop, the table, the shelf, the frame, the clock, the poster — all burning */}
        {BURNING.map((o) => (
          <g key={o.name} className={`${f.tl} ${f.objFire}`} style={{ animationDelay: `${o.at}s` }}>
            {o.flames.map(([x, y, h], i) => flame({ x, y, w: h * 0.55, h, d: 0.5 + ((i * 7 + o.name.length) % 5) * 0.08, o: -i * 0.3 }, i))}
          </g>
        ))}

        {/* the fire in front, at the end the whole room */}
        <g className={`${f.tl} ${f.grow} ${f.gFront}`}>{FIRE.front.map(flame)}</g>

        {/* ---------- the messages ---------- */}
        {/* 02 */}
        <Card x={790} y={14} mx={700} my={-104} t={1.5} d={1.5} w={196} title="Client" lines={["Can we make the", "logo bigger?"]} icon={ChatMark} />
        {/* 03 */}
        <Card x={800} y={6} mx={486} my={-112} t={3} d={1.5} w={208} lines={["Can you try", "one more version?"]} icon={DesignMark} />
        <Card x={1030} y={46} mx={716} my={-62} t={3.25} d={1.25} w={176} lines={["Just a tiny", "change. 🙏"]} icon={MailMark} />
        {/* 04 */}
        <Card x={810} y={26} mx={720} my={-82} t={4.5} d={1.5} w={176} lines={["Need this", "by EOD! ⏰"]} tag="EOD!" />
        {/* 05 */}
        <Card x={800} y={10} mx={700} my={-104} t={6} d={1} w={214} title="Can we add AI to this?" lines={["It'll be more innovative. ✨"]} icon={Sparkle} />
        {/* 06 */}
        <Sticky x={452} y={18} mx={498} my={-96} r={-6} t={7} d={1} lines={["Add", "10 more", "screens?"]} w={104} />
        <Sticky x={820} y={10} mx={800} my={-110} r={7} t={7.15} d={0.85} lines={["Can you", "make it", "pop?"]} w={104} />
        {/* 07 */}
        <Sticky x={400} y={20} mx={488} my={-114} r={-7} t={8} d={1} lines={["The CEO has", "a small", "suggestion."]} w={124} />
        <Sticky x={820} y={8} mx={650} my={-120} r={4} t={8.12} d={0.88} lines={["Let's discuss", "in another", "meeting."]} w={124} />
        <Sticky x={1000} y={30} mx={810} my={-104} r={8} t={8.24} d={0.76} lines={["Actually, can", "we go back", "to v1? 😅"]} w={124} />
        {/* the client calls (06–07): a ringing card */}
        <g className={f.pos} style={{ "--x": 1150, "--y": 28, "--mx": 768, "--my": 4 } as V}>
          <g className={`${f.tl} ${f.pop}`} style={{ "--t": 7.45, "--d": 1.45 } as V} data-sfx="call">
            <g className={`${f.lp} ${f.ring}`}>
              <rect x={4} y={5} width={186} height={56} rx={14} fill={INK} />
              <rect width={186} height={56} rx={14} fill="#2b2a33" stroke={INK} strokeWidth={2.5} />
              <circle cx={28} cy={28} r={15} fill="#7b83eb" />
              <text x={28} y={33} textAnchor="middle" className={f.callInitial}>C</text>
              <text className={f.callName} x={52} y={24}>Client</text>
              <text className={f.callSub} x={52} y={41}>Incoming call…</text>
              <circle cx={140} cy={28} r={12} fill="#e5484d" />
              <path d="M134 29.5c3-2.4 9-2.4 12 0l-1.4 2.4-2.6-.8v-2c-1.3-.4-2.7-.4-4 0v2l-2.6.8z" fill="#fff" />
              <circle cx={168} cy={28} r={12} fill="#30a46c" />
              <path d="M163.5 23.5c.8-.8 2-.6 2.5.3l.9 1.6c.3.6.2 1.3-.3 1.7l-.8.7c.6 1.3 1.6 2.3 2.9 2.9l.7-.8c.4-.5 1.1-.6 1.7-.3l1.6.9c.9.5 1.1 1.7.3 2.5-1.3 1.3-3.3 1.5-4.8.5a14 14 0 0 1-4.8-4.8c-1-1.5-.8-3.5.5-4.8z" fill="#fff" />
            </g>
          </g>
        </g>
      </svg>
      {/* subtitles: small pixel type, only while he speaks */}
      <div className={f.subs} aria-hidden="true">
        {SUBS.map(([, , text], i) => (
          <p key={i} className={`${f.tl} ${f.sub}`} style={anim(`sub${i}`)}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
