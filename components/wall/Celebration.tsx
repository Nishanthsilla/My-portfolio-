"use client";

import { useEffect, useRef } from "react";
import { StickerArt } from "@/lib/wall/stickers";
import w from "./wall.module.css";

/**
 * After a note is posted: the "happy happy happy" cat hops around the screen
 * to its song, with a small card and a "See your note" button.
 *
 * The cat and its song are supplied by Nishanth. Put them at
 *   /public/images/wall/happy-cat.webp   (animated, background removed)
 *   /public/audio/sfx/happy-cat.mp3
 * and set HAPPY_CAT to true. Until then the card shows on its own, silently.
 */
const HAPPY_CAT = false;

export default function Celebration({ offline, onSee }: { offline: boolean; onSee: () => void }) {
  const song = useRef<HTMLAudioElement | null>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btn.current?.focus();
    if (!HAPPY_CAT || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = new Audio("/audio/sfx/happy-cat.mp3");
    a.volume = 0.7;
    void a.play().catch(() => {}); // posting was a click, so the browser allows it
    song.current = a;
    return () => {
      // fade out when the card closes
      const s = song.current;
      if (!s) return;
      const t = window.setInterval(() => {
        s.volume = Math.max(0, s.volume - 0.1);
        if (s.volume <= 0.01) {
          s.pause();
          window.clearInterval(t);
        }
      }, 40);
    };
  }, []);

  return (
    <>
      {HAPPY_CAT && (
        <div className={w.catStage} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={w.happyCat} src="/images/wall/happy-cat.webp" alt="" />
        </div>
      )}
      <div className={`${w.sent} ${w.toast}`} role="status">
        {!HAPPY_CAT && <StickerArt id="gif-party" size={72} />}
        <h2>Stuck it on the wall!</h2>
        <p>
          {offline
            ? "Thanks for leaving a little something! This copy of the site isn't connected, so it's saved on this device only."
            : "Thanks for leaving a little something. It means a lot."}
        </p>
        <button ref={btn} type="button" className={w.btnPrimary} onClick={onSee}>
          See your note <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  );
}
