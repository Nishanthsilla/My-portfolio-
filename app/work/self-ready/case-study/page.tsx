import type { Metadata } from "next";
import Link from "next/link";
import ProjectMedia from "@/components/site/ProjectMedia";
import SiteShell from "@/components/site/SiteShell";
import ImageSlot from "@/components/site/selfready/ImageSlot";
import { Chip, NeedsConfirmation } from "@/components/site/selfready/engine";
import { AssociationScene, ExceptionScene, HeroScene, HierarchyScene, ReviewScene, WorkflowScene } from "@/components/site/selfready/Scenes";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import s from "@/components/site/selfready/selfready.module.css";
import { projectBySlug } from "@/lib/site/content";
import { overviewHref } from "@/lib/site/routes";
import { selfReady } from "@/lib/site/selfReady";

export const metadata: Metadata = {
  title: "Self-Ready — full case study — Nishanth Silla",
  description: selfReady.oneLiner,
};

/*
 * The Self-Ready case study — text verbatim from Nishanth's draft. Its own
 * bracketed notes ("[Confirm …]") are shown as "Needs confirmation" markers,
 * its [ADD IMAGE HERE] notes as designed screenshot slots. Interface motion is
 * an illustrative reconstruction and is labelled as such.
 */

function Head({ n, kicker, title, children }: { n: string; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <AnimatedContent className={s.sectionHead} distance={16} duration={0.6}>
      <div>
        <span className={s.num}>{n} · {kicker}</span>
        <h2 className={s.h2}>{title}</h2>
      </div>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </AnimatedContent>
  );
}
const P = ({ children, lead = false }: { children: React.ReactNode; lead?: boolean }) => <p className={lead ? s.lead : s.p}>{children}</p>;
const Bullets = ({ items }: { items: string[] }) => (
  <ul className={s.p} style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>{items.map((i) => <li key={i}>{i}</li>)}</ul>
);
const Illus = () => <span className={s.illus}>Illustrative reconstruction · not a product screenshot</span>;
const Sub = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ margin: "8px 0 0", fontSize: 19, fontWeight: 560, letterSpacing: "-0.01em" }}>{children}</h3>
);

export default function SelfReadyCaseStudy() {
  const next = projectBySlug("salespulze-heat-map")!;
  return (
    <SiteShell>
      <article className={site.container}>
        {/* Title */}
        <header className={s.hero}>
          <Link className={site.back} href="/work/self-ready">
            <span aria-hidden="true">←</span> Self-Ready overview
          </Link>
          <span className={site.eyebrow}>Case study · Product Strategy</span>
          <h1 className={s.heroTitle}>{selfReady.title}</h1>
          <p className={s.heroLine}>{selfReady.oneLiner}</p>
          <dl className={s.metaRow}>
            {selfReady.meta.map((m) => (
              <div key={m.k}>
                <dt>{m.k}</dt>
                <dd>{m.status === "confirm" ? <NeedsConfirmation>{m.v}</NeedsConfirmation> : m.v}</dd>
              </div>
            ))}
          </dl>
        </header>
        <div className={s.heroMedia}><HeroScene /></div>
        <div className={s.legend}><Illus /><NeedsConfirmation>Status names are working terms</NeedsConfirmation></div>
        <div className={s.scroll} aria-hidden="true"><i /> Scroll</div>

        {/* 01 */}
        <section className={s.section}>
          <Head n="01" kicker="Overview" title="The design focus: make AI-generated information easier for people to trust, validate and act on.">
            <P lead>Retail shelves contain a large amount of information that needs to be interpreted correctly. Products, shelf labels and their associations all contribute to how retail information is understood and maintained.</P>
            <P>Self-Ready is associated with an AI-powered retail shelf intelligence experience designed around analysing shelf information and helping users review the results.</P>
            <P>The central design challenge was not simply displaying what AI had detected. It was making those results understandable and actionable for the people responsible for reviewing them.</P>
            <P>When an AI system identifies a product and associates it with a shelf label, the reviewer needs to understand what was identified, whether the association makes sense, what evidence supports it and whether further action is required.</P>
            <P>The experience needed to make that decision clear without exposing users to unnecessary technical complexity.</P>
          </Head>
          <ImageSlot id="sr-hero-interface" solo caption="Suggested visual: A large, polished view of the Self-Ready interface showing shelf analysis and product-label associations." />
        </section>

        {/* 02 */}
        <section className={s.section}>
          <Head n="02" kicker="Understanding the problem" title="When AI identifies something, the user still needs to understand it.">
            <P lead>AI can help interpret retail shelf images and identify potential product-label relationships. However, an identified result is not automatically a result that a person can confidently accept.</P>
            <P>A reviewer may need to understand:</P>
            <Bullets items={[
              "Which product has been identified?",
              "Which shelf label is associated with it?",
              "Does the association look correct?",
              "What information supports the result?",
              "Does this result need human confirmation?",
              "What should happen when the system cannot establish a clear association?",
            ]} />
            <P>These questions create an important UX challenge.</P>
            <P>If the interface exposes too much technical information, users may struggle to find the decision they need to make. If it exposes too little information, users may not have enough context to validate the AI result.</P>
            <P>The experience therefore needs to balance automation with human judgement.</P>
          </Head>
          <div className={s.quoteBox}>
            How might we make AI-generated product and shelf-label associations easy to review, understand and resolve, without overwhelming users with technical information?
            <small>The design challenge</small>
          </div>
          <div style={{ marginTop: 32 }}>
            <ImageSlot id="sr-shelf-association" solo caption="Suggested visual: A shelf image with a detected product, its corresponding shelf label and a clear visual relationship between them." />
          </div>
        </section>

        {/* 03 */}
        <section className={s.section}>
          <Head n="03" kicker="The UX direction" title="Put the decision first. Explain the evidence when needed.">
            <P lead>A key direction for the experience was to avoid making the primary review screen a technical debugging interface.</P>
            <P>The reviewer should not have to understand the entire AI pipeline before deciding whether an association is correct.</P>
            <P>Instead, the interface should prioritise three layers of information:</P>
          </Head>
          <div className={s.grid3} style={{ marginBottom: 24 }}>
            {[
              ["1. The result", "What did the system identify?", "The product and its associated shelf label should be immediately understandable."],
              ["2. The supporting evidence", "Why does the system believe this association is correct?", "The reviewer should be able to inspect the relevant information needed to validate the result."],
              ["3. Additional technical information", "", "More detailed processing or debugging information should remain secondary and accessible only when required."],
            ].map(([t, q, d]) => (
              <div key={t} className={s.focusItem}>
                <b>{t}</b>
                {q && <p style={{ color: "var(--ink)" }}>{q}</p>}
                <p>{d}</p>
              </div>
            ))}
          </div>
          <P>This hierarchy keeps the primary experience focused on the reviewer&apos;s task.</P>
          <figure className={s.figure} style={{ margin: "24px 0 0" }}>
            <div className={s.panel}><HierarchyScene /></div>
            <figcaption><b>The result first → supporting evidence second → technical detail when needed.</b> <Illus /></figcaption>
          </figure>
          <div style={{ marginTop: 24 }}>
            <ImageSlot id="sr-hierarchy" solo caption="Suggested visual: Annotated interface showing the result, supporting evidence and secondary technical information." />
          </div>
        </section>

        {/* 04 */}
        <section className={s.section}>
          <Head n="04" kicker="Understanding the experience" title="From capturing shelf information to reviewing results">
            <P lead>The product discussions included several areas associated with the broader shelf-intelligence workflow:</P>
            <ul className={s.termList} style={{ marginTop: 0 }}>
              {selfReady.modules.map((m) => <li key={m}><Chip tone="plain">{m}</Chip></li>)}
            </ul>
            <P><NeedsConfirmation>Ownership to confirm</NeedsConfirmation> The exact ownership of every module within Self-Ready needs to be confirmed before publication.</P>
            <P>The intended workflow narrative can be represented as: <b style={{ color: "var(--ink)" }}>Capture → Analyse → Review → Resolve → Publish</b></P>
          </Head>
          <div className={s.panel} style={{ background: "#fff", border: "1px solid var(--line)" }}>
            <WorkflowScene />
          </div>
          <div style={{ marginTop: 24 }}>
            <ImageSlot id="sr-workflow" solo caption="Suggested visual: A horizontal workflow diagram with the five stages, showing the system's role and the user's decision at each stage." />
          </div>
        </section>

        {/* 05 */}
        <section className={s.section}>
          <Head n="05" kicker="Designing for confidence and uncertainty" title="Not every AI result should look equally certain.">
            <P lead>One of the important UX considerations was how to communicate different AI outcomes.</P>
            <P>A result that can be automatically accepted should not look the same as one that needs human attention.</P>
            <P>The project discussions included the following terminology: Auto-admitted, Needs confirmation, Unresolved, Business signal and Detection quality.</P>
            <P><NeedsConfirmation>Terminology to confirm</NeedsConfirmation> These labels need to be checked against the approved product terminology before being presented as final interface copy.</P>
          </Head>
          <div className={s.grid2}>
            {[
              ["auto", "Auto-admitted", "An outcome associated with a result that can proceed without the same level of manual review.", "The interface should communicate its state clearly without requiring unnecessary reviewer intervention."],
              ["confirm", "Needs confirmation", "A result that requires the reviewer to inspect the product-label association before proceeding.", "The interface should make the required action immediately visible."],
              ["unresolved", "Unresolved", "A result for which a clear association has not been established.", "The reviewer needs enough context to understand the uncertainty and decide what action is supported."],
              ["plain", "Business signal and detection quality", "These terms were also discussed as part of the product context.", "Their exact meaning, placement and relationship to the review workflow need confirmation."],
            ].map(([tone, t, a, b]) => (
              <div key={t} className={s.focusItem}>
                <Chip tone={tone as "auto" | "confirm" | "unresolved" | "plain"}>{t}</Chip>
                <p style={{ color: "var(--ink)" }}>{a}</p>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <div className={s.quoteBox} style={{ marginTop: 24 }}>
            Do not communicate confidence through colour alone.
            <small>The design principle — a reviewer should be able to understand the state through a clear label, supporting information and an obvious next action.</small>
          </div>
          <div style={{ marginTop: 24 }}>
            <ImageSlot id="sr-result-states" solo caption="Suggested visual: A comparison of the different result states, using actual product screenshots and approved labels." />
          </div>
        </section>

        {/* 06 */}
        <section className={s.section}>
          <Head n="06" kicker="Key workflow 01 — Capture Sessions" title="Giving users a clear starting point.">
            <P lead>The capture experience is the starting point for understanding the shelf information being processed.</P>
            <P>Users need to locate a relevant capture session and understand which information is available for review.</P>
            <P>The experience should make it easy to move from a session overview into the detailed capture and its associated analysis.</P>
            <Sub>UX considerations</Sub>
            <Bullets items={[
              "Make capture sessions easy to identify.",
              "Present relevant session information clearly.",
              "Use consistent status indicators.",
              "Help users understand which session needs attention.",
              "Provide a clear path from the session overview to its detail.",
            ]} />
            <P>The objective is to reduce the effort required to locate the right information before beginning the review process.</P>
          </Head>
          <div className={s.grid2}>
            <ImageSlot id="sr-capture-sessions" caption="Suggested visual: Actual capture session listing with its information hierarchy and status indicators." />
            <ImageSlot id="sr-capture-detail" caption="Suggested visual: A detailed capture view showing the relevant shelf information." />
          </div>
        </section>

        {/* 07 */}
        <section className={s.section}>
          <Head n="07" kicker="Key workflow 02 — Shelf Analysis" title="Connecting products with their corresponding shelf labels.">
            <P lead>This is one of the most important parts of the experience.</P>
            <P>The system analyses shelf information and identifies products alongside their corresponding labels. The interface needs to communicate that relationship clearly.</P>
            <P>A reviewer should be able to look at the shelf information and understand:</P>
            <Bullets items={[
              "Which product was detected.",
              "Which label is associated with it.",
              "Whether the association needs further review.",
              "What supporting information is available.",
            ]} />
            <P>The visual relationship between a product and its shelf label is especially important. If the reviewer has to move between multiple screens or interpret disconnected information to understand an association, the review process becomes unnecessarily difficult.</P>
            <Sub>UX approach</Sub>
            <P>Keep the association visible and make the supporting information easy to inspect. The product, label and their relationship should be visually connected rather than presented as unrelated pieces of data.</P>
          </Head>
          <figure className={s.figure} style={{ margin: 0 }}>
            <div className={s.panel}><AssociationScene /></div>
            <figcaption><b>Each product stays visibly connected to its label, with its state and evidence beside it.</b> <Illus /></figcaption>
          </figure>
          <div style={{ marginTop: 24 }}>
            <ImageSlot id="sr-shelf-analysis" solo caption="Suggested visual: The actual shelf-analysis interface." />
          </div>
          <div className={s.grid3} style={{ marginTop: 16 }}>
            <ImageSlot id="sr-association" caption="A close-up showing a detected product, its associated shelf label and the relevant state." />
            <ImageSlot id="sr-product-intel" caption="Product-related information, if this module is confirmed as part of Self-Ready." />
            <ImageSlot id="sr-label-intel" caption="Label-related information, if this module is confirmed as part of Self-Ready." />
          </div>
        </section>

        {/* 08 */}
        <section className={s.section}>
          <Head n="08" kicker="Key workflow 03 — Human Review" title="AI can identify the result. The reviewer needs to make sense of it.">
            <P lead>The human-review experience is where the product needs to balance automation and control.</P>
            <P>A reviewer should not have to investigate the entire processing pipeline to understand an association. The reviewer should be able to inspect the association in context and make an informed decision.</P>
            <Sub>Why this matters</Sub>
            <P>A technically detailed interface may expose a large amount of information but still make the actual task difficult. The review experience should prioritise the information required to make a decision. Supporting details should help the reviewer understand the result, not compete with it.</P>
          </Head>
          <div className={s.panel}><ReviewScene /></div>
          <p className={s.legend}><Illus /></p>
          <div className={s.grid2} style={{ marginTop: 16 }}>
            <ImageSlot id="sr-review" caption="Suggested visual: The main review screen with the product, shelf label, association status and evidence." />
            <ImageSlot id="sr-association-detail" caption="Suggested visual: A closer view of the information available when inspecting an association." />
          </div>
        </section>

        {/* 09 */}
        <section className={s.section}>
          <Head n="09" kicker="Key workflow 04 — Exception Handling" title="Making uncertainty actionable.">
            <P lead>Not every detected association can be treated as a straightforward result. Some results may need additional confirmation, while others may remain unresolved.</P>
            <P>The exception experience should help users identify these results and understand why they need attention. It should communicate:</P>
            <Bullets items={[
              "Which result requires attention.",
              "What makes the association uncertain.",
              "What information is available to support the review.",
              "What action the reviewer can take.",
              "What happens after that action.",
            ]} />
            <P>The goal is to make exceptions part of a clear review workflow rather than presenting them as unexplained errors.</P>
            <Sub>A focused review experience</Sub>
            <P>Instead of presenting lengthy technical explanations on the primary screen, keep the exception itself prominent. Give the reviewer the relevant context and supporting evidence needed to understand the issue. Only expose deeper technical information when it is genuinely useful.</P>
          </Head>
          <figure className={s.figure} style={{ margin: 0 }}>
            <div className={s.panel}><ExceptionScene /></div>
            <figcaption><Illus /> <NeedsConfirmation>Actions and reason copy to confirm</NeedsConfirmation></figcaption>
          </figure>
          <div className={s.grid3} style={{ marginTop: 24 }}>
            <ImageSlot id="sr-exception-list" caption="The exception overview with relevant states and information hierarchy." />
            <ImageSlot id="sr-exception-detail" caption="An individual exception showing the associated product, label, reason for review and supporting evidence." />
            <ImageSlot id="sr-exception-resolution" caption="The actual supported resolution interaction and resulting state." />
          </div>
        </section>

        {/* 10 */}
        <section className={s.section}>
          <Head n="10" kicker="Versions, publishing and traceability" title="Making reviewed information manageable beyond the initial decision.">
            <P lead>The product discussions also included Versions, Publish and Activity / Audit as areas of the wider experience.</P>
            <P><NeedsConfirmation>Confirm these are Self-Ready capabilities</NeedsConfirmation> Where these are confirmed as Self-Ready capabilities, they should be explained as part of the journey after review.</P>
          </Head>
          <div className={s.grid3}>
            {[
              ["Versions", "Explain how users understand the current version of information and how changes are managed. Include comparison or change-history behaviour only if the product supports it.", "sr-versions"],
              ["Publishing", "Explain how reviewed information moves into the publishing process. Show the actual publishing action and its resulting state.", "sr-publish"],
              ["Activity and audit history", "Explain how users can inspect relevant activity and trace changes, if this functionality is part of the product.", "sr-audit"],
            ].map(([t, d, id]) => (
              <div key={t} style={{ display: "grid", gap: 12, alignContent: "start" }}>
                <div className={s.focusItem}><b>{t}</b><p>{d}</p></div>
                <ImageSlot id={id} />
              </div>
            ))}
          </div>
        </section>

        {/* 11 */}
        <section className={s.section}>
          <Head n="11" kicker="Important design decisions" title="Designing the experience around human decisions.">
            <P lead>The following are the key design directions established in the project discussions.</P>
            <P><NeedsConfirmation>Evidence to add</NeedsConfirmation> Add actual before-and-after evidence and confirmed design iterations before presenting them as completed design decisions.</P>
          </Head>
          {[
            { n: "01", t: "Keep technical complexity away from the primary review screen", c: "The AI process can involve complex technical information. Exposing all of it on the primary screen risks distracting users from the task they need to complete.", d: "Prioritise the detected association and the information needed to review it. Keep lengthy pipeline explanations and debugging information secondary.", w: "The reviewer should be able to understand the result without first understanding the underlying technical process.", id: "sr-d1" },
            { n: "02", t: "Make uncertainty visible", c: "A result requiring confirmation should not appear equivalent to one that can proceed automatically.", d: "Use clearly differentiated states and communicate when human attention is required.", w: "The reviewer can identify where attention is needed and prioritise the next action.", id: "sr-d2" },
            { n: "03", t: "Connect the result with its evidence", c: "A product-label association is difficult to validate if the reviewer cannot easily understand the relationship.", d: "Keep the product, label and supporting information connected in the review experience.", w: "The reviewer can inspect the relevant context before taking action.", id: "sr-d3" },
          ].map((x) => (
            <div key={x.n} className={s.decision}>
              <span className={s.num}>Decision {x.n}</span>
              <div>
                <h3>{x.t}</h3>
                <dl className={s.decisionBody}>
                  <div><dt>The challenge</dt><dd>{x.c}</dd></div>
                  <div><dt>The direction</dt><dd>{x.d}</dd></div>
                  <div><dt>Why it matters</dt><dd>{x.w}</dd></div>
                </dl>
                <div style={{ marginTop: 20 }}><ImageSlot id={x.id} solo /></div>
              </div>
            </div>
          ))}
        </section>

        {/* 12 */}
        <section className={s.section}>
          <Head n="12" kicker="Outcome" title="A clearer direction for AI-assisted retail review.">
            <P lead>The design direction focused on making AI-generated shelf information easier to understand and review.</P>
            <P>The intended product value was to:</P>
            <Bullets items={[
              "Make product-label associations easier to inspect.",
              "Help users identify results that need attention.",
              "Reduce unnecessary technical complexity in the primary review experience.",
              "Make uncertainty more visible.",
              "Give reviewers relevant information to support their decisions.",
              "Support a more structured journey from analysis through review and resolution.",
            ]} />
            <P><NeedsConfirmation>Verified project results</NeedsConfirmation> Add actual shipped outcomes, stakeholder feedback, adoption data or measurable improvements.</P>
            <P>Potential metrics to investigate, if data is available:</P>
            <Bullets items={[
              "Average time required to review an association.",
              "Percentage of results requiring human confirmation.",
              "Exception resolution time.",
              "Product-label association accuracy.",
              "Reduction in manual review effort.",
              "Reviewer adoption and feedback.",
            ]} />
          </Head>
          <ImageSlot id="sr-final" solo caption="Suggested visual: A polished overview of the final, confirmed product experience." />
        </section>

        {/* 13 */}
        <section className={s.section}>
          <Head n="13" kicker="Reflection" title="Designing for AI means designing for the moments when AI is uncertain.">
            <P lead>One of the most important considerations in this experience is that automation does not remove the need for human judgement.</P>
            <P>A result can be technically generated by AI, but the person reviewing it still needs to understand what happened and why.</P>
            <P>The interface therefore has an important responsibility: it should make the system&apos;s output understandable without making the user work through unnecessary complexity.</P>
            <P>For me, the central design lesson from this project is the importance of designing the space between AI output and human decision-making.</P>
            <P>The experience should not simply show what the system has detected. It should help people understand the result, inspect the relevant evidence and know what to do next.</P>
            <P lead>That is what makes an AI-assisted workflow useful in practice.</P>
          </Head>
        </section>

        {/* 14 */}
        <section className={s.section}>
          <Head n="14" kicker="Project gallery" title="Additional screens and details.">
            <P>Additional screens and details that support the story without interrupting the main narrative.</P>
          </Head>
          <div className={s.grid3}>
            {["sr-g-dashboard", "sr-g-capture", "sr-g-shelf", "sr-g-product-intel", "sr-g-label-intel", "sr-g-exceptions", "sr-g-versions", "sr-g-publishing", "sr-g-audit"].map((id) => (
              <ImageSlot key={id} id={id} />
            ))}
          </div>
        </section>

        {/* Information to confirm */}
        <section className={s.section}>
          <div className={s.pendingBox}>
            <NeedsConfirmation>Information to confirm before publishing</NeedsConfirmation>
            <ol className={s.p} style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
              {selfReady.toConfirm.map((x) => <li key={x}>{x}</li>)}
            </ol>
          </div>
        </section>

        {/* 15 */}
        <section className={s.section}>
          <span className={s.num}>15 · Next project</span>
          <h2 className={s.h2} style={{ marginBottom: 24 }}>Continue exploring my work.</h2>
          <Link className={site.featured} href={overviewHref(next)} style={{ display: "grid" }}>
            <ProjectMedia project={next} className={site.featuredFrame} />
            <div className={site.featuredBody}>
              <span className={site.eyebrow}>{next.eyebrow}</span>
              <span className={site.featuredTitle}>{next.title} <span className={site.arrow} aria-hidden="true">→</span></span>
              <span className={site.cardDesc}>{next.description}</span>
              <span className={`${site.btn} ${site.btnSecondary}`} style={{ marginTop: 12, width: "max-content" }}>View next case study →</span>
            </div>
          </Link>
          <p style={{ marginTop: 24 }}>
            <Link className={site.arrowLink} href="/product-strategy"><span aria-hidden="true">←</span> Back to all projects</Link>
          </p>
        </section>
      </article>
    </SiteShell>
  );
}
