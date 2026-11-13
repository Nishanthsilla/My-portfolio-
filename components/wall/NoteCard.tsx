import { fontById } from "@/lib/wall/fonts";
import { StickerArt } from "@/lib/wall/stickers";
import w from "./wall.module.css";

/**
 * One note on the wall: a die-cut "HELLO" name-tag sticker. The red band says
 * hello, the visitor's emoji or animated sticker sits inside it, the message is
 * written in the white band in the handwriting they picked, and their name is
 * signed along the bottom. Everything is plain text.
 */
export default function NoteCard({
  sticker,
  message,
  name,
  font,
  tag,
  ghost = false,
}: {
  sticker: string;
  message?: string;
  name?: string;
  font?: string;
  tag?: string;
  ghost?: boolean;
}) {
  const f = fontById(font);
  const text = message || "Your note goes here";
  // longer notes get smaller handwriting so the tag never overflows
  const base = text.length <= 32 ? 22 : text.length <= 70 ? 18 : text.length <= 105 ? 15.5 : 14;
  return (
    <div className={`${w.note} ${ghost ? w.noteGhost : ""}`}>
      {tag && <span className={w.noteTag}>{tag}</span>}
      <div className={w.tagTop}>
        <span className={w.tagHello}>HELLO</span>
        <span className={w.tagSub}>I stopped by to say</span>
        <span className={w.tagSticker}>
          <StickerArt id={sticker} size={54} />
        </span>
      </div>
      <p className={w.noteMsg} style={{ fontFamily: f.family, fontWeight: f.weight ?? 400, fontSize: base * f.scale }}>
        {text}
      </p>
      <p className={w.tagBottom}>
        <span className={w.noteName}>— {name || "your name"}</span>
      </p>
    </div>
  );
}
