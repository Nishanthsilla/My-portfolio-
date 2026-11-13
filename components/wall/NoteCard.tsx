import { noteColor, StickerArt } from "@/lib/wall/stickers";
import w from "./wall.module.css";

/** One note as it appears on the wall: the sticker, and a paper card with the message and name (always plain text). */
export default function NoteCard({
  sticker,
  message,
  name,
  tag,
  ghost = false,
  size = 58,
}: {
  sticker: string;
  message?: string;
  name?: string;
  tag?: string;
  ghost?: boolean;
  size?: number;
}) {
  return (
    <div className={`${w.note} ${ghost ? w.noteGhost : ""}`}>
      <span className={w.noteSticker}>
        <StickerArt id={sticker} size={size} />
      </span>
      {(message || ghost) && (
        <div className={w.notePaper} style={{ background: noteColor(sticker) }}>
          {tag && <span className={w.noteTag}>{tag}</span>}
          <p className={w.noteMsg}>{message || "Your note goes here"}</p>
          {(name || ghost) && <p className={w.noteName}>— {name || "your name"}</p>}
        </div>
      )}
    </div>
  );
}
