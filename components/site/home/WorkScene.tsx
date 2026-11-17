"use client";

import { useState } from "react";
import ProjectMedia from "../ProjectMedia";
import CursorScope from "../CursorScope";
import ProjectDrawer, { type DrawerMode } from "./ProjectDrawer";
import { categories, projects, type CategoryId, type Project } from "@/lib/site/content";
import { bento, recent, type TileSize } from "@/lib/site/home";
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
const SHOWN = 6;
const size = (slug: string): TileSize => bento.find((b) => b.slug === slug)?.size ?? "small";

/** newest first (lib/site/home.ts `recent`), then everything else in the bento order */
const ORDERED: Project[] = [
  ...recent.map((slug) => projects.find((p) => p.slug === slug)).filter((p): p is Project => !!p),
  ...bento.map((b) => projects.find((p) => p.slug === b.slug)).filter((p): p is Project => !!p && !recent.includes(p.slug)),
  ...projects.filter((p) => !recent.includes(p.slug) && !bento.some((b) => b.slug === p.slug)),
];

/**
 * Scene 2 of the homepage: the work. Tabs filter by category; the six newest
 * case studies show first and the rest wait behind "Explore more of my work".
 * Opening a project slides a panel in from the right with a Simplified and a
 * Deep-dive view, so visitors never lose their place.
 */
export default function WorkScene() {
  const [tab, setTab] = useState<"all" | CategoryId>("all");
  const [more, setMore] = useState(false);
  const [drawer, setDrawer] = useState<{ p: Project; mode: DrawerMode } | null>(null);

  const list = tab === "all" ? ORDERED : ORDERED.filter((p) => p.category === tab);
  const shown = more ? list : list.slice(0, SHOWN);
  const hidden = list.length - shown.length;
  const tabs: { id: "all" | CategoryId; label: string }[] = [{ id: "all", label: "All work" }, ...categories];

  return (
    <section id="work" className={h.workScene} aria-labelledby="work-title">
      <div className={h.workSceneHead}>
        <p className={h.eyebrow}>Selected work</p>
        <h2 id="work-title" className={h.h2}>Things I&apos;ve shipped</h2>
        <p className={h.workLine}>Enterprise AI, FinTech and learning platforms, from first flows to design-system handoff.</p>
        <div className={h.workTabs} role="tablist" aria-label="Filter work">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setMore(false);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <CursorScope>
        <div className={h.bentoRow} role="tabpanel" aria-label={tabs.find((t) => t.id === tab)!.label}>
          {shown.map((p, i) => (
            <Tile key={p.slug} p={p} size={size(p.slug)} tone={i} open={(mode) => setDrawer({ p, mode })} />
          ))}
          {hidden > 0 && (
            <button type="button" className={h.moreTile} onClick={() => setMore(true)}>
              <span className={h.moreCount}>+{hidden}</span>
              <span className={h.moreLabel}>
                Explore more of my work <span aria-hidden="true">→</span>
              </span>
              <span className={h.moreNote}>Older projects, posters and branding</span>
            </button>
          )}
        </div>
      </CursorScope>
      {drawer && (
        <ProjectDrawer project={drawer.p} mode={drawer.mode} onMode={(mode) => setDrawer({ ...drawer, mode })} onClose={() => setDrawer(null)} />
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
  const style = { ["--tone" as string]: TONES[tone % TONES.length] };
  if (p.external)
    return (
      <a style={style} className={`${cls} ${large ? "cursor-target" : ""}`} data-cursor-label={`Open on ${p.external.label}`} href={p.external.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} — opens on ${p.external.label}`}>
        {body}
      </a>
    );
  return (
    <div style={style} className={`${cls} ${h.stretchTile} ${large ? "cursor-target" : ""}`} data-cursor-label="View project">
      {body}
      <button type="button" className={h.stretch} onClick={() => open("simple")} aria-label={`${p.title} — open`} />
      <button type="button" className={h.tileCta} onClick={() => open("deep")}>
        Read full case study <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
