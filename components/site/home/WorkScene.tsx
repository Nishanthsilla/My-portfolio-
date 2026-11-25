"use client";

import { useEffect, useState } from "react";
import ProjectMedia from "../ProjectMedia";
import CursorScope from "../CursorScope";
import ProjectDrawer, { type DrawerMode } from "./ProjectDrawer";
import { projects, type Project } from "@/lib/site/content";
import { bento, type TileSize } from "@/lib/site/home";
import { categoryLabel } from "@/lib/site/routes";
import h from "./home.module.css";

/** rich colour fields behind each project (in turn), so the covers read like product shots on a backdrop */
const TONES = [
  "linear-gradient(180deg, #F2A24E 0%, #D9612A 100%)",
  "linear-gradient(160deg, #BFF3CD 0%, #3E9D63 100%)",
  "radial-gradient(120% 90% at 50% 100%, #2D50FF 0%, #12207A 55%, #0A1244 100%)",
  "linear-gradient(170deg, #C93A2C 0%, #5C1013 100%)",
  "linear-gradient(180deg, #F8CDB0 0%, #E07A57 100%)",
  "linear-gradient(170deg, #9C8BF5 0%, #3B2B95 100%)",
];
/** a project that needs its own backdrop (it sets off its cover) */
const TONE_FOR: Record<string, string> = {
  // deep plum and wine: the Critical red box glows on it
  "salespulze-heat-map": "radial-gradient(120% 90% at 50% 30%, #6B1E3E 0%, #3A0F22 55%, #1C0711 100%)",
  // the platform's own violet
  "ambient-ai": "linear-gradient(170deg, #9C8BF5 0%, #3B2B95 100%)",
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
    slugs: ["ambient-ai", "self-ready", "thriving-springs-e-learning", "ryzeup"],
  },
  {
    id: "hard-problems",
    title: "I untangle hard problems",
    line: "Messy, complex problems, and how I made them simple to use.",
    slugs: ["salespulze-heat-map", "mao", "disprz"],
  },
  {
    id: "pixels",
    title: "I care about the pixels",
    line: "Interfaces, branding and posters where the detail is the point.",
    slugs: ["fitness-app", "design-system-frustration-logic", "extreme-appcoders-website", "eeve-poster", "food-engineers-logo"],
  },
  {
    id: "systems",
    title: "I build systems that scale",
    line: "The components and rules that keep a product consistent as it grows.",
    slugs: ["covasant-design-system"],
  },
];
const HIDDEN = ["superkalam"];
const bySlug = (s: string) => projects.find((p) => p.slug === s);
const size = (slug: string, i: number): TileSize => (i === 0 ? "large" : bento.find((b) => b.slug === slug)?.size === "large" && i < 2 ? "large" : "small");
const ALL: Project[] = projects.filter((p) => !HIDDEN.includes(p.slug));

/** jump to a statement inside the sideways journey (desktop) or the stacked scene (phones) */
function jumpTo(id: string) {
  const el = document.getElementById(`work-${id}`);
  if (!el) return;
  const journey = el.closest<HTMLElement>("section[data-mode]");
  if (journey?.dataset.mode === "desktop") {
    const track = el.closest<HTMLElement>("[data-scene]")?.parentElement;
    if (!track) return;
    const x = el.getBoundingClientRect().left - track.getBoundingClientRect().left;
    scrollTo({ top: journey.getBoundingClientRect().top + scrollY + x - 24, behavior: "smooth" });
  } else el.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
}

/**
 * Scene 2 of the homepage: the work, as four statements in a row (stacked on phones), each with
 * its projects, then "All work". Opening a project slides a panel in from the right with a
 * Simplified and a Deep-dive view, so visitors never lose their place.
 */
export default function WorkScene() {
  const [drawer, setDrawer] = useState<{ p: Project; mode: DrawerMode } | null>(null);
  const open = (p: Project, mode: DrawerMode) => setDrawer({ p, mode });

  // a shared link (?lens=hard-problems) lands on that statement
  useEffect(() => {
    const lens = new URLSearchParams(location.search).get("lens");
    if (!lens || !STATEMENTS.some((s) => s.id === lens)) return;
    const id = setTimeout(() => jumpTo(lens), 900);
    return () => clearTimeout(id);
  }, []);

  return (
    <section id="work" className={h.workScene} aria-labelledby="work-title">
      <h2 id="work-title" className={h.srOnly}>Selected work</h2>
      <CursorScope>
        {STATEMENTS.map((st, n) => (
          <div key={st.id} id={`work-${st.id}`} className={h.statement} aria-labelledby={`st-${st.id}`}>
            <div className={h.statementHead}>
              <p className={h.eyebrow}>{n === 0 ? "Selected work · " : ""}{n + 1} / {STATEMENTS.length}</p>
              <h3 id={`st-${st.id}`} className={h.statementTitle}>{st.title}</h3>
              <p className={h.workLine}>{st.line}</p>
              {n === 0 && (
                <nav className={h.jumpRow} aria-label="Jump to">
                  {STATEMENTS.slice(1).map((s) => (
                    <a key={s.id} href={`/?lens=${s.id}#work`} onClick={(e) => { e.preventDefault(); jumpTo(s.id); }}>
                      {s.title.replace(/^I (can )?/, "").replace(/^./, (c) => c.toUpperCase())} <span aria-hidden="true">→</span>
                    </a>
                  ))}
                  <a href="#work-all" onClick={(e) => { e.preventDefault(); jumpTo("all"); }}>
                    All work <span aria-hidden="true">→</span>
                  </a>
                </nav>
              )}
            </div>
            <div className={`${h.bentoRow} ${st.slugs.length === 1 ? h.bentoOne : ""}`} role="list">
              {st.slugs.map(bySlug).filter((p): p is Project => !!p).map((p, i) => (
                <Tile key={p.slug} p={p} size={size(p.slug, i)} tone={n * 2 + i} open={(mode) => open(p, mode)} />
              ))}
            </div>
          </div>
        ))}
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

function Tile({ p, size, tone, open }: { p: Project; size: TileSize; tone: number; open: (mode: DrawerMode) => void }) {
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
  const style = { ["--tone" as string]: TONE_FOR[p.slug] ?? TONES[tone % TONES.length] };
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
