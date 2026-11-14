import type { Study } from "./types";

/** Ambient AI — Nishanth's case study, verbatim. */
export const ambientAi: Study = {
  slug: "ambient-ai",
  title: "Ambient AI",
  subtitle: "Making AI agent and device configuration easier through one connected platform.",
  category: "Product Strategy",
  meta: [
    { k: "Role", v: "Lead Product Designer" },
    { k: "Contribution", v: "End-to-end product design" },
    { k: "Focus", v: "UX strategy, information architecture, user journeys, interaction design, UI design, prototyping and developer collaboration" },
    { k: "Platform", v: "Enterprise AI configuration and orchestration platform" },
  ],
  hero: "aa-platform-overview",
  overview: [
    "As AI-powered products become more capable, configuring and managing the systems behind them becomes increasingly complex.",
    "Ambient AI was designed to bring agent configuration, skill management, workflow creation, orchestration and device deployment into one connected platform.",
    "The goal was to make these operations easier and more effective through a central interface, rather than relying on phone-based configuration, which made the experience harder to manage.",
    "I led the product design from understanding the platform's requirements and structuring its information architecture to designing the core workflows and interface experiences.",
  ],
  challenge: {
    title: "Configuring an AI agent is not a single action.",
    body: [
      "It involves several connected decisions:",
      {
        ul: [
          "Defining an agent and its capabilities.",
          "Associating experts and skills.",
          "Configuring launch parameters and trigger profiles.",
          "Building workflows and defining dependencies.",
          "Validating configurations before publishing.",
          "Deploying to the intended device or environment.",
          "Monitoring execution and resolving failures.",
        ],
      },
      "When these activities are distributed across disconnected experiences, users have to understand too much of the underlying system just to complete a configuration task.",
    ],
    question: "The challenge was to make this complexity manageable without removing the flexibility required by an enterprise platform.",
  },
  objective: {
    statement: "Create one platform where users can configure, validate and deploy agents and connected devices through a clear, structured workflow.",
    lead: "The experience needed to:",
    items: [
      "Make agent configuration the central starting point.",
      "Keep related configuration tools connected.",
      "Make complex workflows easier to understand and edit.",
      "Surface configuration issues before deployment.",
      "Support versioning and controlled publishing.",
      "Make deployment status and execution failures visible.",
    ],
  },
  approach: [
    {
      n: "01",
      title: "Structuring the platform",
      body: [
        "I approached the platform as a connected ecosystem rather than a collection of independent configuration screens.",
        "The Management Portal became the central workspace, bringing together the key capabilities:",
        { ul: ["Agent workspace", "Skill Registry", "Workflow Builder", "Orchestrator configuration", "Gateway / MAO management", "Deployment and execution monitoring"] },
        "This structure gave each capability a clear purpose while maintaining relationships between them.",
      ],
      shots: { ids: ["aa-gateway-mao"], layout: "side" },
    },
    {
      n: "02",
      title: "Designing the agent configuration experience",
      body: [
        "The Agent workspace was designed around a split-screen interaction model.",
        "The left side provides a persistent conversational entry point. The right side becomes the dynamic configuration workspace.",
        "Instead of sending users across multiple pages, the experience allows them to configure the relevant capabilities in context, including skills, experts, workflows and trigger profiles.",
        "The intention was to make the agent the starting point for configuration, while keeping the actual configuration controls structured and consistent.",
      ],
      shots: { ids: ["aa-agent-workspace"], layout: "wide" },
    },
    {
      n: "03",
      title: "Connecting skills and workflows",
      body: [
        "Skills are the building blocks that define what an agent can do. Workflows connect those capabilities into a sequence of actions.",
        "I worked on making these relationships easier to understand and configure.",
        "The Skill Registry supports configuration of launch parameters, visibility rules, trigger profiles and templates.",
        "The Workflow Builder provides a visual way to compose steps, configure their parameters, understand dependencies and validate the workflow before publishing.",
        "I also focused on reducing unnecessary interface complexity, making selected steps easier to configure and preventing duplicate or invalid step selections.",
      ],
      shots: { ids: ["aa-skill-registry", "aa-workflow-builder"], layout: "pair" },
    },
    {
      n: "04",
      title: "Making configuration validation clearer",
      body: [
        "A configuration error discovered during deployment can be expensive to troubleshoot.",
        "The experience therefore needed a clear pre-flight validation stage.",
        "Rather than presenting users with lengthy technical explanations, the interface highlights blockers and warnings, helps users locate the affected configuration and makes it clear what needs attention before publishing.",
        "This turns validation into a decision-oriented part of the workflow.",
      ],
      shots: { ids: ["aa-preflight"], layout: "side" },
    },
    {
      n: "05",
      title: "Supporting deployment and version control",
      body: [
        "Configuration does not end when an agent is created.",
        "Users need to publish changes, deploy them to the appropriate environment and understand what happened during execution.",
        "The experience supports versioned workflow snapshots, deployment visibility, execution logs and failure recovery.",
        "The design separates published versions from editable drafts so that changes can be made without silently overwriting an existing published workflow.",
      ],
      shots: { ids: ["aa-deployment"], layout: "wide" },
    },
  ],
  journey: {
    file: "ambient_ai_user_flow.png",
    title: "End-to-end user journey",
    intro: "The following flow shows how a user moves from initial setup to deployment and ongoing operation.",
    caption: "From initial setup through configuration, validation and publishing to deployment and ongoing operation.",
    alt: "Ambient AI end-to-end user journey, from initial setup to deployment and ongoing operation",
  },
  architecture: {
    file: "ambient_ai_architecture.png",
    title: "Product architecture",
    intro: "The architecture below illustrates how the main product surfaces connect configuration, validation, release and runtime operations.",
    caption: "How the main product surfaces connect configuration, validation, release and runtime operations.",
    alt: "Ambient AI product architecture connecting configuration, validation, release and runtime operations",
  },
  decisions: [
    { t: "Centralised configuration", d: "Bring the important configuration capabilities into one platform instead of making users manage them through disconnected experiences." },
    { t: "Agent as the entry point", d: "Use the Agent workspace as the starting point while keeping specialised configuration tools available in context." },
    { t: "Visual workflow composition", d: "Represent workflows as connected steps so users can understand sequence, dependencies and configuration at a glance." },
    { t: "Decision-oriented validation", d: "Prioritise blockers, warnings and direct navigation to the affected configuration instead of overwhelming users with technical information." },
    { t: "Version-aware publishing", d: "Preserve published workflow versions and make draft changes explicit." },
    { t: "Visible execution feedback", d: "Make deployment progress, failed agents and execution logs easier to inspect and act on." },
  ],
  outcome: {
    lead: "Ambient AI brought agent and device configuration into a central platform experience.",
    body: [
      "The key outcome was making configuration easier and more effective through the platform, rather than relying on phone-based configuration, which was harder to manage.",
      "The platform experience provides a structured path from agent setup and configuration through workflow validation, publishing and deployment.",
    ],
  },
  reflection: {
    quote: "Designing an enterprise AI platform is not just about simplifying individual screens. It is about making the relationships between systems understandable.",
    body: [
      "The biggest design challenge was balancing flexibility with clarity: giving users enough control to configure complex AI capabilities without making every interaction feel technical.",
      "Ambient AI reinforced the importance of designing around the user's complete task, rather than treating each platform module as an isolated feature.",
    ],
  },
  screens: [
    { id: "aa-platform-overview", need: "Platform overview — main Management Portal interface", caption: "The Management Portal: the central workspace for agents, skills, workflows, orchestration and deployment.", ratio: "16:9" },
    { id: "aa-gateway-mao", need: "Gateway / MAO — gateway and orchestration configuration", caption: "Gateway / MAO management, one of the capabilities brought together in the Management Portal.", ratio: "4:3" },
    { id: "aa-agent-workspace", need: "Agent workspace — split-screen agent configuration", caption: "The Agent workspace: a persistent conversational entry point on the left, the configuration workspace on the right.", ratio: "16:9" },
    { id: "aa-skill-registry", need: "Skill Registry — skill configuration and launch parameters", caption: "Skill Registry: launch parameters, visibility rules, trigger profiles and templates.", ratio: "4:3" },
    { id: "aa-workflow-builder", need: "Workflow Builder — workflow composition and configuration", caption: "Workflow Builder: composing steps, configuring parameters and understanding dependencies.", ratio: "4:3" },
    { id: "aa-preflight", need: "Pre-flight validation — warnings, blockers and validation", caption: "Pre-flight validation: blockers and warnings, with a direct path to the affected configuration.", ratio: "4:3" },
    { id: "aa-deployment", need: "Deployment — publishing, deployment status and execution logs", caption: "Publishing and deployment: versioned snapshots, deployment status and execution logs.", ratio: "16:9" },
  ],
  next: { slug: "self-ready", title: "Self-Ready", href: "/work/self-ready/case-study" },
};
