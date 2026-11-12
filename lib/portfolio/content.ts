/** Portfolio content, transcribed verbatim from the original HTML. */

export const navLinks = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

export const marqueeItems = [
  "Multi-agent orchestration",
  "human–AI handoff",
  "Approval workflows",
  "confidence indicators",
  "Design systems",
  "motion design",
  "Gamification",
  "usability testing",
];

export type ExperienceRow = {
  when: string;
  company: string;
  current?: boolean;
  role: string;
  summary: string;
  where: string;
};

export const experience: ExperienceRow[] = [
  { when: "Jan 2026 — Now", company: "Covasant", current: true, role: "Lead Product Designer", summary: "Enterprise agentic AI. Leading UX for SalesPulze, multi-agent orchestration and the suite design system.", where: "Hyderabad" },
  { when: "Apr 2024 — Dec 2025", company: "Thriving Springs AI", role: "Lead UX Designer", summary: "Gamified AI LMS. Led a team of 5; adaptive modules lifted engagement 6% in month one.", where: "Hyderabad" },
  { when: "Dec 2022 — Apr 2024", company: "Ryzeup", role: "Senior Product Designer", summary: "Gamified FinTech for frontline workforce. A/B-led redesigns lifted engagement 12%.", where: "Hyderabad" },
  { when: "Jun 2022 — Dec 2022", company: "Disprz", role: "Product Designer", summary: "LMS + LXP. Analytics, KPI dashboards and motion guidelines written from scratch.", where: "Bengaluru" },
  { when: "Jul 2021 — Oct 2021", company: "Xiaomi", role: "Creative Design Intern", summary: "UI assets, illustration, iconography and motion in Xiaomi's global design language.", where: "Bengaluru" },
  { when: "Jan 2021 — Mar 2022", company: "Extreme Appcoders", role: "Freelance Product Designer", summary: "Client work end to end; module redesigns lifted client engagement 15%.", where: "Remote" },
];

export const stats = [
  { count: 5, suffix: "+", text: "5+", label: "years designing products" },
  { count: 15, prefix: "+", suffix: "%", text: "+15%", label: "best engagement lift" },
  { count: 3, text: "3", label: "design systems built or shaped" },
];

export const kit = [
  { label: "Agentic AI UX", items: ["Multi-agent orchestration", "Human–AI handoff", "AI workflow UX", "Trust & transparency"] },
  { label: "Product design", items: ["End-to-end UX", "Interaction design", "Prototyping", "Design systems", "Motion"] },
  { label: "Research", items: ["Usability testing", "A/B testing", "CRO", "Workshops"] },
  { label: "Tools", items: ["Figma", "FigJam", "Maze", "Hotjar", "Miro", "Notion", "Adobe CC", "Lottie"] },
  { label: "Education", items: ["B.Tech CS, Lovely Professional University", "Google UX Certificate"] },
  { label: "Languages", items: ["English", "Telugu", "Hindi", "Odia"] },
];

export const loopSteps = [
  { no: "01", title: "Set intent", text: "People describe the outcome they want; the system turns it into tasks agents can pick up.", tags: ["Goal framing", "Task assignment", "Guardrails"] },
  { no: "02", title: "Observe", text: "Agent activity stays visible: what's running, what's done, and how sure the system is.", tags: ["Execution status", "Confidence indicators"] },
  { no: "03", title: "Step in", text: "When a decision needs a person, the interface asks clearly and makes approve, edit or stop easy.", tags: ["Approval workflows", "Handoff patterns"] },
];

export const contact = {
  email: "nishanthsilla2000@gmail.com",
  phone: "+91 77355 70520",
  links: [
    { href: "https://www.linkedin.com/in/nishanth-silla", label: "LinkedIn" },
    { href: "https://nishanth.webflow.io/", label: "Webflow portfolio" },
  ],
};
