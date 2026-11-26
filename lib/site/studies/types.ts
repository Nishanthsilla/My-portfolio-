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
  /** client work: the file in screens/ is a recreation; the real screenshot is shown only to approved visitors */
  locked?: boolean;
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
  /** where the back link at the top goes (default: the project's overview page) */
  back?: { href: string; label: string };
  meta: { k: string; v: string }[];
  hero: string; // screen id shown under the title
  overview: Block[];
  challenge: { title: string; body: Block[]; question?: string };
  objective: { statement: string; lead: string; items: string[] };
  /** why the design looks like this: the designer's personality and how it maps onto the site */
  personality?: { title: string; body: Block[]; traits: { t: string; d: string }[] };
  /** the tools behind the work (with an optional picture) */
  toolkit?: { title: string; lead: string; items: { t: string; d: string }[]; shot?: string };
  approach: Step[];
  /** a walk through the screens: what each is, why it exists, and what it achieves */
  tour?: { id: string; t: string; what: string; why: string; outcome: string }[];
  /** how it's built: code and data */
  build?: { title: string; body: Block[] };
  /** problems met along the way, and how they were solved */
  problems?: { t: string; problem: string; solution: string }[];
  /** performance and quality work */
  optimisations?: { title: string; lead: string; items: string[] };
  journey?: Journey;
  architecture?: Architecture;
  /** key design contributions: each a challenge, what I did, and the design objective */
  contributions?: { t: string; challenge: string; approach: string[]; objective: string; shots?: { ids: string[]; layout: ShotLayout } }[];
  decisions: { t: string; d: string }[];
  /** headings for the decisions list (a two-column "decision / why it mattered" table when `why` is set) */
  decisionsHead?: { title: string; lead?: string; why?: string; close?: string };
  outcome?: { lead: string; body: Block[]; note?: string };
  reflection: { quote: string; body: string[] };
  closing?: { title: string; body: string };
  screens: Screen[];
  next: { slug: string; title: string; href: string };
};
