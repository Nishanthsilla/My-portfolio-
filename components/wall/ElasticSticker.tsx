"use client";

import { gsap } from "gsap";
import { sfx } from "@/lib/sound/engine";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from "react";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const X = [0.04, 0.96], Y = [0.03, 0.97];
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
/** touch: how long a finger rests on a note before it lifts off the wall */
export const HOLD_MS = 1000;
/** touch: how long it rests before the note starts showing it's about to lift */
const CUE_MS = 220;

/**
 * A sticker you can pick up and move anywhere on the wall. It behaves like a
 * real, slightly elastic sticker: it lifts and stretches when you grab it, leans
 * into the direction you drag it, and wobbles back into place when you let go.
 * Position is wall-relative (0–1), so it holds at any screen size.
 * Keyboard: arrow keys move it (Shift = further).
 *
 * Touch: a swipe or a two-finger pinch never moves a note. Hold a finger on it for a
 * second and it lifts off the wall (bigger, with a deep shadow); then it follows the finger.
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
    const touch = e.pointerType === "touch";
    const sx = e.clientX, sy = e.clientY, id = e.pointerId;
    const calm = reduced();
    let moved = false, live = !touch, lastX = e.clientX, lastT = performance.now(), nx = x, ny = y, ox = 0, oy = 0;
    const tilt = gsap.quickTo(art, "rotation", { duration: 0.45, ease: "power3.out" });
    const skew = gsap.quickTo(art, "skewX", { duration: 0.5, ease: "power3.out" });
    let hold = 0, pre = 0, cue = false;

    const lift = (cx: number, cy: number) => {
      const rect = b.getBoundingClientRect();
      ox = cx - (rect.left + x * rect.width);
      oy = cy - (rect.top + y * rect.height);
      moved = true;
      dragging.current = true;
      b.dataset.holding = "";
      el.dataset.lifted = "";
      el.style.zIndex = "1000000"; // above everything while held, own notes included
      sfx("pick");
      // lifts off the wall: a quick stretch up
      if (!calm) gsap.to(art, { scale: 1.12, duration: 0.35, ease: "back.out(3)", overwrite: true });
    };
    const finish = (drop: boolean) => {
      clearTimeout(hold);
      clearTimeout(pre);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", cancel);
      removeEventListener("touchstart", twoFingers);
      removeEventListener("touchmove", noScroll);
      delete el.dataset.holding;
      if (!moved) {
        // only undo the "about to lift" cue if it had started (a quick swipe never shows it)
        if (touch && cue && !calm) gsap.to(art, { scale: 1, duration: 0.25, ease: "power2.out", overwrite: true });
        return;
      }
      dragging.current = false;
      delete b.dataset.holding;
      delete el.dataset.lifted;
      el.style.zIndex = "";
      // let go: it settles back with an elastic wobble
      gsap.to(art, { rotation, skewX: 0, scale: 1, duration: calm ? 0 : 1.15, ease: "elastic.out(1.15, 0.32)", overwrite: true });
      sfx("drop");
      if (drop) onMove(nx, ny);
      else {
        el.style.left = `${x * 100}%`;
        el.style.top = `${y * 100}%`;
      }
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      if (!live) {
        // touch, still waiting: moving the finger means a swipe or a pan, not a pick-up
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) finish(false);
        return;
      }
      if (!moved) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        lift(sx, sy);
        el.setPointerCapture(id);
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
    const up = (ev: PointerEvent) => {
      if (ev.pointerId === id) finish(true);
    };
    const cancel = (ev: PointerEvent) => {
      if (ev.pointerId === id) finish(moved);
    };
    // a second finger means a pinch: nothing gets picked up (a held note is put back down)
    const twoFingers = (ev: TouchEvent) => {
      if (ev.touches.length > 1) finish(false);
    };
    // once a note is up, the finger drags the note, not the page
    const noScroll = (ev: TouchEvent) => {
      if (live && ev.cancelable) ev.preventDefault();
    };

    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", cancel);
    if (touch) {
      addEventListener("touchstart", twoFingers, { passive: true });
      addEventListener("touchmove", noScroll, { passive: false });
      // the "about to lift" cue (a slow grow and a deeper shadow) waits until the finger has rested a
      // moment: a finger that's scrolling the wall touches notes all the time, and they mustn't pulse
      pre = window.setTimeout(() => {
        cue = true;
        el.dataset.holding = "";
        if (!calm) gsap.to(art, { scale: 1.04, duration: (HOLD_MS - CUE_MS) / 1000, ease: "power1.in", overwrite: true });
      }, CUE_MS);
      hold = window.setTimeout(() => {
        live = true;
        lift(sx, sy);
        try {
          el.setPointerCapture(id);
        } catch {}
        navigator.vibrate?.(12);
      }, HOLD_MS);
    }
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
      aria-label={`${label}. Drag (on a phone: hold, then drag), or use the arrow keys, to move it.`}
      onPointerDown={down}
      onKeyDown={key}
    >
      <div ref={inner} data-sticker-art="">
        {children}
      </div>
    </div>
  );
}
