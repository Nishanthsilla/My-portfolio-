/**
 * CARRY / RE:FORM — FORMA 25. A self-initiated product design concept, in
 * Nishanth's own words. Nothing here is presented as built: it's a concept.
 * Images: /public/images/beyond/forma-25/<name>.webp (+ -sm.webp for small slots).
 */
const IMG = "/images/beyond/forma-25/";
export const img = (name: string) => ({ src: `${IMG}${name}.webp`, sm: `${IMG}${name}-sm.webp` });

export const forma25 = {
  kicker: "CARRY / RE:FORM",
  title: "FORMA 25",
  tagline: "One core. Different journeys.",
  line: "A configurable backpack that adapts to your activity, your needs and the way you move.",
  status: "Concept" as const,
  meta: [
    { k: "Project type", v: "Self-initiated product design concept" },
    { k: "Category", v: "Industrial Design · Product Strategy" },
    { k: "Focus", v: "Modular backpack ecosystem" },
    { k: "Role", v: "Concept development, product architecture and industrial design" },
  ],
  hero: { ...img("hero"), alt: "FORMA 25: a matte black and charcoal backpack with orange zip pulls, on a light studio background" },

  context: {
    title: "The Context",
    paras: [
      "Our everyday needs are not always the same. A backpack that works for commuting may not be suitable for photography, trekking or longer trips.",
      "Yet most backpacks are designed around fixed compartments and specific purposes.",
      "I wanted to explore whether one backpack could adapt to different activities without requiring users to own multiple specialized bags.",
      "This led to CARRY / RE:FORM — a concept for a configurable backpack system.",
    ],
  },

  problem: {
    title: "The Problem",
    lead: "People often switch between different activities, but their backpacks don't adapt with them.",
    points: [
      { k: "Fixed compartments", v: "Storage designed for one purpose may become unnecessary for another." },
      { k: "Multiple bags", v: "Different activities often require different specialized backpacks." },
      { k: "Limited flexibility", v: "Users cannot easily change the storage configuration." },
      { k: "Capacity limitations", v: "Additional storage often means purchasing a larger backpack." },
    ],
    close: "The opportunity was to move from a fixed backpack to a product that changes according to the user's situation.",
  },

  challenge: {
    title: "The Design Challenge",
    question: "How might we create one backpack that adapts to different activities while maintaining comfort, accessibility, durability and a minimal appearance?",
    needs: [
      "Interchangeable external accessories.",
      "Flexible internal organization.",
      "Expandable storage capacity.",
      "Secure and intuitive attachment mechanisms.",
      "Multiple carrying configurations.",
      "A complete standalone backpack experience.",
    ],
  },

  usage: {
    title: "Understanding the Usage",
    lead: "I explored four key situations to understand how the backpack should adapt.",
    cases: [
      { k: "Photography", v: "Equipment protection, quick camera access and secure tripod storage.", ...img("photography"), alt: "A photographer in the mountains with FORMA 25 on his back, a tripod in the side holder" },
      { k: "Trekking", v: "Easy access to outdoor essentials, hydration, utility storage and additional capacity.", ...img("trekking"), alt: "A trekker on a mountain trail with FORMA 25, a bottle holder and a first-aid pouch attached" },
      { k: "Travel", v: "Flexible clothing organization, separate shoe storage and additional packing space.", ...img("travel"), alt: "A traveller at an airport with FORMA 25 and its shoe pod attached" },
      { k: "Everyday", v: "A minimal, lightweight configuration with laptop protection and quick-access storage.", ...img("everyday"), alt: "A commuter on a city street with FORMA 25 and a bottle holder" },
    ],
    insight: "Users don't need all the accessories all the time. They need the right configuration for the activity.",
  },

  solution: {
    title: "The Solution — FORMA 25",
    lead: "FORMA 25 is a modular backpack built around a 25L core, with interchangeable accessories and expandable storage.",
    sub: "The product is designed as four interconnected systems.",
    ecosystem: { ...img("ecosystem"), alt: "Exploded view of the FORMA 25 system: external modules, internal organizers, the 25L core, the expansion layer, the harness and the shoe pod; total capacity 25–40L" },
    modules: { ...img("modules"), alt: "All FORMA 25 parts laid out: tripod holder, bottle holder, utility pouch, quick-access pocket, the core backpack, camera cube, clothing organizer, tech organizer, toiletry module, shoe pod and expansion layer" },
    systems: [
      { k: "Core Backpack — 25L", v: ["Structured base and flexible body.", "Top access and full-side opening.", "Suspended laptop compartment for up to 16-inch devices.", "Ergonomic back panel.", "Universal side attachment interfaces."] },
      { k: "External Modules", v: ["Tripod holder.", "Bottle holder.", "Utility pouch.", "Quick-access pocket.", "Equipment pouch."], note: "Both sides use identical mounting geometry, allowing compatible accessories to switch between left and right." },
      { k: "Internal Organizers", v: ["Camera cube.", "Clothing organizer.", "Tech organizer.", "Toiletry module.", "Accessory organizer."] },
      { k: "Expandable Components", v: ["Detachable 10–15L expansion layer.", "Independent detachable shoe pod."], note: "The target expanded capacity is approximately 35–40L." },
    ],
  },

  decisions: {
    title: "Key Design Decisions",
    items: [
      { k: "A universal attachment system", v: "Rather than creating a different attachment mechanism for every accessory, I explored a shared docking interface. This allows compatible modules to be moved between either side of the backpack." },
      { k: "A hybrid opening system", v: "Top access supports everyday retrieval, while the full-side opening makes packing and accessing the main compartment easier." },
      { k: "A suspended laptop compartment", v: "The dedicated laptop compartment sits against the rear panel with clearance from the backpack's bottom." },
      { k: "A detachable shoe pod", v: "An independent bottom module provides separate shoe storage, with a front accessory pocket and a proposed five-point attachment architecture." },
      { k: "Expandable capacity", v: "A detachable expansion layer increases the target capacity without permanently increasing the size of the core backpack." },
    ],
    dimensions: { ...img("dimensions"), alt: "Technical views and dimensions: front, right, back and left views (52 × 32 × 18 cm), top and bottom views, and the capacity configuration from 25L to about 40L" },
  },

  material: {
    title: "Material & Visual Direction",
    lead: "The design balances a minimal exterior with functional technical details.",
    palette: [
      { k: "Exterior", v: "Matte black and charcoal grey.", c: ["#151515", "#4a4a4a"] },
      { k: "Interior", v: "Bright orange for improved visibility and a distinctive visual identity.", c: ["#ff6a1a"] },
    ],
    materials: ["500D nylon main body.", "Ripstop nylon expansion.", "Polyester interior lining.", "Breathable spacer mesh.", "Closed-cell foam padding.", "Reinforced nylon webbing.", "Mechanical attachment hardware.", "Reverse-coil zippers."],
    note: "Final material and hardware selection would be validated with suppliers and physical prototypes.",
    blueprint: { ...img("blueprint"), alt: "Blueprint sheet: orthographic views, an exploded view of the component architecture, detailed technical drawings in millimetres, the shoe pod, and the materials and hardware" },
  },

  ecosystem: {
    title: "The Product Ecosystem & Outcome",
    lead: "FORMA 25 is designed to support individual module purchases as well as ready-made configurations.",
    kits: [
      { k: "Creator Kit", v: "Camera cube, tripod holder and tech organizer." },
      { k: "Explorer Kit", v: "Utility pouch, bottle holder, first-aid pouch and rain cover." },
      { k: "Travel Kit", v: "Expansion layer, clothing organizer, toiletry module and shoe pod." },
      { k: "Everyday Kit", v: "Quick-access pocket, bottle holder and tech organizer." },
    ],
    modesLead: "The product also explores four carrying modes:",
    modes: ["Backpack", "Tote", "Crossbody", "Hand-carry"],
    outcome: [
      "CARRY / RE:FORM explores a different approach to everyday carry products: instead of owning multiple bags for different activities, users can start with one core backpack and configure it around their needs.",
      "The concept establishes a foundation for a modular product ecosystem that can grow with the user.",
    ],
    next: "The next stage would involve developing physical prototypes, validating attachment strength, evaluating carrying comfort, testing expansion and refining the design for manufacturing.",
  },
};
