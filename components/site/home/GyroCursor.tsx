"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import h from "./home.module.css";

/**
 * A gyroscope cursor for an area (mouse / trackpad only): a little gyroscope
 * whose rings spin faster the faster you move, beside a label such as
 * "View projects". The cursor glides after the pointer and leans into the
 * direction of travel. Touch screens and keyboards are unaffected.
 */
export default function GyroCursor({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  const [on, setOn] = useState(false);
  const [at, setAt] = useState({ x: 0, y: 0 }); // where it appears (then it follows in the animation loop)
  const area = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLDivElement>(null);
  const rings = useRef<(HTMLSpanElement | null)[]>([]);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!on) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = target.current.x, y = target.current.y, lean = 0, a = 0, raf = 0;
    const tick = () => {
      const t = target.current;
      const dx = t.x - x, dy = t.y - y;
      x += dx * 0.22;
      y += dy * 0.22;
      const speed = Math.min(1, Math.hypot(dx, dy) / 60);
      lean += (Math.max(-1, Math.min(1, dx / 40)) * 14 - lean) * 0.15;
      if (!calm) a += 1.6 + speed * 14;
      if (el.current) el.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${calm ? 0 : lean}deg)`;
      const [r1, r2, r3] = rings.current;
      if (r1) r1.style.transform = `rotateX(${a}deg)`;
      if (r2) r2.style.transform = `rotateY(${a * 1.3}deg)`;
      if (r3) r3.style.transform = `rotateZ(${a * 0.7}deg) rotateX(62deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

  return (
    <div
      ref={area}
      className={`${className} ${on ? h.gyroArea : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || !fine()) return;
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
            <span className={h.gyroBody}>
              <span className={h.gyroCore}>
                {[0, 1, 2].map((i) => (
                  <span key={i} ref={(n) => { rings.current[i] = n; }} className={h.gyroRing} />
                ))}
                <span className={h.gyroDot} />
              </span>
              <span className={h.gyroLabel}>{label}</span>
            </span>
          </div>,
          document.body,
        )}
    </div>
  );
}
