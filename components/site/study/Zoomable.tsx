"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from "./study.module.css";

/**
 * An image that opens larger. The viewer fits the image to the screen; wide
 * diagrams can switch to full size and be scrolled. Esc closes it, and focus
 * returns to the image that opened it.
 */
export default function Zoomable({ src, alt, width, height, label, priority = false }: { src: string; alt: string; width?: number; height?: number; label: string; priority?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={s.zoomBtn} onClick={() => setOpen(true)} aria-label={`${label} — open larger`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} decoding="async" className={s.img} />
        <span className={s.zoomHint} aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg>
          View larger
        </span>
      </button>
      {open && <Viewer src={src} alt={alt} label={label} onClose={() => setOpen(false)} />}
    </>
  );
}

function Viewer({ src, alt, label, onClose }: { src: string; alt: string; label: string; onClose: () => void }) {
  const [full, setFull] = useState(false);
  const [shown, setShown] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => setShown(true));
    close.current?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && box.current) {
        // keep focus inside the viewer
        const f = [...box.current.querySelectorAll<HTMLElement>("button")];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      opener?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div ref={box} className={`${s.viewer} ${shown ? s.viewerOn : ""}`} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.viewerBar}>
        <span className={s.viewerTitle}>{label}</span>
        <button type="button" className={s.viewerBtn} onClick={() => setFull((v) => !v)} aria-pressed={full}>
          {full ? "Fit to screen" : "Full size"}
        </button>
        <button ref={close} type="button" className={s.viewerBtn} onClick={onClose} aria-label="Close">
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className={`${s.viewerStage} ${full ? s.viewerFull : ""}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={s.viewerImg} />
      </div>
    </div>,
    document.body,
  );
}
