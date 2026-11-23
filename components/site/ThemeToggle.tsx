"use client";

import { useEffect, useRef, useState } from "react";
import { InkMask } from "./inkMask";
import s from "./site.module.css";

const KEY = "nishanth.theme";

/** Light / dark switch. The choice is remembered; the page is themed before paint by the script in app/layout.tsx. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);

  const flip = () => {
    const next = !dark;
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next ? "dark" : "light";
      try { localStorage.setItem(KEY, next ? "dark" : "light"); } catch {}
      // pages open in the project panel follow along
      document.querySelectorAll("iframe").forEach((f) => { try { f.contentDocument?.documentElement.setAttribute("data-theme", next ? "dark" : "light"); } catch {} });
      setDark(next);
    };
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }).startViewTransition;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!vt || still) {
      // fallback: a soft cross-fade
      root.classList.add("theme-anim");
      apply();
      window.setTimeout(() => root.classList.remove("theme-anim"), 450);
      return;
    }
    const ink = new InkMask(innerWidth, innerHeight);
    if (!ink.ok) {
      root.classList.add("theme-anim");
      apply();
      window.setTimeout(() => root.classList.remove("theme-anim"), 450);
      return;
    }
    // the ink starts at the toggle and bleeds across the page
    const r = btn.current!.getBoundingClientRect();
    const ox = (r.left + r.width / 2) / innerWidth, oy = (r.top + r.height / 2) / innerHeight;
    const DUR = 1350;
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    root.style.setProperty("--ink-mask", `url(${ink.frame(ox, oy, 0)})`);
    root.classList.add("ink-on");
    const t = vt.call(document, apply);
    t.ready.then(() => {
      // keeps the transition open while the ink runs
      root.animate({ opacity: [1, 1] }, { duration: DUR, pseudoElement: "::view-transition-new(root)" });
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / DUR);
        root.style.setProperty("--ink-mask", `url(${ink.frame(ox, oy, ease(k))})`);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }).catch(() => {});
    t.finished.finally(() => { root.classList.remove("ink-on"); root.style.removeProperty("--ink-mask"); });
  };

  return (
    <button ref={btn} type="button" className={`${s.themeBtn} cursor-target`} onClick={flip} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} title={dark ? "Light theme" : "Dark theme"}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {dark ? (
          <g><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></g>
        ) : (
          <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
        )}
      </svg>
    </button>
  );
}
