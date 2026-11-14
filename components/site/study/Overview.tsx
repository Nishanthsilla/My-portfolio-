import Link from "next/link";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import type { Study } from "@/lib/site/studies/types";
import { Screen } from "./Media";
import s from "./study.module.css";

/** Level 1: the short project overview, readable in under a minute, leading into the full case study. */
export default function Overview({ study: st, media, back }: { study: Study; media?: React.ReactNode; back: { href: string; label: string } }) {
  const full = `/work/${st.slug}/case-study`;
  return (
    <article className={s.study}>
      <header className={`${site.container} ${s.hero}`}>
        <Link className={site.back} href={back.href}>
          <span aria-hidden="true">←</span> {back.label}
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
        {media ?? <Screen slug={st.slug} screen={st.screens.find((x) => x.id === st.hero)!} priority />}
      </div>

      <section className={`${site.container} ${s.section}`} aria-labelledby="overview">
        <AnimatedContent className={s.split} distance={16} duration={0.6}>
          <div>
            <p className={s.label}><span>01</span> Project</p>
            <h2 id="overview" className={s.h2}>Overview</h2>
          </div>
          <div className={s.flow}>
            {st.overview.map((p, i) => typeof p === "string" && <p key={i} className={i === 0 ? s.lead : s.p}>{p}</p>)}
          </div>
        </AnimatedContent>
      </section>

      <section className={`${site.container} ${s.section}`} aria-labelledby="objective">
        <AnimatedContent className={s.split} distance={16} duration={0.6}>
          <div>
            <p className={s.label}><span>02</span> The design objective</p>
            <h2 id="objective" className={s.h2}>{st.objective.statement}</h2>
          </div>
          <ol className={s.list}>{st.objective.items.map((x) => <li key={x}>{x}</li>)}</ol>
        </AnimatedContent>
      </section>

      <nav className={`${site.container} ${s.next}`} aria-label="Full case study">
        <Link href={full} className={s.nextLink}>
          <span className={site.eyebrow}>The challenge, approach, user journey, architecture and key decisions</span>
          <span className={s.nextTitle}>
            Read the full case study <span aria-hidden="true">→</span>
          </span>
        </Link>
      </nav>
    </article>
  );
}
