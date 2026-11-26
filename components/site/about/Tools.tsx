"use client";

import { useEffect, useRef } from "react";
import { about } from "@/lib/site/about";
import { loadChimes, notifySound } from "@/lib/sound/notify";
import a from "./about.module.css";

/** keep a tooltip inside the screen: nudge it sideways when it would run off an edge */
function fit(li: HTMLElement) {
  const tip = li.querySelector<HTMLElement>("[data-tip]");
  if (!tip) return;
  tip.style.setProperty("--shift", "0px");
  const r = tip.getBoundingClientRect();
  const pad = 12;
  const shift = r.left < pad ? pad - r.left : r.right > innerWidth - pad ? innerWidth - pad - r.right : 0;
  tip.style.setProperty("--shift", `${Math.round(shift)}px`);
}

const ALL = about.tools.flatMap((g) => g.items);
/** how many logos sit on the inner ring (the rest go on the wider one outside it) */
const innerCount = (phone: boolean) => (phone ? 12 : 12);

/**
 * Nishanth, hands up, with his tools in a semicircle around him. When the section comes into view
 * he pops up, a gift box opens (sound), the magic chimes play and the logos burst out from behind
 * him, one by one, into two arcs. Hover or focus a logo for its name; it glows in its own colours.
 */
export default function Tools() {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    loadChimes();
    // place every logo on its arc (positions depend on the stage's width)
    const layout = () => {
      const w = el.clientWidth;
      const phone = w < 560;
      const size = phone ? 28 : 56;
      const r2 = Math.min(w / 2 - size / 2 - 4, phone ? 999 : 400);
      const r1 = r2 * (phone ? 0.75 : 0.68);
      const INNER = innerCount(phone);
      const cx = w / 2, cy = r2 + size / 2 + 8; // the arcs' centre: his chest
      // his chest sits at the arcs' centre: the stage is as tall as that plus the lower half of the photo
      const pw = phone ? w * 0.44 : Math.min(w * 0.42, 360), ph = (pw * 945) / 792;
      el.style.height = `${Math.round(cy + ph * 0.52)}px`;
      el.style.setProperty("--pw", `${Math.round(pw)}px`);
      el.style.setProperty("--size", `${size}px`);
      el.style.setProperty("--cx", `${cx}px`);
      el.style.setProperty("--cy", `${cy}px`);
      el.style.setProperty("--r1", `${r1}px`);
      el.querySelectorAll<HTMLElement>("[data-logo]").forEach((li, i) => {
        const inner = i < INNER;
        const n = inner ? INNER : ALL.length - INNER, k = inner ? i : i - INNER;
        const r = inner ? r1 : r2;
        // from just below the left horizon, over the top, to just below the right one
        const a0 = Math.PI * (inner ? 1.08 : 1.06), a1 = Math.PI * (inner ? -0.08 : -0.06);
        const ang = a0 + ((a1 - a0) * k) / (n - 1);
        // the outer ring's logos fall between the inner ring's, so the two never line up
        li.style.setProperty("--x", `${Math.round(cx + r * Math.cos(ang) - size / 2)}px`);
        li.style.setProperty("--y", `${Math.round(cy - r * Math.sin(ang) - size / 2)}px`);
        li.style.setProperty("--d", `${700 + i * 55}ms`);
      });
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.on = "";
      return () => ro.disconnect();
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      el.dataset.on = "";
      timers.push(window.setTimeout(() => notifySound("gift"), 150));
      timers.push(window.setTimeout(() => notifySound("tada"), 620));
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); ro.disconnect(); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div ref={stage} className={a.arcStage}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={a.presenter} src="/images/about/hands-up.webp" alt="Nishanth in a tweed jacket, smiling with both hands raised: ta-da!" width={792} height={945} loading="lazy" />
      <ul className={a.arc} aria-label="Tools">
        {ALL.map((t) => (
          <li
            key={t.logo}
            data-logo
            tabIndex={0}
            data-mono={"mono" in t && t.mono ? "" : undefined}
            style={{ ["--src" as string]: `url(/images/tools/${t.logo}.svg)` }}
            onPointerEnter={(e) => fit(e.currentTarget)}
            onFocus={(e) => fit(e.currentTarget)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/tools/${t.logo}.svg`} alt={t.name} width={56} height={56} loading="lazy" />
            <span className={a.tip} data-tip aria-hidden="true">{t.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
