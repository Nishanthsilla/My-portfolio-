"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import s from "./site.module.css";

/**
 * One reusable hover-preview system (React Bits' Hover Preview is a paid Pro
 * component, so this is a lightweight equivalent of our own).
 *
 * - Pointer: a card fades and scales in (240ms) near the link, placed above or
 *   below so it never covers the link and never leaves the viewport. The pointer
 *   can travel into the card without it closing; leaving both closes it (160ms).
 * - Keyboard: focusing the link shows the same preview; Escape hides it.
 * - Touch / no-hover devices: no preview at all — a tap simply follows the link.
 */
export type PreviewContent = {
  title: string;
  meta?: string;
  /** an image (screenshot, cover, document page) … */
  src?: string;
  alt?: string;
  /** … or any rendered preview (e.g. a coded mini-UI) */
  render?: ReactNode;
};

const W = 288;
const H = 268; // card height incl. caption (approx.), used for placement
const GAP = 14;
const MARGIN = 12;

export default function HoverPreview({ preview, children }: { preview: PreviewContent; children: ReactNode }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, below: false });
  const [canHover, setCanHover] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const closeT = useRef(0);
  const id = useId();

  useEffect(() => {
    const mq = matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    // render the card inside the site root, so it inherits the design tokens
    setTarget((anchor.current?.closest("[data-site]") as HTMLElement | null) ?? document.body);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const place = useCallback((clientX?: number) => {
    const el = anchor.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = clientX ?? r.left + r.width / 2;
    const x = Math.min(Math.max(cx - W / 2, MARGIN), innerWidth - W - MARGIN);
    const below = r.top - GAP - H < MARGIN;
    const y = below ? Math.min(r.bottom + GAP, innerHeight - H - MARGIN) : r.top - GAP - H;
    setPos({ x, y, below });
  }, []);

  const show = useCallback(
    (clientX?: number) => {
      window.clearTimeout(closeT.current);
      place(clientX);
      setOpen(true);
    },
    [place],
  );
  const hide = useCallback((delay = 120) => {
    window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => setOpen(false), delay);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
    };
  }, [open]);
  useEffect(() => () => window.clearTimeout(closeT.current), []);

  return (
    <>
      <span
        ref={anchor}
        style={{ display: "inline-flex" }}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(e) => canHover && e.pointerType === "mouse" && show(e.clientX)}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={() => show()}
        onBlur={() => hide(0)}
      >
        {children}
      </span>
      {target && (canHover || open)
        ? createPortal(
            <div
              id={id}
              role="tooltip"
              className={`${s.preview} ${open ? s.previewOn : ""}`}
              style={{ left: pos.x, top: pos.y, ["--origin" as string]: pos.below ? "50% 0%" : "50% 100%" }}
              onPointerEnter={() => window.clearTimeout(closeT.current)}
              onPointerLeave={() => hide()}
            >
              <div className={s.previewMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview.src ? <img src={preview.src} alt={preview.alt ?? ""} loading="lazy" /> : preview.render}
              </div>
              <div className={s.previewCap}>
                <b>{preview.title}</b>
                {preview.meta && <span className={s.eyebrow}>{preview.meta}</span>}
              </div>
            </div>,
            target,
          )
        : null}
    </>
  );
}
