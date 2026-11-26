/**
 * About + Beyond the Interface content. Verbatim from Nishanth's own material:
 *   [site]    current portfolio  ·  [webflow] nishanth.webflow.io  ·  [brief] his messages in this project
 */

export const about = {
  // [cv] headline + summary, in his voice
  hello: "Hi, I'm Nishanth.",
  intro:
    "I'm a Lead Product Designer in Hyderabad. These days I design how people work alongside AI agents: handing them a task, keeping an eye on them, and stepping in when it matters.",
  where: "Hyderabad, India · open to relocation and remote",
  cv: "/nishanth-silla-cv.pdf",
  // [cv] numbers; [brief] "3 design systems end to end"
  stats: [
    { value: "5+", label: "years designing products" },
    { value: "~400k", label: "people use SalesPulze, the platform I lead UX for" },
    { value: "3", label: "design systems, end to end" },
    { value: "1 → 5", label: "the design team I grew at Thriving Springs" },
  ],
  // [site] "What I do"
  whatIDo:
    "AI is becoming a colleague, not a feature. I design the moments where people hand work to agents, keep an eye on it, and take back control when it matters, so they trust what gets done on their behalf.",
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
  // [brief] values, written for him from his CV and his work (he asked for them to read as human, not corporate)
  values: [
    { t: "Make the AI show its work.", d: "If people can't see what an agent is doing, they won't trust it with anything that matters. So the confidence score, the pause button and the undo come first. The clever bits can wait." },
    { t: "Go find the actual user.", d: "The person in the meeting is rarely the one on the shop floor. Frontline workers, area sales managers, the CXO with four minutes to spare: I'd rather watch them use it than guess." },
    { t: "Let the data win the argument.", d: "A/B tests have proved me wrong more than once. That's exactly why I keep running them." },
    { t: "Build the system, then the screen.", d: "Three design systems in, I've learned that consistency is a kindness: to the next designer, and to the engineer who has to build it at 6 pm on a Friday." },
    { t: "Grow the people, not just the product.", d: "I grew a team from one designer to five. Watching someone I mentored run a whole project on their own still beats any launch." },
  ],
  // [cv] experience
  experienceIntro: "From a Xiaomi internship to leading design for an enterprise agentic AI platform, with EdTech and FinTech in between.",
  experience: [
    { when: "Jan 2026 — Now", org: "Covasant", role: "Lead Product Designer", note: "Leading UX for SalesPulze, a live agentic AI sales platform with ~400,000 users, plus multi-agent orchestration and an ambient AI companion now in pilot. Started the design system: 400+ components, shared by 8 products.", where: "Hyderabad", current: true },
    { when: "Apr 2024 — Dec 2025", org: "Thriving Springs AI", role: "Lead UX Designer", note: "Grew the design team from 1 to 5. Gamified, AI-driven learning lifted engagement 6% in the first month and about 10% by month six.", where: "Hyderabad" },
    { when: "Dec 2022 — Apr 2024", org: "Ryzeup", role: "Senior Product Designer", note: "Redesigned the sales-target and KPI journeys from A/B tests: engagement up 12%. Built the Ryzeup design system.", where: "Hyderabad" },
    { when: "Jun 2022 — Dec 2022", org: "Disprz", role: "Product Designer", note: "Analytics, KPI dashboards and LMS features. Wrote the motion guidelines from scratch.", where: "Bengaluru" },
    { when: "Jul 2021 — Oct 2021", org: "Xiaomi", role: "Creative Design Intern", note: "UI assets, icons, illustration and motion in MIUI's design language.", where: "Bengaluru" },
    { when: "Jan 2021 — Mar 2022", org: "Extreme Appcoders", role: "Freelance Product Designer", note: "Client projects from wireframe to handoff; module redesigns lifted usage and retention 15%.", where: "Remote" },
  ],
  // [cv] tools, shown with their logos (FigJam and Figma Make live under Figma; Adobe Creative Suite is Photoshop + Illustrator)
  tools: [
    { name: "Figma", logo: "figma", note: "with FigJam and Figma Make" },
    { name: "Framer", logo: "framer" },
    { name: "Claude", logo: "claude" },
    { name: "Cursor", logo: "cursor" },
    { name: "Lovable", logo: "lovable" },
    { name: "HTML", logo: "html" },
    { name: "CSS", logo: "css" },
    { name: "Maze", logo: "maze" },
    { name: "Hotjar", logo: "hotjar" },
    { name: "Miro", logo: "miro" },
    { name: "Notion", logo: "notion" },
    { name: "Photoshop", logo: "photoshop" },
    { name: "Illustrator", logo: "illustrator" },
    { name: "LottieFiles", logo: "lottie" },
  ],
  // [cv] skills (the chatbot reads these too)
  skills: [
    { k: "AI and agentic UX", v: ["Multi-agent orchestration", "Human-in-the-loop and handoff", "LLM and GenAI features", "Conversational UI", "Prompt design", "AI evals", "Guardrails and error states", "Trust and explainability", "Confidence indicators"] },
    { k: "Product design", v: ["0-to-1", "End-to-end UX", "Information architecture", "Interaction design", "UI and visual design", "Prototyping (incl. AI)", "Design systems and tokens", "Dashboards and data viz", "Motion", "Design QA"] },
    { k: "Research", v: ["User research", "Usability testing", "A/B testing", "CRO", "Competitor analysis", "Stakeholder workshops"] },
    { k: "Tools", v: ["Figma", "Figma Make", "FigJam", "Framer", "Cursor", "Lovable", "Claude", "HTML/CSS (AI-assisted)", "Maze", "Hotjar", "Miro", "Notion", "Adobe Creative Suite", "Lottie"] },
  ],
  education: ["B.Tech, Computer Science, Lovely Professional University (2019 – 2023)", "Google UX Design Certificate"],
  languages: ["English", "Telugu", "Hindi", "Odia"],
  // [cv]
  teaching: "I also teach design to aspiring designers at seminars and college sessions, usually to groups of 15 to 25.",
  // [webflow] personal
  journey:
    "I started my design journey at a very young age. My parents are from the creative field and I grew fond of the aesthetic side of digital design. While doing my btech at LPU, I worked with various agencies and clients to hone my skills and get knowledge about new user experience that are evolving the way we do things today.",
  outside:
    "I'm a huge anime fan, and I really love snacking while watching it. I love to cook because it reminds me of my granny cooking. Photography has a special place in my heart. I like it more when my dad becomes a modeling subject.",
  // [brief] his photos
  photos: {
    hero: { src: "/images/about/snow.webp", alt: "Nishanth walking up a snowy slope in a whiteout, with a trekking pole and orange-tinted glasses" },
    sunset: { src: "/images/about/sunset.webp", alt: "Nishanth from behind, in a cap and a light shirt, watching the sun set over the sea from a cliff" },
    life: [
      { src: "/images/about/naruto-1.webp", alt: "A Naruto tattoo on Nishanth's forearm", label: "Anime, obviously" },
      { src: "/images/about/cook-1.webp", alt: "A bowl of something Nishanth cooked, with onions and herbs", label: "Granny's recipes" },
      { src: "/images/about/camera-1.webp", alt: "Nishanth behind a camera, shooting", label: "Behind the camera" },
    ],
  },
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
    slug: "forma-25",
    title: "CARRY / RE:FORM — FORMA 25",
    status: "Concept",
    summary: "A configurable backpack that adapts to your activity, your needs and the way you move. One core. Different journeys.",
    href: "/beyond/forma-25",
    visual: { kind: "photo", src: "/images/beyond/forma-25/hero.webp" },
  },
  {
    slug: "desk-organizer",
    title: "Modular Hanging Desk Organizer",
    status: "Concept",
    summary: "A modular hanging storage organizer designed to use the unused space beneath a desk.",
    href: "/beyond/desk-organizer",
    visual: { kind: "photo", src: "/images/beyond/desk-organizer/hero-sm.webp" },
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
  instagram: "https://www.instagram.com/yaa.its_nishanth/",
  /** All photographs from the Webflow portfolio, in their original order. */
  photos: Array.from({ length: 23 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { src: `/images/photography/photo-${n}.webp`, thumb: `/images/photography/thumbs/photo-${n}.webp`, alt: `Photograph ${i + 1} of 23 by Nishanth Silla` };
  }),
  /** the six shown in the folder (the full set is in the gallery below it) */
  folderPick: [1, 4, 11, 13, 16, 20],
};

/** FORMA 25 at a glance (the Beyond folder); the full case study is lib/site/forma25.ts. */
export const forma25Parts = [
  { k: "Core", v: "A 25L backpack: top access, full-side opening, a suspended laptop sleeve (up to 16\")." },
  { k: "External modules", v: "Tripod holder, bottle holder, utility pouch, quick-access pocket: they switch sides." },
  { k: "Internal organizers", v: "Camera cube, clothing, tech and toiletry organizers." },
  { k: "Expansion", v: "A detachable 10–15L layer and a separate shoe pod: about 35–40L in all." },
  { k: "Kits", v: "Creator, Explorer, Travel and Everyday, or buy modules one by one." },
];

/** Desk organizer at a glance (the Beyond folder); the full case study is lib/site/deskOrganizer.ts. */
export const deskOrganizerParts = [
  { k: "Mount", v: "Hooks over the desk edge, so the storage sits beneath the tabletop." },
  { k: "Trays", v: "Removable trays that can be repositioned at different heights." },
  { k: "Ledges", v: "Internal sliding ledges, about 0.5 in, on both inner walls support and guide the trays." },
  { k: "Headphone peg", v: "A detachable peg in one dedicated exterior hole, independent of the trays." },
  { k: "Target load", v: "3–5 kg (a design target, not yet validated)." },
];
