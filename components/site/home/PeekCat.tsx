"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import c from "./contact.module.css";

/**
 *  idle    peeking over the bottom corner (ears + eyes), its rubber duck bobbing beside it
 *  startle clicked: the duck jumps, the cat startles
 *  reveal  the contact screen scrolls up: below it is a little bathroom — the cat,
 *          caught in its tub, shouts "Hey! Knock first!"
 *  pull    it yanks the cord and the blind rolls down over the bath ("Occupied")
 *  close   the screen scrolls back down into place
 *  hidden  back to normal; the cat peeks again a moment later
 */
type State = "idle" | "startle" | "reveal" | "pull" | "close" | "hidden";

/** The doodle cat (kawaii: thick round strokes, stripes, pink cheeks). */
function CatArt({ caught, tub, eyeRef, shake }: { caught: boolean; tub: boolean; eyeRef?: (i: number, n: SVGGElement | null) => void; shake?: boolean }) {
  return (
    <svg viewBox={tub ? "-18 0 256 252" : "0 0 220 176"} aria-hidden="true" className={shake ? c.shake : undefined}>
      <g fill="none" stroke="#1d1b19" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M46 96 C 46 54, 60 32, 78 32 C 92 32, 100 48, 104 58 L 132 58 C 138 46, 146 32, 162 32 C 180 32, 186 60, 182 92 L 182 138 L 204 154 L 204 168 L 16 168 L 16 154 L 46 132 Z" fill="#fff" stroke="none" />
        <path d="M46 96 C 46 54, 60 32, 78 32 C 92 32, 100 48, 104 58 L 132 58 C 138 46, 146 32, 162 32 C 180 32, 186 60, 182 92" />
        <path d="M108 68 V 80 M118 66 V 80 M128 68 V 80" stroke="#bdb6ab" strokeWidth="5" />
        <path d="M26 92 L 44 99 M24 108 L 42 109 M198 92 L 180 99 M200 108 L 182 109" strokeWidth="6" />
        <ellipse cx="60" cy="122" rx={caught ? 12 : 10} ry="7" fill="#F7AFBB" stroke="none" />
        <ellipse cx="168" cy="122" rx={caught ? 12 : 10} ry="7" fill="#F7AFBB" stroke="none" />
        {[80, 148].map((cx, i) => (
          <g key={cx} className={caught ? undefined : c.lids}>
            {caught && <circle cx={cx} cy={106} r={13} fill="#fff" strokeWidth="6" />}
            <g ref={(n) => eyeRef?.(i, n)}>
              <circle cx={cx} cy={106} r={caught ? 4 : 7.5} fill="#1d1b19" stroke="none" />
            </g>
          </g>
        ))}
        {caught ? (
          <ellipse cx="114" cy="124" rx="8" ry="10" fill="#1d1b19" stroke="none" />
        ) : (
          <>
            <path d="M106 116 C 104 132, 124 132, 122 116" fill="#F48FA0" strokeWidth="6" />
            <path d="M96 106 C 98 118, 112 118, 114 108 C 116 118, 130 118, 132 106" strokeWidth="6" />
          </>
        )}
        {caught && (
          <>
            {/* soap foam on its head */}
            <g fill="#fff" strokeWidth="5">
              <circle cx="96" cy="40" r="11" />
              <circle cx="138" cy="40" r="10" />
              <circle cx="117" cy="30" r="14" />
            </g>
            <path d="M38 40 L 30 20 M50 30 L 50 10 M190 40 L 198 20 M178 30 L 178 10" stroke="#FF4938" strokeWidth="6" />
          </>
        )}
        <path d="M46 132 C 34 142, 22 150, 20 157 C 18 165, 32 166, 56 165 C 64 165, 70 162, 74 154" />
        <path d="M74 154 C 78 165, 92 167, 100 158 M100 158 C 106 167, 122 167, 128 158 M128 158 C 134 167, 148 167, 154 154" />
        <path d="M154 154 C 158 162, 164 165, 172 165 C 196 166, 206 164, 204 157 C 202 150, 192 142, 182 134" />
        {tub && (
          <g>
            <path d="M-6 158 H 226 C 226 206, 196 232, 160 232 H 60 C 24 232, -6 206, -6 158 Z" fill="#fff" />
            <path d="M-12 158 H 232" strokeWidth="9" />
            <path d="M40 232 L 34 248 M180 232 L 186 248" strokeWidth="7" />
            <g fill="#fff" strokeWidth="5">
              <circle cx="8" cy="150" r="13" />
              <circle cx="30" cy="144" r="11" />
              <circle cx="196" cy="146" r="12" />
              <circle cx="214" cy="152" r="10" />
            </g>
            <g transform="translate(156 124)">
              <path d="M0 26 C 0 12, 10 6, 18 10 C 18 0, 34 -2, 36 10 C 40 10, 44 12, 44 14 C 40 16, 38 16, 36 16 C 40 24, 34 34, 18 34 C 6 34, 0 32, 0 26 Z" fill="#FFD43B" strokeWidth="4.5" />
              <circle cx="28" cy="10" r="2.6" fill="#1d1b19" stroke="none" />
            </g>
          </g>
        )}
      </g>
    </svg>
  );
}

/**
 * The cat in the corner of the contact screen. It's taking a bath just below
 * the screen. Click / Enter / tap: the screen scrolls up to reveal the bathroom,
 * the cat yells, pulls the blind down, and the screen scrolls back into place.
 * Mouse: the eyes follow you; hover and it peeks further. Reduced motion: it
 * just says its line where it is.
 */
export default function PeekCat() {
  const [state, setState] = useState<State>("idle");
  const [screen, setScreen] = useState<HTMLElement | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const eyes = useRef<(SVGGElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  const [calm, setCalm] = useState(false); // reduced motion: the line only, no scene

  // the screen this cat lives under (it scrolls up to reveal the bathroom)
  const screenRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    screenRef.current = wrap.current?.closest<HTMLElement>("[data-cat-screen]") ?? null;
    setScreen(screenRef.current);
  }, []);
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    if (state === "reveal" || state === "pull") el.dataset.bath = "up";
    else delete el.dataset.bath;
  }, [state]);

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
    const pending = timers.current;
    return () => {
      removeEventListener("pointermove", move);
      pending.forEach(clearTimeout);
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const caught = () => {
    if (state !== "idle") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !screen) {
      setCalm(true);
      setState("reveal");
      later(2600, () => {
        setCalm(false);
        setState("idle");
      });
      return;
    }
    setState("startle"); // the duck jumps, the cat startles
    later(650, () => setState("reveal")); // the screen scrolls up (CSS, 900ms)
    later(3350, () => setState("pull")); // the cord, the blind
    later(4950, () => setState("close")); // the screen scrolls back down
    later(6050, () => setState("hidden"));
    later(8600, () => setState("idle"));
  };

  const peekCaught = (calm && state === "reveal") || state === "startle";

  return (
    <div ref={wrap} className={c.catWrap} data-state={calm ? "calm" : state}>
      <span className={c.hint} aria-hidden="true">something&apos;s hiding here →</span>
      <span className={c.soap} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {calm && state === "reveal" && (
        <span className={c.bubble} role="status">
          Hey! Knock first! 🫧
        </span>
      )}
      <div className={c.catBox}>
        {/* the rubber duck, floating at the edge beside the cat */}
        <svg className={c.duck} viewBox="-4 -6 54 46" aria-hidden="true">
          <path d="M0 26 C 0 12, 10 6, 18 10 C 18 0, 34 -2, 36 10 C 40 10, 44 12, 44 14 C 40 16, 38 16, 36 16 C 40 24, 34 34, 18 34 C 6 34, 0 32, 0 26 Z" fill="#FFD43B" stroke="#1d1b19" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M8 22 C 12 26, 20 26, 24 21" fill="none" stroke="#1d1b19" strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="10" r="2.4" fill="#1d1b19" />
        </svg>
        <button type="button" className={c.cat} onClick={caught} aria-label="Something's hiding in the corner">
          <CatArt caught={peekCaught} tub={false} eyeRef={(i, n) => (eyes.current[i] = n)} />
        </button>
      </div>

      {/* the bathroom, just below the contact screen */}
      {screen &&
        state !== "idle" &&
        state !== "hidden" &&
        !calm &&
        createPortal(
          <div className={c.bathroom} data-step={state} aria-hidden="true">
            <span className={c.rail} />
            <span className={c.cord}>
              <i />
            </span>
            <span className={c.blind}>
              <span className={c.sign}>
                <b>Bath in progress 🛁</b>
                <small>Your portfolio will resume shortly.</small>
              </span>
            </span>
            <span className={c.bathCat}>
              {state === "reveal" && <span className={c.bathBubble}>Hey! Knock first! 🫧</span>}
              <CatArt caught tub shake={state === "reveal"} />
              {state === "reveal" && (
                <span className={c.splash}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <i key={i} style={{ ["--i" as string]: i }} />
                  ))}
                </span>
              )}
            </span>
          </div>,
          screen,
        )}
      {/* screen readers: the line, said once */}
      {state === "reveal" && !calm && (
        <span className={c.srOnly} role="status">
          Hey! Knock first!
        </span>
      )}
    </div>
  );
}
