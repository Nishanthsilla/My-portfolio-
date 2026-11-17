"use client";

import { usePathname } from "next/navigation";
import AskPanel from "./ask/AskPanel";
import MusicToggle from "./MusicToggle";
import Oneko from "./Oneko";
import s from "./site.module.css";

/**
 * Site-wide widgets (the chat sticker, the music button, the pixel cat),
 * mounted once in the root layout. Inside a page they were duplicated: the
 * router keeps the previous page alive in the background, which meant two
 * stickers, two cats and potentially two music players. The full-screen
 * wall pages have their own controls, so they're left out there.
 */
export default function GlobalWidgets({ face }: { face: string | null }) {
  const path = usePathname() ?? "/";
  if (path.startsWith("/wall")) return null;
  return (
    // display: contents keeps the site's colour and type tokens without adding a box
    <div className={s.site} style={{ display: "contents" }}>
      <Oneko />
      <MusicToggle />
      <AskPanel face={face} />
    </div>
  );
}
