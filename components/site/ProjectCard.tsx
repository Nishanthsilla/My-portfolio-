import Link from "next/link";
import type { Project } from "@/lib/site/content";
import ProjectMedia from "./ProjectMedia";
import s from "./site.module.css";

/** One project in the work grid. Case studies open inside the site; older work opens its original page. */
export default function ProjectCard({ project }: { project: Project }) {
  const p = project;
  if (p.featured) return <FeaturedCard project={p} />;
  const meta = [p.org, p.year].filter(Boolean).join(" · ") || p.external?.label;
  const inner = (
    <>
      <div style={{ position: "relative" }}>
        <ProjectMedia project={p} />
        {p.external && <span className={s.mediaTag}>{p.external.label} ↗</span>}
      </div>
      <div className={s.cardBody}>
        <span className={s.eyebrow}>{p.eyebrow}</span>
        <div className={s.cardTop}>
          <h3 className={s.cardTitle}>
            {p.title}
            <span className={s.arrow} aria-hidden="true">{p.external ? "↗" : "→"}</span>
          </h3>
          {meta && !p.external && <span className={s.cardMeta}>{meta}</span>}
        </div>
        {p.description && <p className={s.cardDesc}>{p.description}</p>}
        {p.tags && (
          <ul className={s.tags} aria-label="Highlights">
            {p.tags.map((t) => <li key={t} className={s.tag}>{t}</li>)}
          </ul>
        )}
      </div>
    </>
  );
  return p.external ? (
    <a className={s.card} href={p.external.href} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} — opens on ${p.external.label}`}>
      {inner}
    </a>
  ) : (
    <Link className={s.card} href={`/work/${p.slug}`}>
      {inner}
    </Link>
  );
}

/**
 * A featured project (Self-Ready): full-width, animated product cover, a short
 * introduction and a direct "Read full case study" action.
 */
function FeaturedCard({ project: p }: { project: Project }) {
  const f = p.featured!;
  return (
    <div className={`${s.card} ${s.featured}`}>
      <Link href={f.overview} className={s.featuredMedia} aria-label={`${p.title} — project overview`}>
        <ProjectMedia project={p} className={s.featuredFrame} />
      </Link>
      <div className={s.featuredBody}>
        <span className={s.eyebrow}>{p.eyebrow}</span>
        <Link href={f.overview} className={s.featuredTitle}>
          {p.title} <span className={s.arrow} aria-hidden="true">→</span>
        </Link>
        <p className={s.cardDesc}>{p.description}</p>
        <ul className={s.tags} aria-label="Discipline and domain">
          {f.tags.map((t) => <li key={t} className={s.tag}>{t}</li>)}
        </ul>
        <Link href={f.caseStudy} className={`${s.btn} ${s.btnSecondary}`} style={{ marginTop: 16, width: "max-content" }}>
          Read full case study <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

/** A clearly labelled empty slot, so a category never looks unfinished. */
export function PlaceholderCard({ title, note }: { title: string; note: string }) {
  return (
    <div className={s.card} aria-label={`${title} (placeholder)`}>
      <div className={`${s.media} ${s.placeholder}`}>
        <div className={s.placeholderInner}>
          <span className={s.badge}>Placeholder</span>
          <p className={s.h3}>{title}</p>
          <p className={s.body} style={{ fontSize: 14 }}>{note}</p>
        </div>
      </div>
    </div>
  );
}
