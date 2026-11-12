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
    sheet: { tag: "accounts.csv", rows: [["Arkline", "$42.8k", "Q4"], ["Veridian", "$18.5k", "Q4"], ["Nimbus", "$66.2k", "Q1"], ["Ocra", "$9.8k", "Q4"]] },
    report: { tag: "Report", title: "Q3 renewal review", meta: "12 pages" },
    feedback1: { who: "Sales lead", quote: "“I don’t know what the agents sent.”" },
    feedback2: { who: "Account exec", quote: "“Too many tools to check.”" },
    agent: { name: "Pricing agent", status: "Running", meta: "3 tasks · 41s" },
    line: "Reply rate",
  },
  /**
   * The product that runs through chapters 3 and 7: Agent Control Room, with
   * copy from Nishanth's own portfolio work card and coherent demo data.
   */
  product: {
    name: "Agent Control Room",
    workspace: "Q4 Renewals",
    running: "3 agents running",
    complete: "Complete",
    user: "NS",
    intentLabel: "Intent",
    intent: "Renew Q4 deals",
    intentMeta: ["24 accounts", "$1.2M pipeline", "Started 09:41"],
    nodes: [
      { step: "01", name: "Research", agent: "Research agent", meta: "24 accounts scanned", after: "24 accounts scanned", status: "Done", statusAfter: "Done" },
      { step: "02", name: "Draft", agent: "Writer agent", meta: "18 of 24 emails", after: "24 of 24 emails", status: "Running", statusAfter: "Done" },
      { step: "03", name: "Pricing", agent: "Pricing agent", meta: "8% renewal offer", after: "Offer approved", status: "Needs approval", statusAfter: "Approved" },
      { step: "04", name: "Review", agent: "Send queue", meta: "Waiting on pricing", after: "Sent to 24 accounts", status: "Queued", statusAfter: "Done" },
    ],
    approval: {
      tag: "Needs approval",
      agent: "Pricing agent",
      title: "Send 8% renewal offer to Arkline Logistics",
      rows: [
        ["Contract", "$42.8k → $39.4k"],
        ["Term", "3-year renewal"],
      ],
      confidence: "Confidence",
      pct: "82%",
      edit: "Edit",
      approve: "Approve & send",
      done: "Approved & sent",
    },
    replies: { title: "Replies this week", value: "38", delta: "+18%", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], bars: [42, 64, 52, 78, 70, 90] },
    engagement: { title: "Engagement", value: "64%", delta: "+15% vs Q3" },
  },
};
