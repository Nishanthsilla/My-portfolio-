"use client";

import { useEffect, useRef, useState } from "react";
import GradientASCII from "./GradientASCII";

/**
 * Mounts React Bits' Gradient ASCII only for the ending, so its built-in
 * intro (characters forming) plays when the bridge appears. The story
 * toggles it with a `film-ascii` event on the film root.
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
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      {on && (
        <GradientASCII
          lightMode
          shape="rise"
          colors={["#FF4938", "#FF7A6B", "#FFC2B9", "#FFE7E4", "#FAF9F6"]}
          characters=" .:-=+*#%@"
          cellSize={18}
          density={0.75}
          glyphOpacity={0.8}
          glow={0}
          flicker={0.15}
          softness={0.7}
          flow={0.6}
          speed={0.9}
          gradientOpacity={0.55}
          grain={0.03}
          scrambleRadius={0.08}
          clickEffect="none"
          dpr={1.25}
          fontFamily={font}
        />
      )}
    </div>
  );
}
