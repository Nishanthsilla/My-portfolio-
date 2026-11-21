import { CELLS, STATUS } from "./data";
import m from "./mini.module.css";

/**
 * The SalesPulze card on the homepage: a small heatmap box (the first 40 TSM
 * cells from the final design). Hovering the card picks out one Critical
 * entity and shows its tooltip, the way the product does.
 */
const SHOWN = CELLS.slice(0, 40);
const PICK = 2; // TSM · Entity 002 · 40 · Critical

export default function FieldOpsMini() {
  return (
    <div className={m.wrap} aria-hidden="true">
      <div className={m.card}>
        <div className={m.head}>
          <span className={m.icon}><i /><i /><i /><i /></span>
          <b>Field Operations Health</b>
          <span className={m.level}>L7 · TSM <em>104</em></span>
        </div>
        <div className={m.chips}>
          <span style={{ background: STATUS.critical.chipBg, color: STATUS.critical.chipFg }}>6 Critical</span>
          <span style={{ background: STATUS.attention.chipBg, color: STATUS.attention.chipFg }}>57 Attention</span>
          <span style={{ background: STATUS.moderate.chipBg, color: STATUS.moderate.chipFg }}>35 Moderate</span>
          <span style={{ background: STATUS.healthy.chipBg, color: STATUS.healthy.chipFg }}>6 Healthy</span>
        </div>
        <div className={m.grid}>
          {SHOWN.map((c) => (
            <span key={c.n} className={`${m.cell} ${c.n === PICK ? m.pick : ""}`} style={{ background: STATUS[c.status].bg, color: STATUS[c.status].fg }}>
              {c.score}
              {c.n === PICK && (
                <span className={m.tip}>
                  <span className={m.path}>All India → L7 → TSM</span>
                  <b>Entity 002</b>
                  <span className={m.row}>Score <b>40</b> <em style={{ background: STATUS.critical.chipBg, color: STATUS.critical.chipFg }}>Critical</em></span>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
