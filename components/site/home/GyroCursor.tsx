"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import h from "./home.module.css";

/**
 * A pointer cursor for an area (mouse / trackpad only): a blue arrow with a
 * white outline and a matching tag beside it ("View projects"), like a
 * collaborator's cursor. It glides after the pointer and leans a little into
 * the direction of travel. Touch screens and keyboards are unaffected.
 */
export default function GyroCursor({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  const [at, setAt] = useState({ x: 0, y: 0 }); // where it appears (then it follows in the animation loop)
  const el = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!on) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = target.current.x, y = target.current.y, lean = 0, raf = 0;
    const tick = () => {
      const t = target.current;
      const dx = t.x - x;
      x += dx * (calm ? 1 : 0.38);
      y += (t.y - y) * (calm ? 1 : 0.38);
      lean += (Math.max(-1, Math.min(1, dx / 30)) * 10 - lean) * 0.2;
      if (el.current) el.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${calm ? 0 : lean}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  return (
    <div
      className={`${className} ${on ? h.gyroArea : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        target.current = { x: e.clientX, y: e.clientY };
        setAt({ x: e.clientX, y: e.clientY });
        setOn(true);
      }}
      onPointerMove={(e) => {
        target.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerLeave={() => setOn(false)}
    >
      {children}
      {on &&
        createPortal(
          <div ref={el} className={h.gyro} aria-hidden="true" style={{ transform: `translate3d(${at.x}px, ${at.y}px, 0)` }}>
            <svg className={h.gyroArrow} viewBox="0 0 28 28" width="28" height="28">
              <path d="M4 3.5 L24 11 L14.6 14.6 L11 24 Z" fill="#4453FF" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
            </svg>
            <span className={h.gyroLabel}>{label}</span>
          </div>,
          document.body,
        )}
    </div>
  );
}
