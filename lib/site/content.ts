/**
 * Website content. Every string here is reused verbatim from Nishanth's own
 * material — nothing is invented:
 *   [site]    the current portfolio ("Nishanth in Motion", reference/Nishanth_in_Motion-original.html)
 *   [cv]      NISHANTH_CV.pdf
 *   [webflow] the linked Webflow portfolio (nishanth.webflow.io)
 * Anything that is not real content yet is marked `placeholder: true` and is
 * labelled as such in the interface.
 */

export type CategoryId = "visual-craft" | "product-strategy" | "design-engineering";

export const categories: { id: CategoryId; label: string }[] = [
  { id: "visual-craft", label: "Visual Craft" },
  { id: "product-strategy", label: "Product Strategy" },
  { id: "design-engineering", label: "Design Engineering" },
];

/** Coded mini-UIs from the current portfolio, used as project previews until real screenshots exist. */
export type VisualId = "sales" | "orchestration" | "design-system" | "learning" | "ab-test" | "analytics";

export type Project = {
  slug: string;
  category: CategoryId;
  title: string;
  /** Short label shown above the title (from the source card). */
  eyebrow: string;
  org?: string;
  year?: string;
  role?: string;
  /** Card description, verbatim. */
  description?: string;
  tags?: string[];
  /** Role bullets from the CV, verbatim. */
  contribution?: string[];
  preview:
    | { kind: "visual"; id: VisualId }
    | { kind: "image"; src: string; alt: string; fit?: "cover" | "contain"; bg?: string }
    /** an animated product-UI cover (Self-Ready) */
    | { kind: "scene"; id: "self-ready" };
  /** featured projects have their own overview + full case-study routes and a full-width card */
  featured?: { overview: string; caseStudy: string; tags: string[] };
  /** Projects whose case study lives elsewhere for now (Notion, Behance, live site). */
  external?: { href: string; label: string };
  source: "site" | "webflow";
};

export const projects: Project[] = [
  // ---------- Product Strategy ----------
  {
    slug: "self-ready",
    category: "product-strategy",
    title: "Self-Ready",
    eyebrow: "AI / Retail Intelligence",
    description: "Making AI-powered retail shelf intelligence easier to review, understand, and act on.",
    preview: { kind: "scene", id: "self-ready" },
    featured: {
      overview: "/work/self-ready",
      caseStudy: "/work/self-ready/case-study",
      tags: ["Product Design", "AI / Retail Intelligence"],
    },
    source: "site",
  },
  {
    slug: "salespulze",
    category: "product-strategy",
    title: "SalesPulze",
    eyebrow: "Agentic AI · Sales platform",
    org: "Covasant",
    year: "2026",
    role: "Lead Product Designer",
    description:
      "End-to-end UX for an agentic AI platform that clears sales workflow bottlenecks at org scale, with AI-surfaced insights and automated follow-ups that stay reviewable.",
    tags: ["Flagship · Lead", "AI insights", "Follow-up orchestration"],
    contribution: [
      "SalesPulze (flagship product): Led end-to-end UX for an Agentic AI platform that tackles sales workflow bottlenecks and customer engagement problems at org scale, helping sales teams close faster with AI-surfaced insights and automated follow-up orchestration.",
    ],
    preview: { kind: "visual", id: "sales" },
    source: "site",
  },
  {
    slug: "agent-control-room",
    category: "product-strategy",
    title: "Agent Control Room",
    eyebrow: "Multi-agent orchestration",
    org: "Covasant",
    year: "2026",
    role: "Lead Product Designer",
    description:
      "How users assign tasks, watch execution status and step in when human input is needed — with intervention points, confidence indicators and approval flows.",
    tags: ["Intervention points", "Approvals", "Execution status"],
    contribution: [
      "Designed multi-agent orchestration (MAO) interfaces, defining how users set intent, observe agent activity, and intervene when needed. Designed intervention points, confidence indicators, and approval workflows to help users understand and control AI actions",
      "Designed agent orchestration workflows that allowed users to assign tasks, monitor execution status, and intervene when human input was required",
    ],
    preview: { kind: "visual", id: "orchestration" },
    source: "site",
  },
  {
    slug: "thriving-springs-ai",
    category: "product-strategy",
    title: "Thriving Springs AI",
    eyebrow: "AI-driven gamified LMS",
    year: "2024 – 25",
    role: "Lead UX Designer",
    description:
      "Skill-based learning that adapts to frontline workforce behaviour, mixing gamification with personalised content. Led a team of 5 across UI/UX, motion and branding.",
    tags: ["+6% engagement, month one", "Team of 5"],
    contribution: [
      "Led a cross-functional design team of 5 across UI/UX, motion, and branding, owning creative direction and execution consistency across the product.",
      "Designed AI-driven, skill-based learning modules that adapted to frontline workforce behaviour, combining gamification mechanics with personalised content flows to drive a 6% rise in user engagement within the first month.",
      "Integrated usability testing and product analytics into sprint reviews, enabling the team to identify friction points and improve adoption.",
      "Collaborated with product and engineering to define AI-assisted feature requirements and interaction flows, ensuring design decisions were technically feasible and built to scale.",
    ],
    preview: { kind: "visual", id: "learning" },
    source: "site",
  },
  {
    slug: "ryzeup",
    category: "product-strategy",
    title: "Ryzeup",
    eyebrow: "Gamified FinTech SaaS",
    year: "2022 – 24",
    role: "Senior Product Designer",
    description:
      "Journeys redesigned from A/B tests and user feedback, plus the Ryzeup Design System with accessibility built in from day one.",
    tags: ["+12% engagement", "A/B testing", "Accessibility"],
    contribution: [
      "Redesigned key user journeys based on A/B test results and user feedback, increasing engagement by 12%",
      "Built and maintained the Ryzeup Design System, ensuring consistency, scalability, and accessibility compliance across the platform while accelerating cross-team delivery cycles.",
      "Ran stakeholder workshops and competitor analysis sessions to align product vision with user expectations, translating findings into interaction flows, prototypes, and usability test frameworks.",
      "Worked closely with cross-functional teams in an Agile setup, aligning design goals with product and engineering to keep delivery fast without compromising experience quality.",
    ],
    preview: { kind: "visual", id: "ab-test" },
    source: "site",
  },
  {
    slug: "superkalam",
    category: "product-strategy",
    title: "Reducing Learning Friction at Superkalam Through User-Driven Design",
    eyebrow: "UX Case Study",
    preview: { kind: "image", src: "/images/work/superkalam.webp", alt: "Superkalam landing page: “Everything you need for UPSC Preparation”", fit: "contain", bg: "#FFFFFF" },
    external: {
      href: "https://www.notion.so/Reducing-Learning-Friction-at-Superkalam-Through-User-Driven-Design-2d04e310c45b809e97c1f72be39ce7c5?source=copy_link",
      label: "Notion",
    },
    source: "webflow",
  },
  {
    slug: "fitness-app",
    category: "product-strategy",
    title: "A mobile app for complete fitness",
    eyebrow: "UX case study",
    preview: { kind: "image", src: "/images/work/fitness-app.webp", alt: "Fitter Me — black-and-white photo of a weightlifter", fit: "cover" },
    external: { href: "https://www.behance.net/gallery/142013039/Fitness-Center-Platform-%28Case-study%29", label: "Behance" },
    source: "webflow",
  },

  // ---------- Visual Craft ----------
  {
    slug: "disprz",
    category: "visual-craft",
    title: "Disprz",
    eyebrow: "AI-powered LMS + LXP",
    year: "2022",
    role: "Product Designer",
    description:
      "Analytics, KPI dashboards and LMS interfaces. Wrote the animation and motion guidelines from scratch and contributed to the Disprz Design System.",
    tags: ["KPI dashboards", "Motion guidelines"],
    contribution: [
      "Designed key product features across analytics, KPI dashboards, and LMS interfaces, working directly with product managers to translate business requirements into intuitive, user-centric experiences.",
      "Contributed to the Disprz Design System, ensuring consistency, scalability, and accessibility across the platform while supporting faster design-to-dev handoff.",
      "Defined animation and motion design guidelines from scratch, collaborating with motion designers to bring micro-interactions and transitions to life across the product.",
      "Partnered with engineering through design reviews to ensure high-quality, seamless implementation of product features from ideation all the way to delivery.",
    ],
    preview: { kind: "visual", id: "analytics" },
    source: "site",
  },
  {
    slug: "extreme-appcoders-website",
    category: "visual-craft",
    title: "Website Design For Extreme Appcoders.",
    eyebrow: "UI Design",
    preview: { kind: "image", src: "/images/work/extreme-appcoders-website.webp", alt: "Extreme Appcoders — “Creating an Interactive website for the client”", fit: "contain", bg: "#FFFFFF" },
    external: { href: "https://www.extremeappcoders.com/", label: "Live site" },
    source: "webflow",
  },
  {
    slug: "eeve-poster",
    category: "visual-craft",
    title: "Design Poster for Eeve",
    eyebrow: "Branding, Graphic Design",
    preview: { kind: "image", src: "/images/work/eeve-poster.webp", alt: "Eeve poster — an electric scooter on a floating island", fit: "cover" },
    external: { href: "https://www.behance.net/gallery/132204031/social-media-poster-for-eeve", label: "Behance" },
    source: "webflow",
  },
  {
    slug: "food-engineers-logo",
    category: "visual-craft",
    title: "Food Engineers logo design",
    eyebrow: "Branding, Logo Design",
    preview: { kind: "image", src: "/images/work/food-engineers-logo.webp", alt: "Food Engineers logo", fit: "cover" },
    external: { href: "https://www.behance.net/gallery/119535277/commercial-logos", label: "Behance" },
    source: "webflow",
  },

  // ---------- Design Engineering ----------
  {
    slug: "covasant-design-system",
    category: "design-engineering",
    title: "Covasant Design System",
    eyebrow: "Design system · Component library",
    org: "Covasant",
    year: "2026",
    role: "Lead Product Designer",
    description:
      "A scalable system and component library for the whole product suite, built to speed up design-to-dev handoff and keep products consistent.",
    tags: ["Tokens", "Components", "Dev handoff"],
    contribution: [
      "Established a scalable design system and component library for the Covasant product suite, accelerating design-to-dev handoff and ensuring consistency across the platform.",
    ],
    preview: { kind: "visual", id: "design-system" },
    source: "site",
  },
  {
    slug: "design-system-frustration-logic",
    category: "design-engineering",
    title: "A Design System Built Out of Pure Frustration and Logic",
    eyebrow: "Design system",
    preview: { kind: "image", src: "/images/work/design-system-frustration-logic.webp", alt: "Design system components and screens", fit: "contain", bg: "#FFFFFF" },
    external: {
      href: "https://www.notion.so/A-Design-System-Built-Out-of-Pure-Frustration-and-Logic-1-2f54e310c45b80b99018f84d129def3b?source=copy_link",
      label: "Notion",
    },
    source: "webflow",
  },
];

export const projectsIn = (c: CategoryId) => projects.filter((p) => p.category === c);
export const caseStudies = projects.filter((p) => !p.external);
/** projects rendered by the shared /work/[slug] template */
export const templateStudies = projects.filter((p) => !p.external && !p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** Homepage introduction — the current portfolio's hero, verbatim. */
export const intro = {
  now: "Nishanth Silla · Lead Product Designer, Covasant",
  kicker: "Agentic AI · UX · Systems",
  headline: ["Design for agents.", "…and the humans who run them."],
  lede: "I design the interfaces where people set intent, watch AI agents work, and step in at the right moment.",
  facts: [
    { k: "Focus", v: "Multi-agent orchestration, human–AI handoff" },
    { k: "Background", v: "5+ years · Enterprise AI, FinTech, EdTech" },
  ],
};

/** Selected work intro line, verbatim. */
export const workIntro = {
  label: "Selected work",
  title: "Things I've shipped",
  line: "Enterprise AI, FinTech and learning platforms, from first flows to design-system handoff.",
};

export const contact = {
  label: "Contact",
  title: "Let's build what agents & people trust.",
  emailLabel: "Drop me a line",
  email: "nishanthsilla2000@gmail.com",
  phoneLabel: "Call or WhatsApp",
  phone: "+91 77355 70520",
  phoneHref: "tel:+917735570520",
  location: "Hyderabad",
};

export type SocialLink = { id: string; label: string; href: string; preview?: { src: string; title: string } };

/** GitHub, X and Substack are not listed: no profiles exist yet. */
export const socials: SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/nishanth-silla" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/thisisnishanthsilla/" },
  { id: "behance", label: "Behance", href: "https://www.behance.net/nishanthsilla" },
  { id: "medium", label: "Medium", href: "https://medium.com/@nishanthsilla2000" },
  { id: "webflow", label: "Webflow portfolio", href: "https://nishanth.webflow.io/" },
  {
    id: "resume",
    label: "Resume",
    href: "/resume/nishanth-silla-cv.pdf",
    preview: { src: "/images/previews/resume.webp", title: "Resume · PDF" },
  },
];

export const footer = { copyright: "© 2026 Nishanth Silla", note: "Hyderabad" };
