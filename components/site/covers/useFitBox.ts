"use client";

import { useEffect, useState } from "react";

/** The content box (padding left out) of the element's parent, so a scene can fit inside it without being cut. */
export function useFitBox(ref: React.RefObject<HTMLElement | null>) {
  const [b, setB] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const fit = () => {
      const cs = getComputedStyle(el);
      setB({ w: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), h: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return b;
}
