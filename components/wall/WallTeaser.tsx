"use client";

import { useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { StickerArt } from "@/lib/wall/stickers";
import WallApp from "./WallApp";
import w from "./wall.module.css";

/** Decorative stickers for the teaser (no messages — decoration only). */
const DECOR: { id: string; x: number; y: number; r: number; s: number }[] = [
  { id: "heart-eyes", x: 8, y: 16, r: -12, s: 60 },
  { id: "wave", x: 24, y: 60, r: 8, s: 58 },
  { id: "heart", x: 41, y: 22, r: 10, s: 54 },
  { id: "blossom", x: 58, y: 58, r: -6, s: 58 },
  { id: "star-struck", x: 75, y: 14, r: 6, s: 56 },
  { id: "fire", x: 86, y: 58, r: -14, s: 52 },
  { id: "sparkles", x: 51, y: 4, r: 0, s: 34 },
  { id: "party", x: 6, y: 72, r: -8, s: 52 },
];

const subscribe = (cb: () => void) => {
  addEventListener("hashchange", cb);
  return () => removeEventListener("hashchange", cb);
};

/**
 * "Leave a little something." — the homepage entry to The Wall, just before the
 * footer. The wall opens as a full-screen layer over the homepage with its own
 * history entry (#the-wall), so Back — browser, phone gesture or the × — closes
 * it and leaves the visitor exactly where they were.
 */
export default function WallTeaser() {
  const hash = useSyncExternalStore(subscribe, () => location.hash, () => "");
  const open = hash.startsWith("#the-wall");
  const pushed = useRef(false);

  const openWall = (compose: boolean) => {
    pushed.current = true;
    location.hash = compose ? "the-wall/note" : "the-wall";
  };
  const close = () => {
    if (pushed.current) {
      pushed.current = false;
      history.back(); // removes the #the-wall entry: back to the homepage, same scroll
    } else {
      // arrived on a #the-wall link: drop the fragment without leaving the page
      history.replaceState(history.state, "", location.pathname + location.search);
      dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  return (
    <section className={w.teaser} aria-labelledby="wall-title">
      <div className={w.teaserInner}>
        <div className={w.teaserCopy}>
          <p className={w.eyebrow}>The Wall</p>
          <h2 id="wall-title" className={w.teaserTitle}>Leave a little something.</h2>
          <p className={w.teaserLine}>A thought, a note, or just a little sticker. I&apos;d love to see what you leave.</p>
          <div className={w.teaserActions}>
            <button type="button" className={w.btnPrimary} onClick={() => openWall(true)}>Leave a note</button>
            <button type="button" className={w.btnGhost} onClick={() => openWall(false)}>
              Explore the wall <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <button type="button" className={w.teaserBoard} onClick={() => openWall(false)} aria-label="Explore the wall">
          {DECOR.map((d, i) => (
            <span key={i} className={w.teaserSticker} style={{ left: `${d.x}%`, top: `${d.y}%`, transform: `rotate(${d.r}deg)` }}>
              <StickerArt id={d.id} size={d.s} />
            </span>
          ))}
        </button>
      </div>
      {open && createPortal(<WallApp onClose={close} compose={hash === "#the-wall/note"} />, document.body)}
    </section>
  );
}
