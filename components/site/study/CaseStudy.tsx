import Link from "next/link";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import type { Block, Study } from "@/lib/site/studies/types";
import { Diagram, Screen } from "./Media";
import s from "./study.module.css";

/*
 * The long-form case-study layout shared by Ambient AI and Self-Ready:
 * hero → overview → challenge → objective → approach (with the product
 * screens placed in the story) → user journey → architecture → decisions →
 * outcome → reflection. Copy comes from lib/site/studies/*.
 */

function Blocks({ items, lead = false }: { items: Block[]; lead?: boolean }) {
  return (
    <>
      {items.map((b, i) =>
        typeof b === "string" ? (
          <p key={i} className={lead && i === 0 ? s.lead : s.p}>{b}</p>
        ) : "ul" in b ? (
          <ul key={i} className={s.list}>{b.ul.map((x) => <li key={x}>{x}</li>)}</ul>
        ) : "ol" in b ? (
          <ol key={i} className={s.list}>{b.ol.map((x) => <li key={x}>{x}</li>)}</ol>
        ) : (
          <dl key={i} className={s.terms}>
            {b.dl.map((x) => (
              <div key={x.k}>
                <dt>{x.k}</dt>
                <dd>{x.v}</dd>
              </div>
            ))}
          </dl>
        ),
      )}
    </>
  );
}

const Label = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <p className={s.label}>
    <span>{n}</span> {children}
  </p>
);

const Reveal = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <AnimatedContent className={className} distance={16} duration={0.6}>{children}</AnimatedContent>
);

export default function CaseStudy({ study: st }: { study: Study }) {
  const screen = (id: string) => st.screens.find((x) => x.id === id)!;
  return (
    <article className={s.study}>
      {/* 01 hero */}
      <header className={`${site.container} ${s.hero}`}>
        <Link className={site.back} href={`/work/${st.slug}`}>
          <span aria-hidden="true">←</span> {st.title} overview
        </Link>
        <p className={site.eyebrow}>Case study · {st.category}</p>
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
        <Screen slug={st.slug} screen={screen(st.hero)} priority />
      </div>

      {/* 02 overview */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="overview">
        <Reveal className={s.split}>
          <div>
            <Label n="01">Project</Label>
            <h2 id="overview" className={s.h2}>Overview</h2>
          </div>
          <div className={s.flow}><Blocks items={st.overview} lead /></div>
        </Reveal>
      </section>

      {/* 03 challenge */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="challenge">
        <Reveal className={s.split}>
          <div>
            <Label n="02">The challenge</Label>
            <h2 id="challenge" className={s.h2}>{st.challenge.title}</h2>
          </div>
          <div className={s.flow}><Blocks items={st.challenge.body} /></div>
        </Reveal>
        {st.challenge.question && (
          <Reveal>
            <blockquote className={s.question}>
              <p>{st.challenge.question}</p>
            </blockquote>
          </Reveal>
        )}
      </section>

      {/* 04 objective — an inverted band */}
      <section className={s.band} aria-labelledby="objective">
        <div className={site.container}>
          <Reveal>
            <Label n="03">The design objective</Label>
            <h2 id="objective" className={s.bandTitle}>{st.objective.statement}</h2>
          </Reveal>
          <Reveal className={s.objectives}>
            <p className={s.bandLead}>{st.objective.lead}</p>
            <ol>
              {st.objective.items.map((x, i) => (
                <li key={x}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {x}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 05 approach */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="approach">
        <Reveal>
          <Label n="04">Design approach</Label>
          <h2 id="approach" className={s.h2}>My approach</h2>
        </Reveal>
        <ol className={s.steps}>
          {st.approach.map((step) => {
            const shots = step.shots?.ids.map(screen) ?? [];
            const side = step.shots?.layout === "side";
            return (
              <li key={step.n} className={s.step}>
                <div className={side ? s.stepSide : s.stepText}>
                  <Reveal className={s.stepHead}>
                    <span className={s.stepN}>{step.n}</span>
                    <h3 className={s.h3}>{step.title}</h3>
                  </Reveal>
                  <Reveal className={s.flow}><Blocks items={step.body} /></Reveal>
                  {side && shots[0] && <div className={s.sideShot}><Screen slug={st.slug} screen={shots[0]} /></div>}
                </div>
                {!side && shots.length > 0 && (
                  <div className={step.shots?.layout === "pair" ? s.pair : s.wide}>
                    {shots.map((x) => <Screen key={x.id} slug={st.slug} screen={x} />)}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* 06–07 diagrams, each its own section */}
      {[st.journey, st.architecture].map((d, i) => (
        <section key={d.file} className={`${site.container} ${s.section}`} aria-labelledby={`diagram-${i}`}>
          <Reveal className={s.diagramHead}>
            <Label n={i === 0 ? "05" : "06"}>{i === 0 ? "User journey" : "Architecture"}</Label>
            <h2 id={`diagram-${i}`} className={s.h2}>{d.title}</h2>
            <p className={s.p}>{d.intro}</p>
          </Reveal>
          <Diagram slug={st.slug} d={d} n={String(i + 1)} />
        </section>
      ))}

      {/* 08 decisions */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="decisions">
        <Reveal>
          <Label n="07">Decisions</Label>
          <h2 id="decisions" className={s.h2}>Key design decisions</h2>
        </Reveal>
        <ol className={s.decisions}>
          {st.decisions.map((d, i) => (
            <li key={d.t}>
              <span className={s.decN}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.t}</h3>
              <p>{d.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 09 outcome */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="outcome">
        <Reveal className={s.outcome}>
          <Label n="08">Outcome</Label>
          <h2 id="outcome" className={s.outcomeLead}>{st.outcome.lead}</h2>
          <div className={s.outcomeBody}>{st.outcome.body.map((p) => <p key={p} className={s.p}>{p}</p>)}</div>
        </Reveal>
      </section>

      {/* 10 reflection */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="reflection">
        <Reveal className={s.split}>
          <div>
            <Label n="09">Reflection</Label>
            <h2 id="reflection" className={s.srOnly}>Reflection</h2>
          </div>
          <div className={s.flow}>
            <blockquote className={s.pull}><p>{st.reflection.quote}</p></blockquote>
            {st.reflection.body.map((p) => <p key={p} className={s.p}>{p}</p>)}
          </div>
        </Reveal>
      </section>

      {/* next */}
      <nav className={`${site.container} ${s.next}`} aria-label="More work">
        <Link href={st.next.href} className={s.nextLink}>
          <span className={site.eyebrow}>Next case study</span>
          <span className={s.nextTitle}>
            {st.next.title} <span aria-hidden="true">→</span>
          </span>
        </Link>
        <Link href="/#work" className={`${site.btn} ${site.btnSecondary}`}>All work</Link>
      </nav>
    </article>
  );
}
