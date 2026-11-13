"use client";

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import TargetCursor from "./reactbits/TargetCursor";

const fine = "(hover: hover) and (pointer: fine)";
const subscribe = (cb: () => void) => {
  const mq = matchMedia(fine);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * React Bits Target Cursor, scoped to one area (the project grid): inside it the
 * corner brackets lock onto the hovered project; everywhere else the normal
 * cursor stays. No spin, mouse devices only.
 */
export default function CursorScope({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribe, () => matchMedia(fine).matches, () => false);
  return (
    <div ref={ref}>
      {children}
      {enabled && (
        <TargetCursor
          container={ref}
          targetSelector=".cursor-target"
          cursorColor="#FF4938"
          blendMode="normal"
          spinDuration={0}
          size={22}
          cornerSize={9}
          thickness={2}
          padding={10}
          dotSize={5}
          parallaxOn={false}
          clickEffect
          showLabel
        />
      )}
    </div>
  );
}
