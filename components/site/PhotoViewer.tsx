"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from "./beyond.module.css";

export type Photo = { src: string; thumb: string; alt: string };

/**
 * Large photo viewer: previous / next, close, counter, keyboard (← → Esc),
 * swipe on touch, a short fade between photos. Focus moves into the viewer and
 * returns to whatever opened it.
 */
export default function PhotoViewer({ photos, index, onClose }: { photos: Photo[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const [shown, setShown] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const n = photos.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    opener.current = document.activeElement;
    const raf = requestAnimationFrame(() => setShown(true));
    closeBtn.current?.focus();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = prevOverflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // preload neighbours so next / previous feel instant
  useEffect(() => {
    [photos[(i + 1) % n], photos[(i - 1 + n) % n]].forEach((p) => {
      const im = new Image();
      im.src = p.src;
    });
  }, [i, n, photos]);

  const p = photos[i];
  return createPortal(
    <div
      className={`${s.viewer} ${shown ? s.viewerOn : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${i + 1} of ${n}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const st = swipe.current;
        swipe.current = null;
        if (!st || e.pointerType === "mouse") return;
        const dx = e.clientX - st.x, dy = e.clientY - st.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      }}
    >
      <figure className={s.viewerFig} key={p.src}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt={p.alt} className={s.viewerImg} />
      </figure>
      <div className={s.viewerBar}>
        <span className={s.viewerCount} aria-live="polite">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <div className={s.viewerBtns}>
          <button type="button" className={s.vBtn} onClick={() => go(-1)} aria-label="Previous photograph">←</button>
          <button type="button" className={s.vBtn} onClick={() => go(1)} aria-label="Next photograph">→</button>
          <button ref={closeBtn} type="button" className={s.vBtn} onClick={onClose} aria-label="Close viewer">✕</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
