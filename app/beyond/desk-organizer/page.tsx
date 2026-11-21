import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import site from "@/components/site/site.module.css";
import s from "@/components/site/beyond.module.css";
import d from "@/components/site/beyond/desk.module.css";
import { Zoom, ZoomGroup } from "@/components/site/beyond/Zoomable";
import { desk as c, type Pic } from "@/lib/site/deskOrganizer";

export const metadata: Metadata = {
  title: "Modular Hanging Desk Organizer — Beyond the Interface — Nishanth Silla",
  description: "An industrial design concept: a modular hanging organizer that uses the unused space beneath a desk.",
};

const Num = ({ n }: { n: number }) => <span className={d.num}>{String(n).padStart(2, "0")}</span>;
const two = (n: number) => String(n).padStart(2, "0");

/** an approved render, or a labelled placeholder until the visual is supplied */
function Visual({ pic, caption, square, wide }: { pic: Pic; caption?: string; square?: boolean; wide?: boolean }) {
  if ("src" in pic) return <Zoom pic={pic} caption={caption} />;
  return (
    <figure style={{ margin: 0 }}>
      <div className={`${d.slot} ${square ? d.square : ""} ${wide ? d.wideSlot : ""}`} role="img" aria-label={`Image to come: ${pic.need}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 8" /></svg>
        <b>Visual {pic.slot} · to come</b>
        <span>{pic.need}</span>
      </div>
    </figure>
  );
}

/** A concept in development, in Nishanth's words. Nothing here is presented as built, measured or tested. */
export default function DeskOrganizer() {
  const I = c.img;
  const pics = [I.hero, I.sketch, I.exploded, I.tray, I.ortho].filter((p): p is Extract<Pic, { src: string }> => "src" in p);
  const dec = c.decisions;
  return (
    <SiteShell>
      <ZoomGroup pics={pics}>
        <article className={`${site.container} ${d.page}`}>
          {/* ---------- header ---------- */}
          <header className={s.head}>
            <Link className={site.back} href="/beyond"><span aria-hidden="true">←</span> Beyond the Interface</Link>
            <div className={d.heroGrid}>
              <div>
                <span className={`${s.status} ${s.s_Concept}`}>{c.status}</span>
                <h1 className={s.title} style={{ marginTop: 18 }}>{c.title}</h1>
                <p className={d.tagline}>{c.line}</p>
                <dl className={d.spec}>
                  {c.meta.map((m) => (
                    <div key={m.k}><dt>{m.k}</dt><dd>{m.v.replace(" (not yet validated)", "")}{m.v.includes("not yet validated") && <span className={d.pending}>Not yet validated</span>}</dd></div>
                  ))}
                </dl>
              </div>
              <Visual pic={I.hero} />
            </div>
          </header>

          {/* ---------- 01 introduction ---------- */}
          <section className={s.section}>
            <div className={s.split}>
              <div><Num n={1} /><h2 className={s.h2}>Introduction</h2></div>
              <div style={{ display: "grid", gap: 16 }}>{c.intro.slice(1).map((p, i) => <p key={i} className={i === 0 ? s.lead : s.p}>{p}</p>)}</div>
            </div>
          </section>

          {/* ---------- 02 context ---------- */}
          <section className={s.section}>
            <Num n={2} />
            <h2 className={s.h2}>Context & concept evolution</h2>
            <div className={d.evoGrid}>
              <div>
                <div style={{ display: "grid", gap: 14, marginBottom: 32 }}>{c.context.map((p, i) => <p key={i} className={s.p}>{p}</p>)}</div>
                <ol className={d.timeline}>
                  {c.evolution.map((e, i) => <li key={e.k}><i>{i + 1}</i><b>{e.k}</b><p>{e.v}</p></li>)}
                </ol>
                <p className={d.note}>{c.evolutionNote}</p>
              </div>
              <Visual pic={I.sketch} caption="Early exploration sketch. Dimensions and notes on the sheet are exploratory, not final." />
            </div>
          </section>

          {/* ---------- 03 problem ---------- */}
          <section className={s.section}>
            <Num n={3} />
            <h2 className={s.h2}>Problem</h2>
            <div className={s.split} style={{ marginTop: 16 }}>
              <p className={s.lead}>{c.problem[0]}</p>
              <p className={s.p}>{c.problem[1]}</p>
            </div>
            <div className={d.hmw}><span>Opportunity</span><p>{c.opportunity}</p></div>
          </section>

          {/* ---------- 04 challenge ---------- */}
          <section className={s.section}>
            <Num n={4} />
            <h2 className={s.h2}>Design challenge</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.challenge.lead}</p>
            <ul className={d.checks}>{c.challenge.items.map((t, i) => <li key={t}><em>{two(i + 1)}</em>{t}</li>)}</ul>
            <p className={d.callout}>{c.challenge.close}</p>
          </section>

          {/* ---------- 05 users ---------- */}
          <section className={s.section}>
            <Num n={5} />
            <h2 className={s.h2}>Target users</h2>
            <div className={d.cards3}>{c.users.list.map((u) => <div key={u.k} className={d.card}><b>{u.k}</b><p>{u.v}</p></div>)}</div>
            <p className={d.flag}>{c.users.note}</p>
          </section>

          {/* ---------- 06 assumptions ---------- */}
          <section className={s.section}>
            <div className={s.split}>
              <div>
                <Num n={6} /><h2 className={s.h2}>Design assumptions</h2>
                <p className={d.note} style={{ fontStyle: "normal", maxWidth: "24em" }}>{c.assumptions.note}</p>
              </div>
              <table className={d.table}>
                <thead><tr><th>Assumption</th><th>Design response</th></tr></thead>
                <tbody>{c.assumptions.rows.map(([a, r]) => <tr key={a}><td>{a}</td><td><span className={d.arrow}>→</span>{r}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          {/* ---------- 07 solution ---------- */}
          <section className={s.section}>
            <Num n={7} />
            <h2 className={s.h2}>Proposed solution</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>{c.intro[3]}</p>
            <div style={{ marginTop: 32 }}><Visual pic={I.exploded} caption="Exploded assembly: mounting frame, body with internal sliding ledges, removable trays and the detachable headphone peg." /></div>
            <div className={d.parts}>
              {c.components.map((p, i) => <div key={p.k} className={d.part}><em>{two(i + 1)}</em><b>{p.k}</b><p>{p.v}</p></div>)}
            </div>
            <div className={d.pair}>
              <Visual pic={I.configurations} />
              <Visual pic={I.lifestyle} />
            </div>
          </section>

          {/* ---------- 08 decisions ---------- */}
          <section className={s.section}>
            <Num n={8} />
            <h2 className={s.h2}>Key design decisions</h2>

            <div className={d.dec}>
              <div>
                <h3><small>8.1</small>Hanging structure</h3>
                {dec.hanging.map((p, i) => <p key={i} className={i === 0 ? d.strong : undefined}>{p}</p>)}
              </div>
              <Visual pic={I.mount} />
            </div>

            <div className={d.dec}>
              <div>
                <h3><small>8.2</small>Adjustable trays</h3>
                {dec.trays.map((p, i) => <p key={i} className={i === 0 ? d.strong : undefined}>{p}</p>)}
              </div>
              <div>
                <h3><small>8.3</small>Internal sliding ledges</h3>
                <p className={d.strong}>{dec.ledges.lead}</p>
                <div className={d.measure}><span>{dec.ledges.widthNote}</span><b>{dec.ledges.width}</b><em>On both internal side walls</em></div>
                <ul className={d.bul}>{dec.ledges.purpose.map((t) => <li key={t}>{t}</li>)}</ul>
                <p>{dec.ledges.close.split(". ")[0]}.</p>
                <p className={d.not}><b>Not a pegboard.</b> The adjustment mechanism uses internal sliding ledges, not an internal pegboard or peg-and-hole system.</p>
              </div>
            </div>
            <Visual pic={I.ledges} wide />

            <div className={d.dec} style={{ marginTop: 44 }}>
              <div>
                <h3><small>8.4</small>Anti-fall tray design</h3>
                <p className={d.strong}>{dec.antiFall.lead}</p>
                <ul className={d.bul}>{dec.antiFall.items.map((t) => <li key={t}>{t}</li>)}</ul>
                <p>{dec.antiFall.close}</p>
              </div>
              <Visual pic={I.tray} caption="Raised edges, a slight upward profile and rounded corners keep small items in place." />
            </div>

            <div className={d.dec}>
              <div>
                <h3><small>8.5</small>Independent headphone peg</h3>
                <p className={d.strong}>{dec.peg.lead}</p>
                <ul className={d.bul}>{dec.peg.items.map((t) => <li key={t}>{t}</li>)}</ul>
                <p>{dec.peg.close}</p>
              </div>
              <Visual pic={I.peg} />
            </div>
          </section>

          {/* ---------- 09 architecture ---------- */}
          <section className={s.section}>
            <Num n={9} />
            <h2 className={s.h2}>Product architecture</h2>
            <table className={d.table}>
              <thead><tr><th>Component</th><th>Function</th></tr></thead>
              <tbody>{c.architecture.map(([a, r]) => <tr key={a}><td>{a}</td><td>{r}</td></tr>)}</tbody>
            </table>
            <div className={d.flows}>
              <div className={d.flow}>
                <h3>Tray adjustment flow</h3>
                <ol>{c.trayFlow.map((t) => <li key={t}>{t}</li>)}</ol>
                <p className={d.note}>{c.trayFlowNote}</p>
              </div>
              <div className={d.flow}>
                <h3>Headphone peg interaction</h3>
                <ol>{c.pegFlow.map((t) => <li key={t}>{t}</li>)}</ol>
              </div>
            </div>
            <div style={{ marginTop: 40 }}><Visual pic={I.ortho} caption="Orthographic views: front, sides, top, bottom and rear. Proportions only; final dimensions are not yet established." /></div>
          </section>

          {/* ---------- 10 visual & material ---------- */}
          <section className={s.section}>
            <Num n={10} />
            <h2 className={s.h2}>Visual & material direction</h2>
            <div className={d.matGrid}>
              <div>
                <div className={d.swatchRow}>
                  {c.visual.filter((v) => v.c).map((v) => <div key={v.k} className={d.swatch}><i style={{ background: v.c }} /><span>{v.k}</span></div>)}
                </div>
                <dl className={d.dl}>{c.visual.map((v) => <div key={v.k}><dt>{v.k}</dt><dd>{v.v}</dd></div>)}</dl>
              </div>
              <div>
                <span className={site.eyebrow}>Potential materials</span>
                <ul className={d.bul}>{c.materials.map((m) => <li key={m}>{m}</li>)}</ul>
                <p className={d.note}>{c.materialsNote}</p>
              </div>
            </div>
            <div style={{ marginTop: 40 }}><Visual pic={I.material} wide /></div>
          </section>

          {/* ---------- 11 structure ---------- */}
          <section className={s.section}>
            <Num n={11} />
            <h2 className={s.h2}>Structural considerations</h2>
            <p className={s.lead} style={{ marginTop: 16 }}>The mounting structure, body, ledges and trays carry the load as one system.</p>
            <span className={site.eyebrow} style={{ display: "block", marginTop: 32 }}>Load path</span>
            <ol className={d.path}>{c.loadPath.map((p, i) => <li key={p}><i>{i + 1}</i>{p}</li>)}</ol>
            <div className={d.target}>
              <b>3–5<small>kg</small></b>
              <p>{c.engineeringNote}</p>
            </div>
            <div className={s.split} style={{ marginTop: 40 }}>
              <div><span className={site.eyebrow}>Engineering considerations</span></div>
              <ul className={d.bul} style={{ marginTop: 0 }}>{c.engineering.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </section>

          {/* ---------- 12 plan ---------- */}
          <section className={s.section}>
            <Num n={12} />
            <h2 className={s.h2}>Prototype & validation plan</h2>
            <p className={d.flag}>{c.planNote}</p>
            <div className={d.phases}>
              {c.plan.map((p) => <div key={p.k} className={d.phase}><b>{p.k}</b><ul>{p.v.map((t) => <li key={t}>{t}</li>)}</ul></div>)}
            </div>
            <div style={{ marginTop: 40 }}><Visual pic={I.cad} wide /></div>
          </section>

          {/* ---------- 13 limitations ---------- */}
          <section className={s.section}>
            <Num n={13} />
            <h2 className={s.h2}>Current limitations & open questions</h2>
            <ul className={d.limits}>{c.open.map((t, i) => <li key={t}><em>{two(i + 1)}</em>{t}</li>)}</ul>
          </section>

          {/* ---------- 14 outcome ---------- */}
          <section className={s.section}>
            <Num n={14} />
            <h2 className={s.h2}>Outcome & next steps</h2>
            <div className={d.outcome}>
              <p>The concept establishes a modular hanging storage system built around:</p>
              <ul className={d.outList}>{c.outcome.map((t) => <li key={t}>{t}</li>)}</ul>
              <div className={d.next}><span>Next</span><p>{c.next}</p></div>
            </div>
            <div style={{ marginTop: 40 }}><Visual pic={I.final} wide /></div>
            <div className={d.checkGrid}>
              <div>
                <span className={site.eyebrow}>Where the project stands</span>
                <ul className={d.checklist}>{c.checklist.map(([t, on]) => <li key={t} className={on ? d.on : undefined}><i />{t}</li>)}</ul>
              </div>
              <div className={d.maturity}>
                <span>Current maturity</span>
                <b>{c.maturity}</b>
                <div className={d.bar}><i /><i /><i /><i /></div>
                <div className={d.barLab}><span>Concept</span><span>CAD</span><span>Prototype</span><span>Validated</span></div>
              </div>
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
