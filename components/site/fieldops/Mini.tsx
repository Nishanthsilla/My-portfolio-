import { STATUS } from "./data";
import m from "./mini.module.css";

/**
 * The SalesPulze card on the homepage: one Critical cell from the heatmap with
 * a cursor on it. Hovering the card lifts the cell and shows its tooltip.
 */
export default function FieldOpsMini() {
  return (
    <div className={m.wrap} aria-hidden="true">
      <div className={m.box} style={{ background: STATUS.critical.bg, color: STATUS.critical.fg }}>
        38
        <svg className={m.cursor} viewBox="0 0 16 16"><path d="M1 1 L14 6.5 L8 8 L6.5 14 Z" /></svg>
        <span className={m.tip}>
          <b>TSM · Entity 036</b>
          <span>Score 38 · <em>Critical</em></span>
        </span>
      </div>
    </div>
  );
}
