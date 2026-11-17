"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import m from "./me.module.css";

export type Word = { color: string; need: string; photos: string[] };

const MAX = 5; // at most this many photos at once
const NAV = 84; // keep clear of the floating navbar
const EDGE = 12; // and of the screen edges

/** a wavy underline in the word's own colour (it drifts sideways) */
const wave = (color: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='6' viewBox='0 0 16 6'><path d='M0 3 Q4 0 8 3 T16 3' fill='none' stroke='${color}' stroke-width='1.8' stroke-linecap='round'/></svg>`,
  )}")`;

type Spot = { left: number; top: number; r: number; fx: number; fy: number };

/**
 * Where the photos land: a fan above the word (or below, when there's no room
 * above), always inside the visible screen.
 */
function layout(rect: DOMRect, n: number): { w: number; spots: Spot[] } {
  const vw = innerWidth, vh = innerHeight;
  const phone = vw < 760;
  let w = phone ? (n > 3 ? 84 : 104) : n === 1 ? 180 : n > 3 ? 140 : 156;
  const h = () => (w - 12) * 1.25 + 24;
  let step = n > 1 ? w * 0.82 : 0;
  // never wider than the screen
  const room = vw - EDGE * 2;
  if (step * (n - 1) + w > room) step = Math.max(w * 0.45, (room - w) / Math.max(1, n - 1));
  if (step * (n - 1) + w > room) {
    w = Math.max(64, room / (1 + (n - 1) * 0.5));
    step = w * 0.5;
  }
  const span = step * (n - 1) + w;
  const cx = Math.min(Math.max(rect.left + rect.width / 2, EDGE + span / 2), vw - EDGE - span / 2);
  const above = rect.top - h() - 14 >= NAV;
  const baseTop = above ? rect.top - h() - 14 : Math.min(rect.bottom + 14, vh - h() - EDGE);
  const wx = rect.left + rect.width / 2, wy = rect.top + rect.height / 2;
  const spots = Array.from({ length: n }, (_, k) => {
    const t = n === 1 ? 0 : k / (n - 1) - 0.5; // −0.5 … 0.5
    const left = cx - span / 2 + k * step;
    const lift = (0.25 - t * t) * 40; // the middle sits a little higher, like a fan
    const top = Math.max(NAV, Math.min(baseTop - (above ? lift : -lift), vh - h() - EDGE));
    return { left, top, r: n === 1 ? 4 : t * 22, fx: wx - (left + w / 2), fy: wy - (top + h() / 2) };
  });
  return { w, spots };
}

/**
 * A paragraph where some words are alive: hovering one (or tapping it on a
 * phone) throws up to five photos out of it. [[key|the words]] marks one.
 */
export default function HoverStory({ text, words, className }: { text: string; words: Record<string, Word>; className?: string }) {
  const parts = text.split(/(\[\[\w+\|[^\]]+\]\])/g);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        const hit = part.match(/^\[\[(\w+)\|([^\]]+)\]\]$/);
        if (!hit) return part;
        const w = words[hit[1]];
        return w ? <Live key={i} label={hit[2]} word={w} /> : hit[2];
      })}
    </p>
  );
}

function Live({ label, word }: { label: string; word: Word }) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0); // a different set of photos each time
  const [place, setPlace] = useState<{ w: number; spots: Spot[] } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  const touch = useRef(false);

  const n = Math.min(MAX, Math.max(1, word.photos.length || 2));
  const pick = word.photos.length
    ? Array.from({ length: n }, (_, k) => word.photos[(round * n + k) % word.photos.length])
    : Array.from({ length: n }, () => null);

  const show = () => {
    const el = ref.current;
    if (!el) return;
    // the first line of the word (it may wrap)
    const r = el.getClientRects()[0] ?? el.getBoundingClientRect();
    setPlace(layout(r, n));
    setRound((v) => v + 1);
    setOpen(true);
  };

  // put them away on scroll, resize, or a tap anywhere else
  useEffect(() => {
    if (!open) return;
    const hide = () => setOpen(false);
    const off = (e: PointerEvent) => e.target !== ref.current && hide();
    addEventListener("scroll", hide, { capture: true, passive: true });
    addEventListener("resize", hide);
    addEventListener("pointerdown", off);
    return () => {
      removeEventListener("scroll", hide, { capture: true });
      removeEventListener("resize", hide);
      removeEventListener("pointerdown", off);
    };
  }, [open]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={`${m.liveWord} ${open ? m.liveOn : ""}`}
        style={{ ["--c" as string]: word.color, backgroundImage: wave(word.color) }}
        aria-expanded={open}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onPointerDown={(e) => (touch.current = e.pointerType !== "mouse")}
        onClick={() => {
          if (!touch.current) return;
          if (open) setOpen(false);
          else show();
        }}
        onFocus={() => !touch.current && show()}
        onBlur={() => setOpen(false)}
      >
        {label}
      </button>
      {place &&
        createPortal(
          <div className={`${m.throw} ${open ? m.throwOn : ""}`} aria-hidden="true">
            {place.spots.map((s, k) => {
              const src = pick[k];
              return (
                <span
                  key={`${round}-${k}`}
                  className={m.print}
                  style={{
                    left: s.left, top: s.top, width: place.w,
                    ["--r" as string]: `${s.r}deg`, ["--fx" as string]: `${s.fx}px`, ["--fy" as string]: `${s.fy}px`, ["--d" as string]: `${k * 45}ms`,
                  }}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" />
                  ) : (
                    <span className={m.printSlot}>
                      <b>Photo soon</b>
                      {word.need}
                    </span>
                  )}
                </span>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
