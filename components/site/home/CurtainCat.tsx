"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import c from "./curtainCat.module.css";

/**
 * The curtain cat — a three-stage character moment in the corner of the
 * contact screen, drawn as SVG so every part moves on its own:
 *
 *   1  Peek            the cat rises from below the edge, notices the ring  (≈0.3–1.5s)
 *   2  Notice & reach  it looks right at the ring and raises a paw          (≈1.7–3.0s)
 *   3  Grab & pull     both paws on the ring, a tug down and to the side;
 *                      the curtain slides along the rod                     (≈3.2–4.4s)
 *
 * It plays when the contact screen comes into view, holds the final pose,
 * and resets when the screen is left (so it plays again next time). Clicking
 * the cat replays it. Reduced motion: the final pose, no movement.
 *
 * Every part is a <g> with its own class; the poses for each stage live in
 * curtainCat.module.css, so timing and positions can be tuned there.
 */
type Stage = 0 | 1 | 2 | 3;

export default function CurtainCat() {
  const [stage, setStage] = useState<Stage>(0);
  const [calm, setCalm] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const play = useCallback(() => {
    clear();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCalm(true);
      setStage(3);
      return;
    }
    setCalm(false);
    setStage(0);
    const at = (ms: number, s: Stage) => timers.current.push(window.setTimeout(() => setStage(s), ms));
    at(300, 1);
    at(1750, 2);
    at(3250, 3);
  }, []);

  // play when the contact screen is (mostly) in view; reset when it's left
  useEffect(() => {
    const el = root.current?.closest("section") ?? root.current;
    if (!el) return;
    let shown = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.85 && !shown) {
          shown = true;
          play();
        } else if (e.intersectionRatio < 0.2 && shown) {
          shown = false;
          clear();
          setStage(0);
        }
      },
      { threshold: [0, 0.2, 0.85, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [play]);

  const ink = { fill: "none", stroke: "#1d1b19", strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const cream = "#FFFBF2";

  return (
    <div ref={root} className={c.stageBox}>
      <button type="button" className={c.hit} onClick={play} aria-label="A cat in the corner — play it again" />
      <svg className={c.cc} data-stage={stage} data-calm={calm ? "" : undefined} viewBox="0 0 440 330" aria-hidden="true">
        {/* ---------- the curtain mechanism ---------- */}
        <g className={c.curtain}>
          <path d="M330 44 H 560 V 334 H 334 C 330 250, 326 140, 330 44 Z" {...ink} fill="#FF4938" />
          <path d="M372 58 V 330 M414 58 V 330 M456 58 V 330 M498 58 V 330" {...ink} strokeWidth={4} />
          {[346, 392, 438, 484].map((x) => (
            <ellipse key={x} cx={x} cy={37} rx={11} ry={15} {...ink} fill={cream} strokeWidth={5} />
          ))}
        </g>
        <rect x={150} y={29} width={320} height={16} rx={8} {...ink} fill={cream} strokeWidth={5} />
        <g className={c.cord}>
          <rect x={285} y={44} width={10} height={86} rx={5} {...ink} fill={cream} strokeWidth={4.5} />
        </g>
        <g className={c.ring}>
          <circle cx={290} cy={148} r={20} {...ink} fill={cream} />
          <circle cx={290} cy={148} r={8} {...ink} fill="#FFF" strokeWidth={5} />
        </g>

        {/* ---------- the cat ---------- */}
        <g className={c.cat}>
          {/* attention marks (stage 1–2) */}
          <g className={c.marks} stroke="#FF4938" strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M120 150 L 112 132 M150 142 V 122 M180 150 L 188 132" />
          </g>
          {/* head */}
          <path d="M58 334 C 56 282, 66 250, 84 236 L 80 176 L 120 210 C 136 204, 164 204, 180 210 L 220 176 L 216 236 C 234 250, 244 282, 242 334 Z" {...ink} fill={cream} />
          <path d="M90 194 L 92 222 L 110 213 Z M210 194 L 208 222 L 190 213 Z" fill="#FFB3A8" stroke="none" />
          <path d="M140 220 V 234 M150 218 V 234 M160 220 V 234" {...ink} strokeWidth={4.5} />
          <path d="M66 280 L 42 273 M66 292 L 42 296 M234 280 L 258 273 M234 292 L 258 296" {...ink} strokeWidth={4.5} />
          {/* eyes: curious dots (1) · bright and excited (2) · squeezed shut with effort (3) */}
          <g className={c.eyes}>
            {stage < 3 ? (
              <>
                <ellipse cx={124} cy={272} rx={stage === 2 ? 8.5 : 7} ry={stage === 2 ? 11.5 : 10} fill="#1d1b19" />
                <ellipse cx={176} cy={272} rx={stage === 2 ? 8.5 : 7} ry={stage === 2 ? 11.5 : 10} fill="#1d1b19" />
                {stage === 2 && <circle cx={127} cy={267} r={2.6} fill="#fff" />}
                {stage === 2 && <circle cx={179} cy={267} r={2.6} fill="#fff" />}
              </>
            ) : (
              <path d="M114 264 L 130 272 L 114 280 M186 264 L 170 272 L 186 280" {...ink} strokeWidth={5} />
            )}
          </g>
          {stage >= 2 && <path d="M140 296 C 142 304, 150 304, 150 298 C 150 304, 158 304, 160 296" {...ink} strokeWidth={4} />}
          {/* the raised paw (right), in front of the head; it rises from below the edge */}
          <g className={c.armR}>
            <rect x={209} y={188} width={26} height={142} rx={13} {...ink} fill={cream} />
            <ellipse cx={222} cy={190} rx={18} ry={16} {...ink} fill={cream} />
            <path d="M216 180 V 188 M228 180 V 188" {...ink} strokeWidth={4} />
          </g>
          <g className={c.armL}>
            <rect x={162} y={188} width={26} height={142} rx={13} {...ink} fill={cream} />
            <ellipse cx={175} cy={190} rx={18} ry={16} {...ink} fill={cream} />
            <path d="M169 180 V 188 M181 180 V 188" {...ink} strokeWidth={4} />
          </g>
          {/* the resting paws on the edge (stage 1) */}
          <g className={c.restPaws}>
            <ellipse cx={92} cy={330} rx={24} ry={15} {...ink} fill={cream} />
            <ellipse cx={208} cy={330} rx={24} ry={15} {...ink} fill={cream} />
          </g>
          {/* effort drops (stage 3) */}
          <g className={c.drops} fill="#fff" stroke="#1d1b19" strokeWidth={4} strokeLinejoin="round">
            <path d="M58 178 C 50 190, 52 198, 60 198 C 68 198, 70 190, 58 178 Z" />
            <path d="M82 160 C 76 168, 78 174, 83 174 C 88 174, 90 168, 82 160 Z" />
          </g>
        </g>

        {/* motion lines: reaching (2), pulling (3) */}
        <g className={c.motionReach} {...ink} strokeWidth={4.5}>
          <path d="M252 214 C 258 206, 260 198, 258 190 M264 224 C 272 214, 274 202, 272 192" />
        </g>
        <g className={c.motionPull} {...ink} strokeWidth={4.5}>
          <path d="M322 168 C 330 178, 330 190, 324 200 M336 160 C 346 174, 346 192, 338 206" />
        </g>
      </svg>
    </div>
  );
}
