import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectMedia from "@/components/site/ProjectMedia";
import SiteShell from "@/components/site/SiteShell";
import Slot from "@/components/site/Slot";
import { NeedsConfirmation } from "@/components/site/selfready/engine";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import s from "@/components/site/selfready/selfready.module.css";
import { projectBySlug, templateStudies } from "@/lib/site/content";
import { caseStudyHref, categoryHref, categoryLabel } from "@/lib/site/routes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templateStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: `${p.title} — Nishanth Silla`, description: p.description } : {};
}

/** Level 1 — the short project overview (readable in 20–30 seconds). */
export default async function ProjectOverview({ params }: Props) {
  const p = projectBySlug((await params).slug);
  if (!p || p.external || p.featured) notFound();
  const cat = categoryLabel(p.category);
  const meta: [string, string | undefined][] = [
    ["Category", cat],
    ["Company", p.org],
    ["Role", p.role],
    ["Timeline", p.year],
  ];
  return (
    <SiteShell>
      <article className={site.container}>
        <header className={s.hero}>
          <Link className={site.back} href={categoryHref(p.category)}>
            <span aria-hidden="true">←</span> {cat}
          </Link>
          <span className={site.eyebrow}>{p.eyebrow}</span>
          <h1 className={s.heroTitle} style={{ fontSize: "clamp(44px, 7vw, 96px)" }}>{p.title}</h1>
          <p className={s.heroLine}>{p.description ?? <NeedsConfirmation>One-line description to be added</NeedsConfirmation>}</p>
          <dl className={s.metaRow}>
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v ?? <NeedsConfirmation>To be confirmed</NeedsConfirmation>}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className={s.heroMedia}>
          <ProjectMedia project={p} className={site.featuredFrame} fill={0.7} eager />
        </div>

        <AnimatedContent className={`${s.section} ${s.split}`} distance={16} duration={0.6}>
          <div>
            <span className={s.num}>Key contributions</span>
            <h2 className={s.h2}>What I did.</h2>
          </div>
          {p.contribution?.length ? (
            <ul className={site.csList}>
              {p.contribution.slice(0, 5).map((c) => <li key={c}>{c}</li>)}
            </ul>
          ) : (
            <div className={s.pendingBox}>
              <NeedsConfirmation>To be added</NeedsConfirmation>
              <p>Three to five key contributions or areas of work.</p>
            </div>
          )}
        </AnimatedContent>
        {p.tags && (
          <ul className={site.tags} aria-label="Highlights" style={{ marginTop: 24 }}>
            {p.tags.map((t) => <li key={t} className={site.tag}>{t}</li>)}
          </ul>
        )}

        <div className={`${s.section} ${s.grid2}`}>
          <Slot id={`${p.slug}-visual-1`} need={`${p.title.split(" — ")[0]} key screen`} />
          <Slot id={`${p.slug}-visual-2`} need={`${p.title.split(" — ")[0]} supporting visual`} />
        </div>

        <div className={s.section}>
          <Link className={s.ctaBlock} href={caseStudyHref(p)}>
            <span className={s.cta}>
              Read full case study <span aria-hidden="true">→</span>
            </span>
            <span className={s.p}>Explore the complete process, design decisions, key workflows and outcomes.</span>
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
