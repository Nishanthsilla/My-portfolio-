"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHashLayer } from "@/components/site/home/useHashLayer";
import WallApp from "./WallApp";
import w from "./wall.module.css";

const EASE = "cubic-bezier(0.7, 0, 0.2, 1)";

/**
 * Scene 4 of the homepage journey: The Wall, live, beside its heading and two
 * actions — "Add a note" and "Explore canvas". Either one grows the canvas out
 * of its place into full screen (its own history entry: Back, or "Back to
 * portfolio", shrinks it back into the scene).
 */
export default function WallScene() {
  const { hash, open, close } = useHashLayer();
  const full = hash.startsWith("the-wall");
  const [mounted, setMounted] = useState(false);
  const [gen, setGen] = useState(0); // remount the embedded wall after full screen (it re-reads the visitor's layout)
  const slot = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  // the scene's canvas, as a clip-path inset of the whole screen
  const from = () => {
    const r = slot.current?.getBoundingClientRect();
    if (!r || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return "inset(18% 18% 18% 18% round 22px)";
    return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 22px)`;
  };
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follows the URL (#the-wall)
    if (full) setMounted(true);
  }, [full]);

  // open: grow out of the scene
  useLayoutEffect(() => {
    if (!mounted || !layer.current || calm()) return;
    layer.current.animate([{ clipPath: from() }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], { duration: 640, easing: EASE });
  }, [mounted]);

  // close: shrink back into the scene, then go
  useEffect(() => {
    if (full || !mounted) return;
    const el = layer.current;
    const done = () => {
      setMounted(false);
      setGen((g) => g + 1);
    };
    if (!el || calm()) return done();
    const a = el.animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: from() }], { duration: 540, easing: EASE, fill: "forwards" });
    a.onfinish = done;
    return () => a.cancel();
  }, [full, mounted]);

  return (
    <section className={w.scene} aria-labelledby="wall-scene-title">
      <div className={w.sceneHead}>
        <p className={w.eyebrow}>The Wall</p>
        <h2 id="wall-scene-title" className={w.sceneTitle}>Leave a little something.</h2>
        <p className={w.sceneLine}>A thought, a note, or just a little sticker. I&apos;d love to see what you leave.</p>
        <div className={w.sceneActions}>
          <button type="button" className={w.btnPrimary} onClick={() => open("the-wall/note")}>
            Add a note
          </button>
          <button type="button" className={w.btnGhost} onClick={() => open("the-wall")}>
            Explore canvas <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
      <div ref={slot} className={w.sceneWall}>
        <WallApp key={gen} embedded onExpand={() => open("the-wall")} onCompose={() => open("the-wall/note")} />
      </div>
      {mounted &&
        createPortal(
          <div ref={layer} className={w.fullLayer}>
            <WallApp onClose={close} compose={hash === "the-wall/note"} />
          </div>,
          document.body,
        )}
    </section>
  );
}
