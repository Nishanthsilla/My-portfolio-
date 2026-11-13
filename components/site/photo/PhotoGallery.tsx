"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import CircularGallery from "../reactbits/CircularGallery";
import { photography } from "@/lib/site/about";
import g from "./photo.module.css";

const noop = () => () => {};
const smallQ = "(max-width: 640px)";
const subSmall = (cb: () => void) => {
  const mq = matchMedia(smallQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Photography as an immersive, endless gallery (React Bits Circular Gallery):
 * drag, scroll or use the arrow keys; click or press Enter to open a photograph
 * full size (Esc closes). ?photo=N opens that photograph on arrival.
 */
export default function PhotoGallery() {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const small = useSyncExternalStore(subSmall, () => matchMedia(smallQ).matches, () => false);
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const photos = photography.photos;

  // arriving from a photo in the folder: open that photograph
  useEffect(() => {
    const n = Number(new URLSearchParams(location.search).get("photo"));
    if (!n || n < 1 || n > photos.length) return;
    let tries = 0;
    const t = window.setInterval(() => {
      const btn = stage.current?.querySelector<HTMLButtonElement>(`button[aria-label$=", ${n} of ${photos.length}"]`);
      if (btn || ++tries > 40) window.clearInterval(t);
      if (btn) window.setTimeout(() => btn.click(), 650);
    }, 100);
    return () => window.clearInterval(t);
  }, [photos.length]);

  return (
    <div ref={stage} className={g.stage}>
      {isClient && (
        <CircularGallery
          items={photos.map((p, i) => ({ image: p.src, alt: p.alt, text: String(i + 1).padStart(2, "0") }))}
          bend={small ? 1.2 : 2.2}
          itemSize={small ? 1.15 : 1}
          itemAspect={0.74}
          gap={small ? 0.18 : 0.22}
          borderRadius={0.04}
          textColor="#FAFAF7"
          font={`500 15px ${"Geist Mono, ui-monospace, monospace"}`}
          fadeEdges={0.14}
          shadow={0.35}
          scrollSpeed={2.2}
          scrollEase={0.06}
          showTitles={false}
          snap
          openOnClick
          onActiveChange={setActive}
          className={g.gallery}
        />
      )}
      <div className={g.overlay} aria-hidden="true">
        <span className={g.count}>
          {String(active + 1).padStart(2, "0")} <i>/</i> {String(photos.length).padStart(2, "0")}
        </span>
        <span className={g.hint}>{small ? "Swipe · tap to open" : "Drag, scroll or ← → · click to open"}</span>
      </div>
    </div>
  );
}
