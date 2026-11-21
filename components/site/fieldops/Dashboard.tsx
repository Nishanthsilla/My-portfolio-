"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CELLS, LEVELS, ORDER, STATUS, SUMMARY, count, type Status } from "./data";
import d from "./fieldops.module.css";

/**
 * A faithful, coded replica of the final Field Operations Health design
 * (L7 · TSM, All India). Layout, tabs, counts, cells and colours follow the
 * design; nothing is added to the product.
 *
 * mode "cover": plays the cover sequence once it's on screen (fade up → the
 *   level moves to L7 → cells reveal → the summary counts up → a slow float).
 * mode "live": hover a cell for its tooltip, click to select it, sort Natural
 *   or Worst first.
 */
type Mode = "cover" | "live";

function useInView<T extends Element>(once = true) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { setSeen(true); if (once) io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return [ref, seen] as const;
}

/** counts up to `to` once `go` is true (or shows it at once with reduced motion) */
function CountUp({ to, go, ms = 900, delay = 0 }: { to: number; go: boolean; ms?: number; delay?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!go) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0; const t0 = performance.now() + delay;
    const step = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / ms));
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [go, to, ms, delay]);
  return <>{v}</>;
}

export default function Dashboard({ mode = "live", sort: sortProp, selected: selectedProp, hover: hoverProp, onSelect, className }: {
  mode?: Mode;
  /** controlled sort / selection / hover (for the explanatory figures) */
  sort?: "natural" | "worst";
  selected?: number | null;
  hover?: number | null;
  onSelect?: (n: number | null) => void;
  className?: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [sortState, setSort] = useState<"natural" | "worst">("natural");
  const [hoverState, setHover] = useState<number | null>(null);
  const [selState, setSel] = useState<number | null>(null);
  const sort = sortProp ?? sortState;
  const hover = hoverProp !== undefined ? hoverProp : hoverState;
  const selected = selectedProp !== undefined ? selectedProp : selState;
  const live = mode === "live";
  const play = mode === "cover" ? seen : true;

  const cells = useMemo(() => (sort === "worst" ? [...CELLS].sort((a, b) => a.score - b.score || a.n - b.n) : CELLS), [sort]);
  const tip = hover != null ? CELLS.find((c) => c.n === hover) : null;
  const tipIndex = hover != null ? cells.findIndex((c) => c.n === hover) : -1;

  return (
    <div ref={ref} className={`${d.dash} ${mode === "cover" ? d.cover : ""} ${play ? d.play : ""} ${className ?? ""}`} aria-label="Field Operations Health dashboard: 104 TSM entities at Level 7, All India">
      {/* header */}
      <div className={d.card}>
        <div className={d.head}>
          <span className={d.headIcon} aria-hidden="true"><i /><i /><i /><i /></span>
          <div>
            <h3 className={d.hTitle}>Field Operations Health</h3>
            <p className={d.hSub}>One cell = one entity at the selected level. Color = current status. Hover for full hierarchy and details.</p>
          </div>
        </div>
        {/* the hierarchy tabs; the active level slides to L7 in the cover */}
        <div className={d.tabs} role="tablist" aria-label="Management level">
          {LEVELS.map((lv, i) => (
            <div key={lv.l} role="tab" aria-selected={lv.l === "L7"} className={`${d.tab} ${lv.l === "L7" ? d.tabOn : ""}`} style={{ ["--i" as string]: i }}>
              <b>{lv.l}</b> <span>{lv.d}</span> <em>{lv.n}</em>
            </div>
          ))}
          <span className={d.tabBar} aria-hidden="true" />
        </div>
        <div className={d.filters}>
          <span className={d.fLabel}>SCOPE</span>
          <span className={d.seg}><span className={d.segOn}>◍ All India</span><span>↗ India-1</span><span>↘ India-2</span></span>
          <span className={d.fDiv} />
          <span className={d.fLabel}>SHOW</span>
          <span className={d.showAll}>All</span><span className={d.showDot}>Critical</span><span>◎ Problems</span>
          <span className={d.unassigned}>Unassigned <em>{SUMMARY.unassigned}</em></span>
        </div>
      </div>

      <div className={d.body}>
        {/* summary bar */}
        <div className={d.summary}>
          <span className={d.viewing}>You are viewing <b>All India</b> → <span>Level 7</span> → TSM</span>
          <span className={d.chip}><b><CountUp to={SUMMARY.entities} go={play} delay={mode === "cover" ? 2450 : 0} /></b> entities</span>
          {ORDER.map((st, i) => (
            <span key={st} className={d.chip} style={{ background: STATUS[st].chipBg, color: STATUS[st].chipFg, ["--i" as string]: i }}>
              <CountUp to={count(st)} go={play} delay={mode === "cover" ? 2450 + i * 90 : 0} /> {STATUS[st].label}
            </span>
          ))}
          <span className={d.overall}><i /> Overall Score <b><CountUp to={SUMMARY.overall} go={play} delay={mode === "cover" ? 2450 : 0} /></b> · {SUMMARY.overallStatus}</span>
        </div>

        {/* heatmap */}
        <div className={d.mapHead}>
          <span className={d.mapTitle}><i aria-hidden="true" /> Heatmap</span>
          <span className={d.sort}>
            <span className={d.fLabel}>SORT</span>
            {(["natural", "worst"] as const).map((k) => (
              <button key={k} type="button" disabled={!live || sortProp !== undefined} className={sort === k ? d.sortOn : undefined} onClick={() => setSort(k)}>
                {k === "natural" ? "Natural" : "Worst first"}
              </button>
            ))}
          </span>
        </div>
        <div className={d.grid} onMouseLeave={() => live && hoverProp === undefined && setHover(null)}>
          {cells.map((c, i) => (
            <button
              key={c.n}
              type="button"
              tabIndex={live ? 0 : -1}
              className={`${d.cell} ${selected === c.n ? d.cellSel : ""} ${selected != null && selected !== c.n ? d.cellDim : ""}`}
              style={{ background: STATUS[c.status].bg, color: STATUS[c.status].fg, ["--i" as string]: i }}
              aria-label={`TSM entity ${c.n}: score ${c.score}, ${STATUS[c.status].label}`}
              onMouseEnter={() => live && hoverProp === undefined && setHover(c.n)}
              onFocus={() => live && hoverProp === undefined && setHover(c.n)}
              onClick={() => { if (!live) return; const v = selected === c.n ? null : c.n; setSel(v); onSelect?.(v); }}
            >
              {c.score}
            </button>
          ))}
          {tip && tipIndex >= 0 && (
            <div className={d.tip} style={{ ["--col" as string]: tipIndex % 22, ["--row" as string]: Math.floor(tipIndex / 22) }} role="tooltip">
              <span className={d.tipPath}>All India → Level 7 → TSM</span>
              <b>TSM · Entity {String(tip.n).padStart(3, "0")}</b>
              <span className={d.tipRow}>Health score <b>{tip.score}</b></span>
              <span className={d.tipRow}>Status <em style={{ background: STATUS[tip.status].chipBg, color: STATUS[tip.status].chipFg }}>{STATUS[tip.status].label}</em></span>
              {live && <span className={d.tipHint}>Click to investigate</span>}
            </div>
          )}
        </div>
        <div className={d.legend}>
          {ORDER.map((st) => (
            <span key={st}><i style={{ background: STATUS[st].bg }} /> <b>{STATUS[st].label}</b> {STATUS[st].range}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
