/**
 * Modular Hanging Desk Organizer: an industrial design concept in development.
 * Copy follows Nishanth's Markdown (the source of truth). No research, dimensions,
 * test results or specifications beyond what it states. Images: approved ones in
 * /public/images/beyond/desk-organizer; the rest are labelled placeholders.
 */
const D = "/images/beyond/desk-organizer/";
export type Pic = { src: string; sm: string; alt: string } | { slot: string; need: string };
const img = (n: string, alt: string): Pic => ({ src: `${D}${n}.webp`, sm: `${D}${n}-sm.webp`, alt });
const slot = (n: string, need: string): Pic => ({ slot: n, need });

export const desk = {
  kicker: "Industrial product design",
  title: "Modular Hanging Desk Organizer",
  line: "A modular hanging storage organizer designed to use the unused space beneath a desk.",
  status: "Concept",
  meta: [
    { k: "Project type", v: "Industrial Design / Physical Product Design" },
    { k: "Status", v: "Concept Development" },
    { k: "Target load", v: "3–5 kg (not yet validated)" },
    { k: "Intended contents", v: "Books, notebooks, stationery and headphones" },
  ],
  img: {
    hero: img("hero", "The organizer hooked over a desk edge: a mustard-yellow body with four cream trays holding notebooks, pens and sticky notes, one tray pulled out, and headphones on the side peg"),
    configurations: slot("02", "Product configurations: different tray arrangements"),
    lifestyle: slot("03", "Lifestyle usage: the product attached to a desk"),
    exploded: img("exploded", "Exploded assembly: the desk mounting frame, the organizer body with sliding ledges on its inner walls, four removable trays and the detachable headphone peg"),
    ledges: slot("05", "Sliding ledge mechanism: the 0.5-inch internal ledges on both walls"),
    tray: img("tray", "Anti-fall tray design: raised side, back and front edges, a slight upward profile and smooth rounded corners"),
    peg: slot("07", "Detachable headphone peg: the independent single-hole attachment"),
    mount: slot("08", "Desk mounting detail: the over-desk mounting structure"),
    ortho: img("orthographic", "Orthographic views: front, right side, left side, top, bottom and rear"),
    material: slot("10", "Material exploration: colours and surface finishes"),
    cad: slot("11", "CAD & prototype breakdown: modelling and assembly"),
    final: slot("12", "Final product presentation"),
    sketch: img("sketch", "An early exploration sketch sheet: the structure, trays, ledges, headphone hook and over-table hook"),
  },

  intro: [
    "A modular hanging storage organizer designed to utilise the unused space beneath a desk.",
    "The product attaches to the desk edge and provides additional storage through removable trays that can be repositioned at different heights.",
    "The concept focuses on freeing up valuable desk space while keeping everyday essentials accessible.",
    "The design combines a sturdy hanging structure, internal sliding ledges, adjustable trays with raised edges, and an independent detachable headphone peg.",
  ],
  context: [
    "The project started as an exploration of compact desk storage.",
    "The initial direction focused on creating a small organizer for books and everyday accessories. During the design exploration, the concept evolved into a hanging storage solution that uses the space underneath the desk.",
    "The key shift was moving away from conventional tabletop storage towards a modular system that could be configured based on individual storage requirements.",
  ],
  evolution: [
    { k: "Initial exploration", v: "Compact organizer for books and reading-related items." },
    { k: "Desk storage exploration", v: "Storage for stationery and everyday accessories." },
    { k: "Hanging concept", v: "Move storage beneath the tabletop." },
    { k: "Modular direction", v: "Introduce removable trays with adjustable heights." },
    { k: "Mechanism refinement", v: "Introduce internal sliding ledges, raised tray edges and a detachable headphone peg." },
  ],
  evolutionNote: "These represent design explorations, not user-tested iterations.",
  problem: [
    "Traditional desk organizers occupy valuable tabletop space and often have fixed compartments that cannot accommodate objects of different sizes.",
    "People need accessible storage for books, notebooks, stationery and accessories without adding more clutter to their workspace.",
  ],
  opportunity: "How might we use the unused space beneath a desk to create accessible, flexible and configurable storage?",
  challenge: {
    lead: "How might we design a sturdy hanging storage system that:",
    items: [
      "Uses the unused space beneath a desk.",
      "Accommodates objects of different sizes.",
      "Allows trays to be removed and repositioned easily.",
      "Prevents smaller objects from sliding or falling out.",
      "Provides a dedicated place for headphones.",
      "Targets a storage capacity of 3–5 kg.",
    ],
    close: "The challenge is not just creating additional storage. The mounting structure, outer body, internal ledges and removable trays must work together as a stable system.",
  },
  users: {
    note: "These are proposed user groups based on the product's intended usage, not research-validated personas.",
    list: [
      { k: "Students", v: "People who need accessible storage for books, notebooks, stationery and study accessories." },
      { k: "Home-office workers", v: "People who want to organise headphones, notebooks and everyday desk essentials." },
      { k: "Compact workspace users", v: "People who need additional storage without occupying more tabletop space." },
    ],
  },
  assumptions: {
    note: "No formal user interviews, surveys or usability studies have been conducted. The following are design assumptions guiding the concept.",
    rows: [
      ["Desk surface is valuable", "Hang storage beneath the desk"],
      ["Objects vary in size", "Adjustable trays"],
      ["Trays should be accessible", "Internal sliding ledges"],
      ["Small objects can fall", "Raised tray edges"],
      ["Headphones need dedicated storage", "Detachable headphone peg"],
      ["Product needs structural strength", "Reinforced body and mounting system"],
    ],
  },
  components: [
    { k: "Desk Mounting Structure", v: "Hooks over the desk edge and supports the organizer underneath the tabletop." },
    { k: "Outer Organizer Body", v: "Provides the primary structure and supports the internal tray mechanism." },
    { k: "Internal Sliding Ledges", v: "Ledges integrated into both inner side walls to support and guide the removable trays." },
    { k: "Removable Storage Trays", v: "Trays can be repositioned at different heights depending on storage requirements." },
    { k: "Detachable Headphone Peg", v: "A separate removable peg attached through one dedicated hole on the exterior of the organizer." },
  ],
  decisions: {
    hanging: [
      "Instead of placing the organizer on top of the desk, the product hooks over the desk edge.",
      "This allows the storage volume to sit underneath the tabletop, preserving usable desk surface.",
      "The mounting structure must accommodate different desk thicknesses and provide a secure fit.",
    ],
    trays: [
      "The trays are not permanently fixed.",
      "Users can remove them and reposition them at different heights depending on the objects they want to store.",
      "This makes the organizer flexible enough to accommodate books, notebooks, stationery and accessories.",
    ],
    ledges: {
      lead: "One of the most important design decisions is the introduction of internal sliding ledges, integrated into both internal side walls.",
      width: "≈ 0.5 in / 12.7 mm",
      widthNote: "Proposed ledge width",
      purpose: ["Support the trays from underneath.", "Guide the trays while sliding in and out.", "Allow users to reposition trays easily.", "Provide consistent support along the tray's travel."],
      close: "The trays should slide smoothly while remaining properly supported. The adjustment mechanism uses internal sliding ledges, not an internal pegboard or peg-and-hole system.",
    },
    antiFall: {
      lead: "The trays need raised edges to prevent pens, stationery and other small objects from falling out.",
      items: ["Raised side edges.", "Raised front edge.", "Slight upward-facing profile.", "Smooth internal corners."],
      close: "The final angle and raised lip dimensions will be established during CAD development and prototype testing.",
    },
    peg: {
      lead: "The organizer includes one dedicated hole on its exterior for attaching a detachable headphone peg. The peg is completely independent of the internal tray mechanism.",
      items: ["Only one dedicated exterior hole.", "Detachable headphone peg.", "No connection to internal sliding ledges.", "No connection to tray height adjustment.", "Easy to attach and remove.", "Strong enough to support the intended headphones."],
      close: "The final attachment mechanism still needs to be established.",
    },
  },
  architecture: [
    ["Desk-edge mount", "Attaches the organizer to the desk"],
    ["Outer body", "Main structural enclosure"],
    ["Internal ledges", "Support and guide trays"],
    ["Removable trays", "Configurable storage"],
    ["Headphone peg", "Independent headphone attachment"],
  ],
  trayFlow: ["Remove the tray from its current position.", "Select the desired height.", "Align the tray with the internal ledges on both sides.", "Slide the tray inward.", "Ensure it is fully supported before placing objects."],
  trayFlowNote: "The final mechanism should prevent accidental tray disengagement.",
  pegFlow: ["Align the peg with the dedicated exterior hole.", "Insert and secure the peg.", "Hang headphones.", "Remove the peg whenever it is not required."],
  visual: [
    { k: "Primary colour", v: "Mustard yellow / warm yellow-orange", c: "#f2a516" },
    { k: "Tray colour", v: "Warm off-white / cream", c: "#efe6d8" },
    { k: "Form language", v: "Clean geometry with softened corners" },
    { k: "Surface finish", v: "Matte" },
    { k: "Character", v: "Minimal, functional and contemporary" },
  ],
  materials: ["Engineering-grade plastic for the body.", "Suitable rigid material for the trays.", "Reinforced structural components for the mounting mechanism.", "Durable attachment hardware for the headphone peg."],
  materialsNote: "Material selection should consider stiffness, impact resistance, long-term deformation, sliding wear and manufacturing feasibility. No final material has been selected.",
  loadPath: ["Stored objects", "Tray floor", "Tray sides", "Internal ledges", "Organizer body", "Desk mount", "Desk"],
  engineering: ["Tray deflection.", "Ledge strength and attachment.", "Body bending and twisting.", "Desk mounting stability.", "Long-term deformation.", "Sliding wear.", "Accidental tray disengagement."],
  engineeringNote: "Target load capacity: 3–5 kg. This is a design target, not a validated product rating. The complete assembly must be tested, not just individual trays.",
  plan: [
    { k: "Phase 1 — CAD Development", v: ["Establish overall product dimensions.", "Model the desk mounting structure.", "Define tray dimensions.", "Model internal sliding ledges.", "Establish tray clearances.", "Develop a tray retention mechanism.", "Model the independent headphone peg."] },
    { k: "Phase 2 — Prototype Development", v: ["Create a complete 3D assembly.", "Prototype the body and trays.", "Test tray insertion and removal.", "Check the sliding mechanism.", "Test headphone peg attachment.", "Evaluate the mounting structure on representative desk edges."] },
    { k: "Phase 3 — Validation", v: ["Test the complete assembly against the 3–5 kg target.", "Check structural deformation.", "Test mounting stability.", "Repeat tray insertion and removal.", "Check sliding wear.", "Confirm desk surface protection."] },
  ],
  planNote: "These are proposed future activities, not completed tests.",
  open: ["Overall product dimensions are not final.", "Desk thickness compatibility needs to be defined.", "Load distribution between trays is unknown.", "Internal ledge geometry requires CAD verification.", "Tray retention mechanism needs development.", "Raised tray lip dimensions need testing.", "Headphone peg attachment method needs finalisation.", "Final material and manufacturing process remain undecided."],
  outcome: ["Space-saving hanging structure.", "Removable and adjustable trays.", "0.5-inch internal sliding ledges.", "Raised tray edges.", "One independent exterior hole for a detachable headphone peg.", "Target load capacity of 3–5 kg."],
  next: "The next step is to develop a dimensioned CAD model, resolve structural details and validate the design through physical prototyping.",
  checklist: [
    ["Problem identified", true], ["Concept defined", true], ["Core features documented", true], ["Design decisions explained", true],
    ["Product architecture established", true], ["Assumptions separated from validated facts", true],
    ["Overall dimensions established", false], ["CAD geometry finalised", false], ["Material selected", false], ["Mounting mechanism validated", false],
    ["Tray mechanism validated", false], ["3–5 kg load target tested", false], ["Physical prototype evaluated", false],
  ] as [string, boolean][],
  maturity: "Concept Definition",
};
