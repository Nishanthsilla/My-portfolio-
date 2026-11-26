import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import PortfolioHero from "@/components/site/portfolioCover/Hero";
import site from "@/components/site/site.module.css";
import s from "@/components/site/study/study.module.css";
import { thisPortfolio as st } from "@/lib/site/studies/thisPortfolio";

export const metadata: Metadata = { title: `${st.title} — Nishanth Silla`, description: st.subtitle };

/** The simplified version: the idea, why it looks like this, the main screens, and how it was made, in a few minutes. */
export default function ThisPortfolioOverview() {
  const full = `/work/${st.slug}/case-study`;
  const n = (i: number) => String(i).padStart(2, "0");
  return (
    <SiteShell>
      <article className={s.study}>
        <header className={`${site.container} ${s.hero}`}>
          <Link className={site.back} href="/#work">
            <span aria-hidden="true">←</span> All work
          </Link>
          <p className={site.eyebrow}>Project overview · {st.category}</p>
          <h1 className={s.title}>{st.title}</h1>
          <p className={s.subtitle}>{st.subtitle}</p>
          <dl className={s.meta}>
            {st.meta.map((m) => (
              <div key={m.k} className={m.k === "Focus" ? s.metaWide : undefined}>
                <dt>{m.k}</dt>
                <dd>{m.v}</dd>
              </div>
            ))}
          </dl>
        </header>
        <div className={`${site.container} ${s.heroShot}`}>
          <PortfolioHero />
        </div>

        <section className={`${site.container} ${s.section}`} aria-labelledby="overview">
          <AnimatedContent className={s.split} distance={16} duration={0.6}>
            <div>
              <p className={s.label}><span>{n(1)}</span> Project</p>
              <h2 id="overview" className={s.h2}>Overview</h2>
            </div>
            <div className={s.flow}>
              {st.overview.map((p, i) => typeof p === "string" && <p key={i} className={i === 0 ? s.lead : s.p}>{p}</p>)}
            </div>
          </AnimatedContent>
        </section>

        {st.personality && (
          <section className={`${site.container} ${s.section}`} aria-labelledby="why">
            <AnimatedContent distance={16} duration={0.6}>
              <p className={s.label}><span>{n(2)}</span> Why this design</p>
              <h2 id="why" className={s.h2}>{st.personality.title}</h2>
            </AnimatedContent>
            <ol className={s.decisions}>
              {st.personality.traits.map((d, i) => (
                <li key={d.t}>
                  <span className={s.decN}>{n(i + 1)}</span>
                  <h3>{d.t}</h3>
                  <p>{d.d}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {st.tour && (
          <section className={`${site.container} ${s.section}`} aria-labelledby="screens">
            <AnimatedContent distance={16} duration={0.6}>
              <p className={s.label}><span>{n(3)}</span> The main screens</p>
              <h2 id="screens" className={s.h2}>What&rsquo;s on it, and why</h2>
            </AnimatedContent>
            <ol className={s.decisions}>
              {st.tour.slice(0, 5).map((c, i) => (
                <li key={c.id}>
                  <span className={s.decN}>{n(i + 1)}</span>
                  <h3>{c.t}</h3>
                  <p>{c.why} {c.outcome}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {st.toolkit && (
          <section className={`${site.container} ${s.section}`} aria-labelledby="tools">
            <AnimatedContent distance={16} duration={0.6}>
              <p className={s.label}><span>{n(4)}</span> How I made it</p>
              <h2 id="tools" className={s.h2}>{st.toolkit.title}</h2>
            </AnimatedContent>
            <ul className={s.kit}>
              {st.toolkit.items.map((k) => (
                <li key={k.t}>
                  <b>{k.t}</b>
                  <p>{k.d}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {st.outcome && (
          <section className={`${site.container} ${s.section}`} aria-labelledby="outcome">
            <AnimatedContent className={s.outcome} distance={16} duration={0.6}>
              <p className={s.label}><span>{n(5)}</span> Outcome</p>
              <h2 id="outcome" className={s.outcomeLead}>{st.outcome.lead}</h2>
            </AnimatedContent>
          </section>
        )}

        <nav className={`${site.container} ${s.next}`} aria-label="Full case study">
          <Link href={full} className={s.nextLink}>
            <span className={site.eyebrow}>The process, every screen, the code and database, what went wrong and how I fixed it</span>
            <span className={s.nextTitle}>
              Read the full case study <span aria-hidden="true">→</span>
            </span>
          </Link>
        </nav>
      </article>
    </SiteShell>
  );
}
