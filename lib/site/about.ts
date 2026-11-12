/**
 * About + Beyond the Interface content. Verbatim from Nishanth's own material:
 *   [site]    current portfolio  ·  [webflow] nishanth.webflow.io  ·  [brief] his messages in this project
 */

export const about = {
  // [site] "What I do"
  whatIDo:
    "AI is becoming a colleague, not a feature. I design the moments where people hand work to agents, keep an eye on it, and take back control when it matters, so they trust what gets done on their behalf.",
  // [site] About
  aboutLine:
    "I work hand in hand with product and engineering on complex B2B workflows. Lately that means making AI an active collaborator people can understand, steer and trust.",
  // [site] stats (the site says 3 design systems; the intro film says 04 — awaiting confirmation)
  stats: [
    { value: "5+", label: "years designing products" },
    { value: "+15%", label: "best engagement lift" },
    { value: "3", label: "design systems built or shaped", confirm: true },
  ],
  // [site] The human–agent loop
  loop: {
    eyebrow: "The human–agent loop",
    title: "Three moments to get right",
    steps: [
      { n: "01", t: "Set intent", d: "People describe the outcome they want; the system turns it into tasks agents can pick up.", tags: ["Goal framing", "Task assignment", "Guardrails"] },
      { n: "02", t: "Observe", d: "Agent activity stays visible: what's running, what's done, and how sure the system is.", tags: ["Execution status", "Confidence indicators"] },
      { n: "03", t: "Step in", d: "When a decision needs a person, the interface asks clearly and makes approve, edit or stop easy.", tags: ["Approval workflows", "Handoff patterns"] },
    ],
  },
  // [site] Experience
  experienceIntro: "Six teams in five years — from a consumer-tech internship to leading design for an enterprise agentic AI platform.",
  experience: [
    { when: "Jan 2026 — Now", org: "Covasant", role: "Lead Product Designer", note: "Enterprise agentic AI. Leading UX for SalesPulze, multi-agent orchestration and the suite design system.", where: "Hyderabad", current: true },
    { when: "Apr 2024 — Dec 2025", org: "Thriving Springs AI", role: "Lead UX Designer", note: "Gamified AI LMS. Led a team of 5; adaptive modules lifted engagement 6% in month one.", where: "Hyderabad" },
    { when: "Dec 2022 — Apr 2024", org: "Ryzeup", role: "Senior Product Designer", note: "Gamified FinTech for frontline workforce. A/B-led redesigns lifted engagement 12%.", where: "Hyderabad" },
    { when: "Jun 2022 — Dec 2022", org: "Disprz", role: "Product Designer", note: "LMS + LXP. Analytics, KPI dashboards and motion guidelines written from scratch.", where: "Bengaluru" },
    { when: "Jul 2021 — Oct 2021", org: "Xiaomi", role: "Creative Design Intern", note: "UI assets, illustration, iconography and motion in Xiaomi's global design language.", where: "Bengaluru" },
    { when: "Jan 2021 — Mar 2022", org: "Extreme Appcoders", role: "Freelance Product Designer", note: "Client work end to end; module redesigns lifted client engagement 15%.", where: "Remote" },
  ],
  // [site] skills
  skills: [
    { k: "Agentic AI UX", v: ["Multi-agent orchestration", "Human–AI handoff", "AI workflow UX", "Trust & transparency"] },
    { k: "Product design", v: ["End-to-end UX", "Interaction design", "Prototyping", "Design systems", "Motion"] },
    { k: "Research", v: ["Usability testing", "A/B testing", "CRO", "Workshops"] },
    { k: "Tools", v: ["Figma", "FigJam", "Maze", "Hotjar", "Miro", "Notion", "Adobe CC", "Lottie"] },
  ],
  education: ["B.Tech CS, Lovely Professional University", "Google UX Certificate"],
  languages: ["English", "Telugu", "Hindi", "Odia"],
  // [webflow] personal
  journey:
    "I started my design journey at a very young age. My parents are from the creative field and I grew fond of the aesthetic side of digital design. While doing my btech at LPU, I worked with various agencies and clients to hone my skills and get knowledge about new user experience that are evolving the way we do things today.",
  outside:
    "I'm a huge anime fan, and I really love snacking while watching it. I love to cook because it reminds me of my granny cooking. Photography has a special place in my heart. I like it more when my dad becomes a modeling subject.",
};

export type ExploreStatus = "Concept" | "Exploring" | "Prototype" | "Built" | "Status to confirm";

export type Exploration = {
  slug: string;
  title: string;
  status: ExploreStatus;
  summary: string;
  href?: string;
  /** "photography" uses the photo folder; others show a designed image placeholder until assets arrive */
  visual: { kind: "photo"; src: string } | { kind: "slot"; need: string };
};

/** Beyond the Interface — add new ideas here; the page grid picks them up. */
export const explorations: Exploration[] = [
  {
    slug: "modular-01",
    title: "MODULAR 01",
    status: "Concept",
    // [brief]
    summary: "A modular backpack: a 25L core bag, a detachable 10–15L expansion, and movable external modules that attach to either side.",
    href: "/beyond/modular-01",
    visual: { kind: "slot", need: "MODULAR 01 hero visual or sketch" },
  },
  {
    slug: "3d-printing",
    title: "3D printing & physical experiments",
    status: "Status to confirm",
    // [brief]
    summary: "Product ideas explored through 3D printing — physical prototypes, CAD and product-form explorations, and concepts to develop next.",
    visual: { kind: "slot", need: "3D print, CAD render or prototype photo" },
  },
  {
    slug: "more",
    title: "Other ideas & explorations",
    status: "Status to confirm",
    summary: "New product concepts, physical product ideas, experiments and problems worth solving. More to be added.",
    visual: { kind: "slot", need: "Image for the next exploration" },
  },
];

export const photography = {
  label: "Photography",
  subtitle: "Frames, places and moments.",
  // [webflow]
  note: "I work full-time as a product designer, but I've also taken on the role of events photographer. This has enabled me to delve into business management and handle various aspects of my clients' events.",
  instagram: "https://www.instagram.com/thisisnishanthsilla/",
  /** All photographs from the Webflow portfolio, in their original order. */
  photos: Array.from({ length: 23 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { src: `/images/photography/photo-${n}.webp`, thumb: `/images/photography/thumbs/photo-${n}.webp`, alt: `Photograph ${i + 1} of 23 by Nishanth Silla` };
  }),
  /** the six shown in the folder (the full set is in the gallery below it) */
  folderPick: [1, 4, 11, 13, 16, 20],
};

/** MODULAR 01 — the concept as described by Nishanth [brief]. */
export const modular01 = {
  title: "MODULAR 01",
  status: "Concept" as ExploreStatus,
  line: "A modular backpack system: one core bag, an expansion, and modules you can move.",
  parts: [
    { k: "Core", v: "A 25L core bag." },
    { k: "Expansion", v: "A detachable 10–15L expansion." },
    { k: "Modules", v: "Movable external modules that can attach to either side." },
    { k: "Attachment", v: "A combination of rails, straps and snap-based attachment systems." },
    { k: "Ecosystem", v: "A modular ecosystem where users can purchase individual modules or ready-made kits." },
  ],
};
