"use client";

import Link from "next/link";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import GlassSurface from "../reactbits/GlassSurface";
import b from "./button.module.css";

/**
 * The site's one button: a liquid-glass pill (React Bits' Glass Surface bends whatever is behind it,
 * with a soft coloured rim) that squishes like a drop when pressed. Use it for every call to action,
 * as a link (`href`) or a button (`onClick`).
 *
 *  · primary   — the main action on a screen: glass tinted the site's red, white label
 *  · secondary — the other actions: clear glass, ink label
 *  · glass     — on top of pictures and covers: clear glass with a little frost, ink label
 *
 * Sizes: "sm" (36 px tall) and "md" (44 px, the default). Where the browser can't bend the
 * backdrop (Safari, Firefox) it falls back to frosted glass, so it always looks finished.
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

const H = { sm: 36, md: 44 };

export default function Button({ children, variant = "secondary", size = "md", href, target, rel, download, onClick, type = "button", disabled, className = "", style, elRef, ...rest }: Props) {
  const cls = `${b.btn} ${b[size]} ${b[variant]} ${className}`;
  const inner = (
    <>
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={H[size] / 2}
        displace={0.4}
        distortionScale={-110}
        brightness={variant === "primary" ? 55 : 60}
        opacity={0.9}
        blur={variant === "glass" ? 8 : 6}
        backgroundOpacity={variant === "glass" ? 0.25 : 0.06}
        saturation={1.3}
        className={b.surface}
      />
      <span className={b.tint} aria-hidden="true" />
      <span className={b.label}>{children}</span>
    </>
  );
  const ref = (el: HTMLElement | null) => {
    if (elRef) elRef.current = el;
  };
  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href) || !!download || target === "_blank";
    const common = { ref, className: cls, style, onClick, "aria-disabled": disabled || undefined, ...rest };
    return external ? (
      <a {...common} href={href} target={target} rel={rel} download={download}>{inner}</a>
    ) : (
      <Link {...common} href={href} target={target} rel={rel}>{inner}</Link>
    );
  }
  return (
    <button ref={ref} type={type} disabled={disabled} onClick={onClick} className={cls} style={style} {...rest}>
      {inner}
    </button>
  );
}
