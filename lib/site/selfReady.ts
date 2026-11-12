/**
 * Self-Ready — case-study content.
 *
 * SOURCE: only the project brief Nishanth wrote in this conversation (the
 * Markdown draft has not been provided yet). Nothing else is assumed.
 * Every item carries a status:
 *   "confirmed"   — stated in the brief as fact
 *   "direction"   — a design direction discussed in the project (per the brief)
 *   "confirm"     — named in the brief but NOT yet verified for Self-Ready → shown with a "Needs confirmation" marker
 * Interface animations are illustrative reconstructions (generic items, no real data).
 */

export type Status = "confirmed" | "direction" | "confirm";

export const selfReady = {
  slug: "self-ready",
  title: "Self-Ready",
  oneLiner: "Making AI-powered retail shelf intelligence easier to review, understand, and act on.",
  meta: [
    { k: "Discipline", v: "Product Design", status: "confirmed" as Status },
    { k: "Domain", v: "AI / Retail Intelligence", status: "confirmed" as Status },
    { k: "Role", v: "To be confirmed", status: "confirm" as Status },
    { k: "Timeline", v: "To be confirmed", status: "confirm" as Status },
  ],
  /** The central design challenge, as written in the brief. */
  challenge:
    "AI can identify likely product and shelf-label associations, but people still need to understand the result, inspect the evidence, resolve uncertainty, and decide what happens next.",
  /** The information hierarchy direction, as written in the brief. */
  hierarchy: ["The result first", "Supporting evidence second", "Technical detail when needed"],
  direction:
    "Keep lengthy pipeline explanations and technical debugging information away from the primary review experience.",
  /** Areas named in the existing project material — membership in Self-Ready not yet verified. */
  modules: [
    "Capture Sessions",
    "Capture Detail",
    "Shelf Analysis",
    "Exceptions",
    "Product Intelligence",
    "Label Intelligence",
    "Versions",
    "Publish",
    "Activity / Audit",
  ],
  /** Review terms from project discussions — to be verified before being used as final UI copy. */
  terms: ["Auto-admitted", "Needs confirmation", "Unresolved", "Business signal", "Detection quality"],
  /** Short overview: focus areas (design directions taken from the brief). */
  focus: [
    { t: "Making AI results understandable", d: "The result first, supporting evidence second, technical detail when needed." },
    { t: "Reviewing product–label associations", d: "Seeing which product the AI matched to which shelf label, and why." },
    { t: "Handling uncertainty", d: "Surfacing what needs a person's attention and why — without burying the reviewer in pipeline detail." },
    { t: "A calmer primary review", d: "Lengthy pipeline explanations and debugging information kept out of the main review experience." },
  ],
};

/**
 * Screenshot slots. Each renders as "ADD IMAGE HERE — <need>" until a file is
 * placed at /public/images/self-ready/<id>.webp and `src` is filled in.
 */
export type ImageSlot = { id: string; section: string; need: string; ratio: string; src?: string };

export const selfReadySlots: ImageSlot[] = [
  { id: "sr-dashboard", section: "01 Hero", need: "Self-Ready Dashboard", ratio: "16:10" },
  { id: "sr-shelf-analysis", section: "02 The challenge", need: "Shelf Analysis Screen", ratio: "16:10" },
  { id: "sr-capture-sessions", section: "03 Understanding the workflow", need: "Capture Sessions list", ratio: "16:10" },
  { id: "sr-capture-detail", section: "03 Understanding the workflow", need: "Capture Detail screen", ratio: "16:10" },
  { id: "sr-association", section: "04 Making AI results understandable", need: "Product and Label Association", ratio: "16:10" },
  { id: "sr-evidence", section: "04 Making AI results understandable", need: "Evidence panel close-up", ratio: "4:3" },
  { id: "sr-review", section: "05 Reviewing an association", need: "Human Review Interface", ratio: "16:10" },
  { id: "sr-exceptions", section: "06 Handling exceptions", need: "Exception Handling Screen", ratio: "16:10" },
  { id: "sr-product-intel", section: "06 Handling exceptions", need: "Product Intelligence Screen", ratio: "16:10" },
  { id: "sr-before-after", section: "07 Design decisions", need: "Before and After Design Comparison", ratio: "2:1" },
  { id: "sr-versions", section: "08 Versions, publishing, traceability", need: "Version History", ratio: "16:10" },
  { id: "sr-publish", section: "08 Versions, publishing, traceability", need: "Publishing Workflow", ratio: "16:10" },
  { id: "sr-audit", section: "08 Versions, publishing, traceability", need: "Activity / Audit log", ratio: "16:10" },
];
export const slot = (id: string) => selfReadySlots.find((s) => s.id === id)!;
