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
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className={state === "shock" ? c.shake : undefined}
          >
            <g
              fill="#fff"
              stroke="#1d1b19"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* head + ears */}
              <g className={c.ears}>
                <path d="M22 200 C 18 140, 30 98, 54 82 L 44 26 L 88 60 C 96 57, 104 57, 112 60 L 156 26 L 146 82 C 170 98, 182 140, 178 200 Z" />
                <path
                  d="M54 44 L 58 74 L 78 62 Z M146 44 L 142 74 L 122 62 Z"
                  fill="#FFB3A8"
                  strokeWidth="3"
                />
              </g>
              {/* eyes */}
              {[74, 126].map((cx, i) => (
                <g key={cx}>
                  <g className={c.lids}>
                    <ellipse
                      cx={cx}
                      cy={112}
                      rx={shocked ? 20 : 15}
                      ry={shocked ? 22 : 17}
                    />
                    <g
                      ref={(n) => {
                        eyes.current[i] = n;
                      }}
                    >
                      <circle
                        cx={cx}
                        cy={114}
                        r={shocked ? 4 : 8}
                        fill="#1d1b19"
                        stroke="none"
                      />
                      {!shocked && (
                        <circle
                          cx={cx + 3}
                          cy={110}
                          r={2.4}
                          fill="#fff"
                          stroke="none"
                        />
                      )}
                    </g>
                  </g>
                  {shocked && (
                    <path
                      d={`M${cx - 14} ${78 - (i ? 0 : 0)} Q ${cx} 70, ${cx + 14} 78`}
                      fill="none"
                      strokeWidth="3.5"
                    />
                  )}
                </g>
              ))}
              {/* nose, mouth, whiskers */}
              <path
                d="M93 138 L107 138 L100 146 Z"
                fill="#FF4938"
                strokeWidth="3"
              />
              {shocked ? (
                <ellipse cx="100" cy="162" rx="7" ry="9" fill="#1d1b19" />
              ) : (
                <path
                  d="M100 146 C 98 154, 90 156, 85 151 M100 146 C 102 154, 110 156, 115 151"
                  fill="none"
                  strokeWidth="3.5"
                />
              )}
              <path
                d="M60 144 L 22 136 M60 152 L 24 158 M140 144 L 178 136 M140 152 L 176 158"
                fill="none"
                strokeWidth="3"
              />
              {shocked && (
                <path
                  d="M30 40 L 22 18 M38 34 L 40 12 M170 40 L 178 18 M162 34 L 160 12"
                  fill="none"
                  stroke="#FF4938"
                  strokeWidth="4"
                />
              )}
              {/* paws (come up to wave, then grab the screen) */}
              <g className={c.paws}>
                <g className={c.wave}>
                  <path d="M30 200 C 26 176, 38 164, 54 166 C 70 168, 76 182, 72 200 Z" />
                  <path
                    d="M44 172 L 44 182 M56 170 L 56 181"
                    fill="none"
                    strokeWidth="3"
                  />
                </g>
                <path d="M128 200 C 124 182, 132 166, 148 166 C 164 166, 172 180, 170 200 Z" />
                <path
                  d="M142 171 L 142 181 M154 171 L 154 182"
                  fill="none"
                  strokeWidth="3"
                />
              </g>
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}
