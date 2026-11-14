/**
 * Homepage composition. Edit here to change the story panels or the project
 * hierarchy — the components read this file.
 *
 * Copy sources: [site] the current portfolio · [film] the approved intro film ·
 * [brief] Nishanth's brief. Nothing here is a new claim about his work.
 */
import { about } from "./about";
import { intro } from "./content";

/* ---------------- Horizontal introduction (three panels) ---------------- */

export const story = {
  /** Panel 1 — the introduction. Headline refined from the direction in the brief. */
  hello: {
    eyebrow: intro.now, // [site]
    headline: { before: "I design products for ", em: "complex systems", after: " — and the people who run them." },
    kicker: intro.headline[0], // [site] "Design for agents."
  },
  /** Panel 2 — focus and background. [site] */
  facts: intro.facts,
  now: { k: "Now", v: "Lead Product Designer at Covasant, Hyderabad" }, // [site] experience
  /** Panel 3 — how I work. [site] lede + the human–agent loop · [film] Figma → code */
  approach: {
    eyebrow: "How I work",
    line: intro.lede,
    steps: about.loop.steps.map((st) => ({ n: st.n, t: st.t, d: st.d })),
    craft: "I design it in Figma, then ship it in code.",
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

/* ---------------- The two folders ---------------- */

export const folders = {
  beyond: {
    title: "Beyond the Interface",
    description: "Experiments beyond the screen — physical products, prototypes and ideas I'm exploring.", // [brief]
    href: "/beyond",
  },
  photography: {
    title: "Photography",
    description: "Frames, places and moments.", // [brief]
    href: "/photography",
  },
};
