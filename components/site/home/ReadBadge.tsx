"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import h from "./home.module.css";

/**
 * The round "Read case study" badge (the same glass ring as the homepage's "Swipe Right"): it
 * takes the place of the cursor while it's over a case study's name in a room. `label` is the
 * ring's text, or null to hide it.
 */
export default function ReadBadge({ label }: { label: string | null }) {
  const badge = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target exists only in the browser
  useEffect(() => setHost(document.body), []);
  useEffect(() => {
    let x = -300, y = -300, cx = x, cy = y, raf = 0, first = true;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (first) { cx = x; cy = y; first = false; }
    };
    const tick = () => {
      cx += (x - cx) * 0.3; cy += (y - cy) * 0.3;
      if (badge.current) badge.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);
  // while the badge is up, the site's red target cursor steps aside so the two don't overlap
  useEffect(() => {
    const html = document.documentElement;
    if (label) html.dataset.readBadge = "";
    else delete html.dataset.readBadge;
    return () => { delete html.dataset.readBadge; };
  }, [label]);
  if (!host) return null;
  const text = label ?? "Read case study";
  return createPortal(
    <div ref={badge} className={`${h.scrollHint} ${h.scrollHintFollow} ${h.readBadge} ${label ? h.scrollHintOn : ""}`} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path id="read-badge-ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
        </defs>
        <g className={h.scrollHintRing}>
          <text>
            <textPath href="#read-badge-ring" startOffset="0" textLength="285" lengthAdjust="spacingAndGlyphs">
              {text} <tspan className={h.scrollHintStar}>✦</tspan> {text} <tspan className={h.scrollHintStar}>✦</tspan>
            </textPath>
          </text>
        </g>
      </svg>
      {/* the same dancing duck as the "Swipe Right" badge */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={h.scrollHintDuck} src="/images/duck-dance.webp" alt="" width={58} height={70} decoding="async" />
    </div>,
    host,
  );
}
