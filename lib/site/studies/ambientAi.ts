import type { Study } from "./types";

/** Ambient AI — Nishanth's case study, verbatim. Screens are recreations; the real ones are shared on request. */
export const ambientAi: Study = {
  slug: "ambient-ai",
  title: "Ambient AI",
  subtitle: "Bringing clarity and structure to complex AI-powered experiences.",
  category: "Product Strategy",
  meta: [
    { k: "Role", v: "Lead Product Designer" },
    { k: "Type", v: "Enterprise SaaS · AI Platform · Product Design · UX Strategy" },
    { k: "Focus", v: "UX strategy and information architecture, user flows and interaction design, interface design and prototyping, design system consistency, onboarding and in-app guidance, collaboration with product and engineering teams" },
  ],
  hero: "aa-overview",
  overview: [
    "Ambient AI is an enterprise AI platform designed to bring AI-powered capabilities into a connected product experience.",
    "As AI platforms grow, users need more than access to individual AI features. They need a clear way to understand the platform, navigate its capabilities, and get started without having to learn the entire system upfront.",
    "The design challenge was to make a complex platform feel approachable, structured, and easy to navigate while retaining the depth required by enterprise users.",
    "My focus was on improving the platform experience through information architecture, interaction design, consistent UI patterns, and guided onboarding.",
  ],
  challenge: {
    title: "Powerful capabilities don't always translate into a usable experience.",
    body: [
      "Enterprise AI platforms can expose users to multiple capabilities, settings, and workflows. Without a clear structure, even capable users can struggle to understand where to begin and how different parts of the product fit together.",
      "The experience needed to address three important challenges:",
      {
        dl: [
          { k: "Discoverability", v: "Users need to understand what the platform offers and where to find the capabilities relevant to their work." },
          { k: "Complexity", v: "A feature-rich platform can quickly become difficult to navigate when information and actions are not organised around user needs." },
          { k: "Getting started", v: "New users need guidance to understand the product and complete their initial interactions without relying entirely on external documentation or assistance." },
        ],
      },
      "The opportunity was to make the platform easier to understand without removing its enterprise-level capabilities.",
    ],
    question: "How might we make a complex AI platform easier to understand, navigate, and get started with, while keeping its capabilities accessible as users become more experienced?",
  },
  objective: {
    statement: "I approached this as a platform experience problem rather than an individual screen redesign.",
    lead: "The design needed to:",
    items: [
      "Establish a clear navigation structure.",
      "Improve discoverability of platform capabilities.",
      "Reduce unnecessary cognitive load.",
      "Provide contextual guidance for new users.",
      "Maintain consistent interaction patterns.",
      "Support a scalable product experience.",
    ],
  },
  approach: [
    {
      n: "01",
      title: "Understanding the experience",
      body: [
        "Before focusing on individual screens, I looked at the overall experience from the user's perspective. I focused on three important stages:",
        {
          dl: [
            { k: "Discover", v: "Users should be able to understand the platform and identify the capabilities available to them." },
            { k: "Navigate", v: "Users should be able to move between platform areas without losing context or having to understand unnecessary technical details." },
            { k: "Get started", v: "Users should receive relevant guidance that helps them understand important interface elements and complete their first interactions." },
          ],
        },
        "This helped establish a more user-oriented approach to structuring the platform.",
      ],
      shots: { ids: ["aa-agent"], layout: "wide" },
    },
    {
      n: "02",
      title: "Information architecture",
      body: [
        "The platform needed a clear and predictable structure. I focused on:",
        {
          ul: [
            "Organising platform capabilities into understandable categories.",
            "Establishing consistent navigation patterns.",
            "Creating clearer relationships between navigation, page content, and actions.",
            "Maintaining predictable interaction behaviour across screens.",
          ],
        },
        "The goal was to help users understand where they were and what they could do next.",
      ],
      shots: { ids: ["aa-skill-registry"], layout: "wide" },
    },
    {
      n: "03",
      title: "Interface simplification",
      body: [
        "Enterprise products often expose too much information at once. I focused on improving:",
        { ul: ["Content hierarchy.", "Visual grouping.", "Information density.", "Action visibility.", "Consistency across interface components."] },
        "Rather than removing important capabilities, the objective was to make the information easier to scan and interact with.",
      ],
      shots: { ids: ["aa-workflow-builder"], layout: "wide" },
    },
    {
      n: "04",
      title: "Guided onboarding",
      body: [
        "One important part of the experience was helping new users understand how to get started.",
        "Instead of expecting users to discover every capability independently, I worked on an in-app Getting Started experience. The tour was designed around:",
        {
          ul: [
            "Highlighting important platform areas.",
            "Directing attention to relevant interface elements.",
            "Providing contextual explanations.",
            "Helping users understand the next step in their journey.",
          ],
        },
        "The tour was designed within the Ambient AI Control Plane experience rather than the shared Ambient AI Home microfrontend.",
      ],
    },
  ],
  contributions: [
    {
      t: "Platform navigation and experience",
      challenge: "Users needed a clearer way to discover and navigate platform capabilities.",
      approach: ["Improved information hierarchy.", "Organised navigation around understandable categories.", "Focused on consistent page structures.", "Reduced unnecessary visual complexity."],
      objective: "Make the platform easier to explore without requiring users to understand its underlying architecture first.",
    },
    {
      t: "Getting Started experience",
      challenge: "New users needed help understanding the platform and its important interface elements.",
      approach: ["Introduced an in-app guided tour.", "Used contextual spotlights to direct attention.", "Structured guidance around key platform areas.", "Kept the experience within the Control Plane."],
      objective: "Help users understand the product through the interface itself rather than relying entirely on external instructions.",
    },
    {
      t: "Consistent interface patterns",
      challenge: "Different platform areas need to feel like parts of the same product.",
      approach: ["Focused on consistent spacing and typography.", "Improved component-level visual consistency.", "Used predictable interaction patterns.", "Maintained a common visual language across screens."],
      objective: "Create a cohesive experience that can scale as the platform evolves.",
      shots: { ids: ["aa-recording"], layout: "wide" },
    },
  ],
  decisionsHead: {
    title: "Important UX decisions",
    lead: "A few design decisions shaped the experience.",
    why: "Why it mattered",
    close: "These decisions were focused on improving usability without compromising the depth of the platform.",
  },
  decisions: [
    { t: "Clearer navigation categories", d: "Improved discoverability" },
    { t: "Consistent interface patterns", d: "Reduced the learning effort between sections" },
    { t: "Contextual onboarding", d: "Helped new users understand important areas" },
    { t: "Guided spotlight interactions", d: "Directed attention without overwhelming the screen" },
    { t: "Onboarding within Control Plane", d: "Kept guidance connected to the actual working environment" },
  ],
  outcome: {
    lead: "The work focused on establishing a more understandable and consistent experience for the Ambient AI platform.",
    body: [
      "Key contributions:",
      {
        ul: [
          "Worked on structuring the platform experience and navigation.",
          "Improved interface hierarchy and consistency.",
          "Designed an in-app Getting Started tour for the Control Plane.",
          "Explored contextual guidance through screen spotlights.",
          "Worked towards making platform capabilities easier to discover and understand.",
        ],
      },
      "The outcome was a clearer design direction for navigating the platform and helping new users get started.",
    ],
    note: "Quantitative improvements such as onboarding completion, task success, or reduced support requests are not included because verified measurements are not available.",
  },
  reflection: {
    quote: "A powerful platform should not require users to understand its complexity before they can start using it.",
    body: [
      "Designing for an enterprise AI platform requires more than making individual screens visually appealing.",
      "The real challenge is helping users understand a complex system without exposing all of its complexity at once.",
      "This project reinforced the importance of information architecture, progressive disclosure, contextual guidance, and consistency when designing AI-powered enterprise products.",
    ],
  },
  closing: {
    title: "Making complex AI experiences easier to understand, navigate, and use.",
    body: "Ambient AI gave me the opportunity to work on the broader product experience of an enterprise AI platform, focusing on how structure, interaction design, and contextual guidance can make sophisticated products more approachable.",
  },
  screens: [
    { id: "aa-overview", need: "Overview — the Control Plane workspace", caption: "The workspace overview: skills, configurations, workflows and pushes, the connected device, recent activity and quick actions.", ratio: "16:9", locked: true },
    { id: "aa-agent", need: "Agent view — a conversational starting point", caption: "Agent, Expert and Classic views over the same objects. The Agent view starts with a question and suggested first steps.", ratio: "16:9", locked: true },
    { id: "aa-skill-registry", need: "Skill Registry — discovering capabilities", caption: "Skill Registry: each capability as a card with its version, where it runs, its type and its configuration status.", ratio: "16:9", locked: true },
    { id: "aa-workflow-builder", need: "Workflow builder — composing steps with pre-flight checks", caption: "The workflow builder: blocks and sub-workflows on the left, steps connected on the canvas, and pre-flight checks pointing to what needs attention.", ratio: "16:9", locked: true },
    { id: "aa-recording", need: "Sub-workflow recording — a step-by-step flow", caption: "Recording a sub-workflow on a connected device: a stepped flow (ready check, recording, review, save) with a live feed of each captured action.", ratio: "16:9", locked: true },
  ],
  next: { slug: "self-ready", title: "Self-Ready", href: "/work/self-ready/case-study" },
};
