import type { Study } from "./types";

/**
 * The case study of this portfolio itself. The "why" is Nishanth's own (his words, lightly
 * edited); the "what" and "how" are from the build (the repository and the design rounds).
 * No results section yet, at his request.
 */
export const thisPortfolio: Study = {
  slug: "this-portfolio",
  title: "This portfolio",
  subtitle: "A portfolio that makes you laugh, and still gets a hiring manager to the right work in one click.",
  category: "End to end · design and build",
  back: { href: "/#work", label: "All work" },
  meta: [
    { k: "Role", v: "Designer, art director and product owner" },
    { k: "Timeline", v: "Two weeks, November 2026" },
    { k: "Built with", v: "Next.js, React, TypeScript, Postgres, Web Audio" },
    { k: "Focus", v: "Personality, clarity for hiring managers, and a Wall that listens" },
  ],
  hero: "pf-cover",
  overview: [
    "I'm the guy who makes everyone laugh. So when I rebuilt my portfolio, I gave it one rule: whoever opens it should be smiling within a minute, and a hiring manager should still find exactly the work they came for.",
    "This is the story of how I designed it, from the first idea to the database behind the Wall. I didn't start from a template or a moodboard. I started from how I want people to feel, and designed every screen, sound and joke from my imagination.",
  ],
  challenge: {
    title: "Portfolios all look the same, and managers have to dig.",
    body: [
      "Most portfolios are a grid of thumbnails and a wall of text. They're safe, and they're forgettable. Nothing about them tells you what the person is like to work with.",
      "And the people who matter most, hiring managers, are short on time. They usually come with one question: can this person do visual design? Can they untangle a hard problem? Can they own a product end to end? A grid makes them search for the answer.",
    ],
    question: "How do I make a portfolio people remember because it made them laugh, without making a hiring manager dig for the work?",
  },
  objective: {
    statement: "Make them laugh. Let them find the work in one click.",
    lead: "Four goals guided every decision:",
    items: [
      "Show my personality from the first second, so people meet a person, not a PDF.",
      "Organise the work around the questions managers actually ask, not by client or year.",
      "Give visitors a voice: a place to leave a note, a suggestion or a joke.",
      "Keep it comfortable for everyone: fast, readable in light and dark, and calm when motion or sound is unwelcome.",
    ],
  },
  approach: [
    {
      n: "01",
      title: "Lead with personality",
      body: [
        "The site opens with a short cinematic intro, and a sticker of my face waits in the corner if you have a question. At the very bottom, a hand-drawn cartoon plays a designer's worst day: notifications pile up, a client calls, the room catches fire, and he sips his coffee and says \"I'm okay with the events that are unfolding currently.\"",
        "Every joke is drawn and timed by hand: the mouth shapes are drawn for each sound, the soundtrack is separated so the voice comes through, and the subtitles are pixel type. Humour only works if the craft is good.",
      ],
      shots: { ids: ["pf-footer"], layout: "wide" },
    },
    {
      n: "02",
      title: "A journey, not a long page",
      body: [
        "The homepage moves sideways, like turning pages: About, Work, Beyond, the Wall and Contact. Each scene fills the screen, so there's always one thing to look at.",
        "On a laptop you simply scroll and the page slides along. On a phone you swipe, and a small \"Swipe right\" badge tells you how the first time. The top bar always shows where you are and jumps anywhere in one tap.",
      ],
      shots: { ids: ["pf-hero"], layout: "wide" },
    },
    {
      n: "03",
      title: "Work, sorted the way managers think",
      body: [
        "Instead of a grid, the work sits behind four doors, one for each thing a manager might want to see: \"I can take a product from idea to launch\", \"I untangle hard problems\", \"I build systems that scale\" and \"I care about the pixels\".",
        "Each door shows its case studies as live animated covers in a small window that cycles when you hover. Open a door and the page goes down a floor into a room with just that work. \"Back to the floor\" brings you up again. A manager who wants UI goes to UI; one who wants end-to-end goes there.",
        "It took several rounds to get here: a sideways strip of four statements came first, then the floor of doors, then the cards inside the windows were re-stacked, re-centred and softened until they felt calm.",
      ],
      shots: { ids: ["pf-evolution", "pf-doors", "pf-room"], layout: "wide" },
    },
    {
      n: "04",
      title: "The Wall: let visitors talk back",
      body: [
        "A portfolio usually talks at you. The Wall lets visitors leave something behind: a note, a suggestion, a compliment or a joke, written on a sticky note, with a sticker or a GIF.",
        "You write the note, post it, and the wall opens up so you can stick it exactly where you want. A happy cat celebrates when it's placed. On phones, notes don't move by accident: you hold a note to lift it.",
      ],
      shots: { ids: ["pf-wall"], layout: "wide" },
    },
    {
      n: "05",
      title: "An About page about the designer",
      body: [
        "The About page explains how I work: five layers I go through on every project, from business strategy to interface design and validation. Then the tools, presented the only way I know: I raise my hands, a gift box pops open, magic chimes play, and the logos burst out around me.",
        "Then my experience, how I started, and what I love outside work, with my own photos.",
      ],
      shots: { ids: ["pf-tools"], layout: "wide" },
    },
    {
      n: "06",
      title: "Comfortable for everyone",
      body: [
        "Delight shouldn't cost comfort. The dark theme is a warm dark grey rather than pure black, so it's easy on the eyes. Phones get their own layouts, not shrunken desktops.",
        "If someone has asked their device for less motion, the animations calm down and the pages simply stack. Sounds never play by surprise: they only start after you've tapped or clicked, and the music has its own off switch.",
      ],
      shots: { ids: ["pf-dark", "pf-phone"], layout: "pair" },
    },
  ],
  journey: {
    title: "How a visitor moves through it",
    intro: "Two kinds of visitor, one site: someone who came to be curious, and a hiring manager who came with a question.",
    subtitle: "",
    note: "The homepage journey and where each part leads.",
    stages: [
      { label: "Arrive", steps: ["Short intro film", "Hello and a joke"] },
      { label: "Explore", steps: ["Swipe or scroll sideways", "Jump from the top bar"] },
      { label: "Find the work", steps: ["Pick a door", "Go down to its room", "Open a case study"] },
      { label: "Talk back", steps: ["Write a note", "Stick it on the Wall"] },
      { label: "Say hi", steps: ["Email, WhatsApp or the CV", "Or just watch the cartoon burn"] },
    ],
  },
  architecture: {
    title: "What's under the hood",
    intro: "A small, ordinary stack, chosen so the site is fast and the Wall is safe to leave open to the public.",
    subtitle: "",
    note: "How the site is put together, from what visitors see down to the database.",
    layers: [
      { label: "Visitors", items: ["Laptop", "Phone", "Light and dark theme"] },
      { label: "Interface", items: ["Next.js 16 and React 19", "TypeScript", "CSS Modules", "GSAP and Motion"] },
      { label: "Delight", items: ["Web Audio (sounds made in code)", "Hand-drawn cartoon", "Live animated covers"] },
      { label: "The Wall API", items: ["Content filter", "Rate limit", "Notes held until approved"] },
      { label: "Data", items: ["Postgres (SQLite when local)", "GIPHY for GIFs", "Phone alert for new notes"] },
      { label: "Hosting", items: ["Vercel", "GitHub: every change goes live from main"] },
    ],
  },
  contributions: [
    {
      t: "A Wall that's safe to leave open",
      challenge: "Anyone on the internet can write on it, and it carries my name.",
      approach: [
        "Every note is checked by a five-layer filter I called the Side-Eye Filter: profanity (including look-alike letters and spaced-out words), threats, harassment, put-downs, and links.",
        "It runs as you type, so offending words are struck through before you post, and again on the server, which has the final say.",
        "Notes are stored as pending and only appear once I approve them. Posting is rate-limited, and visitors can report a note.",
        "Every database query uses bound parameters, so visitor text never touches the SQL itself.",
      ],
      objective: "An open, friendly wall that can't be turned against the people reading it.",
    },
    {
      t: "Sounds that work the first time",
      challenge: "Browsers block sound until a visitor interacts, and iPhones are stricter still, so sound effects were silent until a second tap.",
      approach: [
        "All sound is set up as the page loads, so the very first tap anywhere unlocks it, including on iPhone.",
        "If a sound is ever blocked, it waits and plays when it can, instead of silently skipping.",
        "Each effect was tested after a single click, on laptop and phone sizes.",
      ],
      objective: "Sound that feels intentional and never surprises anyone.",
    },
  ],
  decisions: [
    { t: "Humour as the brand", d: "It's who I am. People remember how something made them feel, and a laugh says more about working with me than a list of adjectives." },
    { t: "Work grouped by what managers ask", d: "A manager can go straight to visual design, problem solving, systems or end-to-end work without searching." },
    { t: "Doors and rooms instead of a long scroll", d: "The overview stays on one screen; the detail is one step away, and coming back is always one tap." },
    { t: "Live animated covers instead of thumbnails", d: "A moving glimpse of the product says more than a static image, and it invites a click." },
    { t: "A Wall with moderation, not a guestbook", d: "Visitors get a voice; the filter and approval step keep it kind." },
    { t: "A warm dark grey, not black", d: "Easier on the eyes for long reading, and it keeps the warmth of the light theme." },
    { t: "Sound only after a tap, and motion that calms down", d: "Delight is optional. Nobody gets blasted with audio, and people who prefer less motion get a calm page." },
  ],
  decisionsHead: { title: "Key design decisions", why: "Why" },
  reflection: {
    quote: "I didn't start with a template or a moodboard. I started with how I wanted people to feel.",
    body: [
      "This project is the closest thing to a self-portrait I've designed. Every round, from the doors to the dark grey to the tools bursting out of my hands, came from asking one question: would this make someone smile, and would it help them find what they came for?",
      "I designed it and directed every detail. I used AI as my build partner, the same way I do at work: I set the direction, shared screenshots and sketches, and checked every change before it went live.",
    ],
  },
  closing: {
    title: "Now it's your turn.",
    body: "If it made you laugh, or you have a suggestion, leave me a note on the Wall. I read every one.",
  },
  screens: [
    { id: "pf-hero", need: "Homepage — the opening scene", caption: "The homepage: one scene at a time, moving sideways." },
    { id: "pf-cover", need: "The site — three scenes", caption: "The homepage, the Work section and the Wall." },
    { id: "pf-footer", need: "Footer cartoon — the room on fire", caption: "Things are going to be okay. (They are not.)" },
    { id: "pf-evolution", need: "Work section — three rounds", caption: "How the Work section evolved: four statements in a row, then the floor of doors, then the calmer cards in a window." },
    { id: "pf-doors", need: "Work — the floor of four doors", caption: "Four doors, one for each thing a manager might want to see." },
    { id: "pf-room", need: "Work — a room", caption: "Go down a floor into a room with just that kind of work." },
    { id: "pf-wall", need: "The Wall", caption: "The Wall: notes, stickers and GIFs from visitors." },
    { id: "pf-tools", need: "About — the tools reveal", caption: "Ta-da: the tools burst out into an arc." },
    { id: "pf-dark", need: "Dark theme", caption: "The warm dark grey theme." },
    { id: "pf-phone", need: "On a phone", caption: "Phones get their own layouts." },
  ],
  next: { slug: "ambient-ai", title: "Ambient AI", href: "/work/ambient-ai" },
};
