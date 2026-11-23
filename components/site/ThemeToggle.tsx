"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { InkMask } from "./inkMask";
import s from "./site.module.css";

const KEY = "nishanth.theme";
const DUR = 1300;
const FRAMES = 60;
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const HIDDEN = "inset(0 0 100% 0)";

type StartVT = (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
type Baked = { key: string; frames: string[] };

/** the theme lives on <html data-theme>; this follows it */
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

/** Light / dark switch with an ink-bleed transition. The choice is remembered; the page is themed before paint by the script in app/layout.tsx. */
export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const btn = useRef<HTMLButtonElement>(null);
  const baked = useRef<Baked | null>(null);
  const baking = useRef<string | null>(null);

  /** where the ink starts (the toggle). The key ignores the screen height: on phones it changes as the address bar slides, and the outline is scaled to fit. */
  const origin = () => {
    const r = btn.current!.getBoundingClientRect();
    const ox = (r.left + r.width / 2) / innerWidth, oy = (r.top + r.height / 2) / innerHeight;
    return { ox, oy, key: `${innerWidth}:${Math.round(r.left / 8)}:${Math.round(r.top / 8)}` };
  };

  /** traces the outlines in the background, ready for the next click (a new ink shape each time) */
  const prepare = useCallback(() => {
    if (!btn.current || !(document as Document & { startViewTransition?: StartVT }).startViewTransition) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { ox, oy, key } = origin();
    if (baked.current?.key === key || baking.current === key) return;
    const ink = new InkMask(innerWidth, innerHeight);
    if (!ink.ok) return;
    baking.current = key;
    ink.bake(ox, oy, FRAMES, ease, () => baking.current === key).then((frames) => {
      if (baking.current === key) baking.current = null;
      if (frames) baked.current = { key, frames };
    });
  }, []);

  useEffect(() => {
    const ric = (window as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const idle = (cb: () => void) => (ric ? ric(cb, { timeout: 1200 }) : window.setTimeout(cb, 800));
    idle(prepare);
    let t = 0;
    const onResize = () => { clearTimeout(t); t = window.setTimeout(() => idle(prepare), 600); };
    addEventListener("resize", onResize);
    return () => { removeEventListener("resize", onResize); clearTimeout(t); };
  }, [prepare]);

  const flip = () => {
    const next = !dark;
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next ? "dark" : "light";
      try { localStorage.setItem(KEY, next ? "dark" : "light"); } catch {}
      // pages open in the project panel follow along
      document.querySelectorAll("iframe").forEach((f) => { try { f.contentDocument?.documentElement.setAttribute("data-theme", next ? "dark" : "light"); } catch {} });
    };
    const fade = () => {
      root.classList.add("theme-anim");
      apply();
      window.setTimeout(() => root.classList.remove("theme-anim"), 450);
    };
    const vt = (document as Document & { startViewTransition?: StartVT }).startViewTransition;
    if (!vt || matchMedia("(prefers-reduced-motion: reduce)").matches) return fade();

    const { ox, oy, key } = origin();
    let frameAt: (k: number) => string;
    const ready = baked.current?.key === key ? baked.current : null;
    if (ready) {
      baked.current = null;
      frameAt = (k) => ready.frames[Math.min(ready.frames.length - 1, Math.round(k * (ready.frames.length - 1)))];
    } else {
      // not prepared yet (a click straight after loading): trace it live
      const ink = new InkMask(innerWidth, innerHeight);
      if (!ink.ok) return fade();
      frameAt = (k) => ink.frame(ox, oy, ease(k));
    }
    let last = "";
    const set = (v: string) => { if (v !== last) { root.style.setProperty("--ink-clip", v); last = v; } };
    set(HIDDEN);
    root.classList.add("ink-on");
    const t = vt.call(document, apply);
    t.ready.then(() => {
      // keeps the transition open while the ink runs
      root.animate({ opacity: [1, 1] }, { duration: DUR, pseudoElement: "::view-transition-new(root)" });
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / DUR);
        set(frameAt(k));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }).catch(() => {});
    t.finished.finally(() => {
      root.classList.remove("ink-on");
      root.style.removeProperty("--ink-clip");
      window.setTimeout(prepare, 150);
    });
  };

  return (
    <button ref={btn} type="button" className={`${s.themeBtn} cursor-target`} onClick={flip} onPointerEnter={prepare} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} title={dark ? "Light theme" : "Dark theme"}>
      {/* a little sun and moon with faces: the sun spins away and the moon pops in (and back) */}
      <svg viewBox="0 0 24 24" aria-hidden="true" className={s.themeIcon}>
        <defs>
          <linearGradient id="moonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9d5ff" />
            <stop offset="1" stopColor="#6c63ff" />
          </linearGradient>
          <mask id="moonCut">
            <rect width="24" height="24" fill="#fff" />
            <circle cx="7.4" cy="7.6" r="6.6" fill="#000" />
          </mask>
        </defs>
        <g className={s.sun}>
          <g className={s.rays}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1="12" y1="2.6" x2="12" y2="4.6" transform={`rotate(${a} 12 12)`} />
            ))}
          </g>
          <circle cx="12" cy="12" r="5.4" fill="#ffcf4a" />
          <rect x="10.05" y="10.6" width="1.25" height="2.6" rx="0.62" fill="#2a2108" />
          <rect x="12.7" y="10.6" width="1.25" height="2.6" rx="0.62" fill="#2a2108" />
        </g>
        <g className={s.moon}>
          <circle cx="12.4" cy="12.2" r="8" fill="url(#moonFill)" mask="url(#moonCut)" />
          <rect x="13.9" y="12.4" width="1.15" height="2.5" rx="0.57" fill="#17143a" />
          <rect x="16.3" y="12.4" width="1.15" height="2.5" rx="0.57" fill="#17143a" />
        </g>
      </svg>
    </button>
  );
}
