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
  personality: {
    title: "It's not a style. It's me.",
    body: [
      "People who work with me know me as the one who makes the room laugh. I don't think that's separate from being a good designer: humour comes from noticing small, true things about people, and so does good UX.",
      "So the site had to feel like meeting me. Every choice on it traces back to one of these:",
    ],
    traits: [
      { t: "I make people laugh", d: "A burning room in the footer, a meme-style ta-da with my tools, a sticker of my face in the corner. If you smile, the site has done its first job." },
      { t: "I sweat the details", d: "Hand-drawn mouth shapes, a soundtrack split so the voice is clear, cards nudged until they sit dead centre. Jokes only land when the craft is careful." },
      { t: "I respect people's time", d: "Managers find the work sorted by what they're looking for, one click away. The fun never stands between them and a case study." },
      { t: "I like to hear back", d: "The Wall exists because I genuinely want to know what people think: notes, suggestions, compliments, anything." },
    ],
  },
  toolkit: {
    title: "My tools: my brain, Claude, and pen and paper",
    lead: "No template and no moodboard. Three tools did the work:",
    items: [
      { t: "My brain", d: "Every idea started as a picture in my head: the doors, the burning room, me throwing my tools into the air." },
      { t: "Pen and paper", d: "When an idea was hard to explain in words, I sketched it. The card window in the Work section started as the quick drawing below." },
      { t: "Claude", d: "My build partner. I described what I wanted and shared sketches and screenshots; Claude wrote the code. I reviewed every change and decided what went live." },
    ],
    shot: "pf-sketch",
  },
  approach: [
    {
      n: "01",
      title: "Start from a feeling, not a layout",
      body: [
        "I didn't open a template. I asked how I want someone to feel in the first minute (amused, curious, a little surprised) and what a hiring manager needs (the right work, fast). Every idea had to serve one of those two.",
      ],
    },
    {
      n: "02",
      title: "Sketch it, then describe it",
      body: [
        "Ideas started in my head or on paper. I then described them in plain words, the way I'd brief a developer: what it is, how it moves, and what should never happen.",
      ],
    },
    {
      n: "03",
      title: "Build, look, react",
      body: [
        "Every change came back to me as screenshots or a short video, on a laptop and a phone, in light and dark. I reacted to what I saw, not to what was described: \"the mouth is stretching\", \"the cards should come from below\", \"too dark, make it grey\".",
      ],
    },
    {
      n: "04",
      title: "Iterate until it feels right",
      body: [
        "Some parts took many rounds. The Work section went from four statements in a sideways strip, to a floor of doors, to calm cards inside a grey window. Each round fixed something the last one got wrong.",
      ],
      shots: { ids: ["pf-evolution"], layout: "wide" },
    },
    {
      n: "05",
      title: "Ship small, ship often",
      body: [
        "Nothing went live until I'd seen it and said \"push it\". Small, approved changes went out one at a time, so the live site was always working.",
      ],
    },
  ],
  tour: [
    { id: "pf-hero", t: "The hello", what: "The first scene: who I am in one line, after a short cinematic intro.", why: "First impressions are fast. One clear sentence tells you what I do before anything else.", outcome: "You know who I am and what I do within seconds." },
    { id: "pf-doors", t: "The floor of doors", what: "Four doors, one for each kind of work, each showing its case studies as live covers that cycle when you hover.", why: "Managers come with one question. A door per question means nobody has to search.", outcome: "Any kind of work is one click away." },
    { id: "pf-room", t: "A room", what: "The case studies behind a door: a list of names, with the one you point at shown big beside it.", why: "Going \"down a floor\" keeps the overview tidy, and \"Back to work\" always brings you home.", outcome: "You can focus on one kind of work without losing your place." },
    { id: "pf-wall", t: "The Wall", what: "A shared wall of sticky notes from visitors, with stickers and GIFs. You write a note, then stick it exactly where you want.", why: "I wanted the portfolio to listen, not just talk.", outcome: "Visitors leave notes, suggestions and jokes, and I read every one." },
    { id: "pf-tools", t: "The tools reveal", what: "My tools burst out of my hands into an arc, with a gift-box pop and magic chimes.", why: "A row of logos is forgettable. A ta-da is me.", outcome: "A dull list turns into a moment people remember." },
    { id: "pf-footer", t: "The footer cartoon", what: "A designer's worst day, hand-drawn: notifications, a client call, the room on fire, and calm acceptance.", why: "Every designer has lived this day. It's a joke we share.", outcome: "The page ends on a laugh instead of a list of links." },
    { id: "pf-dark", t: "The dark theme", what: "A warm dark grey version of every page.", why: "Pure black is harsh for reading; a warm grey is calmer and keeps the site's warmth.", outcome: "Comfortable to read at night." },
    { id: "pf-phone", t: "On a phone", what: "Every scene has its own phone layout.", why: "A lot of people will see it first on their phone.", outcome: "It feels made for the phone, not squeezed onto it." },
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
  build: {
    title: "How it's built: the code and the database",
    body: [
      "The site is a Next.js app written in TypeScript, styled with plain CSS modules. Each part is its own component: the intro film, the sideways journey, the doors and rooms, the Wall and the footer cartoon.",
      "The project covers are real, coded mini-interfaces that animate, not videos, so they stay sharp at any size. Most sound effects are generated in code with the browser's Web Audio; only a few are audio clips, like the ringtone and the magic chimes.",
      { dl: [
        { k: "Database", v: "The Wall stores its notes in Postgres on the live site, and in a local SQLite file while I'm building. The same queries run on both." },
        { k: "One table", v: "wall_notes: the message, the name, the sticker, font, shape and colour, where the note sits (x, y and rotation), its status (pending, approved or rejected) and how many times it's been reported." },
        { k: "Rules in the table", v: "The database itself enforces the limits: 1 to 140 characters, a position inside the wall, and a tilt between -45° and 45°." },
        { k: "Hosting", v: "The code lives on GitHub. Every change that reaches the main branch is live on Vercel in under a minute." },
      ] },
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
  ],
  problems: [
    { t: "Sound effects sometimes stayed silent", problem: "Browsers block sound until you interact, and iPhones only count certain taps. If you tapped at the top of the page and scrolled down, the footer's sounds could stay quiet.", solution: "All sound is now set up as the page loads and unlocks on the first tap anywhere, iPhone included. A blocked sound waits and plays instead of skipping. I tested every effect after a single click, on laptop and phone sizes." },
    { t: "The cartoon's mouth looked like it was melting", problem: "The first lip-sync stretched one mouth image up and down to follow the voice. It looked like the mouth was collapsing.", solution: "I switched to drawn mouth shapes, picked twelve times a second from the voice, so he really looks like he's talking." },
    { t: "You couldn't hear the dialogue", problem: "The voice was buried under the music.", solution: "I split the soundtrack into voice and music, raised the voice, lowered the music, and added small pixel-type subtitles." },
    { t: "Phones felt cramped", problem: "With reduced motion switched on, the four doors squeezed into one row on phones. In the tools reveal, logos crowded my hands.", solution: "Phones got their own layouts: doors stack one per row, cards fill most of the width, and the logo rings sit further out so they clear my hands." },
    { t: "Notes moved by accident", problem: "Zooming the Wall with two fingers on a phone could drag notes around.", solution: "On phones you now hold a note for a moment to lift it. Otherwise it stays exactly where it is." },
    { t: "Animations sat off-centre", problem: "Inside the small cards, each cover used full-page spacing, so some animations sat in a corner.", solution: "Each cover now uses spacing sized to its card. I measured every one to within 3 pixels of the centre." },
  ],
  optimisations: {
    title: "Making it fast and smooth",
    lead: "A playful site still has to feel quick. These are the things I did under the hood:",
    items: [
      "Animations inside each scene pause while the page slides sideways, so the movement stays smooth.",
      "The footer cartoon only plays while it's on screen.",
      "Photos are resized and compressed to WebP; most are under 100 KB.",
      "Images further down the page load only when you get close to them.",
      "Project covers are coded, not video: tiny to load and crisp at any size.",
      "Most sound effects are generated in code, so there's nothing to download; the few audio clips load ahead of time so they're ready the moment they're needed.",
      "When someone prefers less motion, animations calm down and the pages simply stack.",
      "Wall queries use bound parameters (visitor text never touches the SQL) and an index on status and date.",
    ],
  },
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
  outcome: {
    lead: "Everyone who's seen it likes it.",
    body: [
      "The reaction so far is the one I designed for: people smile at the hello, laugh at the burning room, play with the Wall and grin at the ta-da.",
      "And for the people who came for the work, it's one click away.",
    ],
  },
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
    { id: "pf-sketch", need: "Sketch — the card window", caption: "From a pen sketch to the Work section: a grey window, the first card in the middle, the next one half visible." },
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
