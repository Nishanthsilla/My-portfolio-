import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import ImageSlot from "@/components/site/selfready/ImageSlot";
import { Chip, NeedsConfirmation, Shelf } from "@/components/site/selfready/engine";
import { ExceptionScene, HeroScene, HierarchyScene, ReviewScene, WorkflowScene } from "@/components/site/selfready/Scenes";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import s from "@/components/site/selfready/selfready.module.css";
import { selfReady } from "@/lib/site/selfReady";

export const metadata: Metadata = {
  title: "Self-Ready — full case study — Nishanth Silla",
  description: selfReady.oneLiner,
};

/*
 * Level 2: the full case study. Content comes only from the project brief;
 * anything not stated there is marked "Needs confirmation". All interface
 * motion is an illustrative reconstruction (see components/site/selfready).
 */

function Head({ n, title, children }: { n: string; title: string; children?: React.ReactNode }) {
  return (
    <AnimatedContent className={s.sectionHead} distance={16} duration={0.6}>
      <div>
        <span className={s.num}>{n}</span>
        <h2 className={s.h2}>{title}</h2>
      </div>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </AnimatedContent>
  );
}

const Draft = () => <NeedsConfirmation>Draft copy — confirm</NeedsConfirmation>;

export default function SelfReadyCaseStudy() {
  return (
    <SiteShell>
      <article className={site.container}>
        {/* 01 — Hero */}
        <header className={s.hero}>
          <Link className={site.back} href="/work/self-ready">
            <span aria-hidden="true">←</span> Self-Ready overview
          </Link>
          <span className={site.eyebrow}>01 · Case study · Product Strategy</span>
          <h1 className={s.heroTitle}>{selfReady.title}</h1>
          <p className={s.heroLine}>
            {selfReady.oneLiner} The design challenge: helping people understand what the AI found, check the evidence,
            and decide what happens next.
          </p>
          <dl className={s.metaRow}>
            {selfReady.meta.map((m) => (
              <div key={m.k}>
                <dt>{m.k}</dt>
                <dd>{m.status === "confirm" ? <NeedsConfirmation>{m.v}</NeedsConfirmation> : m.v}</dd>
              </div>
            ))}
            <div>
              <dt>Status</dt>
              <dd><NeedsConfirmation>To be confirmed</NeedsConfirmation></dd>
            </div>
          </dl>
        </header>
        <div className={s.heroMedia}>
          <HeroScene />
        </div>
        <div className={s.legend}>
          <span className={s.illus}>Illustrative reconstruction · not a product screenshot</span>
          <NeedsConfirmation>Status names are working terms</NeedsConfirmation>
        </div>
        <div className={s.scroll} aria-hidden="true"><i /> Scroll</div>

        <div className={s.section}>
          <ImageSlot id="sr-dashboard" solo caption="The real product view will replace this placeholder." />
        </div>

        {/* 02 — The challenge */}
        <section className={s.section} aria-labelledby="sr-challenge">
          <Head n="02 — The challenge" title="The AI can read the shelf. A person still has to decide.">
            <p className={s.lead}>
              Self-Ready applies AI to retail shelf intelligence: from a shelf image, it identifies likely associations
              between products and the shelf labels that belong to them.
            </p>
            <p className={s.p}>
              A likely association is not yet a decision. Someone has to understand what the system concluded, see why,
              settle what it isn&apos;t sure about, and choose what happens next — that is where the design work sits. <Draft />
            </p>
          </Head>
          <div className={s.quoteBox}>
            “{selfReady.challenge}”
            <small>The central design challenge, as defined for the project</small>
          </div>
          <div className={s.split} style={{ marginTop: 48 }}>
            <figure className={`${s.figure} ${s.panel}`} style={{ margin: 0 }}>
              <Shelf st={{ products: 1, labels: 1, links: [{ i: 2, p: 1 }, { i: 6, p: 1 }, { i: 13, p: 1, tone: "flag" }], flag: { i: 13, a: 1 } }} />
              <figcaption>
                <b>Shelf → products → labels → review.</b> Solid orange boxes: detected products. Dashed boxes: shelf labels.
                Lines: proposed associations. The dashed orange line marks one a person needs to look at. <span className={s.illus}>Illustrative</span>
              </figcaption>
            </figure>
            <ImageSlot id="sr-shelf-analysis" caption="The Shelf Analysis screen in the product." />
          </div>
        </section>

        {/* 03 — Understanding the workflow */}
        <section className={s.section} aria-labelledby="sr-flow">
          <Head n="03 — Understanding the workflow" title="From a capture to a published result.">
            <p className={s.lead}>The project material names these areas. Read in order, they outline a journey: capture, analysis, review, publishing and traceability.</p>
            <p className={s.p}>
              <NeedsConfirmation>Scope to confirm</NeedsConfirmation> Not every area is confirmed as part of Self-Ready, so
              this is an outline of the journey, not a specification.
            </p>
          </Head>
          <div className={s.panel} style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <WorkflowScene />
          </div>
          <div className={s.grid2} style={{ marginTop: 24 }}>
            <ImageSlot id="sr-capture-sessions" />
            <ImageSlot id="sr-capture-detail" />
          </div>
        </section>

        {/* 04 — Making AI results understandable */}
        <section className={s.section} aria-labelledby="sr-hierarchy">
          <Head n="04 — The core UX problem" title="Making AI results understandable.">
            <p className={s.lead}>
              A design direction from the project discussions: {selfReady.direction.charAt(0).toLowerCase() + selfReady.direction.slice(1)}
            </p>
            <ol className={s.ladder}>
              {selfReady.hierarchy.map((h) => <li key={h}>{h}</li>)}
            </ol>
          </Head>
          <figure className={`${s.figure}`} style={{ margin: 0 }}>
            <div className={s.panel}><HierarchyScene /></div>
            <figcaption>
              <b>What the AI identified, and which product goes with which label, comes first.</b> The evidence opens beneath it.
              Technical detail stays one deliberate step away. <span className={s.illus}>Illustrative</span>
            </figcaption>
          </figure>
          <div className={s.grid2} style={{ marginTop: 24 }}>
            <ImageSlot id="sr-association" />
            <ImageSlot id="sr-evidence" />
          </div>
        </section>

        {/* 05 — Reviewing an association */}
        <section className={s.section} aria-labelledby="sr-review">
          <Head n="05 — Key workflow" title="Reviewing one product–label association.">
            <p className={s.lead}>Six moments, from the shelf image to the reviewer&apos;s decision and the system&apos;s acknowledgement.</p>
            <p className={s.p}><Draft /> The sequence follows the brief; the screens are reconstructions.</p>
          </Head>
          <div className={s.panel}><ReviewScene /></div>
          <div style={{ marginTop: 24 }}>
            <ImageSlot id="sr-review" solo />
          </div>
        </section>

        {/* 06 — Handling exceptions */}
        <section className={s.section} aria-labelledby="sr-exceptions">
          <Head n="06 — Key workflow" title="When the AI isn’t sure.">
            <p className={s.lead}>
              Uncertain or unresolved associations need to stand out, explain why they need attention, and give the reviewer
              a clear way forward.
            </p>
            <div>
              <ul className={s.termList}>
                <li><Chip tone="auto">Auto-admitted</Chip></li>
                <li><Chip tone="confirm">Needs confirmation</Chip></li>
                <li><Chip tone="unresolved">Unresolved</Chip></li>
                <li><Chip tone="plain">Business signal</Chip></li>
                <li><Chip tone="plain">Detection quality</Chip></li>
              </ul>
              <p className={s.p} style={{ marginTop: 12 }}>
                <NeedsConfirmation>Working terms</NeedsConfirmation> These come from project discussions — verify them before they become final UI copy.
              </p>
            </div>
          </Head>
          <figure className={s.figure} style={{ margin: 0 }}>
            <div className={s.panel}><ExceptionScene /></div>
            <figcaption>
              <b>Grouped by state, with the reason visible before any action.</b> The reviewer confirms one association and leaves
              another unresolved. <NeedsConfirmation>Actions and reason copy to confirm</NeedsConfirmation>
            </figcaption>
          </figure>
          <div className={s.grid2} style={{ marginTop: 24 }}>
            <ImageSlot id="sr-exceptions" />
            <ImageSlot id="sr-product-intel" />
          </div>
        </section>

        {/* 07 — Design decisions */}
        <section className={s.section} aria-labelledby="sr-decisions">
          <Head n="07 — Design decisions and trade-offs" title="What we chose, and what it cost.">
            <p className={s.lead}>One decision is documented in the project material. Two more slots are ready for decisions you want to add.</p>
          </Head>
          <div className={s.decision}>
            <span className={s.num}>D1</span>
            <div>
              <h3>Keep the pipeline and debugging out of the primary review</h3>
              <dl className={s.decisionBody}>
                <div><dt>The problem</dt><dd>Lengthy pipeline explanations and technical debugging information compete for attention with the decision the reviewer has to make. <Draft /></dd></div>
                <div><dt>Options considered</dt><dd><NeedsConfirmation>Not documented</NeedsConfirmation></dd></div>
                <div><dt>Chosen direction</dt><dd>{selfReady.direction}</dd></div>
                <div><dt>Why</dt><dd>It lets the interface follow the hierarchy: the result first, supporting evidence second, technical detail when needed.</dd></div>
                <div><dt>Trade-off</dt><dd>Technical detail is a step further away for anyone who needs it. <Draft /></dd></div>
              </dl>
              <div style={{ marginTop: 24 }}>
                <ImageSlot id="sr-before-after" solo caption="Add a before/after only if an earlier version is documented." />
              </div>
            </div>
          </div>
          {["D2", "D3"].map((d) => (
            <div key={d} className={s.decision}>
              <span className={s.num}>{d}</span>
              <div className={s.pendingBox}>
                <NeedsConfirmation>Decision to add</NeedsConfirmation>
                <p>The problem · options considered (if documented) · chosen direction · why · the trade-off.</p>
              </div>
            </div>
          ))}
        </section>

        {/* 08 — Versions, publishing, traceability */}
        <section className={s.section} aria-labelledby="sr-publish">
          <Head n="08 — Versions, publishing and traceability" title="How reviewed information moves forward.">
            <p className={s.lead}>
              Versions, Publish and Activity / Audit are named in the project material. <NeedsConfirmation>Confirm these are Self-Ready workflows</NeedsConfirmation>
            </p>
            <p className={s.p}>Until they are confirmed, this section shows only how the areas relate, without describing behaviour.</p>
          </Head>
          <div className={s.panel} style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <div className={s.flow} style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {["Versions", "Publish", "Activity / Audit"].map((k, i) => (
                <div key={k} className={`${s.flowNode} ${s.flowPast}`}>
                  <b>{k}</b>
                  {i < 2 && <span className={s.flowLink} aria-hidden="true"><i /></span>}
                </div>
              ))}
            </div>
          </div>
          <div className={s.grid2} style={{ marginTop: 24 }}>
            <ImageSlot id="sr-versions" />
            <ImageSlot id="sr-publish" />
          </div>
          <div style={{ marginTop: 16 }}>
            <ImageSlot id="sr-audit" solo />
          </div>
        </section>

        {/* 09 — Outcome */}
        <section className={s.section} aria-labelledby="sr-outcome">
          <Head n="09 — Outcome" title="No verified outcome yet.">
            <p className={s.lead}>
              The intended value is in the project&apos;s own description: making AI-powered retail shelf intelligence easier to
              review, understand, and act on.
            </p>
            <p className={s.p}><NeedsConfirmation>Outcome to add</NeedsConfirmation> Evidence that would establish impact:</p>
            <ul className={s.p} style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
              <li>Shipped status, and where it is used</li>
              <li>Time for a reviewer to work through a capture, before and after</li>
              <li>How often “needs confirmation” items are resolved without opening technical detail</li>
              <li>Reviewer or stakeholder feedback</li>
            </ul>
          </Head>
        </section>

        {/* 10 — Reflection */}
        <section className={s.section} aria-labelledby="sr-reflection">
          <Head n="10 — Reflection" title="Designing for confidence, uncertainty and judgement.">
            <div className={s.pendingBox}>
              <NeedsConfirmation>In your words</NeedsConfirmation>
              <p>What did this project teach you about showing confidence and uncertainty? Where did evidence help a reviewer decide — and where did it get in the way? What would you design differently now?</p>
            </div>
          </Head>
        </section>

        {/* 11 — Next project */}
        <section className={s.section} aria-label="Next project">
          <Link className={site.nextLink} href="/work/salespulze">
            <span className={site.eyebrow}>Next project</span>
            <span className={site.nextTitle}>
              SalesPulze <span className={site.arrow} aria-hidden="true">→</span>
            </span>
          </Link>
          <p style={{ marginTop: 24 }}>
            <Link className={site.arrowLink} href="/?c=product-strategy#work">
              <span aria-hidden="true">←</span> All Product Strategy work
            </Link>
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
