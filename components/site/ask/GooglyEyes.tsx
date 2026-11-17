"use client";

import { useEffect, useRef } from "react";
import a from "./ask.module.css";

/**
 * Two googly eyes over Nishanth's own eyes on the face sticker. The pupils
 * swing on a little spring towards the mouse (or glance around on phones).
 * Only mounted while they're shown.
 */
export default function GooglyEyes() {
  const root = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const eyes = [...el.querySelectorAll<HTMLElement>("[data-eye]")];
    const st = eyes.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    let mx: number | null = null, my = 0, last = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      last = performance.now();
    };
    addEventListener("pointermove", onMove);
    const tick = (t: number) => {
      eyes.forEach((eye, i) => {
        const r = eye.getBoundingClientRect();
        const max = r.width * 0.26;
        let tx: number, ty: number;
        if (mx !== null && t - last < 2500) {
          const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, d / 120);
          tx = (dx / d) * max * k;
          ty = (dy / d) * max * k;
        } else {
          // no mouse: glance around, the two eyes slightly out of step (googly)
          const p = t / 1000;
          tx = Math.sin(p * 2.1 + i * 0.6) * max * 0.9;
          ty = Math.cos(p * 1.3 + i) * max * 0.5 + max * 0.25;
        }
        const s = st[i];
        // a loose spring: pupils overshoot and wobble
        s.vx = (s.vx + (tx - s.x) * 0.12) * 0.82;
        s.vy = (s.vy + (ty - s.y) * 0.12 + 0.35) * 0.82;
        s.x += s.vx;
        s.y += s.vy;
        const d = Math.hypot(s.x, s.y);
        if (d > max) {
          s.x *= max / d;
          s.y *= max / d;
        }
        eye.style.setProperty("--px", `${s.x.toFixed(2)}px`);
        eye.style.setProperty("--py", `${s.y.toFixed(2)}px`);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <span ref={root} className={a.googly} aria-hidden="true">
      <span data-eye className={`${a.eye} ${a.eyeL}`}><i /></span>
      <span data-eye className={`${a.eye} ${a.eyeR}`}><i /></span>
    </span>
  );
}
