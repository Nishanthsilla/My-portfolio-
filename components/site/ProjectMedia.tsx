"use client";

import { useEffect, useRef, useState } from "react";
import {
  ABTestVisual, AnalyticsVisual, DesignSystemVisual, LearningVisual, OrchestrationVisual, SalesVisual,
} from "@/components/portfolio/visuals/Visuals";
import type { Project, VisualId } from "@/lib/site/content";
import { CoverScene } from "./selfready/Scenes";
import s from "./site.module.css";

const VISUALS: Record<VisualId, () => React.JSX.Element> = {
  sales: SalesVisual,
  orchestration: OrchestrationVisual,
  "design-system": DesignSystemVisual,
  learning: LearningVisual,
  "ab-test": ABTestVisual,
  analytics: AnalyticsVisual,
};

/** Scales a fixed-width coded mini-UI to fit its frame (no layout shift: the frame has a fixed ratio). */
function FitVisual({ id, fill = 0.82 }: { id: VisualId; fill?: number }) {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const st = stage.current, el = inner.current;
    if (!st || !el) return;
    const fit = () => {
      const k = Math.min((st.clientWidth * fill) / el.offsetWidth, (st.clientHeight * fill) / el.offsetHeight);
      setScale(Number.isFinite(k) && k > 0 ? k : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(st);
    return () => ro.disconnect();
  }, [fill]);
  const V = VISUALS[id];
  return (
    <div ref={stage} className={s.visualStage}>
      <div ref={inner} className={`${s.visualFit} ${scale ? s.visualFitReady : ""}`} style={{ transform: `scale(${scale || 1})` }}>
        <V />
      </div>
    </div>
  );
}

export default function ProjectMedia({ project, className = "", fill, eager = false }: { project: Project; className?: string; fill?: number; eager?: boolean }) {
  const p = project.preview;
  return (
    <div className={`${s.media} ${className}`} style={p.kind === "image" && p.bg ? { background: p.bg } : undefined}>
      <div className={s.mediaInner}>
        {p.kind === "placeholder" ? (
          <div className={s.coverSlot} role="img" aria-label={`Placeholder: ${p.need}`}>
            <span className={s.badge}>Placeholder</span>
            <b>ADD IMAGE HERE — {p.need}</b>
          </div>
        ) : p.kind === "scene" ? (
          <CoverScene />
        ) : p.kind === "visual" ? (
          <FitVisual id={p.id} fill={fill} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.src}
            alt={p.alt}
            className={`${s.mediaImg} ${p.fit === "contain" ? s.mediaImgContain : ""}`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        )}
      </div>
    </div>
  );
}
