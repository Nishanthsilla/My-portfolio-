"use client";

import { useEffect, useRef, useState } from "react";
import { STATUS } from "./data";
import m from "./mini.module.css";

/**
 * The SalesPulze card on the homepage: one Critical cell from the heatmap with
 * a cursor on it. While the card is on screen the cursor clicks the cell and
 * its tooltip shows, on a loop (so it plays on phones too); hovering the card
 * on a laptop holds that state instead.
 */
export default function FieldOpsMini() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${m.wrap} ${on ? m.on : ""}`} aria-hidden="true">
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
