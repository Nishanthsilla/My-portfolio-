"use client";

import { useRouter } from "next/navigation";
import { useContext, useSyncExternalStore } from "react";
import FolderFloat from "../reactbits/FolderFloat";
import { explorations, photography } from "@/lib/site/about";
import { folders } from "@/lib/site/home";
import { peekHome, rememberHome, type FolderId } from "@/lib/site/returnTo";
import GyroCursor from "./GyroCursor";
import { JourneyContext } from "./journeyContext";
import h from "./home.module.css";

const noop = () => () => {};
const fine = "(hover: hover) and (pointer: fine)";
const subFine = (cb: () => void) => {
  const mq = matchMedia(fine);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const subSmall = (cb: () => void) => {
  const mq = matchMedia("(max-width: 640px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Two folders, one component (React Bits Folder Float), two contents:
 *  · Beyond the Interface — the explorations spring out as notes;
 *  · Photography — a handful of photographs spring out as small prints.
 * Mouse: hover opens, and a gyroscope cursor says what a click does
 * ("View projects" / "View gallery"); a note or print opens that item.
 * Touch: the first tap opens, the next enters. Keyboard: the folder is a
 * button (Enter opens it), then each note / print is a button.
 */
export default function FolderShelf() {
  const router = useRouter();
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const canHover = useSyncExternalStore(subFine, () => matchMedia(fine).matches, () => true);
  const small = useSyncExternalStore(subSmall, () => matchMedia("(max-width: 640px)").matches, () => false);
  // the folder the visitor came back from stays open
  const back = useSyncExternalStore(noop, () => peekHome()?.folder ?? null, () => null);
  const journey = useContext(JourneyContext);

  // inside the homepage journey: open the folder's sheet below; elsewhere: its page
  const enter = (id: FolderId, href: string, photo?: number) => {
    if (journey) return journey.openBranch(id, photo);
    rememberHome(id);
    router.push(href);
  };

  // the same folder, sized for the screen
  const size = small ? { width: 180, height: 132, spread: 150, lift: 26 } : { width: 214, height: 156, spread: 210, lift: 28 };
  const shared = {
    trigger: (canHover ? "hover" : "click") as "hover" | "click",
    closeOnSelect: false,
    drift: 0.35,
    paperColor: "#F4F1EA",
    itemColor: "#FFFFFF",
    itemTextColor: "#222222",
    labelColor: "#FAFAF7",
    bounce: 0.2,
    ...size,
  };

  return (
    <section className={h.shelf} aria-labelledby="shelf-title">
      <div className={h.shelfHead}>
        <p className={h.eyebrow}>Beyond the work</p>
        <h2 id="shelf-title" className={h.h2}>Two folders worth opening.</h2>
      </div>
      <div className={h.shelfGrid}>
        <article className={h.folderCard}>
          <GyroCursor label="View projects" className={h.folderObject}>
            {isClient && (
              <FolderFloat
                {...shared}
                items={explorations.map((x) => ({ label: x.title, value: x.slug }))}
                label={folders.beyond.title}
                sublabel={`${explorations.length} explorations`}
                defaultOpen={back === "beyond"}
                folderColor="#2A2A28"
                frontColor="#3A3936"
                onSelect={(slug) => enter("beyond", `${folders.beyond.href}#${slug}`)}
                onFolderClick={(open, openIt) => (canHover || open ? enter("beyond", folders.beyond.href) : openIt())}
              />
            )}
          </GyroCursor>
          <div className={h.folderText}>
            <h3 className={h.folderTitle}>{folders.beyond.title}</h3>
            <p className={h.folderDesc}>{folders.beyond.description}</p>
          </div>
        </article>

        <article className={h.folderCard}>
          <GyroCursor label="View gallery" className={h.folderObject}>
            {isClient && (
              <FolderFloat
                {...shared}
                items={photography.folderPick.map((k) => ({ label: `Open ${photography.photos[k].alt}`, value: String(k + 1), image: photography.photos[k].thumb }))}
                label={folders.photography.title}
                sublabel={`${photography.photos.length} photographs`}
                defaultOpen={back === "photography"}
                folderColor="#D9301F"
                frontColor="#FF4938"
                onSelect={(n) => enter("photography", `${folders.photography.href}?photo=${n}`, Number(n))}
                onFolderClick={(open, openIt) => (canHover || open ? enter("photography", folders.photography.href) : openIt())}
              />
            )}
          </GyroCursor>
          <div className={h.folderText}>
            <h3 className={h.folderTitle}>{folders.photography.title}</h3>
            <p className={h.folderDesc}>{folders.photography.description}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
