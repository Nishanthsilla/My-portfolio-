"use client";

import { createContext, useContext, useState } from "react";
import PhotoViewer from "../PhotoViewer";
import f from "./forma.module.css";

type Pic = { src: string; sm?: string; alt: string };
const Ctx = createContext<{ open: (src: string) => void } | null>(null);

/** Every image inside opens full size (with next/previous through all of them). */
export function ZoomGroup({ pics, children }: { pics: Pic[]; children: React.ReactNode }) {
  const [at, setAt] = useState<number | null>(null);
  return (
    <Ctx.Provider value={{ open: (src) => setAt(Math.max(0, pics.findIndex((p) => p.src === src))) }}>
      {children}
      {at !== null && <PhotoViewer photos={pics.map((p) => ({ src: p.src, thumb: p.sm ?? p.src, alt: p.alt }))} index={at} onClose={() => setAt(null)} />}
    </Ctx.Provider>
  );
}

export function Zoom({ pic, small, className, caption }: { pic: Pic; small?: boolean; className?: string; caption?: string }) {
  const g = useContext(Ctx);
  return (
    <figure className={`${f.fig} ${className ?? ""}`}>
      <button type="button" className={f.zoomBtn} onClick={() => g?.open(pic.src)} aria-label={`Enlarge: ${pic.alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={small && pic.sm ? pic.sm : pic.src} alt={pic.alt} loading="lazy" decoding="async" width={1536} height={1024} />
        <span className={f.zoomHint} aria-hidden="true">
          <svg viewBox="0 0 16 16"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" /></svg>
        </span>
      </button>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
