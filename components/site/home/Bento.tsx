import Link from "next/link";
import ProjectMedia from "../ProjectMedia";
import CursorScope from "../CursorScope";
import AnimatedContent from "../reactbits/AnimatedContent";
import { categories, projects, type Project } from "@/lib/site/content";
import { bento, type TileSize } from "@/lib/site/home";
import { caseStudyHref, categoryHref, categoryLabel, overviewHref } from "@/lib/site/routes";
import h from "./home.module.css";

/** Every project, in the order and size set in lib/site/home.ts; anything not listed joins at the end (small). */
function ordered(): { p: Project; size: TileSize }[] {
  const listed = bento
    .map((b) => ({ p: projects.find((x) => x.slug === b.slug), size: b.size }))
    .filter((x): x is { p: Project; size: TileSize } => !!x.p);
  const rest = projects.filter((p) => !bento.some((b) => b.slug === p.slug)).map((p) => ({ p, size: "small" as const }));
  return [...listed, ...rest];
}

/**
 * Selected work as an editorial bento: large tiles for the strongest, most
 * relevant projects (bigger canvas, animated product covers, more context),
 * small tiles for supporting work. Every tile opens its project.
 */
export default function Bento({ variant = "page" }: { variant?: "page" | "journey" }) {
  const tiles = ordered();
  const browse = (
    <nav key="browse" className={h.browse} aria-label="Browse work by category">
      <p className={h.eyebrow}>Browse by category</p>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={categoryHref(c.id)}>
              {c.label} <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
  // scene 2 of the homepage journey: the tiles run sideways in two rows
  if (variant === "journey")
    return (
      <section id="work" className={h.workScene} aria-labelledby="work-title">
        <div className={h.workSceneHead}>
          <p className={h.eyebrow}>Selected work</p>
          <h2 id="work-title" className={h.h2}>Things I&apos;ve shipped</h2>
          <p className={h.workLine}>Enterprise AI, FinTech and learning platforms, from first flows to design-system handoff.</p>
        </div>
        <CursorScope>
          <div className={h.bentoRow}>
            {tiles.map(({ p, size }) => <Tile key={p.slug} p={p} size={size} />)}
            {browse}
          </div>
        </CursorScope>
      </section>
    );
  return (
    <section id="work" className={h.work} aria-labelledby="work-title">
      <div className={h.workHead}>
        <div>
          <p className={h.eyebrow}>Selected work</p>
          <h2 id="work-title" className={h.h2}>Things I&apos;ve shipped</h2>
        </div>
        <p className={h.workLine}>Enterprise AI, FinTech and learning platforms, from first flows to design-system handoff.</p>
      </div>
      <CursorScope>
        <AnimatedContent className={h.bento} distance={18} duration={0.6} stagger={0.06} threshold={0.06}>
          {[
            ...tiles.map(({ p, size }) => <Tile key={p.slug} p={p} size={size} />),
            browse,
          ]}
        </AnimatedContent>
      </CursorScope>
    </section>
  );
}

function Tile({ p, size }: { p: Project; size: TileSize }) {
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
        {p.description && <p className={h.tileDesc}>{p.description}</p>}
        {large && p.tags && (
          <ul className={h.tags} aria-label="Highlights">
            {p.tags.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>
    </>
  );
  const cls = `${h.tile} ${large ? h.large : h.small}`;
  if (p.external)
    return (
      <a
        className={`${cls} ${large ? "cursor-target" : ""}`}
        data-cursor-label={`Open on ${p.external.label}`}
        href={p.external.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${p.title} — opens on ${p.external.label}`}
      >
        {body}
      </a>
    );
  // the whole tile opens the brief overview; "Read full case study" goes straight to the full story
  return (
    <div className={`${cls} ${h.stretchTile} ${large ? "cursor-target" : ""}`} data-cursor-label="View project">
      {body}
      <Link className={h.stretch} href={overviewHref(p)} aria-label={`${p.title} — project overview`} />
      <Link className={h.tileCta} href={caseStudyHref(p)}>
        Read full case study <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
