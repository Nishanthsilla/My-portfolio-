"use client";

import { useSyncExternalStore } from "react";
import SpecularButton, { type SpecularButtonProps } from "../reactbits/SpecularButton";
import b from "./button.module.css";

/**
 * The site's one button. Built on React Bits' SpecularButton: a pill whose edge catches a light
 * that follows the cursor, in the site's colours. Use it for every call to action (as a link with
 * `href`, or a button with `onClick`).
 *
 *  · primary   — the main action on a screen: the site's red, white label, a white light on the edge
 *  · secondary — the other actions: white body, ink label, hairline edge, coral light
 *  · glass     — on top of pictures and covers: frosted white, ink label
 *
 * Colours follow the light/dark theme. Sizes: "sm" (36 px tall) and "md" (44 px, the default).
 */
export type ButtonVariant = "primary" | "secondary" | "glass";
type Props = Omit<SpecularButtonProps, "size" | "tint" | "tintOpacity" | "textColor" | "lineColor" | "baseColor"> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
};

const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

const LOOK: Record<"light" | "dark", Record<ButtonVariant, Pick<SpecularButtonProps, "tint" | "tintOpacity" | "textColor" | "lineColor" | "baseColor" | "blur">>> = {
  light: {
    primary: { tint: "#ff4938", tintOpacity: 1, textColor: "#ffffff", lineColor: "#ffffff", baseColor: "#c2301f" },
    secondary: { tint: "#ffffff", tintOpacity: 1, textColor: "#222222", lineColor: "#ff4938", baseColor: "#d6d1c8" },
    glass: { tint: "#ffffff", tintOpacity: 0.88, textColor: "#1d1b19", lineColor: "#ff4938", baseColor: "#ffffff", blur: 8 },
  },
  dark: {
    primary: { tint: "#ff4938", tintOpacity: 1, textColor: "#ffffff", lineColor: "#ffffff", baseColor: "#c2301f" },
    secondary: { tint: "#30302e", tintOpacity: 1, textColor: "#eceae4", lineColor: "#ff6a55", baseColor: "#55524d" },
    glass: { tint: "#ffffff", tintOpacity: 0.88, textColor: "#1d1b19", lineColor: "#ff4938", baseColor: "#ffffff", blur: 8 },
  },
};

export default function Button({ variant = "secondary", size = "md", className = "", ...rest }: Props) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  return (
    <SpecularButton
      {...LOOK[dark ? "dark" : "light"][variant]}
      size={size === "sm" ? "sm" : "md"}
      radius={999}
      intensity={1.1}
      idleIntensity={variant === "primary" ? 0.45 : 0.3}
      shineSize={12}
      shineFade={38}
      thickness={1.4}
      proximity={220}
      className={`${b.btn} ${b[size]} ${b[variant]} ${className}`}
      {...rest}
    />
  );
}
