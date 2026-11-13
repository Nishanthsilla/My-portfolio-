"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import StickerPeel from "./reactbits/StickerPeel";
import s from "./easter.module.css";

const KEY = "nishanth.sticker.found";
const noop = () => () => {};
const smallQuery = "(max-width: 600px)";
const subscribeSmall = (cb: () => void) => {
  const mq = matchMedia(smallQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const wasFound = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Homepage-only Easter egg: React Bits Sticker Peel (matte #FF4938 die-cut,
 * "PSSST! YOU FOUND ME."). Peel it away to reveal a note; it springs back home.
 * Idle = no animation at all. Keyboard: focus it and press Enter.
 */
export default function EasterSticker() {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const small = useSyncExternalStore(subscribeSmall, () => matchMedia(smallQuery).matches, () => false);
  const remembered = useSyncExternalStore(noop, wasFound, () => false);
  const [found, setFound] = useState(false);
  const [hover, setHover] = useState(false);
  const control = useRef<{ toss: (vx: number, vy: number) => void } | null>(null);
  const shown = found || remembered;
  const W = small ? 104 : 124;
  const anchor = { right: small ? 20 : 36, bottom: small ? 24 : 32 };

  const reveal = () => {
    setFound(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <div className={s.zone} aria-label="A sticker">
      {/* the note underneath */}
      <div className={`${s.note} ${shown ? s.noteOn : ""}`} style={{ right: anchor.right + W + 20, bottom: anchor.bottom + 12 }} aria-live="polite">
        {shown && (
          <>
            <p>Curiosity looks good on you.</p>
            <a href="#contact" className={s.hello}>
              Say hello <span aria-hidden="true">→</span>
            </a>
          </>
        )}
      </div>
      {isClient && (
        <StickerPeel
          imageSrc="/images/easter/sticker.png"
          width={W}
          rotate={-7}
          finish="matte"
          backColor="#F3EDE7"
          lightingIntensity={0.28}
          shadowIntensity={0.42}
          peelBackHoverPct={16}
          peelBackActivePct={34}
          curlRadius={10}
          swing={1}
          friction={0.4}
          bounce={0.35}
          intro={false}
          anchor={anchor}
          snapBack
          controlRef={control}
          onHoverChange={setHover}
          onPeelAway={reveal}
        />
      )}
      <span className={`${s.hint} ${hover && !shown ? s.hintOn : ""}`} style={{ right: anchor.right, bottom: anchor.bottom + W + 14 }} aria-hidden="true">
        Something&apos;s hiding here.
      </span>
      {/* keyboard access: a focusable target over the sticker (pointer events pass through to the sticker) */}
      <button
        type="button"
        className={s.keyTarget}
        style={{ right: anchor.right, bottom: anchor.bottom, width: W, height: W }}
        aria-label="Peel the sticker"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            control.current?.toss(-1400, -500);
            reveal();
          }
        }}
      />
    </div>
  );
}
