"use client";

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
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
      <g className={`${f.tl} ${f.pop}`} style={{ "--t": t, "--d": d } as V}>
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
      <g className={`${f.tl} ${f.drop}`} style={{ "--t": t, "--d": d } as V}>
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
    const io = new IntersectionObserver(
      ([e]) => {
        el.classList.toggle(f.vis, e.isIntersecting);
        if (e.intersectionRatio >= 0.55) el.classList.add(f.play);
      },
      { threshold: [0, 0.55] },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const fl = `${uid}fl`, glow = `${uid}gl`, wall = `${uid}wl`;
  const flame = (p: { x: number; y: number; w: number; h: number; d: number; o: number }, i: number) => (
    <use key={i} href={`#${fl}`} x={p.x - p.w / 2} y={p.y - p.h} width={p.w} height={p.h} className={`${f.lp} ${f.flick}`} style={{ "--fd": `${p.d.toFixed(2)}s`, "--fo": `${p.o.toFixed(2)}s` } as V} />
  );

  return (
    <div ref={root} className={`${f.root} ${className}`} role="img" aria-label="A cartoon dog in a hat calmly drinks coffee while client requests pile up and the room catches fire. He ends up a skeleton in sunglasses, still holding his coffee: this is fine.">
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
          <path d="M834 106l92-4 6 58h-92z" fill="#e3dccb" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <text x={883} y={146} textAnchor="middle" className={f.lapN}>n</text>
          <path d="M818 160h124" stroke={INK} strokeWidth={4} strokeLinecap="round" />
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
              <Mug />
              <path d="M-8 132q22 18 46 8" fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
              <path d="M-8 132q22 18 46 8" fill="none" stroke={FUR} strokeWidth={11} strokeLinecap="round" />
              <circle cx={42} cy={138} r={8} fill={FUR} stroke={INK} strokeWidth={2.5} />
              {/* head */}
              <g className={`${f.lp} ${f.nod}`}>
                <path d="M-30 70c-22 8-20 48-6 54 8-8 10-28 14-42z" fill="#c9752a" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                <circle cx={0} cy={86} r={38} fill={FUR} stroke={INK} strokeWidth={3} />
                <path d="M20 79c30-9 66-1 66 17s-34 21-64 14z" fill={FUR} stroke={INK} strokeWidth={3} />
                <circle cx={17} cy={94} r={14} fill={FUR} />
                <ellipse cx={84} cy={90} rx={8.5} ry={6.5} fill="#1d120a" />
                <path d="M50 106q14 5 26-2" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
                {/* eyes: open (blinking, glancing) / tired / shut */}
                <g className={`${f.tl} ${f.eOpen}`}>
                  <g className={`${f.lp} ${f.blink}`}>
                    <circle cx={22} cy={70} r={14} fill="#fff" stroke={INK} strokeWidth={2.5} />
                    <circle cx={48} cy={68} r={13} fill="#fff" stroke={INK} strokeWidth={2.5} />
                    <g className={`${f.tl} ${f.pupils}`}>
                      <circle cx={26} cy={72} r={4.6} fill="#111" />
                      <circle cx={51} cy={70} r={4.3} fill="#111" />
                    </g>
                  </g>
                </g>
                <g className={`${f.tl} ${f.eHalf}`}>
                  <circle cx={22} cy={70} r={14} fill="#fff" stroke={INK} strokeWidth={2.5} />
                  <circle cx={48} cy={68} r={13} fill="#fff" stroke={INK} strokeWidth={2.5} />
                  <circle cx={25} cy={76} r={4.4} fill="#111" />
                  <circle cx={50} cy={74} r={4.1} fill="#111" />
                  <path d="M7 71a15 15 0 0 1 30 0z" fill={FUR} stroke={INK} strokeWidth={2.5} />
                  <path d="M34 69a14 14 0 0 1 28 0z" fill={FUR} stroke={INK} strokeWidth={2.5} />
                </g>
                <g className={`${f.tl} ${f.eShut}`}>
                  <path d="M10 72q12 8 24 0M37 70q11 8 22 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
                </g>
                <Hat />
                <g className={`${f.tl} ${f.shades}`}>
                  <Shades />
                </g>
              </g>
            </g>
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
              <Mug />
              <path d="M-12 128q22 22 50 12" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
              <path d="M-12 128q22 22 50 12" fill="none" stroke={BONE} strokeWidth={4.5} strokeLinecap="round" />
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
        {/* 08 */}
        <g className={f.pos} style={{ "--x": 790, "--y": 4, "--mx": 712, "--my": -100 } as V}>
          <g className={`${f.tl} ${f.pop}`} style={{ "--t": 9, "--d": 1 } as V}>
            <path d="M16 58l-48 36 40-14z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <ellipse cx={92} cy={42} rx={92} ry={42} fill="#fff" stroke={INK} strokeWidth={3.5} />
            <path d="M6 60l10 16" stroke="#fff" strokeWidth={7} />
            <text className={f.fine} x={92} y={36} textAnchor="middle">THIS IS</text>
            <text className={f.fine} x={92} y={64} textAnchor="middle">FINE.</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
