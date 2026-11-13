"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import c from "./contact.module.css";

type State = "idle" | "shock" | "bye" | "away" | "hidden";
const LINES: Partial<Record<State, string>> = {
  shock: "Oops! You found me.",
  bye: "Bye bye! 👋",
};

/**
 * A doodled cat peeking over the bottom edge of the contact screen: ears and
 * eyes only, eyes following the pointer, the odd blink. Hover and it peeks a
 * little further. Click (or Enter) and it's caught: shocked face, "Oops! You
 * found me.", a wave goodbye — then it grabs the screen with both paws and
 * drags it down as it ducks away, and the screen springs back up into place.
 * The cat comes back to peek a moment later.
 */
export default function PeekCat() {
  const [state, setState] = useState<State>("idle");
  const btn = useRef<HTMLButtonElement>(null);
  const eyes = useRef<(SVGGElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  // the pupils follow the pointer
  useEffect(() => {
    const move = (e: PointerEvent) => {
      eyes.current.forEach((g) => {
        if (!g) return;
        const r = g.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2),
          dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1,
          k = Math.min(1, d / 120) * 5;
        g.setAttribute(
          "transform",
          `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`,
        );
      });
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) =>
    timers.current.push(window.setTimeout(fn, ms));

  const caught = () => {
    if (state !== "idle") return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setState("shock");
    later(1500, () => setState("bye"));
    if (calm) {
      later(3200, () => setState("idle"));
      return;
    }
    // grab the screen and drag it down while ducking away… then it springs back
    later(2900, () => {
      setState("away");
      const screen = btn.current
        ?.closest("section")
        ?.querySelector<HTMLElement>("[data-cat-screen]");
      if (!screen) return;
      gsap
        .timeline()
        .to(screen, { y: "62%", duration: 0.75, ease: "power3.in" })
        .to(screen, {
          y: 0,
          duration: 1.3,
          ease: "elastic.out(1, 0.45)",
          delay: 0.25,
          clearProps: "transform",
        });
    });
    later(3700, () => setState("hidden"));
    later(6400, () => setState("idle"));
  };

  const shocked = state === "shock" || state === "bye" || state === "away";
  const line = LINES[state];

  return (
    <div className={c.catWrap} data-state={state}>
      <span className={c.hint} aria-hidden="true">
        something&apos;s hiding here →
      </span>
      {line && (
        <span key={state} className={c.bubble} role="status">
          {line}
        </span>
      )}
      <div className={c.catBox}>
        <button
          ref={btn}
          type="button"
          className={c.cat}
          onClick={caught}
          aria-label="Something's hiding in the corner"
        >
          <svg viewBox="0 0 220 176" aria-hidden="true" className={state === "shock" ? c.shake : undefined}>
            {/* a kawaii doodle cat: thick round strokes, open outline, pink cheeks */}
            <g fill="none" stroke="#1d1b19" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
              {/* the white of the face and paws (no outline) */}
              <path d="M46 96 C 46 54, 60 32, 78 32 C 92 32, 100 48, 104 58 L 132 58 C 138 46, 146 32, 162 32 C 180 32, 186 60, 182 92 L 182 138 L 204 154 L 204 168 L 16 168 L 16 154 L 46 132 Z" fill="#fff" stroke="none" />
              {/* ears and the top of the head */}
              <g className={c.ears}>
                <path d="M46 96 C 46 54, 60 32, 78 32 C 92 32, 100 48, 104 58 L 132 58 C 138 46, 146 32, 162 32 C 180 32, 186 60, 182 92" />
              </g>
              {/* tabby stripes */}
              <path d="M108 68 V 80 M118 66 V 80 M128 68 V 80" stroke="#bdb6ab" strokeWidth="5" />
              {/* whiskers */}
              <path d="M26 92 L 44 99 M24 108 L 42 109 M198 92 L 180 99 M200 108 L 182 109" strokeWidth="6" />
              {/* cheeks */}
              <ellipse cx="60" cy="122" rx={shocked ? 12 : 10} ry="7" fill="#F7AFBB" stroke="none" />
              <ellipse cx="168" cy="122" rx={shocked ? 12 : 10} ry="7" fill="#F7AFBB" stroke="none" />
              {/* eyes: dots that follow you · wide when caught · happy arcs to say bye */}
              {[80, 148].map((cx, i) => (
                <g key={cx} className={c.lids}>
                  {state === "bye" ? (
                    <path d={`M${cx - 9} 108 Q ${cx} 98, ${cx + 9} 108`} strokeWidth="6" />
                  ) : shocked ? (
                    <>
                      <circle cx={cx} cy={106} r={13} fill="#fff" strokeWidth="6" />
                      <g ref={(n) => { eyes.current[i] = n; }}>
                        <circle cx={cx} cy={106} r={4} fill="#1d1b19" stroke="none" />
                      </g>
                    </>
                  ) : (
                    <g ref={(n) => { eyes.current[i] = n; }}>
                      <circle cx={cx} cy={106} r={7.5} fill="#1d1b19" stroke="none" />
                    </g>
                  )}
                </g>
              ))}
              {/* mouth: a little ω with the tongue out · a tiny "o" when caught */}
              {state === "shock" || state === "away" ? (
                <ellipse cx="114" cy="122" rx="6" ry="8" fill="#1d1b19" stroke="none" />
              ) : (
                <>
                  <path d="M106 116 C 104 132, 124 132, 122 116" fill="#F48FA0" strokeWidth="6" />
                  <path d="M96 106 C 98 118, 112 118, 114 108 C 116 118, 130 118, 132 106" strokeWidth="6" />
                </>
              )}
              {/* "!" marks and a sweat drop when caught */}
              {state === "shock" && (
                <>
                  <path d="M38 40 L 30 20 M50 30 L 50 10 M190 40 L 198 20 M178 30 L 178 10" stroke="#FF4938" strokeWidth="6" />
                  <path d="M196 60 C 190 70, 192 78, 198 78 C 204 78, 206 70, 196 60 Z" fill="#9ED3FF" strokeWidth="4" />
                </>
              )}
              {/* paws on the ledge (they lift to wave, then grab the screen) */}
              <g className={c.paws}>
                <g className={c.wave}>
                  <path d="M46 132 C 34 142, 22 150, 20 157 C 18 165, 32 166, 56 165 C 64 165, 70 162, 74 154" />
                </g>
                <path d="M74 154 C 78 165, 92 167, 100 158 M100 158 C 106 167, 122 167, 128 158 M128 158 C 134 167, 148 167, 154 154" />
                <path d="M154 154 C 158 162, 164 165, 172 165 C 196 166, 206 164, 204 157 C 202 150, 192 142, 182 134" />
              </g>
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}
