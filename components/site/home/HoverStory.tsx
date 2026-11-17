"use client";

import { useEffect, useRef, useState } from "react";
import m from "./me.module.css";

export type Word = { color: string; need: string; photos: string[] };

/** where the thrown photos land around the word: x / y offset (px), tilt (deg) */
const SPOTS = [
  { x: -170, y: -190, r: -9 },
  { x: 10, y: -235, r: 4 },
  { x: 180, y: -175, r: 11 },
];

/**
 * A paragraph where some words are alive: hovering one (or tapping it on a
 * phone) throws a few photos out around it, like prints tossed on a table.
 * [[key|the words]] in the text marks such a word.
 */
export default function HoverStory({ text, words, className }: { text: string; words: Record<string, Word>; className?: string }) {
  const parts = text.split(/(\[\[\w+\|[^\]]+\]\])/g);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        const hit = part.match(/^\[\[(\w+)\|([^\]]+)\]\]$/);
        if (!hit) return part;
        const w = words[hit[1]];
        return w ? <Live key={i} label={hit[2]} word={w} seed={i} /> : hit[2];
      })}
    </p>
  );
}

function Live({ label, word, seed }: { label: string; word: Word; seed: number }) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(0); // which photos to throw this time
  const ref = useRef<HTMLSpanElement>(null);
  const touch = useRef(false);

  // a tap anywhere else puts the photos away (phones)
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    addEventListener("pointerdown", off);
    return () => removeEventListener("pointerdown", off);
  }, [open]);

  const show = () => {
    setPick((p) => p + 1);
    setOpen(true);
  };
  const photos = word.photos.length ? word.photos : [];
  const shown = photos.length
    ? SPOTS.map((_, k) => photos[(pick * 2 + k + seed) % photos.length]).slice(0, Math.min(SPOTS.length, photos.length))
    : [null, null];
  // a single photo lands just above and to the right of the word, slightly bigger
  const spots = shown.length === 1 ? [{ x: 150, y: -175, r: 5 }] : SPOTS;

  return (
    <span
      ref={ref}
      className={`${m.live} ${open ? m.liveOn : ""}`}
      style={{ ["--c" as string]: word.color }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(false);
      }}
    >
      <button
        type="button"
        className={m.liveWord}
        aria-expanded={open}
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
      <span className={m.throw} aria-hidden="true">
        {shown.map((src, k) => (
          <span
            key={`${pick}-${k}`}
            className={m.print}
            style={{ ["--x" as string]: `${spots[k].x}px`, ["--y" as string]: `${spots[k].y}px`, ["--r" as string]: `${spots[k].r}deg`, ["--d" as string]: `${k * 55}ms`, ...(shown.length === 1 ? { width: 170 } : {}) }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" loading="lazy" />
            ) : (
              <span className={m.printSlot}>
                <b>Photo soon</b>
                {word.need}
              </span>
            )}
          </span>
        ))}
      </span>
    </span>
  );
}
