import Link from "next/link";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import type { Block, Study } from "@/lib/site/studies/types";
import { screenFile } from "./assets";
import Catalogue from "./Catalogue";
import { Flowchart, Screen } from "./Media";
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

export default function CaseStudy({ study: st, media }: { study: Study; media?: React.ReactNode }) {
  const screen = (id: string) => st.screens.find((x) => x.id === id)!;
  // section numbers count only the sections this study has
  let sec = 0;
  const N = () => String(++sec).padStart(2, "0");
  return (
    <article className={s.study}>
      {/* 01 hero */}
      <header className={`${site.container} ${s.hero}`}>
        <Link className={site.back} href={st.back?.href ?? `/work/${st.slug}`}>
          <span aria-hidden="true">←</span> {st.back?.label ?? `${st.title} overview`}
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
        {media ?? <Screen slug={st.slug} screen={screen(st.hero)} priority />}
      </div>

      {/* 02 overview */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="overview">
        <Reveal className={s.split}>
          <div>
            <Label n={N()}>Project</Label>
            <h2 id="overview" className={s.h2}>Overview</h2>
          </div>
          <div className={s.flow}><Blocks items={st.overview} lead /></div>
        </Reveal>
      </section>

      {/* 03 challenge */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="challenge">
        <Reveal className={s.split}>
          <div>
            <Label n={N()}>The challenge</Label>
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
            <Label n={N()}>The design objective</Label>
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

      {/* why this design: the personality behind it */}
      {st.personality && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="personality">
          <Reveal className={s.split}>
            <div>
              <Label n={N()}>Why this design</Label>
              <h2 id="personality" className={s.h2}>{st.personality.title}</h2>
            </div>
            <div className={s.flow}><Blocks items={st.personality.body} lead /></div>
          </Reveal>
          <ol className={s.decisions}>
            {st.personality.traits.map((d, i) => (
              <li key={d.t}>
                <span className={s.decN}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{d.t}</h3>
                <p>{d.d}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* the tools behind it */}
      {st.toolkit && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="toolkit">
          <Reveal>
            <Label n={N()}>Tools</Label>
            <h2 id="toolkit" className={s.h2}>{st.toolkit.title}</h2>
            <p className={s.p}>{st.toolkit.lead}</p>
          </Reveal>
          <ul className={s.kit}>
            {st.toolkit.items.map((k) => (
              <li key={k.t}>
                <b>{k.t}</b>
                <p>{k.d}</p>
              </li>
            ))}
          </ul>
          {st.toolkit.shot && <div className={s.wide}><Screen slug={st.slug} screen={screen(st.toolkit.shot)} /></div>}
        </section>
      )}

      {/* 05 approach */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="approach">
        <Reveal>
          <Label n={N()}>Design approach</Label>
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

      {/* screen by screen */}
      {st.tour && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="tour">
          <Reveal>
            <Label n={N()}>Screen by screen</Label>
            <h2 id="tour" className={s.h2}>Every screen, and why it&rsquo;s there</h2>
          </Reveal>
          <ol className={s.contribs}>
            {st.tour.map((c, i) => (
              <li key={c.id} className={s.contrib}>
                <Reveal className={s.contribHead}>
                  <span className={s.stepN}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={s.h3}>{c.t}</h3>
                </Reveal>
                <div className={s.wide}><Screen slug={st.slug} screen={screen(c.id)} /></div>
                <Reveal className={s.contribBody}>
                  <div><p className={s.contribK}>What it is</p><p className={s.p}>{c.what}</p></div>
                  <div><p className={s.contribK}>Why I did it</p><p className={s.p}>{c.why}</p></div>
                  <div><p className={s.contribK}>The outcome</p><p className={s.p}>{c.outcome}</p></div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 06 user journey */}
      {st.journey && (
      <section className={`${site.container} ${s.section}`} aria-labelledby="journey">
        <Reveal className={s.diagramHead}>
          <Label n={N()}>User journey</Label>
          <h2 id="journey" className={s.h2}>{st.journey.title}</h2>
          <p className={s.p}>{st.journey.intro}</p>
        </Reveal>
        <Flowchart slug={st.slug} name="user_flow" fig="1" note={st.journey.note} alt={`${st.title} end-to-end user flow: ${st.journey.stages.map((g, i) => `${i + 1}. ${g.label} — ${g.steps.join(", ")}`).join("; ")}`} />
      </section>
      )}

      {/* 07 architecture */}
      {st.architecture && (
      <section className={`${site.container} ${s.section}`} aria-labelledby="architecture">
        <Reveal className={s.diagramHead}>
          <Label n={N()}>Architecture</Label>
          <h2 id="architecture" className={s.h2}>{st.architecture.title}</h2>
          <p className={s.p}>{st.architecture.intro}</p>
        </Reveal>
        <Flowchart slug={st.slug} name="architecture" fig="2" note={st.architecture.note} alt={`${st.title} product architecture: ${st.architecture.layers.map((l) => `${l.label} — ${l.items.join(", ")}`).join("; ")}`} />
      </section>
      )}

      {/* how it's built: code and data */}
      {st.build && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="build">
          <Reveal className={s.split}>
            <div>
              <Label n={N()}>Code and data</Label>
              <h2 id="build" className={s.h2}>{st.build.title}</h2>
            </div>
            <div className={s.flow}><Blocks items={st.build.body} lead /></div>
          </Reveal>
        </section>
      )}

      {/* key design contributions */}
      {st.contributions && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="contributions">
          <Reveal>
            <Label n={N()}>Contributions</Label>
            <h2 id="contributions" className={s.h2}>Key design contributions</h2>
          </Reveal>
          <ol className={s.contribs}>
            {st.contributions.map((c, i) => (
              <li key={c.t} className={s.contrib}>
                <Reveal className={s.contribHead}>
                  <span className={s.stepN}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={s.h3}>{c.t}</h3>
                </Reveal>
                <Reveal className={s.contribBody}>
                  <div><p className={s.contribK}>The challenge</p><p className={s.p}>{c.challenge}</p></div>
                  <div><p className={s.contribK}>My approach</p><ul className={s.list}>{c.approach.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><p className={s.contribK}>Design objective</p><p className={s.p}>{c.objective}</p></div>
                </Reveal>
                {c.shots && (
                  <div className={c.shots.layout === "pair" ? s.pair : s.wide}>
                    {c.shots.ids.map((id) => <Screen key={id} slug={st.slug} screen={screen(id)} />)}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* problems and solutions */}
      {st.problems && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="problems">
          <Reveal>
            <Label n={N()}>Problems and solutions</Label>
            <h2 id="problems" className={s.h2}>What went wrong, and how I fixed it</h2>
          </Reveal>
          <ol className={s.contribs}>
            {st.problems.map((c, i) => (
              <li key={c.t} className={s.contrib}>
                <Reveal className={s.contribHead}>
                  <span className={s.stepN}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={s.h3}>{c.t}</h3>
                </Reveal>
                <Reveal className={`${s.contribBody} ${s.twoCol}`}>
                  <div><p className={s.contribK}>The problem</p><p className={s.p}>{c.problem}</p></div>
                  <div><p className={s.contribK}>The solution</p><p className={s.p}>{c.solution}</p></div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* optimisations */}
      {st.optimisations && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="optimisations">
          <Reveal className={s.split}>
            <div>
              <Label n={N()}>Optimisation</Label>
              <h2 id="optimisations" className={s.h2}>{st.optimisations.title}</h2>
              <p className={s.p} style={{ marginTop: 16 }}>{st.optimisations.lead}</p>
            </div>
            <ul className={s.list}>{st.optimisations.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </Reveal>
        </section>
      )}

      {/* 08 decisions */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="decisions">
        <Reveal>
          <Label n={N()}>Decisions</Label>
          <h2 id="decisions" className={s.h2}>{st.decisionsHead?.title ?? "Key design decisions"}</h2>
          {st.decisionsHead?.lead && <p className={s.p}>{st.decisionsHead.lead}</p>}
        </Reveal>
        {st.decisionsHead?.why ? (
          <Reveal>
            <table className={s.decTable}>
              <thead><tr><th>UX decision</th><th>{st.decisionsHead.why}</th></tr></thead>
              <tbody>{st.decisions.map((d) => <tr key={d.t}><td>{d.t}</td><td>{d.d}</td></tr>)}</tbody>
            </table>
            {st.decisionsHead.close && <p className={s.p} style={{ marginTop: 20 }}>{st.decisionsHead.close}</p>}
          </Reveal>
        ) : (
        <ol className={s.decisions}>
          {st.decisions.map((d, i) => (
            <li key={d.t}>
              <span className={s.decN}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.t}</h3>
              <p>{d.d}</p>
            </li>
          ))}
        </ol>
        )}
      </section>

      {/* 09 outcome */}
      {st.outcome && (
      <section className={`${site.container} ${s.section}`} aria-labelledby="outcome">
        <Reveal className={s.outcome}>
          <Label n={N()}>Outcome</Label>
          <h2 id="outcome" className={s.outcomeLead}>{st.outcome.lead}</h2>
          <div className={s.outcomeBody}><Blocks items={st.outcome.body} /></div>
          {st.outcome.note && <p className={s.outcomeNote}>{st.outcome.note}</p>}
        </Reveal>
      </section>
      )}

      {/* 10 reflection */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="reflection">
        <Reveal className={s.split}>
          <div>
            <Label n={N()}>Reflection</Label>
            <h2 id="reflection" className={s.srOnly}>Reflection</h2>
          </div>
          <div className={s.flow}>
            <blockquote className={s.pull}><p>{st.reflection.quote}</p></blockquote>
            {st.reflection.body.map((p) => <p key={p} className={s.p}>{p}</p>)}
          </div>
        </Reveal>
      </section>

      {/* closing statement */}
      {st.closing && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="closing">
          <Reveal className={s.closing}>
            <h2 id="closing" className={s.closingTitle}>{st.closing.title}</h2>
            <p className={s.p}>{st.closing.body}</p>
          </Reveal>
        </section>
      )}

      {/* 11 all platform screens (confidential client work: recreations, real ones on request) */}
      {st.screens.some((x) => x.locked) && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="all-screens">
          <Reveal className={s.diagramHead}>
            <Label n={N()}>The platform</Label>
            <h2 id="all-screens" className={s.h2}>See all platform screenshots</h2>
            <p className={s.p}>Every screen from the real {st.title} platform. It&rsquo;s client work, so the real screens are shared on request.</p>
          </Reveal>
          <Catalogue
            items={st.screens.filter((x) => x.locked).flatMap((x) => {
              const f = screenFile(st.slug, x.id);
              return f ? [{ id: x.id, label: x.need.split(" — ")[0], caption: x.caption, replica: f.src, width: f.width, height: f.height }] : [];
            })}
          />
        </section>
      )}

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
