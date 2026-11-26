"use client";

import { useEffect, useRef } from "react";
import { about } from "@/lib/site/about";
import { notifySound } from "@/lib/sound/notify";
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

/** where the logos come from: between the hands in the photo (as a share of its width and height) */
const HANDS = { x: 0.8, y: 0.55 };

/**
 * The tools from Nishanth's CV, as their logos, presented by Nishanth himself: when the section comes
 * into view he slides in, "ta-da!" plays, and the logos pop out from between his hands to their places.
 * Hover or focus a logo for its name; it glows in its own colour.
 */
export default function Tools() {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const aim = () => {
      // start every logo at the hands
      const img = el.querySelector<HTMLElement>("[data-presenter]");
      if (!img) return;
      const r = img.getBoundingClientRect();
      const hx = r.left + r.width * HANDS.x, hy = r.top + r.height * HANDS.y;
      el.querySelectorAll<HTMLElement>("[data-logo]").forEach((li, i) => {
        const b = li.getBoundingClientRect();
        li.style.setProperty("--fx", `${Math.round(hx - (b.left + b.width / 2))}px`);
        li.style.setProperty("--fy", `${Math.round(hy - (b.top + b.height / 2))}px`);
        li.style.setProperty("--d", `${420 + i * 45}ms`);
      });
    };
    if (still) { el.dataset.on = ""; return; }
    aim();
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      aim();
      el.dataset.on = "";
      window.setTimeout(() => notifySound("tada"), 180);
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={stage} className={a.toolStage}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={a.presenter} data-presenter src="/images/about/tada.webp" alt="Nishanth in a tweed jacket, smiling and presenting his tools with both palms open: ta-da!" width={720} height={865} loading="lazy" />
      <div className={a.toolGroups}>
        {about.tools.map((g) => (
          <div key={g.group} className={a.toolGroup}>
            <h3>{g.group}</h3>
            <ul className={a.tools}>
              {g.items.map((t) => (
                <li
                  key={t.logo}
                  data-logo
                  tabIndex={0}
                  data-mono={"mono" in t && t.mono ? "" : undefined}
                  style={{ ["--glow" as string]: t.glow }}
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
        ))}
      </div>
    </div>
  );
}
