"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import c from "./contact.module.css";

/**
 *  idle    peeking over the edge (ears + eyes), soap bubbles drifting up behind it
 *  bath    caught mid-bath: it shoots up in its tub, splashing — "Hey! Knock first!"
 *  curtain a shower curtain sweeps across the whole screen ("Occupied")
 *  hidden  the curtain opens again; the cat is gone… and peeks back a moment later
 */
type State = "idle" | "bath" | "curtain" | "hidden";
type Curtain = "off" | "closing" | "opening";

/**
 * The cat in the corner of the contact screen. It's taking a bath.
 * Mouse: the eyes follow you; hover and it peeks further. Click / Enter /
 * tap: the bath scene. Reduced motion: it just says its line, no curtain.
 */
export default function PeekCat() {
  const [state, setState] = useState<State>("idle");
  const [curtain, setCurtain] = useState<Curtain>("off");
  const [host, setHost] = useState<HTMLElement | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const eyes = useRef<(SVGGElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  // the curtain covers the whole contact scene (the section this cat lives in)
  useEffect(() => {
    setHost(wrap.current?.closest("section") ?? null);
  }, []);

  // the pupils follow the pointer
  useEffect(() => {
    const move = (e: PointerEvent) => {
      eyes.current.forEach((g) => {
        if (!g) return;
        const r = g.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 120) * 4;
        g.setAttribute("transform", `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`);
      });
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const caught = () => {
    if (state !== "idle") return;
    setState("bath");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      later(2600, () => setState("idle"));
      return;
    }
    later(1900, () => {
      setState("curtain");
      setCurtain("closing");
    });
    later(4000, () => {
      setState("hidden");
      setCurtain("opening");
    });
    later(4900, () => setCurtain("off"));
    later(7600, () => setState("idle"));
  };

  const bath = state === "bath" || state === "curtain";

  return (
    <div ref={wrap} className={c.catWrap} data-state={state}>
      <span className={c.hint} aria-hidden="true">something&apos;s hiding here →</span>
      {/* soap bubbles drifting up from behind the cat (a hint of what it's doing) */}
      <span className={c.soap} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {state === "bath" && (
        <span className={c.bubble} role="status">
          Hey! Knock first! 🫧
        </span>
      )}
      <div className={c.catBox}>
        <button type="button" className={c.cat} onClick={caught} aria-label="Something's hiding in the corner">
          <svg viewBox="0 0 220 176" aria-hidden="true" className={state === "bath" ? c.shake : undefined}>
            {/* a kawaii doodle cat: thick round strokes, open outline, pink cheeks */}
            <g fill="none" stroke="#1d1b19" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M46 96 C 46 54, 60 32, 78 32 C 92 32, 100 48, 104 58 L 132 58 C 138 46, 146 32, 162 32 C 180 32, 186 60, 182 92 L 182 138 L 204 154 L 204 168 L 16 168 L 16 154 L 46 132 Z" fill="#fff" stroke="none" />
              <g className={c.ears}>
                <path d="M46 96 C 46 54, 60 32, 78 32 C 92 32, 100 48, 104 58 L 132 58 C 138 46, 146 32, 162 32 C 180 32, 186 60, 182 92" />
              </g>
              <path d="M108 68 V 80 M118 66 V 80 M128 68 V 80" stroke="#bdb6ab" strokeWidth="5" />
              <path d="M26 92 L 44 99 M24 108 L 42 109 M198 92 L 180 99 M200 108 L 182 109" strokeWidth="6" />
              <ellipse cx="60" cy="122" rx={bath ? 12 : 10} ry="7" fill="#F7AFBB" stroke="none" />
              <ellipse cx="168" cy="122" rx={bath ? 12 : 10} ry="7" fill="#F7AFBB" stroke="none" />
              {/* eyes: dots that follow you · wide open when caught */}
              {[80, 148].map((cx, i) => (
                <g key={cx} className={c.lids}>
                  {bath && <circle cx={cx} cy={106} r={13} fill="#fff" strokeWidth="6" />}
                  <g ref={(n) => { eyes.current[i] = n; }}>
                    <circle cx={cx} cy={106} r={bath ? 4 : 7.5} fill="#1d1b19" stroke="none" />
                  </g>
                </g>
              ))}
              {/* mouth: a little ω with the tongue out · a shouting "o" when caught */}
              {bath ? (
                <ellipse cx="114" cy="124" rx="8" ry="10" fill="#1d1b19" stroke="none" />
              ) : (
                <>
                  <path d="M106 116 C 104 132, 124 132, 122 116" fill="#F48FA0" strokeWidth="6" />
                  <path d="M96 106 C 98 118, 112 118, 114 108 C 116 118, 130 118, 132 106" strokeWidth="6" />
                </>
              )}
              {/* a towel on its head, and "!" marks, when caught */}
              {bath && (
                <>
                  <path d="M70 44 C 84 22, 150 22, 166 44 C 150 52, 86 52, 70 44 Z" fill="#FFB3A8" strokeWidth="5" />
                  <path d="M38 40 L 30 20 M50 30 L 50 10 M190 40 L 198 20 M178 30 L 178 10" stroke="#FF4938" strokeWidth="6" />
                </>
              )}
              {/* paws on the ledge — or on the rim of the tub */}
              <path d="M46 132 C 34 142, 22 150, 20 157 C 18 165, 32 166, 56 165 C 64 165, 70 162, 74 154" />
              <path d="M74 154 C 78 165, 92 167, 100 158 M100 158 C 106 167, 122 167, 128 158 M128 158 C 134 167, 148 167, 154 154" />
              <path d="M154 154 C 158 162, 164 165, 172 165 C 196 166, 206 164, 204 157 C 202 150, 192 142, 182 134" />
              {/* the bathtub (comes up with the cat when it's caught) */}
              <g className={c.tub}>
                <path d="M-6 158 H 226 C 226 206, 196 232, 160 232 H 60 C 24 232, -6 206, -6 158 Z" fill="#fff" />
                <path d="M-12 158 H 232" strokeWidth="9" />
                <path d="M40 232 L 34 248 M180 232 L 186 248" strokeWidth="7" />
                {/* foam along the rim */}
                <g fill="#fff" strokeWidth="5">
                  <circle cx="8" cy="150" r="13" />
                  <circle cx="30" cy="144" r="11" />
                  <circle cx="196" cy="146" r="12" />
                  <circle cx="214" cy="152" r="10" />
                  <circle cx="110" cy="170" r="6" />
                </g>
                {/* rubber duck */}
                <g transform="translate(156 124)">
                  <path d="M0 26 C 0 12, 10 6, 18 10 C 18 0, 34 -2, 36 10 C 40 10, 44 12, 44 14 C 40 16, 38 16, 36 16 C 40 24, 34 34, 18 34 C 6 34, 0 32, 0 26 Z" fill="#FFD43B" strokeWidth="4.5" />
                  <circle cx="28" cy="10" r="2.6" fill="#1d1b19" stroke="none" />
                </g>
              </g>
            </g>
          </svg>
        </button>
      </div>
      {/* water splashing out */}
      {state === "bath" && (
        <span className={c.splash} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} style={{ ["--i" as string]: i }} />
          ))}
        </span>
      )}
      {/* the shower curtain, across the whole contact screen */}
      {host &&
        curtain !== "off" &&
        createPortal(
          <div className={c.curtain} data-curtain={curtain} aria-hidden="true">
            <span className={c.rod} />
            <span className={c.fabric}>
              <span className={c.sign}>
                Occupied <span>🛁</span>
              </span>
            </span>
          </div>,
          host,
        )}
    </div>
  );
}
