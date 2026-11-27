import type { CSSProperties, ReactNode, RefObject } from "react";

/** React Bits Glass Surface (liquid glass). Types for the vendored GlassSurface.jsx. */
export interface GlassSurfaceProps {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  mixBlendMode?: CSSProperties["mixBlendMode"];
  refraction?: boolean;
  renderer?: "auto" | "svg" | "webgl" | "fallback";
  backdrop?: HTMLElement | RefObject<HTMLElement | null> | string | null;
  shape?: string;
  className?: string;
  style?: CSSProperties;
}
declare const GlassSurface: (props: GlassSurfaceProps) => React.JSX.Element;
export default GlassSurface;
