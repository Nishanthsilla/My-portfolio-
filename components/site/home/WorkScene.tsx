"use client";

import { useEffect, useRef, useState } from "react";
import ProjectMedia from "../ProjectMedia";
import CursorScope from "../CursorScope";
import ProjectDrawer, { type DrawerMode } from "./ProjectDrawer";
import { projects, type Project } from "@/lib/site/content";
import type { TileSize } from "@/lib/site/home";
import { categoryLabel } from "@/lib/site/routes";
import h from "./home.module.css";

/** the colour fields behind each project, kept but softened: less saturation and a gentler light-to-dark
 * range, so the backdrops stay warm without being loud */
const TONES = [
  "linear-gradient(180deg, #E8B07A 0%, #C98552 100%)", // orange
  "linear-gradient(160deg, #B5D9BE 0%, #6FA683 100%)", // green
  "radial-gradient(120% 90% at 50% 100%, #5A6FC4 0%, #3A4888 55%, #2E3A6E 100%)", // blue
  "linear-gradient(170deg, #B9675C 0%, #7E3E38 100%)", // red
  "linear-gradient(180deg, #EECBB4 0%, #D59A80 100%)", // peach
  "linear-gradient(170deg, #ABA0E0 0%, #6A5DAE 100%)", // violet
];
/** a project that needs its own backdrop (it sets off its cover) */
const TONE_FOR: Record<string, string> = {
  // muted plum: the Critical red box still glows on it
  "salespulze-heat-map": "radial-gradient(120% 90% at 50% 30%, #7A4058 0%, #5A2E42 55%, #43222F 100%)",
  // the platform's own violet, softened
  "ambient-ai": "linear-gradient(170deg, #ABA0E0 0%, #6A5DAE 100%)",
};
/**
 * The work, told as four things Nishanth can do — each a statement with the projects that prove
 * it — then a compact list of everything. (Superkalam is hidden for now.)
 */
export const STATEMENTS: { id: string; title: string; line: string; slugs: string[] }[] = [
  {
    id: "idea-to-launch",
    title: "I can take a product from idea to launch",
    line: "Products I owned from the business problem to the shipped release.",
    slugs: ["ambient-ai", "self-ready", "thriving-springs-e-learning", "ryzeup", "this-portfolio"],
  },
  {
    id: "hard-problems",
    title: "I untangle hard problems",
    line: "Messy, complex problems, and how I made them simple to use.",
    slugs: ["salespulze-heat-map", "mao", "disprz"],
  },
  {
    id: "systems",
    title: "I build systems that scale",
    line: "The components and rules that keep a product consistent as it grows.",
    slugs: ["covasant-design-system", "design-system-frustration-logic"],
  },
  {
    id: "pixels",
    title: "I care about the pixels",
    line: "Interfaces, branding and posters where the detail is the point.",
    slugs: ["fitness-app", "extreme-appcoders-website", "eeve-poster", "food-engineers-logo"],
  },
];
const HIDDEN = ["superkalam"];
const bySlug = (s: string) => projects.find((p) => p.slug === s);
const ALL: Project[] = projects.filter((p) => !HIDDEN.includes(p.slug));
/** each project keeps one backdrop everywhere (the peek cards and its tile) */
const toneOf = (p: Project) => TONE_FOR[p.slug] ?? TONES[Math.max(0, ALL.indexOf(p)) % TONES.length];
const roomProjects = (id: string) => (STATEMENTS.find((s) => s.id === id)?.slugs ?? []).map(bySlug).filter((p): p is Project => !!p);
/** in a room the first project leads (large) once there are three or more; two or four share the space */
const roomSize = (n: number, i: number): TileSize => (n === 1 || n === 2 || (n === 3 && i === 0) || (n >= 5 && i < 2) ? "large" : "small");

/**
 * Scene 2 of the homepage: the work as one floor with four doors (one per thing Nishanth does well).
 * Hovering a door fans out the case studies inside; opening it takes the view down a level into
 * that room, a bento grid sized to how many projects it holds. "Back to the floor" (or Esc, or the
 * browser's back button) rises again. After the floor comes "All work", then the journey goes on.
 */
export default function WorkScene() {
  const [drawer, setDrawer] = useState<{ p: Project; mode: DrawerMode } | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  // the room stays rendered while the view rises back to the floor
  const [shown, setShown] = useState<string | null>(null);
  const open = (p: Project, mode: DrawerMode) => setDrawer({ p, mode });
  const scene = useRef<HTMLElement>(null);

  const goDown = (id: string, push = true) => {
    setShown(id);
    setRoom(id);
    if (push) history.pushState({ ...history.state, workRoom: id }, "", `?lens=${id}#work`);
  };
  const goUp = (pop = false) => {
    setRoom(null);
    if (!pop && history.state?.workRoom) history.back();
    else if (!pop) history.replaceState(history.state, "", location.pathname + "#work");
  };

  // a shared link (?lens=pixels) lands in that room; the browser's back button rises to the floor
  useEffect(() => {
    const lens = new URLSearchParams(location.search).get("lens");
    let t = 0;
    if (lens && STATEMENTS.some((s) => s.id === lens)) {
      t = window.setTimeout(() => {
        scene.current?.closest<HTMLElement>("[data-scene]")?.scrollIntoView({ block: "start", inline: "start" });
        goDown(lens, false);
      }, 900);
    }
    const onPop = () => {
      const id = (history.state as { workRoom?: string } | null)?.workRoom;
      if (id) goDown(id, false);
      else setRoom(null);
    };
    addEventListener("popstate", onPop);
    return () => { clearTimeout(t); removeEventListener("popstate", onPop); };
  }, []);

  // while down in a room, the sideways journey holds still (Esc rises)
  useEffect(() => {
    if (!room) return;
    const html = document.documentElement;
    const desktop = scene.current?.closest<HTMLElement>("section[data-mode]")?.dataset.mode === "desktop";
    html.dataset.placing = "";
    html.dataset.workRoom = room;
    const inGrid = (t: EventTarget | null) => {
      const g = (t as HTMLElement | null)?.closest?.("[data-room-scroll]") as HTMLElement | null;
      return !!g && g.scrollHeight > g.clientHeight + 1;
    };
    const wheel = (e: WheelEvent) => {
      if (!desktop || inGrid(e.target) || e.ctrlKey) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("[role=dialog]")) goUp();
      else if (desktop && ["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key) && !(e.target as HTMLElement)?.closest?.("input,textarea")) e.preventDefault();
    };
    addEventListener("wheel", wheel, { capture: true, passive: false });
    addEventListener("keydown", key);
    scene.current?.closest<HTMLElement>("[data-scene]")?.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      delete html.dataset.placing;
      delete html.dataset.workRoom;
      removeEventListener("wheel", wheel, { capture: true });
      removeEventListener("keydown", key);
    };
  }, [room]);

  const st = STATEMENTS.find((s) => s.id === shown);
  const list = shown ? roomProjects(shown) : [];

  return (
    <section ref={scene} id="work" className={h.workScene} aria-labelledby="work-title">
      <CursorScope>
        <div className={h.shaft} data-down={room ? "" : undefined} onTransitionEnd={(e) => { if (e.target === e.currentTarget && !room) setShown(null); }}>
          <div className={h.shaftInner}>
            {/* the floor */}
            <div className={h.floor} aria-hidden={room ? true : undefined} inert={room ? true : undefined}>
              <header className={h.floorHead}>
                <p className={h.eyebrow}>Selected work</p>
                <h2 id="work-title" className={h.floorTitle}>Four things I do well. Pick a door.</h2>
              </header>
              <ul className={h.doors}>
                {STATEMENTS.map((s, n) => {
                  const ps = roomProjects(s.id);
                  return (
                    <li key={s.id}>
                      <button type="button" className={`${h.door} cursor-target`} data-cursor-label="Go down" onClick={() => goDown(s.id)} aria-label={`${s.title}: ${ps.length} case ${ps.length === 1 ? "study" : "studies"}`}>
                        <span className={h.doorNum}>0{n + 1}</span>
                        <span className={h.doorTitle}>{s.title}</span>
                        <span className={h.doorLine}>{s.line}</span>
                        <PeekStack ps={ps} />
                        <span className={h.doorFoot}>
                          <span>{ps.length} case {ps.length === 1 ? "study" : "studies"}</span>
                          <span className={h.doorGo}>Go down <span aria-hidden="true">↓</span></span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* the ground between the floor and the rooms below */}
            <div className={h.ground} aria-hidden="true" />
            {/* the room below */}
            <div className={h.room} aria-hidden={room ? undefined : true} inert={room ? undefined : true}>
              {st && (
                <>
                  <header className={h.roomHead}>
                    <button type="button" className={h.backUp} onClick={() => goUp()}>
                      <span aria-hidden="true">↑</span> Back to the floor
                    </button>
                    <div>
                      <p className={h.eyebrow}>0{STATEMENTS.indexOf(st) + 1} · {list.length} case {list.length === 1 ? "study" : "studies"}</p>
                      <h3 className={h.roomTitle}>{st.title}</h3>
                    </div>
                    <p className={h.workLine}>{st.line}</p>
                  </header>
                  <div className={h.roomGrid} data-count={Math.min(list.length, 5)} data-room-scroll role="list">
                    {list.map((p, i) => (
                      <Tile key={p.slug} p={p} size={roomSize(list.length, i)} tone={toneOf(p)} open={(mode) => open(p, mode)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div id="work-all" className={h.allWork} aria-labelledby="all-work-title">
          <p className={h.eyebrow}>Everything</p>
          <h3 id="all-work-title" className={h.statementTitle}>All work</h3>
          <ul className={h.allList}>
            {ALL.map((p) => (
              <li key={p.slug}>
                {p.external ? (
                  <a href={p.external.href} target="_blank" rel="noopener noreferrer">
                    <b>{p.title}</b><span>{p.eyebrow}</span><em>{p.year ?? ""}</em>
                  </a>
                ) : (
                  <button type="button" onClick={() => open(p, "simple")}>
                    <b>{p.title}</b><span>{p.eyebrow}</span><em>{p.year ?? ""}</em>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CursorScope>
      {drawer && (
        <ProjectDrawer project={drawer.p} mode={drawer.mode} onMode={(mode) => setDrawer({ ...drawer, mode })} onProject={(p, mode) => setDrawer({ p, mode })} onClose={() => setDrawer(null)} />
      )}
    </section>
  );
}

/** where card k (0 = current) sits: in the middle, below it, or (the last one) just above, leaving */
const slot = (k: number, n: number) => (n >= 3 && k === n - 1 ? -1 : k);

/**
 * The case studies behind a door, with their live covers, in a grey window: the current one in the
 * middle, the next half visible below and the previous one at the top. While the door is hovered or
 * focused (on phones, while it is on screen) the column moves up a card every couple of seconds.
 */
function PeekStack({ ps }: { ps: Project[] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [front, setFront] = useState(0);
  const [prev, setPrev] = useState(0);
  const [tick, setTick] = useState(0); // total steps taken (the wrap animation alternates by lap)
  const n = ps.length;
  useEffect(() => {
    const door = ref.current?.closest("button");
    if (!door || n < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let first = 0, every = 0;
    const step = () => { setTick((t) => t + 1); setFront((f) => { setPrev(f); return (f + 1) % n; }); };
    const stop = () => { clearTimeout(first); clearInterval(every); };
    const start = () => { stop(); first = window.setTimeout(() => { step(); every = window.setInterval(step, 2200); }, 900); };
    if (matchMedia("(hover: none)").matches) {
      // phones: no hover, so it moves on its own while the door is on screen,
      // but holds still while a finger is on the screen, so nothing shifts under a scroll
      let seen = false, touching = false, rest = 0;
      const sync = () => (seen && !touching ? start() : stop());
      const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.6 });
      io.observe(door);
      const down = () => { touching = true; clearTimeout(rest); sync(); };
      const up = () => { clearTimeout(rest); rest = window.setTimeout(() => { touching = false; sync(); }, 1200); };
      addEventListener("touchstart", down, { passive: true, capture: true });
      addEventListener("touchend", up, { passive: true, capture: true });
      addEventListener("touchcancel", up, { passive: true, capture: true });
      return () => {
        stop(); io.disconnect(); clearTimeout(rest);
        removeEventListener("touchstart", down, { capture: true });
        removeEventListener("touchend", up, { capture: true });
        removeEventListener("touchcancel", up, { capture: true });
      };
    }
    const leave = () => stop();
    door.addEventListener("pointerenter", start);
    door.addEventListener("focus", start);
    door.addEventListener("pointerleave", leave);
    door.addEventListener("blur", leave);
    return () => { stop(); door.removeEventListener("pointerenter", start); door.removeEventListener("focus", start); door.removeEventListener("pointerleave", leave); door.removeEventListener("blur", leave); };
  }, [n]);
  return (
    <span ref={ref} className={h.peek} aria-hidden="true">
      {ps.map((p, i) => {
        const pos = slot((i - front + n) % n, n);
        const was = slot((i - prev + n) % n, n);
        const wraps = front !== prev && pos > was;
        return (
          <span
            key={p.slug}
            className={h.peekCard}
            data-out={wraps ? (Math.floor(tick / n) % 2 ? "a" : "b") : undefined}
            style={{ ["--tone" as string]: toneOf(p), ["--p" as string]: pos, ["--from" as string]: was }}
          >
            <ProjectMedia project={p} className={h.peekMedia} fill={0.86} />
            <b>{p.title.split(" — ")[0]}</b>
          </span>
        );
      })}
    </span>
  );
}

function Tile({ p, size, tone, open }: { p: Project; size: TileSize; tone: string; open: (mode: DrawerMode) => void }) {
  const large = size === "large";
  const meta = [categoryLabel(p.category), p.org, p.year].filter(Boolean).join(" · ");
  const body = (
    <>
      <div className={h.tileMedia}>
        <ProjectMedia project={p} className={h.tileFrame} fill={large ? 0.8 : 0.86} />
        {p.external && <span className={h.tileTag}>{p.external.label} ↗</span>}
      </div>
      <div className={h.tileBody}>
        <p className={h.tileMeta}>{large ? p.eyebrow : meta}</p>
        <h3 className={h.tileTitle}>
          {p.title}
          <span className={h.arrow} aria-hidden="true">{p.external ? "↗" : "→"}</span>
        </h3>
        {large && p.description && <p className={h.tileDesc}>{p.description}</p>}
      </div>
    </>
  );
  const cls = `${h.tile} ${large ? h.large : h.small}`;
  const style = { ["--tone" as string]: tone };
  if (p.external)
    return (
      <a style={style} className={`${cls} cursor-target`} data-cursor-label={`Open on ${p.external.label}`} href={p.external.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} — opens on ${p.external.label}`}>
        {body}
      </a>
    );
  return (
    <div style={style} className={`${cls} ${h.stretchTile} cursor-target`} data-cursor-label="View project">
      {body}
      <button type="button" className={h.stretch} onClick={() => open("simple")} aria-label={`${p.title} — open`} />
      <button type="button" className={h.tileCta} onClick={() => open("deep")}>
        Read full case study <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
