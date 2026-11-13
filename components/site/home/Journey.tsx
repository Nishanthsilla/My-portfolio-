"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { onIntroDone } from "@/lib/introState";
import GlyphEmbers from "./GlyphEmbers";
import { JourneyContext, type BranchId } from "./journeyContext";
import { useHashLayer } from "./useHashLayer";
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
      let dist = 0, top = 0, target = 0, current = 0, raf = 0, idle = 0, settling = false, shown = -1;
      const measure = () => {
        // every full-width scene is exactly the visible frame (100vw would include the scrollbar)
        sec.style.setProperty("--jw", `${fr.clientWidth}px`);
        dist = Math.max(0, tr.scrollWidth - fr.clientWidth);
        sec.style.height = `${dist + fr.clientHeight}px`;
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
      const paint = () => {
        raf = 0;
        current += (target - current) * 0.18;
        if (Math.abs(target - current) < 0.4) current = target;
        tr.style.transform = `translate3d(${(-current).toFixed(1)}px,0,0)`;
        pick(current);
        if (current !== target) raf = requestAnimationFrame(paint);
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(paint);
      };
      // pausing near the start of a scene (or the end of the wide work scene) settles onto it
      const settle = () => {
        const vw = fr.clientWidth;
        const p = scrollY - top;
        if (p <= 1 || p >= dist - 1) return;
        const points: number[] = [];
        tr.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => points.push(Math.min(dist, el.offsetLeft)));
        tr.querySelectorAll<HTMLElement>("[data-snap-end]").forEach((el) => points.push(Math.min(dist, el.offsetLeft + el.offsetWidth - vw)));
        let best = Infinity;
        for (const q of points) if (Math.abs(q - p) < Math.abs(best - p)) best = q;
        if (Math.abs(best - p) > vw * 0.22 || Math.abs(best - p) < 2) return;
        settling = true;
        scrollTo({ top: top + best, behavior: "smooth" });
        window.setTimeout(() => (settling = false), 700);
      };
      const onScroll = () => {
        target = Math.min(dist, Math.max(0, scrollY - top));
        kick();
        window.clearTimeout(idle);
        if (!settling) idle = window.setTimeout(settle, 180);
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
      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
        window.clearTimeout(idle);
        removeEventListener("scroll", onScroll);
        sec.style.height = "";
        sec.style.removeProperty("--jw");
        tr.style.transform = "";
      };
    }
    if (mode === "touch") {
      // phones: a swipeable strip; the frame itself scrolls sideways
      const onScroll = () => {
        const list = scenes();
        let i = 0;
        list.forEach((el, k) => {
          if (el.offsetLeft <= fr.scrollLeft + fr.clientWidth * 0.45) i = k;
        });
        setActive(i);
      };
      goRef.current = (i, smooth = true) => {
        const el = scenes()[i];
        if (el) fr.scrollTo({ left: el.offsetLeft, behavior: smooth ? "smooth" : ("instant" as ScrollBehavior) });
      };
      fr.addEventListener("scroll", onScroll, { passive: true });
      return () => fr.removeEventListener("scroll", onScroll);
    }
    // reduced motion: stacked
    goRef.current = (i) => scenes()[i]?.scrollIntoView({ block: "start" });
    return undefined;
  }, [mode]);

  const go = useCallback((i: number) => goRef.current(Math.max(0, Math.min(SCENES.length - 1, i))), []);

  /* ---------- "Get in touch" / #contact and #work jump to their scene ---------- */
  useEffect(() => {
    const target = (href: string | null) => {
      const m = href?.match(/^\/?#(contact|work)$/);
      return m ? SCENES.findIndex((s) => s.id === m[1]) : -1;
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href]");
      const i = target(a?.getAttribute("href") ?? null);
      if (i < 0) return;
      e.preventDefault();
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
      if (branch || e.altKey || e.metaKey || e.ctrlKey) return;
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
    const off =
      saved && Date.now() - saved.at < 30 * 60_000
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
          {mode !== "stack" && (
            <nav className={h.journeyNav} aria-label="Scenes">
              <button type="button" className={h.arrowBtn} onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous scene">
                ←
              </button>
              <ol className={h.journeyDots}>
                {SCENES.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => go(i)} aria-current={i === active ? "step" : undefined}>
                      <span className={h.dotNum}>{String(i + 1).padStart(2, "0")}</span> {s.label}
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" className={h.arrowBtn} onClick={() => go(active + 1)} disabled={active === SCENES.length - 1} aria-label="Next scene">
                →
              </button>
            </nav>
          )}
        </div>
      </section>

      {branch &&
        createPortal(
          <div className={h.sheet} role="dialog" aria-modal="true" aria-label={branch === "beyond" ? "Beyond the Interface" : "Photography"}>
            <div className={h.sheetBar}>
              <button type="button" className={h.sheetClose} onClick={close}>
                <span aria-hidden="true">↑</span> Back to the journey
              </button>
              <span className={h.sheetTitle}>{branch === "beyond" ? "Beyond the Interface" : "Photography"}</span>
            </div>
            <div className={h.sheetBody}>{branch === "beyond" ? beyond : photography}</div>
          </div>,
          document.querySelector("[data-site]") ?? document.body,
        )}
    </JourneyContext.Provider>
  );
}
