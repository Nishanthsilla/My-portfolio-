import SplitWords from "../SplitWords";
import WorkCard, { type WorkCardProps } from "./WorkCard";
import {
  ABTestVisual,
  AnalyticsVisual,
  DesignSystemVisual,
  LearningVisual,
  OrchestrationVisual,
  SalesVisual,
} from "../visuals/Visuals";

const cards: WorkCardProps[] = [
  { cursor: "Flagship", visual: <SalesVisual />, label: "Agentic AI · Sales platform", title: "SalesPulze", year: "Covasant · 2026", text: "End-to-end UX for an agentic AI platform that clears sales workflow bottlenecks at org scale, with AI-surfaced insights and automated follow-ups that stay reviewable.", tags: [{ text: "Flagship · Lead", hit: true }, { text: "AI insights" }, { text: "Follow-up orchestration" }] },
  { cursor: "MAO", visual: <OrchestrationVisual />, label: "Multi-agent orchestration", title: "Agent Control Room", year: "Covasant · 2026", text: "How users assign tasks, watch execution status and step in when human input is needed — with intervention points, confidence indicators and approval flows.", tags: [{ text: "Intervention points" }, { text: "Approvals" }, { text: "Execution status" }] },
  { cursor: "System", visual: <DesignSystemVisual />, label: "Design system · Component library", title: "Covasant Design System", year: "Covasant · 2026", text: "A scalable system and component library for the whole product suite, built to speed up design-to-dev handoff and keep products consistent.", tags: [{ text: "Tokens" }, { text: "Components" }, { text: "Dev handoff" }] },
  { cursor: "+6%", visual: <LearningVisual />, label: "AI-driven gamified LMS", title: "Thriving Springs AI", year: "2024 – 25", text: "Skill-based learning that adapts to frontline workforce behaviour, mixing gamification with personalised content. Led a team of 5 across UI/UX, motion and branding.", tags: [{ text: "+6% engagement, month one", hit: true }, { text: "Team of 5" }] },
  { cursor: "+12%", visual: <ABTestVisual />, label: "Gamified FinTech SaaS", title: "Ryzeup", year: "2022 – 24", text: "Journeys redesigned from A/B tests and user feedback, plus the Ryzeup Design System with accessibility built in from day one.", tags: [{ text: "+12% engagement", hit: true }, { text: "A/B testing" }, { text: "Accessibility" }] },
  { cursor: "Motion", visual: <AnalyticsVisual />, label: "AI-powered LMS + LXP", title: "Disprz", year: "2022", text: "Analytics, KPI dashboards and LMS interfaces. Wrote the animation and motion guidelines from scratch and contributed to the Disprz Design System.", tags: [{ text: "KPI dashboards" }, { text: "Motion guidelines" }] },
];

/** Selected work; runs sideways (pinned) on desktop via the motion layer. */
export default function Work() {
  return (
    <section id="work" className="work-sec" data-tone="paper">
      <div className="work-pin">
        <div className="work-track" id="track">
          <div className="w-intro">
            <div>
              <div className="label" style={{ marginBottom: 14 }}>Selected work</div>
              <h2 className="h-move"><SplitWords className="word" text="Things I've shipped" /></h2>
            </div>
            <p>Enterprise AI, FinTech and learning platforms, from first flows to design-system handoff.</p>
            <div className="w-count" aria-hidden="true"><b id="wNow">01</b> / 06</div>
            <div className="w-hint label"><i></i>Keep scrolling</div>
          </div>

          {cards.map((c) => (
            <WorkCard key={c.title} {...c} />
          ))}

          <div className="w-end">
            <div className="label">Also</div>
            <h3>Earlier chapters</h3>
            <ul>
              <li>Xiaomi <span>Design intern · 2021</span></li>
              <li>Extreme Appcoders <span>Freelance · +15%</span></li>
            </ul>
            <a className="label" href="#experience" style={{ textDecoration: "none", color: "var(--accent)" }}>Full experience ↓</a>
          </div>
        </div>
      </div>
    </section>
  );
}
