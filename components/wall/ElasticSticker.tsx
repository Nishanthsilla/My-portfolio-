"use client";

import { gsap } from "gsap";
import { sfx } from "@/lib/sound/engine";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from "react";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const X = [0.04, 0.96], Y = [0.03, 0.97];
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A sticker you can pick up and move anywhere on the wall. It behaves like a
 * real, slightly elastic sticker: it lifts and stretches when you grab it, leans
 * into the direction you drag it, and wobbles back into place when you let go.
 * Position is wall-relative (0–1), so it holds at any screen size.
 * Keyboard: arrow keys move it (Shift = further).
 */
export default function ElasticSticker({
  board,
  x,
  y,
  rotation,
  z = 1,
  onMove,
  label,
  className = "",
  children,
}: {
  board: RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
  rotation: number;
  z?: number;
  onMove: (x: number, y: number) => void;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // rest pose (and after every move / rotation change)
  useEffect(() => {
    if (!dragging.current && inner.current) gsap.set(inner.current, { rotation, scale: 1 });
  }, [rotation]);
  useEffect(() => () => {
    if (inner.current) gsap.killTweensOf(inner.current);
  }, []);

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-nodrag]")) return;
    const el = outer.current, art = inner.current, b = board.current;
    if (!el || !art || !b) return;
    const rect = b.getBoundingClientRect();
    const ox = e.clientX - (rect.left + x * rect.width), oy = e.clientY - (rect.top + y * rect.height);
    const sx = e.clientX, sy = e.clientY;
    const calm = reduced();
    let moved = false, lastX = e.clientX, lastT = performance.now(), nx = x, ny = y;
    const tilt = gsap.quickTo(art, "rotation", { duration: 0.45, ease: "power3.out" });
    const skew = gsap.quickTo(art, "skewX", { duration: 0.5, ease: "power3.out" });
    el.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      if (!moved) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        moved = true;
        dragging.current = true;
        el.dataset.lifted = "";
        el.style.zIndex = "1000";
        sfx("pick");
        // pick it up: a quick stretch
        if (!calm) gsap.to(art, { scale: 1.08, duration: 0.35, ease: "back.out(3)" });
      }
      ev.preventDefault();
      const r = b.getBoundingClientRect();
      nx = clamp((ev.clientX - ox - r.left) / r.width, X[0], X[1]);
      ny = clamp((ev.clientY - oy - r.top) / r.height, Y[0], Y[1]);
      el.style.left = `${nx * 100}%`;
      el.style.top = `${ny * 100}%`;
      // lean into the drag: horizontal speed tilts and shears it a little
      const now = performance.now(), dt = Math.max(8, now - lastT), vx = (ev.clientX - lastX) / dt;
      lastX = ev.clientX;
      lastT = now;
      if (!calm) {
        tilt(rotation + clamp(vx * 14, -22, 22));
        skew(clamp(-vx * 5, -9, 9));
      }
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      if (!moved) return;
      dragging.current = false;
      delete el.dataset.lifted;
      el.style.zIndex = "";
      // let go: it snaps back with an elastic wobble
      gsap.to(art, { rotation, skewX: 0, scale: 1, duration: calm ? 0 : 1.15, ease: "elastic.out(1.15, 0.32)", overwrite: true });
      sfx("drop");
      onMove(nx, ny);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const k = e.shiftKey ? 0.05 : 0.01;
    const d: Record<string, [number, number]> = { ArrowLeft: [-k, 0], ArrowRight: [k, 0], ArrowUp: [0, -k], ArrowDown: [0, k] };
    if (!d[e.key]) return;
    e.preventDefault();
    onMove(clamp(x + d[e.key][0], X[0], X[1]), clamp(y + d[e.key][1], Y[0], Y[1]));
    if (inner.current && !reduced()) gsap.fromTo(inner.current, { scale: 1.05 }, { scale: 1, duration: 0.8, ease: "elastic.out(1.2, 0.35)" });
  };

  return (
    <div
      ref={outer}
      className={className}
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, zIndex: z }}
      tabIndex={0}
      role="group"
      aria-roledescription="movable sticker"
      aria-label={`${label}. Drag, or use the arrow keys, to move it.`}
      onPointerDown={down}
      onKeyDown={key}
    >
      <div ref={inner} data-sticker-art="">
        {children}
      </div>
    </div>
  );
}
