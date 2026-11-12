"use client";

import { useEffect, useRef, useState } from "react";
import GradientASCII from "./GradientASCII";

/**
 * React Bits' Gradient ASCII as a brief full-screen bridge after the camera
 * push-through. It mounts just before it is needed, so its built-in intro
 * (characters forming) plays on cue; the story toggles it with a `film-ascii`
 * event on the film root and drives its opacity from the film clock.
 */
export default function AsciiBridge() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [font, setFont] = useState("ui-monospace, Menlo, monospace");
  useEffect(() => {
    const root = ref.current?.closest("[data-intro-film]");
    if (!root) return;
    const mono = getComputedStyle(root).getPropertyValue("--font-geist-mono").trim();
    if (mono) setFont(`${mono}, ui-monospace, Menlo, monospace`);
    const onEvent = (e: Event) => setOn((e as CustomEvent<boolean>).detail);
    root.addEventListener("film-ascii", onEvent);
    return () => root.removeEventListener("film-ascii", onEvent);
  }, []);
  return (
    // The canvas is taller than the viewport and top-aligned: only the evenly lit
    // "sky" of the horizon field is on screen, so density is even edge to edge.
    <div ref={ref} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "150%" }}>
      {on && (
        <GradientASCII
          lightMode
          // "horizon" at its widest scale puts the whole viewport in its sky, so characters
          // cover every edge; no background gradient, glow or grain —
          // only the characters themselves, warm grey with orange reserved for the brightest band
          shape="horizon"
          colors={["#A99C8E", "#B2A699", "#A89A8C", "#E4806F"]}
          characters=" .:+*%#"
          cellSize={20}
          density={0.9}
          glyphOpacity={0.85}
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
