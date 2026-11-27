"use client";

import { useEffect, useRef, useState } from "react";
import {
  ABTestVisual, AnalyticsVisual, DesignSystemVisual, LearningVisual, OrchestrationVisual, SalesVisual,
} from "@/components/portfolio/visuals/Visuals";
import type { Project, VisualId } from "@/lib/site/content";
import { CoverScene } from "./selfready/Scenes";
import FieldOpsMini from "./fieldops/Mini";
import AgentPush from "./ambient/AgentPush";
import LearnLoop from "./covers/LearnLoop";
import TargetRewards from "./covers/TargetRewards";
import PortfolioCover from "./portfolioCover/PortfolioCover";
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
          p.id === "field-ops" ? <FieldOpsMini /> : p.id === "portfolio" ? <PortfolioCover /> : p.id === "ambient" ? <div className="cover-fit"><AgentPush /></div> : p.id === "learn-loop" ? <div className="cover-fit"><LearnLoop /></div> : p.id === "targets" ? <div className="cover-fit"><TargetRewards /></div> : <div className="cover-fit"><CoverScene /></div>
        ) : p.kind === "visual" ? (
          <FitVisual id={p.id} fill={fill} />
        ) : p.fit === "window" ? (
          // a product screen shown whole, as a window in the space above the card's title
          <div className="cover-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} className={s.windowImg} loading={eager ? "eager" : "lazy"} decoding="async" />
          </div>
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
