"use client";

import { useState, useSyncExternalStore } from "react";
import Folder from "./reactbits/Folder";
import PhotoViewer from "./PhotoViewer";
import { photography } from "@/lib/site/about";
import s from "./beyond.module.css";

const hoverQuery = "(hover: hover) and (pointer: fine)";
const noop = () => () => {};
const subscribeSmall = (cb: () => void) => {
  const mq = matchMedia("(max-width: 600px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const subscribe = (cb: () => void) => {
  const mq = matchMedia(hoverQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Photography: the React Bits Folder (opens on hover with a mouse, on tap on
 * touch screens) holds a curated six; every photograph is in the grid below.
 * Clicking any photo opens the viewer at that photo.
 */
export default function PhotoFolder() {
  const canHover = useSyncExternalStore(subscribe, () => matchMedia(hoverQuery).matches, () => true);
  // the Folder computes its colours with a canvas, so it renders in the browser only
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const small = useSyncExternalStore(subscribeSmall, () => matchMedia("(max-width: 600px)").matches, () => false);
  const [viewing, setViewing] = useState<number | null>(null);
  const photos = photography.photos;
  const picks = photography.folderPick.map((k) => photos[k]);
  return (
    <>
      <div className={s.folderStage}>
        {isClient && <Folder
          items={picks.map((p) => ({ image: p.thumb, alt: p.alt }))}
          label={photography.label}
          openOn={canHover ? "hover" : "click"}
          variant="matte"
          theme="light"
          color="#FF4938"
          paperColor="#FFFFFF"
          tabPosition="left"
          layout="spread"
          size={small ? 0.64 : 1.05}
          zoomOnClick={false}
          draggable={false}
          tilt={0.35}
          bounce={0.25}
          onItemClick={(_, i) => setViewing(photography.folderPick[i])}
        />}
      </div>
      <p className={s.folderHint}>{canHover ? "Hover the folder to open it · click a photo to view it" : "Tap the folder to open it · tap a photo to view it"}</p>

      <div className={s.gallery}>
        {photos.map((p, i) => (
          <button key={p.src} type="button" className={s.thumb} onClick={() => setViewing(i)} aria-label={`Open photograph ${i + 1} of ${photos.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      {viewing !== null && <PhotoViewer photos={photos} index={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
