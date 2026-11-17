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
  /**
   * Panels 3–5 — what makes me, me. Nishanth's own answers, in his words.
   * [[key|words]] marks a word that throws photos on hover:
   * /public/images/about/<key>-1.webp, <key>-2.webp, … (shown once they exist).
   */
  me: {
    title: "What makes me, me?",
    story: [
      "I'm a tinkerer who builds. As a kid I'd take apart a remote-control car and use its motors to make a [[plane|remote-control plane]]. I still work like that: pull things apart, play around, and find a better way.",
      "I don't like products that throw everything at you. I want it to be obvious what to do next. The best thing people say about my work is that it was easy to get through: nothing to confuse them, they just did what they came to do.",
    ],
    life: "When I'm not designing, I'm behind a [[camera|camera]]. I shoot and edit photos for my dad's photography and events business. I [[cook|cook]] a lot, mostly for my girlfriend, because taking care of people makes me happy. And I'm enough of an anime geek to have [[naruto|Naruto]] tattooed on my forearm.",
    howIWork: "No fixed recipe. Every project has its own workflow, so I shape my process around the problem and keep the answer as simple as it can be.",
    /** what the placeholder asks for, until a word has photos */
    words: {
      plane: { color: "#1f9d55", need: "The plane you built, or any tinkering" },
      camera: { color: "#2f6bff", need: "You with your cameras, or your edits" },
      cook: { color: "#ff4938", need: "Your cooking" },
      naruto: { color: "#f08a00", need: "Your Naruto tattoo" },
    } as Record<string, { color: string; need: string }>,
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
