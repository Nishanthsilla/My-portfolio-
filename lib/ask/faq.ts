/**
 * "Ask Nishanth" — the questions it can answer, written from the site's own
 * content (lib/site/*). No AI: a visitor's question is matched to a topic by
 * keywords (lib/ask/match.ts), and the answer is always the same.
 *
 * To add or change an answer, edit a topic below:
 *   keys      words or phrases that point to this topic (lowercase; a phrase scores more than a word)
 *   answer    what's said (plain text; blank line = new paragraph)
 *   more      optional: said for "tell me more" right after this answer
 *   links     optional buttons under the answer
 *   next      follow-up questions offered as chips (topic ids)
 */
import { about } from "@/lib/site/about";
import { contact } from "@/lib/site/content";

export type Topic = {
  id: string;
  /** how the question reads as a suggestion chip */
  q: string;
  keys: string[];
  answer: string;
  more?: string;
  links?: { label: string; href: string }[];
  next: string[];
};

const exp = about.experience;

export const TOPICS: Topic[] = [
  {
    id: "who",
    q: "Who is Nishanth?",
    keys: ["who is", "who's", "about him", "about nishanth", "introduce", "tell me about", "nishanth", "yourself", "background", "summary", "bio", "overview"],
    answer: `Nishanth Silla is a Lead Product Designer at Covasant in Hyderabad, with 5+ years designing products across enterprise AI, FinTech and EdTech.\n\nHe designs the interfaces where people set intent, watch AI agents work, and step in at the right moment.`,
    next: ["focus", "projects", "experience"],
  },
  {
    id: "focus",
    q: "What does Nishanth design?",
    keys: ["what does he design", "what does he do", "what do you do", "what does nishanth do", "focus", "specialize", "speciality", "specialty", "kind of work", "type of work", "agentic", "agents", "ai ux", "expertise", "domain", "niche"],
    answer: `AI is becoming a colleague, not a feature. Nishanth designs the moments where people hand work to agents, keep an eye on it, and take back control when it matters, so they trust what gets done on their behalf.\n\nHis focus is multi-agent orchestration and human–AI handoff: how people hand work to AI, keep an eye on it, and take back control.`,
    more: `He thinks about it as a loop with three moments: Set intent (people describe the outcome; the system turns it into tasks agents can pick up), Observe (agent activity stays visible: what's running, what's done, how sure the system is), and Step in (when a decision needs a person, approve, edit or stop is easy).`,
    next: ["ai", "projects", "process"],
  },
  {
    id: "ai",
    q: "How does he design for AI agents?",
    keys: ["design for ai", "ai agents", "how does he design", "human agent", "human-ai", "human ai", "handoff", "trust", "orchestration", "loop", "approach to ai", "ai design", "use ai"],
    answer: `He designs around three moments of the human–agent loop.\n\nSet intent: people describe the outcome they want and the system turns it into tasks agents can pick up. Observe: agent activity stays visible — what's running, what's done and how sure the system is. Step in: when a decision needs a person, the interface asks clearly and makes approve, edit or stop easy.`,
    next: ["mao", "salespulze", "process"],
  },
  {
    id: "projects",
    q: "Which of his projects should I explore first?",
    keys: ["which project", "explore first", "start with", "best project", "favourite project", "favorite project", "projects", "portfolio", "work", "case study", "case studies", "showcase", "highlight", "recommend"],
    answer: `Start with Self-Ready — making AI-powered retail shelf intelligence easier to understand, review and act on. It has a full case study.\n\nThen SalesPulze and MAO (Multi-Agent Orchestrator) at Covasant show his agentic AI work, and the Covasant Design System shows how he builds systems.`,
    links: [{ label: "Open Self-Ready", href: "/work/self-ready" }],
    next: ["selfready", "salespulze", "mao"],
  },
  {
    id: "selfready",
    q: "What is Self-Ready?",
    keys: ["self ready", "self-ready", "selfready", "shelf", "retail"],
    answer: `Self-Ready is about making AI-powered retail shelf intelligence easier to understand, review and act on. It's one of his featured projects, with an overview and a full case study on the site.`,
    links: [{ label: "Open Self-Ready", href: "/work/self-ready" }],
    next: ["salespulze", "mao", "process"],
  },
  {
    id: "salespulze",
    q: "What did he do on SalesPulze?",
    keys: ["salespulze", "sales pulze", "salespulse", "heat map", "heatmap", "sales"],
    answer: `SalesPulze is Covasant's flagship product (2026). Nishanth led end-to-end UX for this agentic AI platform, which clears sales workflow bottlenecks at org scale — with AI-surfaced insights and automated follow-ups that stay reviewable.`,
    links: [{ label: "Open SalesPulze", href: "/work/salespulze-heat-map" }],
    next: ["mao", "ai", "covasant"],
  },
  {
    id: "mao",
    q: "What is MAO?",
    keys: ["mao", "multi-agent", "multi agent", "orchestrator"],
    answer: `MAO — the Multi-Agent Orchestrator (Covasant, 2026) — covers how users assign tasks, watch execution status and step in when human input is needed, with intervention points, confidence indicators and approval flows.`,
    links: [{ label: "Open MAO", href: "/work/mao" }],
    next: ["ai", "salespulze", "designsystem"],
  },
  {
    id: "designsystem",
    q: "Has he built design systems?",
    keys: ["design system", "design systems", "component library", "components", "tokens", "covasant design system", "ryzeup design system"],
    answer: `Yes. At Covasant he built a scalable design system and component library for the whole product suite, to speed up design-to-dev handoff and keep products consistent.\n\nBefore that he created the Ryzeup Design System with accessibility built in from day one, and contributed to the Disprz Design System.`,
    links: [{ label: "Open Covasant Design System", href: "/work/covasant-design-system" }],
    next: ["process", "skills", "projects"],
  },
  {
    id: "experience",
    q: "Where has he worked?",
    keys: ["experience", "worked", "work history", "career", "companies", "previous", "past jobs", "jobs", "resume history", "how many years", "years of experience", "seniority", "teams"],
    answer: `${about.experienceIntro}\n\n${exp.map((e) => `${e.org} — ${e.role} (${e.when})`).join("\n")}`,
    next: ["covasant", "resume", "skills"],
  },
  {
    id: "covasant",
    q: "What does he do at Covasant?",
    keys: ["covasant", "doing now", "working on", "these days", "at the moment", "current job", "currently", "right now", "now", "current role", "where does he work", "lead product designer", "job"],
    answer: `${exp[0].role} at ${exp[0].org} since ${exp[0].when.split(" —")[0]}: ${exp[0].note}`,
    next: ["salespulze", "mao", "designsystem"],
  },
  {
    id: "process",
    q: "How does he work?",
    keys: ["process", "how does he work", "how do you work", "workflow", "method", "approach", "figma", "code", "collaborate", "engineering", "developers", "handoff to dev", "prototype"],
    answer: `He works hand in hand with product and engineering on complex B2B workflows. Lately that means making AI an active collaborator people can understand, steer and trust.\n\nHe designs in Figma, then ships it in code.`,
    next: ["skills", "ai", "designsystem"],
  },
  {
    id: "skills",
    q: "What are his skills and tools?",
    keys: ["skills", "tools", "software", "stack", "good at", "strengths", "abilities", "research", "usability", "a/b", "ab testing", "motion", "prototyping"],
    answer: about.skills.map((s) => `${s.k}: ${s.v.join(", ")}.`).join("\n"),
    next: ["process", "education", "experience"],
  },
  {
    id: "education",
    q: "What did he study?",
    keys: ["education", "study", "studied", "degree", "college", "university", "lpu", "btech", "b.tech", "certificate", "qualification"],
    answer: `${about.education.join(". ")}.\n\nWhile doing his B.Tech at LPU, he worked with agencies and clients to hone his skills.`,
    next: ["journey", "experience", "skills"],
  },
  {
    id: "journey",
    q: "How did he get into design?",
    keys: ["get into design", "started", "start design", "journey", "why design", "became a designer", "how did he start", "story", "inspiration"],
    answer: `He started his design journey at a very young age: his parents are from the creative field, and he grew fond of the aesthetic side of digital design. While doing his B.Tech at LPU, he worked with various agencies and clients to hone his skills and learn the new user experiences changing how we do things.`,
    next: ["education", "hobbies", "experience"],
  },
  {
    id: "hobbies",
    q: "What does he do outside work?",
    keys: ["hobbies", "hobby", "outside work", "free time", "fun", "interests", "anime", "cook", "cooking", "personal", "weekend", "likes"],
    answer: `He's a huge anime fan, and loves snacking while watching it. He loves to cook because it reminds him of his granny's cooking. And photography has a special place in his heart — he likes it most when his dad becomes the model.`,
    next: ["photography", "beyond", "journey"],
  },
  {
    id: "photography",
    q: "Does he do photography?",
    keys: ["photography", "photos", "photographs", "camera", "pictures", "photographer", "gallery"],
    answer: `Yes — photography has a special place in his heart. There's a gallery of his photographs on the site: frames, places and moments.`,
    links: [{ label: "Open the gallery", href: "/photography" }],
    next: ["hobbies", "beyond", "contact"],
  },
  {
    id: "beyond",
    q: "What are his side projects?",
    keys: ["side project", "side projects", "beyond the interface", "explorations", "3d", "3d printing", "printing", "physical", "modular", "backpack", "product design", "hardware", "experiments", "ideas"],
    answer: `Beyond the screen he explores physical products and prototypes. MODULAR 01 is a concept for a modular backpack: a 25L core bag, a detachable 10–15L expansion, and movable external modules. He also explores product ideas through 3D printing — physical prototypes, CAD and product-form explorations.`,
    links: [{ label: "Open Beyond the Interface", href: "/beyond" }],
    next: ["hobbies", "photography", "process"],
  },
  {
    id: "contact",
    q: "How can I contact him?",
    keys: ["contact", "reach", "email", "mail", "hire", "hiring", "available", "availability", "freelance", "work with", "collaborate with", "get in touch", "phone", "call", "whatsapp", "linkedin", "connect"],
    answer: `The best way is email: ${contact.email}. You can also call or WhatsApp him on ${contact.phone}, or connect on LinkedIn.`,
    links: [
      { label: "Email Nishanth", href: `mailto:${contact.email}` },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/nishanth-silla" },
    ],
    next: ["resume", "location", "projects"],
  },
  {
    id: "resume",
    q: "Can I see his resume?",
    keys: ["resume", "cv", "curriculum", "pdf", "download"],
    answer: `Yes — his resume is on the site as a PDF.`,
    links: [{ label: "Open the resume", href: "/resume/nishanth-silla-cv.pdf" }],
    next: ["experience", "contact", "skills"],
  },
  {
    id: "location",
    q: "Where is he based?",
    keys: ["where is he", "based", "location", "city", "live", "lives", "hyderabad", "india", "relocate", "remote", "timezone", "time zone"],
    answer: `He's based in ${contact.location}, India.`,
    next: ["contact", "covasant", "languages"],
  },
  {
    id: "languages",
    q: "What languages does he speak?",
    keys: ["languages", "language", "speak", "telugu", "hindi", "english", "odia"],
    answer: `He speaks ${about.languages.slice(0, -1).join(", ")} and ${about.languages[about.languages.length - 1]}.`,
    next: ["location", "hobbies", "contact"],
  },
  {
    id: "bot",
    q: "What can I ask you?",
    keys: ["who are you", "what are you", "what can i ask", "what can you do", "help", "are you ai", "are you a bot", "bot", "chatbot"],
    answer: `I answer questions about Nishanth — his work, projects, experience, process, side projects, photography and how to reach him. Pick a question below or ask your own.`,
    next: ["who", "projects", "contact"],
  },
];

export const GREETING = /^(hi|hey|hello|hola|yo|namaste|good (morning|afternoon|evening)|sup|hii+)\b[\s!.?]*$/i;
export const THANKS = /^(thanks|thank you|thx|ty|cool|great|nice|awesome|ok|okay)\b[\s!.?]*$/i;
export const MORE = /\b(more|elaborate|explain|details?|go on|continue|expand)\b/i;
export const SUGGESTED = ["focus", "projects", "ai"];
export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
