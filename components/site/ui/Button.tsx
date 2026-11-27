"use client";

import Link from "next/link";
import { useRef, type CSSProperties, type MouseEventHandler, type PointerEvent, type ReactNode } from "react";
import b from "./button.module.css";

/**
 * The site's one button, with a liquid fill: colour pours in from exactly where the cursor
 * enters, swells until it fills the pill, and drains back out toward where the cursor leaves.
 * On touch screens it pours from the finger. Use it for every call to action, as a link
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

/** place the blob at the pointer, sized to cover the whole button from that point */
function aim(el: HTMLElement, x: number, y: number) {
  const r = el.getBoundingClientRect();
  const px = x - r.left, py = y - r.top;
  const d = 2 * Math.hypot(Math.max(px, r.width - px), Math.max(py, r.height - py)) + 4;
  el.style.setProperty("--fx", `${px}px`);
  el.style.setProperty("--fy", `${py}px`);
  el.style.setProperty("--fd", `${d}px`);
}

export default function Button({ children, variant = "secondary", size = "md", href, target, rel, download, onClick, type = "button", disabled, className = "", style, elRef, ...rest }: Props) {
  const self = useRef<HTMLElement | null>(null);
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
      <span className={b.fill} aria-hidden="true" />
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
