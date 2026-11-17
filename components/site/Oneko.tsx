"use client";

import { useEffect } from "react";

/*
 * Oneko: a tiny pixel cat that chases the mouse, sits when it stops, and
 * eventually scratches or falls asleep. Adapted from oneko.js by adryd
 * (github.com/adryd325/oneko.js, MIT licence); sprite sheet: /cursors/oneko.gif.
 * Mouse devices only; skipped with reduced motion and inside the project panel.
 */

const SPRITES: Record<string, [number, number][]> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  scratchWallN: [[0, 0], [0, -1]],
  scratchWallS: [[-7, -1], [-6, -2]],
  scratchWallE: [[-2, -2], [-2, -3]],
  scratchWallW: [[-4, 0], [-4, -1]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

// the cat keeps its place when you move between pages
const saved = { x: 32, y: 32, mx: 0, my: 0, frame: 0, idle: 0 };

export default function Oneko() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.hasAttribute("data-embed")) return;

    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      width: "32px", height: "32px", position: "fixed", pointerEvents: "none", imageRendering: "pixelated",
      zIndex: "75", backgroundImage: "url(/cursors/oneko.gif)", left: `${saved.x - 16}px`, top: `${saved.y - 16}px`,
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(el);

    let { x, y, mx, my, frame: frameCount, idle: idleTime } = saved;
    let idleAnimation: string | null = null;
    let idleFrame = 0;
    const speed = 10;

    const set = (name: string, f: number) => {
      const s = SPRITES[name][f % SPRITES[name].length];
      el.style.backgroundPosition = `${s[0] * 32}px ${s[1] * 32}px`;
    };
    const resetIdle = () => {
      idleAnimation = null;
      idleFrame = 0;
    };
    const idle = () => {
      idleTime += 1;
      if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation == null) {
        const options = ["sleeping", "scratchSelf"];
        if (x < 32) options.push("scratchWallW");
        if (y < 32) options.push("scratchWallN");
        if (x > innerWidth - 32) options.push("scratchWallE");
        if (y > innerHeight - 32) options.push("scratchWallS");
        idleAnimation = options[Math.floor(Math.random() * options.length)];
      }
      switch (idleAnimation) {
        case "sleeping":
          if (idleFrame < 8) {
            set("tired", 0);
            break;
          }
          set("sleeping", Math.floor(idleFrame / 4));
          if (idleFrame > 192) resetIdle();
          break;
        case "scratchWallN":
        case "scratchWallS":
        case "scratchWallE":
        case "scratchWallW":
        case "scratchSelf":
          set(idleAnimation, idleFrame);
          if (idleFrame > 9) resetIdle();
          break;
        default:
          set("idle", 0);
          return;
      }
      idleFrame += 1;
    };
    const tick = () => {
      frameCount += 1;
      const dx = x - mx, dy = y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < speed || dist < 48) return idle();
      resetIdle();
      if (idleTime > 1) {
        set("alert", 0);
        idleTime = Math.min(idleTime, 7) - 1;
        return;
      }
      let dir = dy / dist > 0.5 ? "N" : "";
      dir += dy / dist < -0.5 ? "S" : "";
      dir += dx / dist > 0.5 ? "W" : "";
      dir += dx / dist < -0.5 ? "E" : "";
      set(dir, frameCount);
      x = Math.min(Math.max(16, x - (dx / dist) * speed), innerWidth - 16);
      y = Math.min(Math.max(16, y - (dy / dist) * speed), innerHeight - 16);
      el.style.left = `${x - 16}px`;
      el.style.top = `${y - 16}px`;
    };
    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    addEventListener("mousemove", move);
    set("idle", 0);
    const t = window.setInterval(() => !document.hidden && tick(), 100);
    return () => {
      Object.assign(saved, { x, y, mx, my, frame: frameCount, idle: idleTime });
      window.clearInterval(t);
      removeEventListener("mousemove", move);
      el.remove();
    };
  }, []);
  return null;
}
