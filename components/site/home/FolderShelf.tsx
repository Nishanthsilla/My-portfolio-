"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import Folder from "../reactbits/Folder";
import FolderFloat from "../reactbits/FolderFloat";
import { explorations, photography } from "@/lib/site/about";
import { folders } from "@/lib/site/home";
import { peekHome, rememberHome, type FolderId } from "@/lib/site/returnTo";
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
 * Two folders, two different experiences:
 *  · Beyond the Interface — React Bits Folder Float: the explorations spring
 *    out as notes; a note opens that exploration, the folder opens the journal.
 *  · Photography — React Bits Folder: photographs fan out; a photo or the
 *    folder opens the gallery.
 * Mouse: hover opens, click enters. Touch: first tap opens, second tap enters.
 * Keyboard: each folder has a labelled link next to it.
 */
export default function FolderShelf() {
  const router = useRouter();
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const canHover = useSyncExternalStore(subFine, () => matchMedia(fine).matches, () => true);
  const small = useSyncExternalStore(subSmall, () => matchMedia("(max-width: 640px)").matches, () => false);
  // the folder the visitor came back from stays open
  const back = useSyncExternalStore(noop, () => peekHome()?.folder ?? null, () => null);
  const [photoOpen, setPhotoOpen] = useState(false);

  const enter = (id: FolderId, href: string) => {
    rememberHome(id);
    router.push(href);
  };

  return (
    <section className={h.shelf} aria-labelledby="shelf-title">
      <div className={h.shelfHead}>
        <p className={h.eyebrow}>Beyond the work</p>
        <h2 id="shelf-title" className={h.h2}>Two folders worth opening.</h2>
      </div>
      <div className={h.shelfGrid}>
        {/* Beyond the Interface */}
        <article className={h.folderCard}>
          <div className={h.folderObject}>
            {isClient && (
              <FolderFloat
                items={explorations.map((x) => ({ label: x.title, value: x.slug }))}
                label={folders.beyond.title}
                sublabel={`${explorations.length} explorations`}
                trigger={canHover ? "hover" : "click"}
                defaultOpen={back === "beyond"}
                closeOnSelect={false}
                drift={0.35}
                folderColor="#2A2A28"
                frontColor="#3A3936"
                paperColor="#F4F1EA"
                itemColor="#FFFFFF"
                itemTextColor="#222222"
                labelColor="#FAFAF7"
                width={small ? 190 : 230}
                height={small ? 140 : 168}
                spread={small ? 150 : 200}
                lift={30}
                bounce={0.2}
                onSelect={(slug) => enter("beyond", `${folders.beyond.href}#${slug}`)}
                onFolderClick={(open, openIt) => (canHover || open ? enter("beyond", folders.beyond.href) : openIt())}
              />
            )}
          </div>
          <div className={h.folderText}>
            <h3 className={h.folderTitle}>{folders.beyond.title}</h3>
            <p className={h.folderDesc}>{folders.beyond.description}</p>
            <Link className={h.folderLink} href={folders.beyond.href} onClick={() => rememberHome("beyond")}>
              Open the journal <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>

        {/* Photography */}
        <article className={h.folderCard}>
          <div
            className={h.folderObject}
            // mouse: hover opens, a click enters · touch: the first tap opens, the next enters
            onClickCapture={(e) => {
              if ((e.target as HTMLElement).closest("[data-folder-item]")) return;
              if (canHover || photoOpen) {
                e.preventDefault();
                e.stopPropagation();
                enter("photography", folders.photography.href);
              }
            }}
          >
            {isClient && (
              <Folder
                items={photography.folderPick.map((k) => ({ image: photography.photos[k].thumb, alt: photography.photos[k].alt }))}
                label={folders.photography.title}
                openOn={canHover ? "hover" : "click"}
                defaultOpen={back === "photography"}
                onOpenChange={setPhotoOpen}
                onItemClick={(_, i) => enter("photography", `${folders.photography.href}?photo=${photography.folderPick[i] + 1}`)}
                variant="matte"
                theme="light"
                color="#FF4938"
                paperColor="#FFFFFF"
                tabPosition="left"
                layout="spread"
                size={small ? 0.7 : 1}
                zoomOnClick={false}
                closeOnOutsideClick
              />
            )}
          </div>
          <div className={h.folderText}>
            <h3 className={h.folderTitle}>{folders.photography.title}</h3>
            <p className={h.folderDesc}>{folders.photography.description}</p>
            <Link className={h.folderLink} href={folders.photography.href} onClick={() => rememberHome("photography")}>
              Open the gallery <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
