"use client";

import { useEffect, useRef, useState } from "react";
import d from "./fieldops.module.css";

/** Scales a fixed-width design (the dashboard is 1640px wide) to the width of its frame. */
export default function Fit({ width = 1640, children, className, pad = 0 }: { width?: number; children: React.ReactNode; className?: string; pad?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  const [h, setH] = useState(0);
  useEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const fit = () => {
      const s = (o.clientWidth - pad * 2) / width;
      setK(s);
      setH(i.offsetHeight * s + pad * 2);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width, pad]);
  return (
    <div ref={outer} className={`${d.fit} ${className ?? ""}`} style={{ height: h || undefined, aspectRatio: h ? undefined : "1640 / 960" }}>
      <div ref={inner} className={d.fitInner} style={{ transform: `translate(${pad}px, ${pad}px) scale(${k || 0.0001})`, width }}>
        {children}
      </div>
    </div>
  );
}
