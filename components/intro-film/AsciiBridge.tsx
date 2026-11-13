"use client";

import { useEffect, useRef, useState } from "react";

const GREYS = ["#A99C8E", "#B2A699", "#A89A8C", "#E4806F"];
const ORANGES = ["#FF4938", "#FF4938", "#F2402F", "#FF4938"];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) =>
  "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
import GradientASCII from "./GradientASCII";

/**
 * React Bits' Gradient ASCII as the full-screen bridge between "…ship it in
 * code." and the product. It mounts just before it is needed, so its built-in intro
 * (characters forming) plays on cue; the story toggles it with a `film-ascii`
 * event on the film root and drives its opacity from the film clock.
 */
export default function AsciiBridge() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [tint, setTint] = useState(0);
  const [font, setFont] = useState("ui-monospace, Menlo, monospace");
  useEffect(() => {
    const root = ref.current?.closest("[data-intro-film]");
    if (!root) return;
    const mono = getComputedStyle(root).getPropertyValue("--font-geist-mono").trim();
    if (mono) setFont(`${mono}, ui-monospace, Menlo, monospace`);
    const onEvent = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    const onTint = (e: Event) => setTint((e as CustomEvent<number>).detail);
    root.addEventListener("film-ascii", onEvent);
    root.addEventListener("film-ascii-tint", onTint);
    return () => {
      root.removeEventListener("film-ascii", onEvent);
      root.removeEventListener("film-ascii-tint", onTint);
    };
  }, []);
  return (
    // The canvas is taller than the viewport and top-aligned: only the evenly lit
    // "sky" of the horizon field is on screen, so density is even edge to edge.
    <div
      ref={ref}
      style={{
        position: "absolute", left: 0, top: 0, width: "100%", height: "150%",
        // the characters blend with the light ground; lifting contrast as they turn orange makes them
        // read as the primary #FF4938 while the off-white ground stays off-white
        filter: tint > 0 ? `contrast(${(1 + 0.7 * tint).toFixed(3)}) saturate(${(1 + 0.3 * tint).toFixed(3)})` : undefined,
      }}
    >
      {on && (
        <GradientASCII
          lightMode
          // "horizon" at its widest scale puts the whole viewport in its sky, so characters
          // cover every edge; no background gradient, glow or grain —
          // only the characters themselves, warm grey with orange reserved for the brightest band
          shape="horizon"
          colors={GREYS.map((g, i) => mix(g, ORANGES[i], tint))}
          characters=" .:+*%#"
          cellSize={20}
          density={0.9}
          glyphOpacity={0.85 + 0.15 * tint}
          glow={0}
          gradientOpacity={0}
          grain={0}
          flicker={0.12}
          softness={0.6}
          flow={0.8}
          speed={1.1}
          scale={2.5}
          scrambleRadius={0.08}
          clickEffect="none"
          dpr={1}
          fontFamily={font}
        />
      )}
    </div>
  );
}
