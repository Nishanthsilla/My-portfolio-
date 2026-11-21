import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import site from "@/components/site/site.module.css";
import s from "@/components/site/beyond.module.css";
import f from "@/components/site/beyond/forma.module.css";
import { Zoom, ZoomGroup } from "@/components/site/beyond/Zoomable";
import { forma25 as c } from "@/lib/site/forma25";

export const metadata: Metadata = {
  title: "FORMA 25 — Beyond the Interface — Nishanth Silla",
  description: "CARRY / RE:FORM — FORMA 25: a configurable, modular backpack concept. One core. Different journeys.",
};

const Num = ({ n }: { n: number }) => <span className={f.num}>{String(n).padStart(2, "0")}</span>;

/** A self-initiated physical-product concept, in Nishanth's words. Nothing here is presented as built. */
export default function Forma25() {
  const pics = [c.hero, ...c.usage.cases, c.solution.ecosystem, c.solution.modules, c.decisions.dimensions, c.material.blueprint];
  return (
    <SiteShell>
      <ZoomGroup pics={pics}>
        <article className={site.container}>
          {/* ---------- header ---------- */}
          <header className={s.head}>
            <Link className={site.back} href="/beyond"><span aria-hidden="true">←</span> Beyond the Interface</Link>
            <div className={f.topRow}>
              <span className={f.kicker}>{c.kicker}</span>
              <span className={`${s.status} ${s.s_Concept}`}>{c.status}</span>
            </div>
            <h1 className={s.title}>{c.title}</h1>
            <p className={f.tagline}>{c.tagline}</p>
            <p className={s.line}>{c.line}</p>
            <dl className={f.meta}>
              {c.meta.map((m) => <div key={m.k}><dt>{m.k}</dt><dd>{m.v}</dd></div>)}
            </dl>
          </header>

          <div className={f.hero}><Zoom pic={c.hero} /></div>

          {/* ---------- 01 context ---------- */}
          <section className={s.section}>
            <div className={s.split}>
              <div><Num n={1} /><h2 className={s.h2}>{c.context.title}</h2></div>
              <div className={f.prose}>{c.context.paras.map((p, i) => <p key={i} className={i === 0 ? s.lead : s.p}>{p}</p>)}</div>
            </div>
          </section>

          {/* ---------- 02 problem ---------- */}
          <section className={s.section}>
            <Num n={2} />
            <h2 className={s.h2}>{c.problem.title}</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.problem.lead}</p>
            <div className={f.cards4}>
              {c.problem.points.map((p) => <div key={p.k} className={f.card}><b>{p.k}</b><p>{p.v}</p></div>)}
            </div>
            <p className={f.callout}>{c.problem.close}</p>
          </section>

          {/* ---------- 03 challenge ---------- */}
          <section className={s.section}>
            <Num n={3} />
            <h2 className={s.h2}>{c.challenge.title}</h2>
            <blockquote className={f.hmw}>{c.challenge.question}</blockquote>
            <p className={s.p}>The design needed to support:</p>
            <ul className={f.checks}>{c.challenge.needs.map((n) => <li key={n}>{n}</li>)}</ul>
          </section>

          {/* ---------- 04 usage ---------- */}
          <section className={s.section}>
            <Num n={4} />
            <h2 className={s.h2}>{c.usage.title}</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.usage.lead}</p>
            <div className={f.usage}>
              {c.usage.cases.map((u) => (
                <div key={u.k} className={f.useCase}>
                  <Zoom pic={u} small />
                  <b>{u.k}</b>
                  <p>{u.v}</p>
                </div>
              ))}
            </div>
            <p className={f.insight}><span>Key insight</span>{c.usage.insight}</p>
          </section>

          {/* ---------- 05 solution ---------- */}
          <section className={s.section}>
            <Num n={5} />
            <h2 className={s.h2}>{c.solution.title}</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.solution.lead}</p>
            <div className={f.wide}><Zoom pic={c.solution.ecosystem} caption="The system: core, external modules, internal organizers, expansion layer and shoe pod." /></div>
            <p className={s.p} style={{ marginTop: 40 }}>{c.solution.sub}</p>
            <div className={f.systems}>
              {c.solution.systems.map((sy, i) => (
                <div key={sy.k} className={f.system}>
                  <span className={f.sysNum}>{String(i + 1).padStart(2, "0")}</span>
                  <b>{sy.k}</b>
                  <ul>{sy.v.map((v) => <li key={v}>{v}</li>)}</ul>
                  {sy.note && <p>{sy.note}</p>}
                </div>
              ))}
            </div>
            <div className={f.wide}><Zoom pic={c.solution.modules} caption="Every part of the kit, laid out." /></div>
          </section>

          {/* ---------- 06 decisions ---------- */}
          <section className={s.section}>
            <Num n={6} />
            <h2 className={s.h2}>{c.decisions.title}</h2>
            <div className={f.decisions}>
              {c.decisions.items.map((d, i) => (
                <div key={d.k} className={f.decision}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{d.k}</h3>
                  <p>{d.v}</p>
                </div>
              ))}
            </div>
            <div className={f.wide}><Zoom pic={c.decisions.dimensions} caption="Technical views, dimensions and the capacity configuration: 25L core → about 35L → about 40L." /></div>
          </section>

          {/* ---------- 07 material ---------- */}
          <section className={s.section}>
            <Num n={7} />
            <h2 className={s.h2}>{c.material.title}</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.material.lead}</p>
            <div className={f.matGrid}>
              <div className={f.palette}>
                {c.material.palette.map((p) => (
                  <div key={p.k}>
                    <span className={f.swatches}>{p.c.map((x) => <i key={x} style={{ background: x }} />)}</span>
                    <b>{p.k}</b>
                    <p>{p.v}</p>
                  </div>
                ))}
              </div>
              <div>
                <span className={site.eyebrow}>Proposed materials</span>
                <ul className={f.materials}>{c.material.materials.map((m) => <li key={m}>{m}</li>)}</ul>
                <p className={f.note}>{c.material.note}</p>
              </div>
            </div>
            <div className={f.wide}><Zoom pic={c.material.blueprint} caption="Blueprint: orthographic views, component architecture, technical drawings and materials." /></div>
          </section>

          {/* ---------- 08 ecosystem & outcome ---------- */}
          <section className={s.section}>
            <Num n={8} />
            <h2 className={s.h2}>{c.ecosystem.title}</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.ecosystem.lead}</p>
            <div className={f.cards4}>
              {c.ecosystem.kits.map((k) => <div key={k.k} className={f.card}><b>{k.k}</b><p>{k.v}</p></div>)}
            </div>
            <p className={s.p} style={{ marginTop: 32 }}>{c.ecosystem.modesLead}</p>
            <div className={f.modes}>{c.ecosystem.modes.map((m) => <span key={m}>{m}</span>)}</div>

            <div className={f.outcome}>
              <span className={site.eyebrow}>The outcome</span>
              {c.ecosystem.outcome.map((p) => <p key={p}>{p}</p>)}
              <p className={f.sign}>{c.tagline}</p>
            </div>
            <div className={s.split} style={{ marginTop: 48 }}>
              <div><span className={site.eyebrow}>Next steps</span></div>
              <p className={s.p}>{c.ecosystem.next}</p>
            </div>
          </section>

          <section className={s.section}>
            <Link className={site.nextLink} href="/beyond">
              <span className={site.eyebrow}>Back to</span>
              <span className={site.nextTitle}>Beyond the Interface <span className={site.arrow} aria-hidden="true">→</span></span>
            </Link>
          </section>
        </article>
      </ZoomGroup>
    </SiteShell>
  );
}
