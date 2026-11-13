import Link from "next/link";
import { StickerArt } from "@/lib/wall/stickers";
import w from "./wall.module.css";

/** Decorative stickers for the teaser (no messages — decoration only). */
const DECOR: { id: string; x: number; y: number; r: number; s: number }[] = [
  { id: "star", x: 8, y: 18, r: -12, s: 64 },
  { id: "hi", x: 22, y: 62, r: 8, s: 78 },
  { id: "heart", x: 40, y: 22, r: 10, s: 58 },
  { id: "flower", x: 58, y: 58, r: -6, s: 70 },
  { id: "smiley", x: 76, y: 16, r: 6, s: 62 },
  { id: "arrow", x: 86, y: 60, r: -14, s: 64 },
  { id: "sparkle", x: 50, y: 6, r: 0, s: 36 },
  { id: "wow", x: 4, y: 74, r: -8, s: 70 },
];

/** "Leave a little something." — the homepage entry to The Wall, just before the footer. */
export default function WallTeaser() {
  return (
    <section className={w.teaser} aria-labelledby="wall-title">
      <div className={w.teaserInner}>
        <div className={w.teaserCopy}>
          <p className={w.eyebrow}>The Wall</p>
          <h2 id="wall-title" className={w.teaserTitle}>Leave a little something.</h2>
          <p className={w.teaserLine}>A thought, a note, or just a little sticker. I&apos;d love to see what you leave.</p>
          <div className={w.teaserActions}>
            <Link className={w.btnPrimary} href="/wall?compose=1">Leave a note</Link>
            <Link className={w.btnGhost} href="/wall">Explore the wall <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <Link href="/wall" className={w.teaserBoard} aria-label="Explore the wall">
          {DECOR.map((d, i) => (
            <span key={i} className={w.teaserSticker} style={{ left: `${d.x}%`, top: `${d.y}%`, transform: `rotate(${d.r}deg)`, animationDelay: `${i * 60}ms` }}>
              <StickerArt id={d.id} size={d.s} />
            </span>
          ))}
        </Link>
      </div>
    </section>
  );
}
