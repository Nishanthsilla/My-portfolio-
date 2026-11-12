"use client";

import { useSyncExternalStore } from "react";
import Grainient from "@/components/backgrounds/Grainient/Grainient";
import styles from "./GradientMesh.module.css";

/**
 * Animated gradient mesh built on React Bits <Grainient />: a domain-warped
 * gradient field rendered in WebGL2, so its colour fields drift continuously
 * with no keyframe loop to reset. A CSS radial-gradient mesh sits underneath
 * as the fallback when WebGL2 is unavailable or fails.
 */
const MESH_COLORS = [
  "#090d19", // midnight navy base
  "#121a33", // deep muted navy
  "#24345f", // muted blue
  "#3552b0", // soft electric blue
  "#3a2a6e", // deep violet
  "#1a1530", // violet shadow
  "#5a4034", // very subtle warm amber
];

type Props = { energized?: boolean };

type Env = "pending" | "webgl" | "webgl-compact" | "fallback";
let detected: Env | null = null;
const detect = (): Env => {
  if (detected) return detected;
  let ok = false;
  try {
    ok = !!document.createElement("canvas").getContext("webgl2");
  } catch {
    ok = false;
  }
  const compact = window.matchMedia("(max-width: 767px)").matches;
  detected = ok ? (compact ? "webgl-compact" : "webgl") : "fallback";
  return detected;
};
const subscribe = () => () => {};

export default function GradientMesh({ energized = false }: Props) {
  // Client-only capability check; the server renders the CSS fallback layer.
  const env = useSyncExternalStore(subscribe, detect, (): Env => "pending");
  const mode = env === "fallback" ? "fallback" : env === "pending" ? "pending" : "webgl";
  const compact = env === "webgl-compact";

  return (
    <div className={styles.mesh} aria-hidden>
      <div className={styles.fallback} data-animated={mode === "fallback" ? "" : undefined}>
        <span className={styles.f1} />
        <span className={styles.f2} />
        <span className={styles.f3} />
        <span className={styles.f4} />
      </div>
      {mode === "webgl" && (
        <Grainient
          className={styles.webgl}
          colors={MESH_COLORS}
          type="linear"
          angle={118}
          bands={1}
          speed={energized ? 1.9 : 0.85}
          flow={1.35}
          scale={1.55}
          softness={1}
          silk={0.12}
          grainAmount={compact ? 0.025 : 0.035}
          grainSize={1.2}
          grainAnimated={!compact}
          contrast={0.9}
          saturation={0.68}
          variation={2}
          interactive={false}
          clickSwirl={false}
          intro={false}
          dpr={compact ? 1 : 1.5}
        />
      )}
    </div>
  );
}
