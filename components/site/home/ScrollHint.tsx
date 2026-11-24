"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import h from "./home.module.css";

/**
 * "Scroll right" — the homepage moves sideways, but people scroll down by habit.
 * While the first screen is in view a round badge (rotating text, an arrow
 * a dancing duck in the middle) says so: with a mouse it replaces the cursor (the normal
 * cursor returns over links and buttons); on touch screens it rests in the
 * bottom-right corner. From the second screen on it's gone.
 */
export default function ScrollHint({ track }: { track: React.RefObject<HTMLElement | null> }) {
  const [first, setFirst] = useState(true);
  const [fine, setFine] = useState(false);
  const [overUi, setOverUi] = useState(false);
  const [seen, setSeen] = useState(false); // the mouse badge waits for the first move
  const badge = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(true); // the loader / intro film is playing over the page

  // never while the loader or the intro film is up
  useEffect(() => {
    const busy = () => {
      const html = document.documentElement;
      if (html.classList.contains("intro-lock")) return true;
      return [...document.querySelectorAll<HTMLElement>("[data-intro-film], [data-intro-loader]")].some((el) => {
        const cs = getComputedStyle(el);
        return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.05 && el.getBoundingClientRect().height > 0;
      });
    };
    const check = () => setIntro(busy());
    check();
    const id = window.setInterval(check, 250);
    return () => clearInterval(id);
  }, []);

  // is the first screen still in view?
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const intro = track.current?.querySelector<HTMLElement>("[data-scene='intro']");
      if (!intro) return;
      const r = intro.getBoundingClientRect();
      setFirst(r.left > -innerWidth * 0.35 && r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);
    const fr = track.current?.parentElement;
    fr?.addEventListener("scroll", kick, { passive: true });
    const mo = new MutationObserver(kick);
    if (track.current) mo.observe(track.current, { attributes: true, attributeFilter: ["style"] });
    return () => {
      removeEventListener("scroll", kick);
      removeEventListener("resize", kick);
      fr?.removeEventListener("scroll", kick);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [track]);

  // a mouse or trackpad: the badge follows the pointer
  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setFine(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  useEffect(() => {
    if (!fine) return;
    let x = -200, y = -200, cx = x, cy = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!seen) { cx = x; cy = y; setSeen(true); }
      const ui = (e.target as HTMLElement | null)?.closest?.("a, button, input, textarea, select, [role=button], [role=tab], .cursor-target");
      setOverUi(!!ui);
    };
    const tick = () => {
      cx += (x - cx) * 0.3; cy += (y - cy) * 0.3;
      if (badge.current) badge.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [fine, seen]);

  // hide the system cursor on the first screen (not over links and buttons)
  const hideCursor = fine && first && seen && !overUi && !intro;
  useEffect(() => {
    document.documentElement.classList.toggle("scroll-hint-cursor", hideCursor);
    return () => document.documentElement.classList.remove("scroll-hint-cursor");
  }, [hideCursor]);

  const show = first && !intro && (fine ? seen && !overUi : true);
  const [host, setHost] = useState<HTMLElement | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target exists only in the browser
  useEffect(() => setHost(document.body), []);
  if (!host) return null;
  return createPortal(
    <div ref={badge} className={`${h.scrollHint} ${fine ? h.scrollHintFollow : h.scrollHintDock} ${show ? h.scrollHintOn : ""}`} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id="scroll-hint-ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
        </defs>
        <g className={h.scrollHintRing}>
          <text>
            <textPath href="#scroll-hint-ring" startOffset="0" textLength="285" lengthAdjust="spacing">Scroll Right <tspan className={h.scrollHintStar}>✦</tspan> Scroll Right <tspan className={h.scrollHintStar}>✦</tspan></textPath>
          </text>
        </g>
      </svg>
      {/* a dancing duck in the middle */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={h.scrollHintDuck} src="/images/duck-dance.webp" alt="" width={58} height={70} decoding="async" />
    </div>,
    host,
  );
}
