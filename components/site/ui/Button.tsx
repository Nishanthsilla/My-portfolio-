"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type MouseEventHandler, type PointerEvent, type ReactNode } from "react";
import b from "./button.module.css";

/**
 * The site's one button, with a liquid fill: colour pours in from exactly where the cursor
 * enters — a wobbling pool with droplets splashing ahead of it, merged by a "goo" filter so they
 * flow together like fluid — fills the pill, and drains back out toward where the cursor leaves,
 * the droplets trailing behind. On touch screens it pours from the finger. Use it for every call to action, as a link
 * (`href`) or a button (`onClick`).
 *
 *  · primary   — the main action: solid red; ink pours in
 *  · secondary — the other actions: an outline; red pours in, the label turns white
 *  · glass     — on top of pictures: frosted white; red pours in
 *
 * Sizes: "sm" (36 px tall) and "md" (44 px, the default). Follows light/dark mode.
 */
export type ButtonVariant = "primary" | "secondary" | "glass";
type Props = {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean | string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  /** gets the rendered element (e.g. to move focus to it) */
  elRef?: { current: HTMLElement | null };
};

/** place the pool at the pointer, sized to cover the whole button from that point; the droplets head for the middle */
function aim(el: HTMLElement, x: number, y: number) {
  const r = el.getBoundingClientRect();
  const px = Math.min(r.width, Math.max(0, x - r.left)), py = Math.min(r.height, Math.max(0, y - r.top));
  const d = 2 * Math.hypot(Math.max(px, r.width - px), Math.max(py, r.height - py)) + 24;
  el.style.setProperty("--fx", `${px}px`);
  el.style.setProperty("--fy", `${py}px`);
  el.style.setProperty("--fd", `${d}px`);
  el.style.setProperty("--dx", `${r.width / 2 - px}px`);
  el.style.setProperty("--dy", `${r.height / 2 - py}px`);
  el.style.setProperty("--h", `${r.height}px`);
}

/** the "goo" filter every button's liquid shares: blur, then a hard alpha edge, so drops merge like fluid */
const GOO = "site-liquid-goo";
function useGoo() {
  useEffect(() => {
    if (document.getElementById(GOO)) return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = `<defs><filter id="${GOO}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"/></filter></defs>`;
    document.body.appendChild(svg);
  }, []);
}

export default function Button({ children, variant = "secondary", size = "md", href, target, rel, download, onClick, type = "button", disabled, className = "", style, elRef, ...rest }: Props) {
  const self = useRef<HTMLElement | null>(null);
  useGoo();
  const ref = (el: HTMLElement | null) => {
    self.current = el;
    if (elRef) elRef.current = el;
  };
  const enter = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    aim(el, e.clientX, e.clientY);
    el.dataset.flow = "";
  };
  const leave = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    aim(el, e.clientX, e.clientY); // drain toward the way out
    delete el.dataset.flow;
  };
  const handlers = {
    onPointerEnter: enter,
    onPointerLeave: leave,
    // touch: pour from the finger, drain when it lifts
    onPointerDown: (e: PointerEvent<HTMLElement>) => { if (e.pointerType !== "mouse") enter(e); },
    onPointerUp: (e: PointerEvent<HTMLElement>) => { if (e.pointerType !== "mouse") window.setTimeout(() => delete e.currentTarget?.dataset?.flow, 260); },
  };
  const cls = `${b.btn} ${b[size]} ${b[variant]} ${className}`;
  const inner = (
    <>
      <span className={b.liquid} aria-hidden="true">
        <span className={b.fill} />
        <i className={b.drop} />
        <i className={b.drop} />
        <i className={b.drop} />
      </span>
      <span className={b.label}>{children}</span>
    </>
  );
  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href) || !!download || target === "_blank";
    const common = { ref, className: cls, style, onClick, "aria-disabled": disabled || undefined, ...handlers, ...rest };
    return external ? (
      <a {...common} href={href} target={target} rel={rel} download={download}>{inner}</a>
    ) : (
      <Link {...common} href={href} target={target} rel={rel}>{inner}</Link>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled} onClick={onClick} className={cls} style={style} {...handlers} {...rest}>
      {inner}
    </button>
  );
}
