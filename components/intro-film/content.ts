/**
 * Motion-film copy. Structure and phrasing follow the reference film; the
 * name, title, project lines and stats are Nishanth's own (approved).
 */
export const film = {
  hello: "Hello World",
  name: "I’m Nishanth",
  title: "Lead Product Designer",
  lines: ["I make things", "that help others", "do their"],
  /** One per portfolio project, in the order the cards appear. */
  verbs: [
    { verb: "selling.", caption: "/* work */ SalesPulze – agentic AI for sales teams" },
    { verb: "delegating.", caption: "/* work */ Agent Control Room – multi-agent orchestration" },
    { verb: "shipping.", caption: "/* work */ Covasant Design System – one system, whole suite" },
    { verb: "learning.", caption: "/* work */ Thriving Springs AI – +6% engagement, month one" },
    { verb: "earning.", caption: "/* work */ Ryzeup – +12% engagement from A/B-led redesigns" },
    { verb: "reporting.", caption: "/* work */ Disprz – KPI dashboards & motion guidelines" },
  ],
  finalVerb: "thing.",
  finalCaption: "/* yours could be next */",
  complex: "Even when it’s complex,",
  clear: "I make it clear.",
  stats: [
    { value: "+15%", label: "best engagement lift" },
    { value: "5+", label: "years designing products" },
    { value: "4", label: "design systems built or shaped" },
  ],
  dark: { line1: ["I", "design", "it", "in", "Figma,"], line2: ["then", "ship", "it", "in"], code: "code." },
  cursorTag: "Nishanth",
  /** Chapter-2 artefacts: the raw material of a product problem. */
  artefacts: {
    research: { tag: "Research", title: "Interview notes", line: "“Approvals feel risky.”" },
    insight: { tag: "Insight", title: "Users want to see what agents are doing" },
    requirement: { tag: "Requirement", title: "Human sign-off before sending" },
    decision: { tag: "Decision", title: "Show confidence, not just results" },
    idea: { tag: "Idea", title: "One approval queue" },
    dependency: "CRM sync",
    kpi: "Engagement",
  },
  /**
   * The product that runs through chapters 3–7: Agent Control Room, with copy
   * taken from Nishanth's own portfolio (work card "Agent Control Room").
   */
  product: {
    name: "Agent Control Room",
    running: "3 agents running",
    complete: "Complete",
    intentLabel: "Intent",
    intent: "Renew Q4 deals",
    nodes: [
      { name: "Research", meta: "done · 12s", after: "done · 12s" },
      { name: "Draft", meta: "running…", after: "done · 31s" },
      { name: "Pricing", meta: "needs approval", after: "approved" },
      { name: "Review", meta: "human", after: "done" },
    ],
    approval: { title: "Pricing needs approval", confidence: "Confidence", pct: "82%", edit: "Edit", approve: "Approve & send" },
    file: "ControlRoom.tsx",
    url: "localhost:3000",
  },
};
