"use client";

import { createPortal } from "react-dom";
import { useHashLayer } from "@/components/site/home/useHashLayer";
import WallApp from "./WallApp";
import w from "./wall.module.css";

/**
 * Scene 4 of the homepage journey: The Wall itself, live — approved notes,
 * the sticker toolbar and the composer, right in the scene. The expand button
 * opens it full screen (its own history entry: Back returns to the scene).
 */
export default function WallScene() {
  const { hash, open, close } = useHashLayer();
  const full = hash.startsWith("the-wall");
  return (
    <section className={w.scene} aria-labelledby="wall-scene-title">
      <div className={w.sceneHead}>
        <p className={w.eyebrow}>The Wall</p>
        <h2 id="wall-scene-title" className={w.sceneTitle}>Leave a little something.</h2>
        <p className={w.sceneLine}>A thought, a note, or just a little sticker. I&apos;d love to see what you leave.</p>
      </div>
      <div className={w.sceneWall}>{!full && <WallApp embedded onExpand={() => open("the-wall")} />}</div>
      {full && createPortal(<WallApp onClose={close} compose={hash === "the-wall/note"} />, document.body)}
    </section>
  );
}
