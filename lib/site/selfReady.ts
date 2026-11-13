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
  oneLiner: "Making AI-powered retail shelf intelligence easier to understand, review and act on.",
  meta: [
    { k: "Discipline", v: "Product Design · AI · Retail Intelligence", status: "confirmed" as Status },
    { k: "Role", v: "Confirm your official role and responsibilities", status: "confirm" as Status },
    { k: "Timeline", v: "Add project timeline", status: "confirm" as Status },
    { k: "Platform", v: "Confirm web application / platform details", status: "confirm" as Status },
    { k: "Status", v: "Confirm shipped / in development", status: "confirm" as Status },
  ],
  /** "Information to confirm before publishing" — from the draft. */
  toConfirm: [
    "Your exact role and ownership in Self-Ready.",
    "Project timeline and team composition.",
    "The official product description and target user roles.",
    "Which of the listed modules belong specifically to Self-Ready.",
    "The approved meanings of Auto-admitted, Needs confirmation, Unresolved, Business signal and Detection quality.",
    "Actual research activities and findings.",
    "Which workflows and features were shipped.",
    "Screenshots of the actual interfaces.",
    "Verified product outcomes, stakeholder feedback or metrics.",
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
  /** Short overview: the draft's design directions, verbatim. */
  focus: [
    { t: "Keep technical complexity away from the primary review screen", d: "Prioritise the detected association and the information needed to review it. Keep lengthy pipeline explanations and debugging information secondary." },
    { t: "Make uncertainty visible", d: "Use clearly differentiated states and communicate when human attention is required." },
    { t: "Connect the result with its evidence", d: "Keep the product, label and supporting information connected in the review experience." },
    { t: "Capture → Analyse → Review → Resolve → Publish", d: "The intended workflow narrative, from capturing shelf information to reviewing results." },
  ],
};

/**
 * Screenshot slots. Each renders as "ADD IMAGE HERE — <need>" until a file is
 * placed at /public/images/self-ready/<id>.webp and `src` is filled in.
 */
export type ImageSlot = { id: string; section: string; need: string; ratio: string; src?: string };

export const selfReadySlots: ImageSlot[] = [
  // the draft's own placeholders, in order
  { id: "sr-hero-interface", section: "01 Overview", need: "Self-Ready hero interface", ratio: "16:10" },
  { id: "sr-shelf-association", section: "02 Understanding the problem", need: "Retail shelf and product-label association", ratio: "16:10" },
  { id: "sr-hierarchy", section: "03 The UX direction", need: "Information hierarchy or review screen", ratio: "16:10" },
  { id: "sr-workflow", section: "04 Understanding the experience", need: "Self-Ready end-to-end workflow", ratio: "21:9" },
  { id: "sr-result-states", section: "05 Designing for confidence and uncertainty", need: "AI result states", ratio: "16:10" },
  { id: "sr-capture-sessions", section: "06 Capture Sessions", need: "Capture sessions overview", ratio: "16:10" },
  { id: "sr-capture-detail", section: "06 Capture Sessions", need: "Capture detail screen", ratio: "16:10" },
  { id: "sr-shelf-analysis", section: "07 Shelf Analysis", need: "Shelf analysis screen", ratio: "16:10" },
  { id: "sr-association", section: "07 Shelf Analysis", need: "Product and label association", ratio: "4:3" },
  { id: "sr-product-intel", section: "07 Shelf Analysis", need: "Product intelligence", ratio: "4:3" },
  { id: "sr-label-intel", section: "07 Shelf Analysis", need: "Label intelligence", ratio: "4:3" },
  { id: "sr-review", section: "08 Human Review", need: "Human review interface", ratio: "16:10" },
  { id: "sr-association-detail", section: "08 Human Review", need: "Association detail", ratio: "4:3" },
  { id: "sr-exception-list", section: "09 Exception Handling", need: "Exception list", ratio: "16:10" },
  { id: "sr-exception-detail", section: "09 Exception Handling", need: "Exception detail", ratio: "4:3" },
  { id: "sr-exception-resolution", section: "09 Exception Handling", need: "Exception resolution", ratio: "4:3" },
  { id: "sr-versions", section: "10 Versions, publishing and traceability", need: "Version history or version state", ratio: "16:10" },
  { id: "sr-publish", section: "10 Versions, publishing and traceability", need: "Publish workflow", ratio: "16:10" },
  { id: "sr-audit", section: "10 Versions, publishing and traceability", need: "Activity / audit screen", ratio: "16:10" },
  { id: "sr-d1", section: "11 Decision 01", need: "Primary review screen / information hierarchy", ratio: "16:10" },
  { id: "sr-d2", section: "11 Decision 02", need: "Result state comparison", ratio: "16:10" },
  { id: "sr-d3", section: "11 Decision 03", need: "Product-label association detail", ratio: "16:10" },
  { id: "sr-final", section: "12 Outcome", need: "Final Self-Ready experience", ratio: "16:10" },
  { id: "sr-g-dashboard", section: "14 Project gallery", need: "Self-Ready dashboard", ratio: "4:3" },
  { id: "sr-g-capture", section: "14 Project gallery", need: "Capture session", ratio: "4:3" },
  { id: "sr-g-shelf", section: "14 Project gallery", need: "Shelf analysis", ratio: "4:3" },
  { id: "sr-g-product-intel", section: "14 Project gallery", need: "Product intelligence", ratio: "4:3" },
  { id: "sr-g-label-intel", section: "14 Project gallery", need: "Label intelligence", ratio: "4:3" },
  { id: "sr-g-exceptions", section: "14 Project gallery", need: "Exception handling", ratio: "4:3" },
  { id: "sr-g-versions", section: "14 Project gallery", need: "Version management", ratio: "4:3" },
  { id: "sr-g-publishing", section: "14 Project gallery", need: "Publishing", ratio: "4:3" },
  { id: "sr-g-audit", section: "14 Project gallery", need: "Activity / audit", ratio: "4:3" },
];
export const slot = (id: string) => selfReadySlots.find((s) => s.id === id)!;
