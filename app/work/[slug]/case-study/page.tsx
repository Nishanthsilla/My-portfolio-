import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectMedia from "@/components/site/ProjectMedia";
import SiteShell from "@/components/site/SiteShell";
import Slot from "@/components/site/Slot";
import { NeedsConfirmation } from "@/components/site/selfready/engine";
import site from "@/components/site/site.module.css";
import s from "@/components/site/selfready/selfready.module.css";
import { projectBySlug, templateStudies } from "@/lib/site/content";
import { caseStudyHref, categoryHref, categoryLabel, neighbours, overviewHref } from "@/lib/site/routes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templateStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  return p ? { title: `${p.title} — full case study — Nishanth Silla`, description: p.description } : {};
}

/** The parts of the full story; each shows a labelled slot until the project's draft is provided. */
const STORY = [
  { k: "Context and background", img: "context visual" },
  { k: "The problem", img: null },
  { k: "My role and collaboration", img: null },
  { k: "Research and discovery", img: "research artefact" },
  { k: "Design strategy", img: null },
  { k: "Key workflows and screens", img: "key workflow screens" },
  { k: "Design decisions and trade-offs", img: "before / after comparison" },
  { k: "Outcome", img: null },
  { k: "Reflection", img: null },
];

/** Level 2 — the full case study. Existing content is shown; the rest of the story has labelled slots. */
export default async function ProjectCaseStudy({ params }: Props) {
  const p = projectBySlug((await params).slug);
  if (!p || p.external || p.featured) notFound();
  const cat = categoryLabel(p.category);
  const { prev, next } = neighbours(p);
  const short = p.title.split(" — ")[0];
  return (
    <SiteShell>
      <article className={site.container}>
        <header className={s.hero}>
          <Link className={site.back} href={overviewHref(p)}>
            <span aria-hidden="true">←</span> {p.title} overview
          </Link>
          <span className={site.eyebrow}>Case study · {cat}</span>
          <h1 className={s.heroTitle} style={{ fontSize: "clamp(44px, 7vw, 96px)" }}>{p.title}</h1>
          <p className={s.heroLine}>{p.description ?? <NeedsConfirmation>One-line description to be added</NeedsConfirmation>}</p>
          <dl className={s.metaRow}>
            {([["Company", p.org], ["Role", p.role], ["Timeline", p.year], ["Category", cat]] as [string, string | undefined][]).map(([k, v]) => (
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

        <section className={s.section}>
          <div className={s.quoteBox} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 18 }}>
            <NeedsConfirmation>Full case study coming soon</NeedsConfirmation>
            <span className={s.p} style={{ maxWidth: "none" }}>
              What is here comes from the existing portfolio and CV. The full story will be added from the {short} draft.
            </span>
          </div>
        </section>

        {p.contribution?.length ? (
          <section className={s.section}>
            <div className={s.sectionHead}>
              <div>
                <span className={s.num}>My contribution</span>
                <h2 className={s.h2}>What I did.</h2>
              </div>
              <ul className={site.csList}>{p.contribution.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </section>
        ) : null}

        {STORY.map((st, i) => (
          <section key={st.k} className={s.section} style={{ paddingTop: 72 }}>
            <div className={s.sectionHead} style={{ marginBottom: st.img ? 24 : 0 }}>
              <div>
                <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
                <h2 className={s.h2} style={{ fontSize: "clamp(26px, 3vw, 38px)" }}>{st.k}</h2>
              </div>
              <div className={s.pendingBox}>
                <NeedsConfirmation>To be added</NeedsConfirmation>
                <p>From the {short} case-study draft.</p>
              </div>
            </div>
            {st.img && <Slot id={`${p.slug}-${st.img.replace(/[^a-z]+/g, "-")}`} need={`${short} — ${st.img}`} solo />}
          </section>
        ))}

        <section className={s.section}>
          <Link className={site.nextLink} href={caseStudyHref(next)}>
            <span className={site.eyebrow}>Next case study</span>
            <span className={site.nextTitle}>
              {next.title} <span className={site.arrow} aria-hidden="true">→</span>
            </span>
          </Link>
          <p style={{ marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <Link className={site.arrowLink} href={caseStudyHref(prev)}>
              <span aria-hidden="true">←</span> Previous: {prev.title}
            </Link>
            <Link className={site.arrowLink} href={categoryHref(p.category)}>
              All {cat} work
            </Link>
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
