"use client";

import Dashboard from "./Dashboard";
import Fit from "./Fit";
import p from "./page.module.css";

/**
 * The case-study cover: the final design, animated once it's on screen
 * (Dashboard mode "cover"). The static screenshot is the fallback without JS.
 */
export default function Cover({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${p.cover} ${compact ? p.coverCompact : ""}`}>
      <Fit pad={compact ? 0 : 0}><Dashboard mode="cover" /></Fit>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/work/field-ops/final-heatmap.webp" alt="Field Operations Health: the final heatmap design" style={{ width: "100%", height: "auto" }} />
      </noscript>
    </div>
  );
}
