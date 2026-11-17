"use client";

import { useEffect, useRef } from "react";
import { StickerArt } from "@/lib/wall/stickers";
import w from "./wall.module.css";

/**
 * After a note is posted: a small card with the "happy happy happy" cat dancing
 * inside it (to its song), one line of thanks and a "See your note" button.
 *
 * The cat (cut out of a green-screen clip, an animated WebP with a see-through
 * background: /public/images/wall/happy-cat.webp) and its song
 * (/public/audio/sfx/happy-cat.mp3) were supplied by Nishanth. The song loops
 * while the card is open and fades out when it closes.
 */
const HAPPY_CAT = true;

export default function Celebration({ offline, onSee }: { offline: boolean; onSee: () => void }) {
  const song = useRef<HTMLAudioElement | null>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btn.current?.focus();
    if (!HAPPY_CAT || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = new Audio("/audio/sfx/happy-cat.mp3");
    a.volume = 0.7;
    a.loop = true;
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
    <div className={`${w.sent} ${w.toast}`} role="status">
      {HAPPY_CAT ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={w.happyCat} src="/images/wall/happy-cat.webp" alt="" />
      ) : (
        <StickerArt id="gif-party" size={72} />
      )}
      <p className={w.sentLine}>
        {offline
          ? "Stuck on the wall, saved on this device only (this copy of the site isn't connected)."
          : "Stuck it on the wall! Thanks for leaving a little something."}
      </p>
      <button ref={btn} type="button" className={w.btnPrimary} onClick={onSee}>
        See your note <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
