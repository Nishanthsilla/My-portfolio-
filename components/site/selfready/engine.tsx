"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./selfready.module.css";

/* ------------------------------------------------------------------------ */
/* time helpers                                                              */
/* ------------------------------------------------------------------------ */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOut = (x: number) => {
  const v = clamp01(x);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** in → hold → out envelope */
export const window01 = (t: number, a: number, b: number, c: number, d: number) => ease(prog(t, a, b)) * (1 - ease(prog(t, c, d)));

/**
 * A looping clock for one scene. It only runs while the scene is on screen and
 * the tab is visible; with reduced motion it rests on a single representative
 * frame (`still`).
 */
export function useLoop(duration: number, still: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(still);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, start = 0, visible = false, offset = 0, last = 0;
    const tick = (now: number) => {
      if (!start) start = now - offset * 1000;
      const v = ((now - start) / 1000) % duration;
      // ~30 updates/s is plenty for UI-state animation and keeps React work low
      if (now - last > 30) {
        last = now;
        setT(v);
      }
      offset = v;
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => {
      const on = es.some((e) => e.isIntersecting);
      if (on && !visible) {
        visible = true;
        start = 0;
        raf = requestAnimationFrame(tick);
      } else if (!on && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration]);
  return { ref, t };
}

/** True when the element is narrower than `limit` px (phones): scenes switch to a stacked layout. */
export function useNarrow(ref: React.RefObject<HTMLElement | null>, limit = 620) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setNarrow(el.clientWidth < limit);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, limit]);
  return narrow;
}

/** Scales a fixed-size design (w×h) to the width of its container. */
export function Stage({ w, h, children, label }: { w: number; h: number; children: ReactNode; label?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setK(el.clientWidth / w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={box} className={s.stage} style={{ aspectRatio: `${w} / ${h}` }} role={label ? "img" : undefined} aria-label={label}>
      <div className={s.stageInner} style={{ width: w, height: h, transform: `scale(${k || 0.0001})`, opacity: k ? 1 : 0 }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* the illustrative shelf                                                    */
/* ------------------------------------------------------------------------ */
const ROWS = [24, 148, 272];
const COLS = [24, 138, 252, 366, 480];
const PW = 96, PH = 84;
const PALETTE = ["#E9D3B8", "#CFDCE6", "#DCCFE0", "#D3E2CD", "#F0DFAE", "#E6C9C3"];
type Kind = "box" | "bottle" | "can" | "pouch";
const KINDS: Kind[] = ["box", "bottle", "box", "can", "pouch", "bottle", "box", "can", "box", "pouch", "can", "box", "bottle", "box", "can"];

export type Item = { i: number; x: number; y: number; lx: number; ly: number };
/** 15 items: 3 shelves × 5. Item 13's label sits between two products (the ambiguous case). */
export const ITEMS: Item[] = Array.from({ length: 15 }, (_, i) => {
  const r = Math.floor(i / 5), c = i % 5;
  const x = COLS[c], y = ROWS[r];
  const lx = i === 13 ? x - 46 : x + 8;
  return { i, x, y, lx, ly: y + PH + 12 };
});
export const NAME = (i: number) => `Item ${String.fromCharCode(65 + i)}`;
export const LABEL = (i: number) => `Label ${i + 1}`;

export type ShelfState = {
  products?: number;            // 0..1, how many product boxes are drawn
  labels?: number;              // 0..1, how many label boxes are drawn
  links?: { i: number; p: number; tone?: "ok" | "flag" | "done" }[];
  focus?: { i: number; a: number } | null; // dims everything else
  flag?: { i: number; a: number } | null;
  done?: number[];
  boxesOut?: number;            // 0..1 fade of all overlays (for the loop)
};

function Product({ x, y, kind, color }: { x: number; y: number; kind: Kind; color: string }) {
  const cx = x + PW / 2;
  if (kind === "bottle")
    return (
      <g>
        <rect x={cx - 9} y={y + 2} width={18} height={12} rx={3} fill="#8E8579" />
        <rect x={cx - 22} y={y + 12} width={44} height={PH - 12} rx={12} fill={color} />
        <rect x={cx - 16} y={y + 38} width={32} height={20} rx={3} fill="#fff" opacity={0.7} />
      </g>
    );
  if (kind === "can")
    return (
      <g>
        <rect x={cx - 26} y={y + 18} width={52} height={PH - 18} rx={6} fill={color} />
        <rect x={cx - 26} y={y + 18} width={52} height={7} rx={3} fill="#B9B0A4" />
        <rect x={cx - 18} y={y + 40} width={36} height={14} rx={2} fill="#fff" opacity={0.7} />
      </g>
    );
  if (kind === "pouch")
    return (
      <g>
        <path d={`M${x + 16} ${y + 10} h${PW - 32} l6 ${PH - 10} h-${PW - 20} z`} fill={color} />
        <rect x={cx - 18} y={y + 34} width={36} height={18} rx={3} fill="#fff" opacity={0.7} />
      </g>
    );
  return (
    <g>
      <rect x={x + 12} y={y + 6} width={PW - 24} height={PH - 6} rx={4} fill={color} />
      <rect x={x + 22} y={y + 22} width={PW - 44} height={22} rx={3} fill="#fff" opacity={0.7} />
      <rect x={x + 22} y={y + 52} width={PW - 58} height={6} rx={3} fill="#fff" opacity={0.6} />
    </g>
  );
}

function ShelfLabel({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={80} height={22} rx={2} fill="#FFFFFF" stroke="#D8D2C8" />
      <rect x={x + 6} y={y + 6} width={36} height={4} rx={2} fill="#B9B0A4" />
      <rect x={x + 6} y={y + 13} width={24} height={3} rx={1.5} fill="#D3CCC2" />
      <rect x={x + 54} y={y + 5} width={20} height={12} rx={2} fill="#3A3733" />
    </g>
  );
}

export function Shelf({ st }: { st: ShelfState }) {
  const prodN = Math.round((st.products ?? 0) * 15);
  const labN = Math.round((st.labels ?? 0) * 15);
  const out = 1 - (st.boxesOut ?? 0);
  const dimOthers = st.focus ? st.focus.a : 0;
  return (
    <svg viewBox="0 0 600 380" className={s.shelf} aria-hidden="true">
      <rect width="600" height="380" fill="#F4F1EC" />
      {ROWS.map((y) => (
        <g key={y}>
          <rect x="10" y={y + PH + 2} width="580" height="8" fill="#CBC3B7" />
          <rect x="10" y={y + PH + 10} width="580" height="30" fill="#E7E2DA" />
        </g>
      ))}
      {ITEMS.map((it) => (
        <g key={it.i} opacity={st.focus && st.focus.i !== it.i ? 1 - 0.55 * dimOthers : 1}>
          <Product x={it.x} y={it.y} kind={KINDS[it.i]} color={PALETTE[it.i % PALETTE.length]} />
          <ShelfLabel x={it.lx} y={it.ly} />
        </g>
      ))}
      {/* detections */}
      <g opacity={out}>
        {ITEMS.map((it) => {
          const done = st.done?.includes(it.i);
          const flagged = st.flag?.i === it.i ? st.flag.a : 0;
          const stroke = flagged > 0.01 ? "#FF4938" : done ? "#3A3733" : "#FF4938";
          const dim = st.focus && st.focus.i !== it.i ? 1 - 0.7 * dimOthers : 1;
          return (
            <g key={it.i} opacity={dim}>
              {it.i < prodN && (
                <rect x={it.x + 6} y={it.y} width={PW - 12} height={PH + 2} rx={5} fill="none" stroke={stroke} strokeWidth={flagged ? 2.5 : 1.6} />
              )}
              {it.i < labN && (
                <rect x={it.lx - 3} y={it.ly - 3} width={86} height={28} rx={4} fill="none" stroke="#3A3733" strokeWidth={1.3} strokeDasharray="4 3" />
              )}
            </g>
          );
        })}
        {(st.links ?? []).map((l) => {
          const it = ITEMS[l.i];
          const x1 = it.x + PW / 2, y1 = it.y + PH + 2, x2 = it.lx + 40, y2 = it.ly - 3;
          const col = l.tone === "flag" ? "#FF4938" : l.tone === "done" ? "#3A3733" : "#FF4938";
          return (
            <g key={l.i} opacity={l.p}>
              <line x1={x1} y1={y1} x2={lerp(x1, x2, l.p)} y2={lerp(y1, y2, l.p)} stroke={col} strokeWidth={2} strokeDasharray={l.tone === "flag" ? "3 3" : undefined} />
              <circle cx={x1} cy={y1} r={3.5} fill={col} />
              <circle cx={lerp(x1, x2, l.p)} cy={lerp(y1, y2, l.p)} r={3.5} fill={col} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** A small crop of one product and its label, for evidence panels. */
export function Crop({ i, part }: { i: number; part: "product" | "label" }) {
  const it = ITEMS[i];
  const vb = part === "product" ? `${it.x} ${it.y - 4} ${PW} ${PH + 10}` : `${it.lx - 6} ${it.ly - 6} 92 34`;
  return (
    <svg viewBox={vb} className={s.crop} aria-hidden="true">
      <rect x={0} y={0} width={600} height={380} fill="#F4F1EC" />
      {part === "product" ? (
        <Product x={it.x} y={it.y} kind={KINDS[i]} color={PALETTE[i % PALETTE.length]} />
      ) : (
        <ShelfLabel x={it.lx} y={it.ly} />
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* UI atoms                                                                  */
/* ------------------------------------------------------------------------ */
export function Cursor({ x, y, press = false, a = 1 }: { x: number; y: number; press?: boolean; a?: number }) {
  return (
    <div className={s.cursor} style={{ transform: `translate(${x}px, ${y}px) scale(${press ? 0.86 : 1})`, opacity: a }} aria-hidden="true">
      <svg viewBox="0 0 16 16"><path d="M1 1 L14 6.5 L8 8 L6.5 14 Z" /></svg>
    </div>
  );
}

export function Chip({ tone, children }: { tone: "auto" | "confirm" | "unresolved" | "done" | "plain"; children: ReactNode }) {
  return <span className={`${s.chip} ${s[`chip_${tone}`]}`}>{children}</span>;
}

/** Visible marker for anything not yet verified. */
export function NeedsConfirmation({ children = "Needs confirmation" }: { children?: ReactNode }) {
  return <span className={s.confirm}>{children}</span>;
}

export function Illustrative() {
  return <span className={s.illus}>Illustrative reconstruction · not a product screenshot</span>;
}
