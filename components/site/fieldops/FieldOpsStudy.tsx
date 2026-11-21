import Link from "next/link";
import site from "@/components/site/site.module.css";
import s from "@/components/site/study/study.module.css";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import Cover from "./Cover";
import { Anatomy, ColorSystem, Hierarchy, Interaction, LiveDemo, Prioritization, Workflow } from "./Figures";
import { Shot } from "./Shot";
import p from "./page.module.css";

/*
 * Field Operations Health (SalesPulze), in two versions of the same story:
 *   overview  — the short, visual one (default)
 *   deep      — the full case study
 * Copy follows Nishanth's brief. Outcomes are design-level (what the design
 * makes possible); no measured metrics are claimed.
 */
export const FO = {
  slug: "salespulze-heat-map",
  title: "Field Operations Health",
  product: "SalesPulze",
  line: "From scattered sales intelligence to an organisation-wide view of operational health.",
  meta: [
    { k: "Product", v: "SalesPulze · Agentic AI sales platform" },
    { k: "Company", v: "Covasant · 2026" },
    { k: "Role", v: "Lead Product Designer" },
    { k: "Focus", v: "Information architecture · Data visualisation · Interaction design" },
  ],
  img: {
    geo: { src: "/images/work/field-ops/explore-geographic.webp", alt: "Exploration 1: India Zonal Overview, a map of India shaded by company density, with zone counts" },
    zones: { src: "/images/work/field-ops/explore-zones.webp", alt: "Exploration 2: the zone-based view, a map coloured by average meeting score with an AI insight, zone summaries and a hover card" },
    final: { src: "/images/work/field-ops/final-heatmap.webp", alt: "The final design: Field Operations Health, a hierarchical heatmap of 104 TSM entities at Level 7" },
  },
};

const Reveal = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <AnimatedContent className={className} distance={16} duration={0.6}>{children}</AnimatedContent>
);
const Label = ({ n, children }: { n: string; children: React.ReactNode }) => <p className={s.label}><span>{n}</span> {children}</p>;
const Head = ({ n, label, title, id }: { n: string; label: string; title: React.ReactNode; id: string }) => (
  <div><Label n={n}>{label}</Label><h2 id={id} className={s.h2}>{title}</h2></div>
);

/** [ Overview ] [ Deep Dive ]: part of the page, two routes of one study */
function Switch({ mode }: { mode: "overview" | "deep" }) {
  return (
    <nav className={p.switch} aria-label="Case study version">
      <Link href={`/work/${FO.slug}`} aria-current={mode === "overview" ? "page" : undefined} scroll={false}>Overview</Link>
      <Link href={`/work/${FO.slug}/case-study`} aria-current={mode === "deep" ? "page" : undefined} scroll={false}>Deep Dive</Link>
    </nav>
  );
}

export default function FieldOpsStudy({ mode }: { mode: "overview" | "deep" }) {
  const deep = mode === "deep";
  let n = 0;
  const N = () => String(++n).padStart(2, "0");
  return (
    <article className={s.study}>
      <header className={`${site.container} ${s.hero}`}>
        <div className={p.topRow}>
          <Link className={site.back} href="/?c=product-strategy#work"><span aria-hidden="true">←</span> Product Strategy</Link>
          <Switch mode={mode} />
        </div>
        <p className={site.eyebrow}>{deep ? "Case study · deep dive" : "Case study · overview"} · {FO.product}</p>
        <h1 className={s.title}>{FO.title}</h1>
        <p className={s.subtitle}>{FO.line}</p>
        <dl className={s.meta}>
          {FO.meta.map((m) => <div key={m.k} className={m.k === "Focus" ? s.metaWide : undefined}><dt>{m.k}</dt><dd>{m.v}</dd></div>)}
        </dl>
      </header>

      {/* Visual 01 · the final dashboard, animated */}
      <div className={`${site.container} ${s.heroShot}`}><Cover /></div>

      {/* ---------- Overview / Context ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-overview">
        <Reveal className={s.split}>
          <Head n={N()} label={deep ? "Project context" : "Overview"} title={deep ? "Meeting intelligence, everywhere but in one place." : "One view of how the field organisation is doing."} id="fo-overview" />
          <div className={s.flow}>
            {deep ? (
              <>
                <p className={s.lead}>SalesPulze captures intelligence from every daily sales meeting: transcripts, performance scores, activities and follow-ups, meeting quality and hygiene, risks and problems, customer objections, operational blockers, and AI-generated insights with recommended actions.</p>
                <p className={s.p}>The information existed, but senior leadership couldn&apos;t see the overall health of the field organisation without reading individual meeting reports and moving through multiple organisational levels.</p>
                <p className={s.p}>The objective: one place where leadership can understand organisational health, spot underperforming entities, and investigate why.</p>
              </>
            ) : (
              <>
                <p className={s.lead}>Field Operations Health is a hierarchical heatmap in SalesPulze. Each cell is one person or team at a chosen management level, scored and coloured by the health of their sales meetings.</p>
                <p className={s.p}>It lets CXOs and regional leaders see the whole organisation at once, spot who needs attention, and open the meetings behind any score.</p>
              </>
            )}
          </div>
        </Reveal>
      </section>

      {/* ---------- Problem ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-problem">
        <Reveal className={s.split}>
          <Head n={N()} label="The problem" title="Too much investigating before anyone could act." id="fo-problem" />
          <div className={s.flow}>
            <p className={s.lead}>The existing geographical view showed where the organisation operates, not how it performs. To find the teams that were struggling, leaders had to drill down level by level, and the signals that explained a score (quality, hygiene, blockers, AI insights) lived in separate places.</p>
            {deep && (
              <ol className={s.list}>
                <li>Too much investigation before action.</li>
                <li>Limited visibility into organisational health.</li>
                <li>Difficulty identifying critical entities.</li>
                <li>Meeting quality, hygiene, blockers and AI insights were disconnected.</li>
                <li>Senior leaders needed a consolidated view instead of individual reports.</li>
              </ol>
            )}
          </div>
        </Reveal>
      </section>

      {/* ---------- Challenge ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-challenge">
        <Reveal>
          <Label n={N()}>The challenge</Label>
          <blockquote className={p.hmw} id="fo-challenge">How might we help CXOs and regional sales leaders see organisational health issues immediately, understand where attention is needed, and investigate the right teams without navigating through multiple layers?</blockquote>
          <div className={p.users}>
            <div>
              <b>CXO · Senior leadership</b>
              <ul><li>Monitor overall organisational health.</li><li>Identify critical areas.</li><li>See where management intervention is needed.</li></ul>
            </div>
            <div>
              <b>RSM · Regional leadership</b>
              <ul><li>Find underperforming teams.</li><li>Investigate specific managers and territories.</li><li>Understand the underlying problems.</li><li>Prioritise follow-up actions.</li></ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Exploration (deep only) ---------- */}
      {deep && (
        <section className={`${site.container} ${s.section}`} aria-labelledby="fo-explore">
          <Reveal className={s.split}>
            <Head n={N()} label="Design exploration" title="Two maps, and why neither was enough." id="fo-explore" />
            <p className={s.lead}>I started where the data seemed to point: geography. Each step added context, and each step showed the same gap.</p>
          </Reveal>
          <div className={p.explore}>
            <Reveal className={p.exploreItem}>
              <Shot pic={FO.img.geo} />
              <div>
                <span className={p.tag}>Exploration 01 · Geographical map</span>
                <h3 className={s.h3}>Where the organisation operates</h3>
                <p className={s.p}>A density map of India by zone. It made the regional distribution clear, but showed nothing about the organisational hierarchy or how many entities needed attention.</p>
              </div>
            </Reveal>
            <Reveal className={p.exploreItem}>
              <Shot pic={FO.img.zones} />
              <div>
                <span className={p.tag}>Exploration 02 · Zone-based analytics</span>
                <h3 className={s.h3}>More context, still a map to dig through</h3>
                <p className={s.p}>Zones coloured by meeting score, with an AI insight, zone summaries and a hover card. Richer, but a leader still had to pick a zone and drill down to find the actual people and problems.</p>
              </div>
            </Reveal>
          </div>
          <Reveal className={s.question}><p>The key realisation: leadership needed a direct view of organisational health, not another geographical dashboard that needed more exploring.</p></Reveal>
        </section>
      )}

      {/* ---------- Solution ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-solution">
        <Reveal className={s.split}>
          <Head n={N()} label="The solution" title="A heatmap of the organisation, not the map." id="fo-solution" />
          <div className={s.flow}>
            <p className={s.lead}>I rebuilt the view around the organisational hierarchy instead of geography. Every cell is one entity at the selected management level, showing its health score and a colour for its status.</p>
            <p className={s.p}>Leaders can scan the whole level, recognise patterns, and see straight away which entities need attention.</p>
          </div>
        </Reveal>
        {deep && <Reveal className={p.fig}><Anatomy /><span className={p.figN}>Fig · Anatomy of a cell</span></Reveal>}
      </section>

      {deep ? (
        <>
          {/* ---------- Colour system ---------- */}
          <section className={`${site.container} ${s.section}`} aria-labelledby="fo-colour">
            <Reveal className={s.split}>
              <Head n={N()} label="Visual language" title="Four statuses, one consistent scale." id="fo-colour" />
              <div className={s.flow}>
                <p className={s.lead}>Every cell carries two signals: the number for precision, the colour for instant recognition. The same four classifications appear in the cells, the summary chips and the legend.</p>
              </div>
            </Reveal>
            <Reveal className={p.fig}><ColorSystem /></Reveal>
          </section>

          {/* ---------- Hierarchy ---------- */}
          <section className={`${site.container} ${s.section}`} aria-labelledby="fo-hier">
            <Reveal className={s.split}>
              <Head n={N()} label="Organisational hierarchy" title="Seven levels, one pattern." id="fo-hier" />
              <div className={s.flow}>
                <p className={s.lead}>The heatmap works across seven management levels, from AVP to ASM. Switching level swaps the entities but keeps the visualisation identical, so there is nothing new to learn at each step down.</p>
                <p className={s.p}>Scope (All India, India-1, India-2) and filters for Critical and Problems narrow the same view instead of opening a new one.</p>
              </div>
            </Reveal>
            <Reveal className={p.fig}><Hierarchy /></Reveal>
          </section>

          {/* ---------- Monitoring ---------- */}
          <section className={`${site.container} ${s.section}`} aria-labelledby="fo-monitor">
            <Reveal className={s.split}>
              <Head n={N()} label="Organisation-wide monitoring" title="The distribution before the details." id="fo-monitor" />
              <div className={s.flow}>
                <p className={s.lead}>Above the heatmap, one line summarises the level: total entities, how many are Critical, Attention, Moderate and Healthy, and an overall score. In the L7 view: 104 entities, 6 Critical, 57 Attention, 35 Moderate, 6 Healthy, overall 57.</p>
                <p className={s.p}>Leadership reads the health of the whole level before looking at a single record.</p>
              </div>
            </Reveal>
          </section>

          {/* ---------- Prioritisation ---------- */}
          <section className={`${site.container} ${s.section}`} aria-labelledby="fo-prio">
            <Reveal className={s.split}>
              <Head n={N()} label="Prioritisation" title="Worst first puts the starting point first." id="fo-prio" />
              <div className={s.flow}>
                <p className={s.lead}><b>Natural</b> keeps the default entity order. <b>Worst first</b> sorts by the lowest score, so the entities that need the most attention lead the map.</p>
              </div>
            </Reveal>
            <Reveal className={p.fig}><Prioritization /></Reveal>
          </section>

          {/* ---------- Interaction ---------- */}
          <section className={`${site.container} ${s.section}`} aria-labelledby="fo-interact">
            <Reveal className={s.split}>
              <Head n={N()} label="Interaction design" title="Hover to understand. Click to investigate." id="fo-interact" />
              <div className={s.flow}>
                <p className={s.lead}>Two levels of depth. Hover gives quick context on the map itself. Selecting an entity opens the meeting intelligence behind its score: overview, meeting performance, sales activity, quality and hygiene, risks, blockers, AI insights and recommended follow-ups.</p>
                <p className={s.p}>The heatmap tells leaders where to look; the meeting intelligence tells them what to do.</p>
              </div>
            </Reveal>
            <Reveal className={p.fig}><Interaction /></Reveal>
            <Reveal className={p.fig}><LiveDemo /></Reveal>
          </section>

          {/* ---------- Workflow ---------- */}
          <section className={`${site.container} ${s.section}`} aria-labelledby="fo-flow">
            <Reveal className={s.split}>
              <Head n={N()} label="UX workflow" title="From the whole organisation to one follow-up." id="fo-flow" />
              <p className={s.lead}>The journey the design supports, from noticing to acting.</p>
            </Reveal>
            <Reveal className={p.fig}><Workflow /></Reveal>
          </section>
        </>
      ) : (
        /* ---------- Design highlights (overview) ---------- */
        <section className={`${site.container} ${s.section}`} aria-labelledby="fo-highlights">
          <Reveal className={s.split}>
            <Head n={N()} label="Design highlights" title="Four decisions that make it work." id="fo-highlights" />
            <p className={s.lead}>Each one answers the same question: how fast can a leader get from &ldquo;something&apos;s wrong&rdquo; to &ldquo;here&apos;s who and why&rdquo;?</p>
          </Reveal>
          <div className={p.highlights}>
            <Reveal className={p.hl}><span className={p.tag}>01 · Organisational hierarchy</span><p>Seven levels, L2 AVP to L8 ASM, one consistent view at each.</p><Hierarchy /></Reveal>
            <Reveal className={p.hl}><span className={p.tag}>02 · Colour-coded health</span><p>Score for precision, colour for recognition: Critical, Attention, Moderate, Healthy.</p><ColorSystem /></Reveal>
            <Reveal className={p.hl}><span className={p.tag}>03 · Prioritisation</span><p>Natural or Worst first: the entities needing the most attention lead the map.</p><Prioritization /></Reveal>
            <Reveal className={p.hl}><span className={p.tag}>04 · Entity investigation</span><p>Hover for context, click for the meeting intelligence behind the score.</p><Interaction /></Reveal>
          </div>
        </section>
      )}

      {/* ---------- Final design ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-final">
        <Reveal className={s.split}>
          <Head n={N()} label="Final design" title="Field Operations Health" id="fo-final" />
          <p className={s.lead}>The L7 · TSM view for All India: 104 entities, the health distribution, sorting and the legend in one screen.</p>
        </Reveal>
        <Reveal className={p.fig}><Shot pic={FO.img.final} /></Reveal>
      </section>

      {/* ---------- Impact ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-impact">
        <Reveal className={s.split}>
          <Head n={N()} label="UX impact" title="From where the organisation operates to how it performs." id="fo-impact" />
          <p className={s.p}>Design-level outcomes: what the new experience makes possible. These are not measured business metrics.</p>
        </Reveal>
        <Reveal className={p.fig}>
          <table className={p.table}>
            <thead><tr><th>Before</th><th>After</th></tr></thead>
            <tbody>
              {[
                ["Geographical exploration", "Organisational health overview"],
                ["Deeper navigation to identify problems", "Immediate visibility of critical entities"],
                ["Disconnected performance information", "Consolidated health indicators"],
                ["Manual investigation", "Worst-first prioritisation"],
                ["Limited organisational visibility", "Hierarchical exploration"],
              ].map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* ---------- Learning ---------- */}
      <section className={`${site.container} ${s.section}`} aria-labelledby="fo-learn">
        <Reveal>
          <Label n={N()}>{deep ? "Key learnings" : "Key takeaway"}</Label>
          <blockquote className={p.quote} id="fo-learn">An enterprise dashboard shouldn&apos;t just show more information. It should help people recognise patterns, understand priorities, and know where to investigate.</blockquote>
          {deep && <p className={`${s.p} ${p.after}`}>The real value of the heatmap is the connection between an entity&apos;s score and the meetings, problems and actions behind it.</p>}
        </Reveal>
      </section>

      <nav className={`${site.container} ${s.next}`} aria-label={deep ? "Back to the overview" : "Full case study"}>
        <Link href={deep ? `/work/${FO.slug}` : `/work/${FO.slug}/case-study`} className={s.nextLink}>
          <span className={site.eyebrow}>{deep ? "The short version" : "Exploration, hierarchy, colour system, interactions and workflow"}</span>
          <span className={s.nextTitle}>{deep ? "Back to the overview" : "Read the deep dive"} <span aria-hidden="true">→</span></span>
        </Link>
      </nav>
    </article>
  );
}
