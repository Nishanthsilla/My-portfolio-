"use client";

import { useState } from "react";
import { CELLS, LEVELS, ORDER, STATUS, count, type Status } from "./data";
import Dashboard from "./Dashboard";
import Fit from "./Fit";
import f from "./figures.module.css";

const Cell = ({ score, status, big, dim, sel }: { score: number; status: Status; big?: boolean; dim?: boolean; sel?: boolean }) => (
  <span className={`${f.cell} ${big ? f.big : ""} ${dim ? f.dim : ""} ${sel ? f.sel : ""}`} style={{ background: STATUS[status].bg, color: STATUS[status].fg }}>{score}</span>
);

/** Visual 03 · the organisational hierarchy, L2 → L8, with the entity counts from the design */
export function Hierarchy() {
  const max = Math.max(...LEVELS.map((l) => l.n));
  return (
    <div className={f.hier} role="img" aria-label="Seven management levels: L2 AVP (2), L3 GM (4), L4 RM (7), L5 BM (13), L6 SM (38), L7 TSM (104), L8 ASM (120)">
      {LEVELS.map((l) => (
        <div key={l.l} className={`${f.lvl} ${l.l === "L7" ? f.lvlOn : ""}`}>
          <span className={f.lvlId}><b>{l.l}</b> {l.d}</span>
          <span className={f.bar}><i style={{ width: `${Math.max(3, (l.n / max) * 100)}%` }} /></span>
          <span className={f.lvlN}>{l.n} <small>entities</small></span>
        </div>
      ))}
      <p className={f.hierNote}>Same view at every level: pick a level and the heatmap shows its entities. <b>L7 · TSM</b> is the view in the final design.</p>
    </div>
  );
}

/** Visual 04 · the four health classifications, with real scores from the design */
export function ColorSystem() {
  const ex: Record<Status, number[]> = { critical: [22, 29, 38], attention: [43, 51, 57], moderate: [61, 68, 74], healthy: [81, 86, 99] };
  return (
    <div className={f.colors}>
      {ORDER.map((st) => (
        <div key={st} className={f.colorCard}>
          <span className={f.swatch} style={{ background: STATUS[st].bg }} />
          <div className={f.colorHead}><b>{STATUS[st].label}</b><span>{st === "attention" ? "40 – 59" : st === "moderate" ? "60 – 79" : st === "healthy" ? "80 – 100" : "Below 40"}</span></div>
          <p>{STATUS[st].meaning}</p>
          <div className={f.exRow}>{ex[st].map((n) => <Cell key={n} score={n} status={st} />)}</div>
          <span className={f.inView}>{count(st)} of 104 in the L7 view</span>
        </div>
      ))}
    </div>
  );
}

/** Visual 05 · anatomy of one cell */
export function Anatomy() {
  return (
    <div className={f.anat}>
      <div className={f.anatCell}>
        <Cell score={47} status="attention" big />
        <span className={`${f.callout} ${f.cTop}`}><b>Score</b> the precise health score, 0–100</span>
        <span className={`${f.callout} ${f.cRight}`}><b>Colour</b> its status, readable at a glance</span>
        <span className={`${f.callout} ${f.cBottom}`}><b>One cell = one entity</b> at the selected level (here, one TSM)</span>
      </div>
      <div className={f.anatWhy}>
        <p><b>Two signals, one shape.</b> Colour lets a leader scan all 104 entities at a glance; the number keeps the comparison honest when two cells look alike.</p>
        <p><b>Equal cells, no geography.</b> Every entity gets the same weight on screen, so a small territory with a problem is as visible as a large one.</p>
      </div>
    </div>
  );
}

/** Visual 06 · hover, select, investigate */
export function Interaction() {
  const pick = CELLS.slice(0, 10);
  return (
    <div className={f.states}>
      <div className={f.state}>
        <span className={f.stateN}>01 · Hover</span>
        <div className={f.mini}>{pick.map((c) => <Cell key={c.n} score={c.score} status={c.status} />)}</div>
        <div className={f.tipCard}>
          <span className={f.path}>All India → Level 7 → TSM</span>
          <b>TSM · Entity 002</b>
          <span className={f.row}>Health score <b>40</b></span>
          <span className={f.row}>Status <em style={{ background: STATUS.critical.chipBg, color: STATUS.critical.chipFg }}>Critical</em></span>
        </div>
        <p><b>Quick understanding.</b> Who the entity is, where it sits in the hierarchy, its score and status, without leaving the map. (Names are hidden here.)</p>
      </div>
      <div className={f.state}>
        <span className={f.stateN}>02 · Select</span>
        <div className={f.mini}>{pick.map((c) => <Cell key={c.n} score={c.score} status={c.status} sel={c.n === 2} dim={c.n !== 2} />)}</div>
        <p><b>Focus.</b> The chosen entity is ringed and the rest step back, so it stays clear what is being investigated.</p>
      </div>
      <div className={f.state}>
        <span className={f.stateN}>03 · Investigate</span>
        <div className={f.detail}>
          <span className={f.path}>TSM · Entity 002 · <em style={{ color: STATUS.critical.chipFg }}>Critical</em></span>
          {["Entity overview", "Meeting performance", "Sales activity", "Quality & hygiene", "Identified risks", "Operational blockers", "AI insights", "Recommended follow-up actions"].map((t) => (
            <span key={t} className={f.detailRow}>{t}<i /></span>
          ))}
        </div>
        <p><b>Detailed investigation.</b> The meeting intelligence behind the score: what happened, what went wrong, what to do next.</p>
      </div>
    </div>
  );
}

/** Visual 07 · Natural vs Worst first, on the real 104 cells */
export function Prioritization() {
  const worst = [...CELLS].sort((a, b) => a.score - b.score || a.n - b.n);
  const Grid = ({ cells, mark }: { cells: typeof CELLS; mark?: boolean }) => (
    <div className={f.pgrid}>{cells.map((c, i) => <span key={c.n} className={`${f.pcell} ${mark && i >= 12 ? f.pfade : ""}`} style={{ background: STATUS[c.status].bg, color: STATUS[c.status].fg }}>{c.score}</span>)}</div>
  );
  return (
    <div className={f.prio}>
      <div>
        <span className={f.stateN}>Natural</span>
        <Grid cells={CELLS} />
        <p>The default order. Good for finding a known entity; the six Critical cells are scattered across the map.</p>
      </div>
      <div>
        <span className={f.stateN}>Worst first</span>
        <Grid cells={worst} mark />
        <p>The lowest scores lead. The six Critical entities and the weakest Attention cases sit in the first row: where to start is no longer a search.</p>
      </div>
    </div>
  );
}

/** Visual · the workflow, 1 → 7 */
export function Workflow() {
  const steps = ["Monitor overall organisational health", "Identify critical and underperforming entities", "Go to the relevant management level", "Investigate one entity's performance", "Understand meeting quality, risks and blockers", "Review AI insights and recommended actions", "Prioritise follow-up"];
  return (
    <ol className={f.flow}>
      {steps.map((s, i) => (
        <li key={s} className={i < 3 ? f.flowSee : i < 6 ? f.flowWhy : f.flowAct}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <b>{s}</b>
        </li>
      ))}
      <li className={f.flowKey} aria-hidden="true"><i className={f.flowSee} /> Where <i className={f.flowWhy} /> Why <i className={f.flowAct} /> Action</li>
    </ol>
  );
}

/** the live, interactive replica: hover, click, sort */
export function LiveDemo() {
  const [sel, setSel] = useState<number | null>(null);
  const c = sel != null ? CELLS.find((x) => x.n === sel) : null;
  return (
    <div className={f.live}>
      <Fit><Dashboard mode="live" onSelect={setSel} /></Fit>
      <p className={f.liveHint}>{c ? <>Selected <b>TSM · Entity {String(c.n).padStart(3, "0")}</b>: score {c.score}, {STATUS[c.status].label}. In the product this opens the entity&apos;s meeting intelligence (see Interaction design).</> : <>Try it: hover a cell, click to select it, and switch between <b>Natural</b> and <b>Worst first</b>. A coded replica of the final design, L7 · TSM.</>}</p>
    </div>
  );
}
