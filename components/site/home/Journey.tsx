"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { onIntroDone } from "@/lib/introState";
import { SCENE_EVENT } from "../Header";
import ScrollHint from "./ScrollHint";
import GlyphEmbers from "./GlyphEmbers";
import { JourneyContext, type BranchId } from "./journeyContext";
import { useHashLayer } from "./useHashLayer";
import siteCss from "../site.module.css";
import h from "./home.module.css";

type Mode = "desktop" | "touch" | "stack";
const Q_REDUCE = "(prefers-reduced-motion: reduce)";
const Q_DESK = "(hover: hover) and (pointer: fine) and (min-width: 900px)";
const modeNow = (): Mode => (matchMedia(Q_REDUCE).matches ? "stack" : matchMedia(Q_DESK).matches ? "desktop" : "touch");
const subscribeMode = (cb: () => void) => {
  const a = matchMedia(Q_REDUCE), b = matchMedia(Q_DESK);
  a.addEventListener("change", cb);
  b.addEventListener("change", cb);
  return () => {
    a.removeEventListener("change", cb);
    b.removeEventListener("change", cb);
  };
};

const SCENES = [
  { id: "intro", label: "Intro" },
  { id: "work", label: "Work" },
  { id: "beyond", label: "Beyond" },
  { id: "wall", label: "Wall" },
  { id: "contact", label: "Contact" },
] as const;
const BRANCH_HASH: Record<BranchId, string> = { beyond: "beyond-the-interface", photography: "photography" };
const SAVE_KEY = "nishanth.home.journey";

/**
 * The homepage as one horizontal journey of five scenes —
 * intro → work → the two folders → The Wall → contact.
 *
 *  · Laptop (mouse/trackpad): scrolling down moves the journey sideways
 *    (a sticky frame + a track translated by the scroll position), settling
 *    gently at the start of a scene when scrolling pauses near one.
 *  · Phone/tablet: swipe sideways between scenes (native scroll snapping);
 *    a long scene scrolls up and down inside itself.
 *  · Reduced motion: the scenes simply stack vertically.
 *  · A folder opens its content in a sheet that slides up from below
 *    (its own history entry: Back / close returns to the same spot).
 */
export default function Journey({
  intro,
  work,
  folders,
  wall,
  contact,
  beyond,
  photography,
}: {
  intro: ReactNode;
  work: ReactNode;
  folders: ReactNode;
  wall: ReactNode;
  contact: ReactNode;
  beyond: ReactNode;
  photography: ReactNode;
}) {
  const mode = useSyncExternalStore(subscribeMode, modeNow, () => "desktop" as Mode);
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const goRef = useRef<(i: number, smooth?: boolean) => void>(() => {});

  const scenes = () => [...(track.current?.querySelectorAll<HTMLElement>("[data-scene]") ?? [])];

  /* ---------- laptop: vertical scroll drives the track sideways ---------- */
  useEffect(() => {
    const sec = section.current, fr = frame.current, tr = track.current;
    if (!sec || !fr || !tr) return;
    if (mode === "desktop") {
      /* Free scroll: the page moves sideways exactly as far as the visitor scrolls (wheel,
       * trackpad, keys, scrollbar), with a light smoothing. No page steps, no snapping. */
      let dist = 0, top = 0, target = 0, current = 0, raf = 0, shown = -1, moving = false;
      const measure = () => {
        // every full-width scene is exactly the visible frame (100vw would include the scrollbar)
        sec.style.setProperty("--jw", `${fr.clientWidth}px`);
        dist = Math.max(0, tr.scrollWidth - fr.clientWidth);
        // tall enough that the very end of the page reaches the very end of the track
        sec.style.height = `${dist + innerHeight}px`;
        top = sec.getBoundingClientRect().top + scrollY;
      };
      const pick = (x: number) => {
        const list = scenes();
        let i = 0;
        list.forEach((el, k) => {
          if (el.offsetLeft <= x + fr.clientWidth * 0.45) i = k;
        });
        if (i !== shown) {
          shown = i;
          setActive(i);
        }
      };
      const html = document.documentElement;
      const paint = () => {
        raf = 0;
        current += (target - current) * 0.26;
        if (Math.abs(target - current) < 0.4) current = target;
        tr.style.transform = `translate3d(${(-current).toFixed(1)}px,0,0)`;
        pick(current);
        if (current !== target) {
          // scene animations hold still while the strip is moving (keeps the motion smooth)
          if (!moving) { moving = true; html.dataset.paging = ""; }
          raf = requestAnimationFrame(paint);
        } else if (moving) {
          moving = false;
          delete html.dataset.paging;
        }
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(paint);
      };
      const onScroll = () => {
        target = Math.min(dist, Math.max(0, scrollY - top));
        kick();
      };
      goRef.current = (i, smooth = true) => {
        const el = scenes()[i];
        if (!el) return;
        scrollTo({ top: top + Math.min(dist, el.offsetLeft), behavior: smooth ? "smooth" : ("instant" as ScrollBehavior) });
      };

      const ro = new ResizeObserver(() => {
        measure();
        onScroll();
      });
      ro.observe(tr);
      ro.observe(fr);
      measure();
      target = current = Math.min(dist, Math.max(0, scrollY - top));
      paint();
      addEventListener("scroll", onScroll, { passive: true });

      // trackpads: a left/right swipe moves the page left/right too (up/down already does),
      // and the browser's own back/forward swipe stays out of the way on the homepage
      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || html.dataset.placing !== undefined) return;
        if ((e.target as Element).closest?.("[data-own-wheel], .circular-gallery, [role=dialog]")) return;
        e.preventDefault();
        const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerWidth : 1;
        scrollBy({ top: e.deltaX * k, behavior: "instant" as ScrollBehavior });
      };
      addEventListener("wheel", onWheel, { passive: false });
      const prevOver = html.style.overscrollBehaviorX;
      html.style.overscrollBehaviorX = "none";
      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
        removeEventListener("scroll", onScroll);
        removeEventListener("wheel", onWheel);
        html.style.overscrollBehaviorX = prevOver;
        delete html.dataset.paging;
        sec.style.height = "";
        sec.style.removeProperty("--jw");
        tr.style.transform = "";
      };
    }
    if (mode === "touch") {
      // phones: a swipeable strip; the frame itself scrolls sideways
      let still = 0;
      const onScroll = () => {
        // while the strip is being swiped, animations hold still (same flag as the desktop slide)
        document.documentElement.dataset.paging = "";
        clearTimeout(still);
        still = window.setTimeout(() => delete document.documentElement.dataset.paging, 140);
        const list = scenes();
        let i = 0;
        list.forEach((el, k) => {
          if (el.offsetLeft <= fr.scrollLeft + fr.clientWidth * 0.45) i = k;
        });
        setActive(i);
      };
      goRef.current = (i, smooth = true) => {
        const el = scenes()[i];
        if (!el) return;
        fr.scrollTo({ left: el.offsetLeft, behavior: smooth ? "smooth" : ("instant" as ScrollBehavior) });
        setActive(i); // the menu shows the scene straight away, even if the strip is already there (no scroll event)
      };
      fr.addEventListener("scroll", onScroll, { passive: true });
      onScroll(); // in case the strip was already moved (a restored position) before this listener existed

      // pulling up where there's nothing more below: the scene stretches like rubber, then springs back
      // (instead of the page scrolling into empty space). Sideways swipes and inner scrolling are left alone.
      let sx = 0, sy = 0, on = false, decided = false, pulled = false;
      const canScrollDown = (t: Element | null) => {
        for (let n = t as HTMLElement | null; n && n !== fr; n = n.parentElement) {
          const oy = getComputedStyle(n).overflowY;
          if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight + 1 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
        }
        return false;
      };
      const onStart = (e: TouchEvent) => {
        on = false;
        if (e.touches.length !== 1 || document.documentElement.dataset.placing !== undefined) return;
        if ((e.target as Element).closest?.("input, textarea, select, [contenteditable], [data-sticker-art], [data-nodrag], .prompt-bar__menu")) return;
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
        on = true;
        decided = false;
        pulled = false;
      };
      const onMove = (e: TouchEvent) => {
        if (!on) return;
        const x = e.touches[0].clientX, y = e.touches[0].clientY;
        if (!decided) {
          const dx = x - sx, dy = y - sy;
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          decided = true;
          if (!(dy < 0 && Math.abs(dy) > Math.abs(dx) * 1.2) || canScrollDown(e.target as Element)) {
            on = false;
            return;
          }
          sy = y;
          fr.style.transition = "none";
          fr.style.transformOrigin = "50% 100%";
        }
        const pull = Math.max(0, sy - y);
        // resistance: it gives a little, then less and less
        const s = 1 + (1 - Math.exp(-pull / 240)) * 0.075;
        fr.style.transform = `scaleY(${s.toFixed(4)})`;
        pulled = true;
        e.preventDefault();
      };
      const onEnd = () => {
        if (!on) return;
        on = false;
        if (!pulled) return;
        fr.style.transition = "transform 560ms cubic-bezier(0.18, 1.25, 0.4, 1)";
        fr.style.transform = "";
      };
      fr.addEventListener("touchstart", onStart, { passive: true });
      fr.addEventListener("touchmove", onMove, { passive: false });
      fr.addEventListener("touchend", onEnd, { passive: true });
      fr.addEventListener("touchcancel", onEnd, { passive: true });
      return () => {
        fr.removeEventListener("scroll", onScroll);
        fr.removeEventListener("touchstart", onStart);
        fr.removeEventListener("touchmove", onMove);
        fr.removeEventListener("touchend", onEnd);
        fr.removeEventListener("touchcancel", onEnd);
        fr.style.transform = fr.style.transition = fr.style.transformOrigin = "";
        clearTimeout(still);
        delete document.documentElement.dataset.paging;
      };
    }
    // reduced motion: stacked
    goRef.current = (i) => scenes()[i]?.scrollIntoView({ block: "start" });
    return undefined;
  }, [mode]);

  const go = useCallback((i: number) => goRef.current(Math.max(0, Math.min(SCENES.length - 1, i))), []);

  /* ---------- the navbar highlights the scene in view ---------- */
  useEffect(() => {
    dispatchEvent(new CustomEvent(SCENE_EVENT, { detail: SCENES[active].id }));
    // the page knows which scene is up (the chat face steps aside on the Wall)
    document.documentElement.dataset.scene = SCENES[active].id;
  }, [active]);
  useEffect(() => () => void delete document.documentElement.dataset.scene, []);

  /* ---------- navbar links (/#about, /#work, /#beyond, /#wall, /#contact) jump to their scene ---------- */
  useEffect(() => {
    const target = (href: string | null) => {
      const m = href?.match(/^\/?#(about|intro|work|beyond|wall|contact)$/);
      if (!m) return -1;
      return SCENES.findIndex((s) => s.id === (m[1] === "about" ? "intro" : m[1]));
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href]");
      const i = target(a?.getAttribute("href") ?? null);
      if (i < 0) return;
      e.preventDefault();
      history.replaceState(history.state, "", location.pathname + location.search);
      go(i);
    };
    document.addEventListener("click", onClick, true);
    const i = target(location.hash);
    const off = i >= 0 ? onIntroDone(() => requestAnimationFrame(() => go(i))) : undefined;
    return () => {
      document.removeEventListener("click", onClick, true);
      off?.();
    };
  }, [go]);

  /* ---------- keyboard: ← → move between scenes (not while typing) ---------- */
  const { hash, open, close } = useHashLayer();
  const branch: BranchId | null = hash.startsWith(BRANCH_HASH.beyond) ? "beyond" : hash.startsWith(BRANCH_HASH.photography) ? "photography" : null;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (branch || e.altKey || e.metaKey || e.ctrlKey || document.documentElement.dataset.placing !== undefined) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable], [role=group], [role=listbox], [role=dialog], .circular-gallery")) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (mode === "desktop") {
        const sec = section.current!;
        const r = sec.getBoundingClientRect();
        if (r.top > 1 || r.bottom < innerHeight - 1) return; // only while the journey fills the view
      }
      e.preventDefault();
      go(active + (e.key === "ArrowRight" ? 1 : -1));
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [active, branch, go, mode]);

  /* ---------- coming back from a project page: same place in the journey ---------- */
  useEffect(() => {
    const fr = frame.current, root = section.current;
    if (!fr || !root) return;
    const save = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='/']");
      if (!a || a.getAttribute("href")?.startsWith("/#")) return;
      try {
        sessionStorage.setItem(SAVE_KEY, JSON.stringify({ y: Math.round(scrollY), x: Math.round(fr.scrollLeft), at: Date.now() }));
      } catch {}
    };
    root.addEventListener("click", save, true);
    let saved: { y: number; x: number; at: number } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || "null");
      sessionStorage.removeItem(SAVE_KEY);
    } catch {}
    // a link to a scene (/#contact, from "Say hi") wins over "back where you were"
    const toScene = /^#(about|intro|work|beyond|wall|contact)$/.test(location.hash);
    const off =
      saved && !toScene && Date.now() - saved.at < 30 * 60_000
        ? onIntroDone(() =>
            requestAnimationFrame(() => {
              scrollTo({ top: saved!.y, behavior: "instant" as ScrollBehavior });
              fr.scrollLeft = saved!.x;
            }),
          )
        : undefined;
    return () => {
      root.removeEventListener("click", save, true);
      off?.();
    };
  }, []);

  /* ---------- the folder sheet: opens below, scrolls down into it ---------- */
  const ctx = useMemo(
    () => ({ openBranch: (id: BranchId, photo?: number) => open(photo ? `${BRANCH_HASH[id]}/${photo}` : BRANCH_HASH[id]) }),
    [open],
  );
  useEffect(() => {
    if (!branch) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden"; // the journey keeps its place underneath
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector(".circular-gallery [aria-hidden='false']") && close();
    addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
  }, [branch, close]);

  return (
    <JourneyContext.Provider value={ctx}>
      <section ref={section} className={h.journey} data-mode={mode} aria-label="Homepage">
        {mode !== "stack" && <ScrollHint track={track} />}
        <div ref={frame} className={h.journeyFrame}>
          <div ref={track} className={h.journeyTrack}>
            <div className={h.sceneIntro} data-scene="intro">
              {intro}
            </div>
            <div className={h.sceneWork} data-scene="work" data-snap data-snap-end>
              {work}
            </div>
            <div className={h.sceneFolders} data-scene="beyond" data-snap>
              {folders}
            </div>
            <div className={h.sceneWall} data-scene="wall" data-snap>
              {wall}
            </div>
            <div className={h.sceneContact} data-scene="contact" data-snap>
              <GlyphEmbers className={h.embers} />
              <div className={h.contactBody}>{contact}</div>
            </div>
          </div>
        </div>
      </section>

      {branch &&
        createPortal(
          <div className={siteCss.site} style={{ display: "contents" }}>
          <div className={h.sheet} role="dialog" aria-modal="true" aria-label={branch === "beyond" ? "Beyond the Interface" : "Photography"}>
            <div className={h.sheetBar}>
              <button type="button" className={h.sheetClose} onClick={close}>
                <span aria-hidden="true">↑</span> Back to the journey
              </button>
              <span className={h.sheetTitle}>{branch === "beyond" ? "Beyond the Interface" : "Photography"}</span>
            </div>
            <div className={h.sheetBody}>{branch === "beyond" ? beyond : photography}</div>
          </div>
          </div>,
          document.body,
        )}
    </JourneyContext.Provider>
  );
}
