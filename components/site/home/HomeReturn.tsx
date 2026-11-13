"use client";

import { useEffect } from "react";
import { onIntroDone } from "@/lib/introState";
import { forgetHome, peekHome } from "@/lib/site/returnTo";

/** Restores the homepage scroll position after returning from a folder page (once the intro, if any, is done). */
export default function HomeReturn() {
  useEffect(() => {
    const spot = peekHome();
    if (!spot) return;
    return onIntroDone(() => {
      const go = () => {
        scrollTo({ top: spot.y, behavior: "instant" as ScrollBehavior });
        forgetHome();
      };
      // after layout settles (fonts, folders measuring themselves)
      requestAnimationFrame(() => requestAnimationFrame(go));
    });
  }, []);
  return null;
}
