"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import h from "./home.module.css";

/**
 * A pointer cursor for an area (mouse / trackpad only): a blue arrow with a
 * white outline and a matching tag beside it ("View projects" and a one-line
 * description of what's inside), like a
 * collaborator's cursor. It shows only while the pointer is over `only`
 * (the folder); elsewhere the normal cursor stays. It glides after the pointer and leans a little into
 * the direction of travel. Touch screens and keyboards are unaffected.
 */
export default function GyroCursor({ label, note, only = ".folder-float", children, className = "" }: { label: string; note?: string; only?: string; children: ReactNode; className?: string }) {
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
      onPointerMove={(e) => {
        target.current = { x: e.clientX, y: e.clientY };
        // only over the folder itself (or what springs out of it) — not the empty card around it
        const over = e.pointerType === "mouse" && !!(e.target as Element).closest(only) && matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (over && !on) setAt({ x: e.clientX, y: e.clientY });
        if (over !== on) setOn(over);
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
            <span className={h.gyroLabel}>
              <b>{label}</b>
              {note && <span>{note}</span>}
            </span>
          </div>,
          document.body,
        )}
    </div>
  );
}
