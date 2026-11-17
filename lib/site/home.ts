/**
 * Homepage composition. Edit here to change the story panels or the project
 * hierarchy — the components read this file.
 *
 * Copy sources: [site] the current portfolio · [film] the approved intro film ·
 * [brief] Nishanth's brief. Nothing here is a new claim about his work.
 */
import { intro } from "./content";

/* ---------------- Horizontal introduction (three panels) ---------------- */

export const story = {
  /** Panel 1 — the introduction. Headline refined from the direction in the brief. */
  hello: {
    eyebrow: intro.now, // [site]
    headline: { before: "Hi, I'm Nishanth. I make ", em: "complicated software", after: " feel simple to use." },
    kicker: "Product designer in Hyderabad, 5+ years in.",
  },
  /** Panel 2 — focus and background. [site] */
  facts: intro.facts,
  now: { k: "Day job", v: "Lead Product Designer at Covasant" }, // [site] experience
  /** Panel 3 — how I work: a designer's process, built only from the skills on the site (lib/site/about.ts). */
  approach: {
    eyebrow: "How I work",
    line: "Talk to people, sketch it rough, test it early, then sweat the details.",
    steps: [
      { n: "01", t: "Understand", d: "I start with the people who'll use it: workshops, conversations, and their real workflows, before I open a design tool." },
      { n: "02", t: "Sketch and map", d: "User flows and rough wireframes in FigJam first. Quick to change, easy to throw away." },
      { n: "03", t: "Prototype and test", d: "Clickable prototypes in Figma, in front of real users. Usability tests and A/B tests decide, not my opinion." },
      { n: "04", t: "Ship it together", d: "Design-system components, clear specs, and close work with developers, so what ships matches what we designed." },
    ],
    craft: "Figma · FigJam · Maze · Hotjar",
  },
};

/* ---------------- Bento: project hierarchy ---------------- */

export type TileSize = "large" | "small";

/**
 * Order and size of every project on the homepage. Size reflects quality,
 * relevance to current work and storytelling potential — not age. Projects
 * missing from this list are still shown (as small tiles, at the end), so
 * nothing is ever dropped silently.
 */
export const bento: { slug: string; size: TileSize }[] = [
  { slug: "self-ready", size: "large" }, // AI retail intelligence — the full case study
  { slug: "ambient-ai", size: "large" }, // agent + device configuration platform — full case study
  { slug: "mao", size: "large" }, // multi-agent orchestration — current focus
  { slug: "salespulze-heat-map", size: "small" },
  { slug: "covasant-design-system", size: "large" }, // design system at enterprise scale
  { slug: "thriving-springs-e-learning", size: "small" },
  { slug: "ryzeup", size: "small" },
  { slug: "superkalam", size: "large" }, // older, but a strong research-led story
  { slug: "disprz", size: "small" },
  { slug: "fitness-app", size: "small" },
  { slug: "design-system-frustration-logic", size: "small" },
  { slug: "extreme-appcoders-website", size: "small" },
  { slug: "eeve-poster", size: "small" },
  { slug: "food-engineers-logo", size: "small" },
];

/**
 * The six most recent case studies — shown first on the homepage. Everything
 * else waits behind "Explore more of my work".
 */
export const recent = ["self-ready", "ambient-ai", "salespulze-heat-map", "mao", "covasant-design-system", "thriving-springs-e-learning"];

/* ---------------- The two folders ---------------- */

export const folders = {
  beyond: {
    title: "Beyond the Interface",
    description: "What I make away from the screen: 3D prints, product ideas and prototypes.",
    href: "/beyond",
  },
  photography: {
    title: "Photography",
    description: "Photos I take for fun. My dad is my favourite model.",
    href: "/photography",
  },
};
