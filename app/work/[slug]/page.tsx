import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HoverPreview from "@/components/site/HoverPreview";
import ProjectMedia from "@/components/site/ProjectMedia";
import SiteShell from "@/components/site/SiteShell";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import s from "@/components/site/site.module.css";
import { caseStudies, categories, projectBySlug } from "@/lib/site/content";

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: `${p.title} — Nishanth Silla`, description: p.description } : {};
}

/** The four parts of the full case study, shown as clearly labelled slots until the write-up exists. */
const PENDING = ["Problem", "Approach", "Key decisions", "Outcome"];

export default async function CaseStudyPage({ params }: Props) {
  const p = projectBySlug((await params).slug);
  if (!p || p.external) notFound();
  const cat = categories.find((c) => c.id === p.category)!;
  const i = caseStudies.indexOf(p);
  const next = caseStudies[(i + 1) % caseStudies.length];

  return (
    <SiteShell>
      <article>
        <header className={`${s.container} ${s.csHead}`}>
          <Link className={s.back} href={`/?c=${p.category}#work`}>
            <span aria-hidden="true">←</span> {cat.label}
          </Link>
          <span className={s.eyebrow}>{p.eyebrow}</span>
          <h1 className={`${s.display} ${s.csTitle}`}>{p.title}</h1>
          {p.description && <p className={`${s.lede} ${s.csLede}`}>{p.description}</p>}
          <dl className={s.csMeta}>
            {p.org && (
              <div><dt>Company</dt><dd>{p.org}</dd></div>
            )}
            {p.year && (
              <div><dt>Year</dt><dd>{p.year}</dd></div>
            )}
            {p.role && (
              <div><dt>Role</dt><dd>{p.role}</dd></div>
            )}
            <div><dt>Category</dt><dd>{cat.label}</dd></div>
          </dl>
        </header>

        <div className={s.container}>
          <AnimatedContent distance={16} duration={0.6} trigger="mount" delay={0.05}>
            <ProjectMedia project={p} className={s.csHero} fill={0.72} eager />
          </AnimatedContent>
          {p.tags && (
            <ul className={s.tags} aria-label="Highlights" style={{ marginTop: 24 }}>
              {p.tags.map((t) => <li key={t} className={s.tag}>{t}</li>)}
            </ul>
          )}

          {p.contribution && (
            <AnimatedContent className={s.csSection} distance={16} duration={0.6}>
              <div>
                <span className={s.eyebrow}>01</span>
                <h2 className={s.h3} style={{ marginTop: 8 }}>My contribution</h2>
              </div>
              <ul className={s.csList}>
                {p.contribution.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </AnimatedContent>
          )}

          <AnimatedContent className={s.csSection} distance={16} duration={0.6}>
            <div>
              <span className={s.eyebrow}>02</span>
              <h2 className={s.h3} style={{ marginTop: 8 }}>Case study</h2>
              <span className={s.badge} style={{ marginTop: 16 }}>Coming soon</span>
            </div>
            <div className={s.pending}>
              {PENDING.map((k) => (
                <div key={k} className={s.pendingItem}>
                  <b>{k}</b>
                  <p>Details to be updated.</p>
                </div>
              ))}
            </div>
          </AnimatedContent>

          <Link className={s.nextLink} href={`/work/${next.slug}`}>
            <span className={s.eyebrow}>Next case study</span>
            <HoverPreview preview={{ title: next.title, meta: next.eyebrow, render: <ProjectMedia project={next} fill={0.86} /> }}>
              <span className={s.nextTitle}>
                {next.title} <span className={s.arrow} aria-hidden="true">→</span>
              </span>
            </HoverPreview>
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
