"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { warmNotify } from "@/lib/sound/notify";
import AskPanel from "./ask/AskPanel";
import MusicToggle from "./MusicToggle";
import s from "./site.module.css";

/**
 * Site-wide widgets (the chat sticker, the music button),
 * mounted once in the root layout. Inside a page they were duplicated: the
 * router keeps the previous page alive in the background, which meant two
 * stickers and potentially two music players. The wall, full
 * screen, has its own controls, so they're left out there.
 */
export default function GlobalWidgets({ face }: { face: string | null }) {
  const path = usePathname() ?? "/";
  // the wall full screen (#the-wall) has its own bottom bar: keep these out of its way
  const onWall = useSyncExternalStore(
    (cb) => {
      addEventListener("hashchange", cb);
      return () => removeEventListener("hashchange", cb);
    },
    () => location.hash.startsWith("#the-wall"),
    () => false,
  );
  const hide = path.startsWith("/wall") || path.startsWith("/admin") || path.startsWith("/access-admin") || onWall;
  // the sound effects' audio is set up as the site loads, so the first tap anywhere unlocks it
  useEffect(() => warmNotify(), []);
  return (
    // display: contents keeps the site's colour and type tokens without adding a box
    <div className={s.site} style={{ display: "contents" }}>
      {/* the music keeps playing; only its button steps aside (unmounting would start a second player) */}
      <MusicToggle hidden={hide} />
      {!hide && <AskPanel face={face} />}
    </div>
  );
}
