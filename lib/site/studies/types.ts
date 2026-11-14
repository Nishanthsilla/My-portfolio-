/**
 * A long-form case study, written as data so both projects share one layout
 * (components/site/study). Copy is Nishanth's own, used verbatim.
 *
 * Screenshots turn on by themselves: drop a file at
 * /public/images/case-studies/<slug>/screens/<id>.(webp|png|jpg) and rebuild.
 * Until then a designed placeholder holds its place. The user flow and the
 * architecture are drawn in code from the data below.
 */

/** a paragraph, a bullet list, or a term list */
export type Block = string | { ul: string[] } | { ol: string[] } | { dl: { k: string; v: string }[] };

export type Screen = {
  id: string;
  /** what the screenshot must show (shown on the placeholder) */
  need: string;
  caption: string;
  /** placeholder ratio, e.g. "16:10"; a real image keeps its own ratio */
  ratio?: string;
};

/** how a group of screenshots sits next to its text */
export type ShotLayout = "wide" | "side" | "pair";

export type Step = { n: string; title: string; body: Block[]; shots?: { ids: string[]; layout: ShotLayout } };

/** the end-to-end user flow: stages in order, each with its steps in order */
export type Journey = { title: string; intro: string; subtitle: string; note: string; stages: { label: string; steps: string[] }[] };
/** the product architecture: layers from top (people) to bottom (runtime / device) */
export type Architecture = { title: string; intro: string; subtitle: string; note: string; layers: { label: string; items: string[] }[] };

export type Study = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  meta: { k: string; v: string }[];
  hero: string; // screen id shown under the title
  overview: Block[];
  challenge: { title: string; body: Block[]; question?: string };
  objective: { statement: string; lead: string; items: string[] };
  approach: Step[];
  journey: Journey;
  architecture: Architecture;
  decisions: { t: string; d: string }[];
  outcome: { lead: string; body: string[] };
  reflection: { quote: string; body: string[] };
  screens: Screen[];
  next: { slug: string; title: string; href: string };
};
