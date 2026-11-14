import type { Study } from "./types";

/** Self-Ready — Nishanth's case study, verbatim. */
export const selfReadyStudy: Study = {
  slug: "self-ready",
  title: "Self-Ready",
  subtitle: "Turning product imagery into device-ready recognition data.",
  category: "Product Strategy",
  meta: [
    { k: "Role", v: "Lead Product Designer" },
    { k: "Contribution", v: "End-to-end product design" },
    { k: "Focus", v: "UX strategy, information architecture, user journeys, interaction design, UI design, prototyping and developer collaboration" },
    { k: "Platform", v: "Retail image intelligence and product readiness" },
  ],
  hero: "sr-workbench",
  overview: [
    "Retail image intelligence depends on more than capturing images. The system needs reliable product imagery, accurate product identification and validated associations before that information can be used effectively by a device model.",
    "Self-Ready was designed to support this process.",
    "It brings image ingestion, processing, human validation, product data management and device readiness into one connected operational experience.",
    "I led the design of the experience, focusing on making the journey from image intake to device-ready product data easier to understand and manage.",
  ],
  challenge: {
    title: "A captured image does not automatically become reliable recognition data.",
    body: [
      "Images need to be processed, products need to be identified, and AI-generated product and shelf-label associations need to be validated.",
      "There are also cases where the system cannot confidently identify a product, where packaging has changed, or where an image needs to be rejected or reviewed again.",
      "The experience needed to support these different situations without making the review process unnecessarily complicated.",
    ],
    question: "How might we make the process of preparing and validating product imagery clear enough for operational teams to manage, while maintaining the quality of data used by the device model?",
  },
  objective: {
    statement: "Create a connected workflow from image intake to device-ready product data.",
    lead: "Create a connected workflow that helps users:",
    items: [
      "Ingest product and shelf imagery.",
      "Track image processing and capture sessions.",
      "Review AI-generated product and label associations.",
      "Confirm or reject incorrect associations.",
      "Manage images that need additional review.",
      "Maintain reliable product image records.",
      "Prepare eligible product imagery for the device model.",
    ],
  },
  approach: [
    {
      n: "01",
      title: "Designing the image ingestion journey",
      body: [
        "The journey begins with two ways to bring imagery into the platform:",
        { ul: ["Manual Bulk Ingestion", "Scheduled Image Capture"] },
        "I kept these as distinct entry points because they represent different operational needs.",
        "Ingestion History provides visibility into submitted batches, including successful and failed image counts. Users can understand the outcome of a batch without having to inspect every file individually.",
      ],
      shots: { ids: ["sr-ingestion", "sr-ingestion-history"], layout: "pair" },
    },
    {
      n: "02",
      title: "Making capture sessions easier to understand",
      body: [
        "After ingestion, users need to understand what happened to the images.",
        "Capture Sessions organise the results into clear processing states, allowing users to distinguish images that are still processing from those that are ready for review or have failed.",
        "The session view focuses on useful operational information, such as image counts, identified products, facings, AI quality, labels read and barcodes.",
        "The goal was to make the state of a capture session understandable without exposing unnecessary pipeline details.",
      ],
      shots: { ids: ["sr-capture-sessions"], layout: "wide" },
    },
    {
      n: "03",
      title: "Simplifying human validation",
      body: [
        "One of the most important parts of Self-Ready is the Image Review experience.",
        "The FDE's primary responsibility is to validate whether the AI-generated product and shelf-label association is correct.",
        "I designed this experience around that decision.",
        "Instead of exposing lengthy pipeline explanations or technical debugging information, the interface focuses on:",
        {
          ul: [
            "The individual product crop.",
            "The associated shelf label.",
            "AI confidence and the reason behind the association.",
            "A clear question: Does this label belong to this product?",
            "Direct Confirm and Reject decisions.",
          ],
        },
        "The intention was to reduce distractions and make the review action the centre of the experience.",
      ],
      shots: { ids: ["sr-image-review"], layout: "wide" },
    },
    {
      n: "04",
      title: "Managing exceptions through Blocklist",
      body: [
        "Not every rejected association should disappear from the system.",
        "Some cases require further investigation or review.",
        "The Blocklist provides a dedicated place to manage these exceptions, with states such as Needs Review, Confirmed and Rejected.",
        "This allows users to resolve issues while preserving the original decision history and keeping the relationship with the original capture session.",
        "Importantly, rejecting an item and adding it to the Blocklist are treated as separate decisions.",
      ],
      shots: { ids: ["sr-blocklist"], layout: "side" },
    },
    {
      n: "05",
      title: "Maintaining product image lifecycle",
      body: [
        "The Product Database is the foundation for maintaining confirmed product information and the imagery associated with it.",
        "I worked on structuring product imagery into lifecycle states:",
        {
          dl: [
            { k: "Active", v: "Images currently used for recognition." },
            { k: "Seasonal", v: "Temporary or packaging-specific images with their own validity period." },
            { k: "Inactive", v: "Historical images retained for reference." },
          ],
        },
        "This distinction helps users understand which images are currently relevant and which are retained as historical or temporary records.",
        "It also avoids treating every image update as a destructive replacement.",
      ],
      shots: { ids: ["sr-product-database", "sr-product-details"], layout: "pair" },
    },
    {
      n: "06",
      title: "Preparing data for the device model",
      body: [
        "The final objective is to prepare reliable product imagery and recognition data for the device model.",
        "The On-device Index provides visibility into the product data prepared for device use.",
        "By connecting image ingestion, validation and product lifecycle management, Self-Ready supports a more structured process for improving the data used by the device model.",
      ],
      shots: { ids: ["sr-on-device-index"], layout: "side" },
    },
  ],
  journey: {
    file: "self_ready_user_flow.png",
    title: "End-to-end user journey",
    intro: "This flow shows how users move from image ingestion through processing, validation and product data management towards device readiness.",
    caption: "From image ingestion through processing, validation and product data management towards device readiness.",
    alt: "Self-Ready end-to-end user journey, from image ingestion to device readiness",
  },
  architecture: {
    file: "self_ready_architecture.png",
    title: "Product architecture",
    intro: "The architecture illustrates how image intake, AI processing, human review, product records and device readiness fit together.",
    caption: "How image intake, AI processing, human review, product records and device readiness fit together.",
    alt: "Self-Ready product architecture: image intake, AI processing, human review, product records and device readiness",
  },
  decisions: [
    { t: "Separate ingestion methods", d: "Keep manual bulk ingestion and scheduled image capture as distinct workflows." },
    { t: "Decision-focused image review", d: "Make product-label validation the primary task instead of exposing technical pipeline details." },
    { t: "Preserve decision history", d: "Keep rejection, blocklist and review states distinct so users can understand what happened to an item." },
    { t: "Manage image lifecycle explicitly", d: "Separate active, seasonal and inactive imagery rather than treating all product images equally." },
    { t: "Connect product data to device readiness", d: "Make the relationship between confirmed product imagery, the On-device Index and device model preparation understandable." },
  ],
  outcome: {
    lead: "Self-Ready provides a structured experience for preparing product imagery and recognition data to train and update the device model.",
    body: [
      "It connects ingestion, AI-assisted processing, human validation and product image management into one operational workflow.",
      "The outcome is a clearer and more manageable process for maintaining the data that supports device recognition.",
    ],
  },
  reflection: {
    quote: "The most important lesson from Self-Ready was that AI output should not automatically be treated as reliable product data.",
    body: [
      "Human validation, clear decision states and a well-defined image lifecycle are essential parts of the experience.",
      "The design needed to make these responsibilities clear while keeping the operational interface focused and efficient.",
    ],
  },
  screens: [
    { id: "sr-workbench", need: "Platform overview — Self-Ready Workbench", caption: "The Self-Ready Workbench: ingestion, processing, review, product data and device readiness in one place.", ratio: "16:9" },
    { id: "sr-ingestion", need: "Image ingestion — Manual Bulk Ingestion and Scheduled Image Capture", caption: "Two distinct entry points: Manual Bulk Ingestion and Scheduled Image Capture.", ratio: "4:3" },
    { id: "sr-ingestion-history", need: "Ingestion History — batch tracking and processing status", caption: "Ingestion History: submitted batches with successful and failed image counts.", ratio: "4:3" },
    { id: "sr-capture-sessions", need: "Capture Sessions — image processing and session overview", caption: "Capture Sessions: processing states, image counts, identified products, facings, AI quality, labels read and barcodes.", ratio: "16:9" },
    { id: "sr-image-review", need: "Image Review — product crop, shelf label and Confirm / Reject", caption: "Image Review: the product crop, its shelf label, AI confidence and reason, and a direct Confirm or Reject.", ratio: "16:9" },
    { id: "sr-blocklist", need: "Blocklist — exception management and review states", caption: "Blocklist: exceptions with Needs Review, Confirmed and Rejected states, linked to the original capture session.", ratio: "4:3" },
    { id: "sr-product-database", need: "Product Database — confirmed product records", caption: "Product Database: confirmed product information and its imagery.", ratio: "4:3" },
    { id: "sr-product-details", need: "Product details — Active, Seasonal and Inactive image lifecycle", caption: "Product details: Active, Seasonal and Inactive imagery.", ratio: "4:3" },
    { id: "sr-on-device-index", need: "On-device Index — device readiness and product data preparation", caption: "On-device Index: the product data prepared for device use.", ratio: "4:3" },
  ],
  next: { slug: "ambient-ai", title: "Ambient AI", href: "/work/ambient-ai/case-study" },
};
