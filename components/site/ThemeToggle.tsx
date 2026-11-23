"use client";

import { useEffect, useState } from "react";
import s from "./site.module.css";

const KEY = "nishanth.theme";

/** Light / dark switch. The choice is remembered; the page is themed before paint by the script in app/layout.tsx. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = !dark;
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem(KEY, next ? "dark" : "light"); } catch {}
    // pages open in the project panel follow along
    document.querySelectorAll("iframe").forEach((f) => { try { f.contentDocument?.documentElement.setAttribute("data-theme", next ? "dark" : "light"); } catch {} });
    setDark(next);
    window.setTimeout(() => root.classList.remove("theme-anim"), 450);
  };
  return (
    <button type="button" className={`${s.themeBtn} cursor-target`} onClick={flip} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark} title={dark ? "Light theme" : "Dark theme"}>
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
