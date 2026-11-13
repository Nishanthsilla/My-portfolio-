import { fontById } from "@/lib/wall/fonts";
import { paperOf } from "@/lib/wall/notes";
import { StickerArt, isGiphy } from "@/lib/wall/stickers";
import w from "./wall.module.css";

/**
 * One note on the wall: a sticky note in the shape and paper colour its writer
 * picked — a small "Hello! I stopped by to say" at the top, their message in
 * the handwriting they chose, their name at the bottom, and their animated
 * sticker or GIF stuck on the corner. Everything is plain text.
 */
export default function NoteCard({
  sticker,
  message,
  name,
  font,
  shape = "square",
  color = "yellow",
  ghost = false,
}: {
  sticker: string;
  message?: string;
  name?: string;
  font?: string;
  shape?: string;
  color?: string;
  ghost?: boolean;
}) {
  const f = fontById(font);
  const text = message || "Your note goes here";
  // longer notes get smaller handwriting so they always fit
  const base = text.length <= 32 ? 19 : text.length <= 70 ? 15.5 : text.length <= 105 ? 13.5 : 12;
  return (
    <div className={`${w.note} ${ghost ? w.noteGhost : ""}`} data-shape={shape}>
      <div className={w.paper} style={{ ["--paper" as string]: paperOf(color) }}>
        <p className={w.hi}>Hello! I stopped by to say</p>
        <p className={w.noteMsg} style={{ fontFamily: f.family, fontWeight: f.weight ?? 400, fontSize: base * f.scale }}>
          {text}
        </p>
        <p className={w.noteName}>— {name || "your name"}</p>
      </div>
      {shape === "square" && <span className={w.tape} aria-hidden="true" />}
      <span className={`${w.tagSticker} ${isGiphy(sticker) ? w.tagGif : ""}`}>
        <StickerArt id={sticker} size={isGiphy(sticker) ? 70 : 42} />
      </span>
    </div>
  );
}
