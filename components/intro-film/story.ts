/**
 * Chapters 2–7, staged on a design-space "board" (1200×700 landscape,
 * 640×1060 portrait) that is scaled to fit the viewport.
 *
 *   2  "Even when it's complex," — documents, data, feedback and decisions float
 *      around the headline (some burst from the dot, some enter from the sides)
 *   3  "I make it clear." — the clutter is cleared away; the core pieces wait on
 *      both sides and pass, one by one, through the frame that turns them into
 *      the clean Agent Control Room (CR)
 *   4  the proof row (all three stats roll together)
 *   5–6  "I design it in Figma, / then ship it in code." — the cursor hovers "Figma"
 *      (design state: selection, tools, rulers, guides) then "code" (code state:
 *      text cursor, symbols, a snippet being written); visitors can hover or tap too
 *   7  one continuous ending: full-screen Gradient ASCII → the #FF4938 takeover
 *      from the button's spot → the camera backs out of the button to reveal the
 *      product → the cursor clicks Approve & send once → Zoom Through: the camera
 *      dives into the button and the website emerges from its surface (zoom.ts)
 * Everything is a pure function of time r.
 */
import styles from "./IntroFilm.module.css";
import { COLORS, T, bezier, inCubic, inOutCubic, inOutQuint, inQuint, lerp, outCubic, outQuint, prog, span } from "./timeline";
import { ZoomThrough } from "./zoom";

/** The cursor's approach: sets off briskly, then slows into the button. */
const approach = bezier(0.33, 0, 0.12, 1);

type Rect = { x: number; y: number; w: number; h: number };
type Place = { cx: number; cy: number; s: number };
type Geo = {
  W: number; H: number;
  complex: { font: number };
  clear: { y: number; font: number };
  crW: number; crH: number;
  cr3: Place; cr7: Place;
  sent: { font: number; maxW: number };
  /** Chapter 2: home positions (centres) and scale of every artefact. */
  arts: Record<string, [number, number]>;
  artSc: number;
  /** Chapter 3 staging: x of the left/right columns, y slots, scale, off-screen entry x. */
  sides: { lx: number; rx: number; ys: number[]; sc: number; offL: number; offR: number };
  stats: { x: number; w: number; font: number; labelFont: number; pad: number };
};

/** The pieces that become the product (chapter 3). */
const ART_KEYS = ["research", "workflow", "decision", "requirement", "idea", "insight", "dependency", "kpi", "chart", "button", "sketch", "sticky"] as const;
type ArtKey = (typeof ART_KEYS)[number];
/** Documents and data that only add to the complexity; cleared away in chapter 3. */
const CLUTTER = ["sheet", "report", "feedback1", "feedback2", "agent", "line", "points"] as const;
const ART_TARGET: Record<ArtKey, string> = {
  research: "n0", workflow: "n1", decision: "n2", requirement: "n3", idea: "appr", sticky: "appr",
  insight: "head", dependency: "intent", kpi: "logB", chart: "logA", button: "btns", sketch: "flow",
};
const SIDE: Record<ArtKey, ["L" | "R", number]> = {
  sketch: ["L", 0], insight: ["L", 1], research: ["L", 2], sticky: ["L", 3], chart: ["L", 4], dependency: ["L", 5],
  workflow: ["R", 0], decision: ["R", 1], requirement: ["R", 2], idea: ["R", 3], kpi: ["R", 4], button: ["R", 5],
};
const EXTRAS: ArtKey[] = ["sketch", "sticky"];
const FLOW: ArtKey[] = ["sketch", "insight", "workflow", "dependency", "research", "decision", "requirement", "sticky", "idea", "chart", "kpi", "button"];
/** Clean regions, revealed as their pieces land. The buttons (inside the approval panel) come last. */
const REGIONS = ["head", "intent", "n0", "n1", "n2", "n3", "appr", "logA", "logB", "btns"];
/** Related pieces, joined by dotted lines in chapter 2. */
const GROUPS = [
  ["research", "workflow", "decision", "requirement"], ["idea", "button"], ["insight", "dependency", "feedback1"],
  ["kpi", "line", "chart"], ["sheet", "report"], ["agent", "feedback2"],
];
const TILT: Record<string, number> = { sketch: -7, insight: 5, research: -4, sticky: 8, chart: -6, dependency: 4, workflow: 6, decision: -5, requirement: 3, idea: -8, kpi: 5, button: -3 };

const GEO_LAND: Geo = {
  W: 1200, H: 700,
  complex: { font: 56 },
  clear: { y: 62, font: 58 },
  crW: 1040, crH: 560,
  cr3: { cx: 600, cy: 382, s: 0.74 },
  cr7: { cx: 600, cy: 350, s: 0.92 },
  sent: { font: 84, maxW: 1060 },
  arts: {
    research: [165, 100], sheet: [470, 105], insight: [790, 92], report: [1068, 118],
    feedback1: [150, 238], dependency: [415, 222], kpi: [640, 228], agent: [878, 236],
    line: [132, 384], decision: [1076, 372],
    requirement: [395, 478], points: [645, 470], workflow: [912, 482],
    chart: [140, 580], idea: [420, 612], feedback2: [690, 612], button: [1052, 604],
    sketch: [-300, 300], sticky: [-300, 500],
  },
  artSc: 1,
  sides: { lx: 108, rx: 1092, ys: [168, 258, 348, 438, 528, 618], sc: 0.6, offL: -260, offR: 1460 },
  stats: { x: 90, w: 1020, font: 136, labelFont: 23, pad: 28 },
};
const GEO_PORT: Geo = {
  W: 640, H: 1060,
  complex: { font: 50 },
  clear: { y: 120, font: 50 },
  crW: 600, crH: 920,
  cr3: { cx: 320, cy: 556, s: 0.72 },
  cr7: { cx: 320, cy: 520, s: 0.98 },
  sent: { font: 60, maxW: 600 },
  arts: {
    research: [168, 80], sheet: [472, 88],
    insight: [178, 192], report: [482, 218],
    feedback1: [170, 300], dependency: [420, 330],
    kpi: [168, 412], agent: [470, 418],
    line: [160, 652], decision: [472, 650],
    requirement: [175, 762], points: [470, 762],
    workflow: [178, 872], feedback2: [480, 878],
    chart: [128, 978], idea: [355, 1002], button: [545, 968],
    sketch: [-300, 300], sticky: [-300, 500],
  },
  artSc: 0.8,
  sides: { lx: 58, rx: 582, ys: [262, 374, 486, 598, 710, 822], sc: 0.38, offL: -220, offR: 860 },
  stats: { x: 16, w: 608, font: 70, labelFont: 17, pad: 12 },
};

const $ = <E extends Element = HTMLElement>(root: ParentNode, s: string) => root.querySelector<E>(s)!;
const $$ = <E extends Element = HTMLElement>(root: ParentNode, s: string) => Array.from(root.querySelectorAll<E>(s));
const show = (el: Element, on: boolean) => {
  const e = el as HTMLElement;
  const v = on ? "inherit" : "hidden";
  if (e.style.visibility !== v) e.style.visibility = v;
};
const rise = (el: HTMLElement, p: number, dir = 1) => {
  el.style.transform = p >= 1 ? "none" : `translate3d(0,${((1 - p) * 140 * dir).toFixed(2)}%,0)`;
};
function offsetIn(el: HTMLElement, root: HTMLElement): Rect {
  let x = 0, y = 0, n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
const hex = (c: string) => {
  const h = c.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mixC = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`;
};
const DIM = "#cdc8c1";
type WordKey = "figma" | "code";
const flowTimes = (k: ArtKey) => {
  const i = FLOW.indexOf(k);
  const a = T.flowStart + i * T.flowStagger;
  return { a, b: a + T.flowTravel };
};

export class Story {
  g: Geo = GEO_LAND;
  bx = 0; by = 0; bs = 1;
  private vw = 0; private vh = 0;
  private el: Record<string, HTMLElement>;
  private arts: Record<string, HTMLElement> = {};
  private artSize: Record<string, { w: number; h: number }> = {};
  private targets: Record<string, Rect> = {};
  private regionEls: Record<string, HTMLElement> = {};
  private scans: Record<string, HTMLElement> = {};
  private links: SVGLineElement[];
  private nodes: HTMLElement[];
  private bars: HTMLElement[];
  private statStrips: HTMLElement[][];
  private stats: HTMLElement[];
  private words: Record<string, Rect> = {};
  private fx: Record<string, HTMLElement> = {};
  private syms: HTMLElement[];
  private snipLines: HTMLElement[];
  private lastR = 0;
  private user: { k: WordKey; at: number; prev: WordKey | null } | null = null;
  private asciiOn = false;
  private zoom: ZoomThrough;

  constructor(private root: HTMLElement) {
    const q = (s: string) => $(root, s);
    this.el = {
      board: q("[data-board]"),
      hComplex: q("[data-h=complex]"), hComplexU: q("[data-h=complex] [data-u]"),
      hClear: q("[data-h=clear]"), hClearU: q("[data-h=clear] [data-u]"),
      sent: q("[data-sent]"), s1u: q("[data-s1u]"), s2: q("[data-s2]"), s2u: q("[data-s2u]"),
      wFigma: q("[data-w=figma]"), wCode: q("[data-w=code]"),
      linksSvg: q("[data-links]"),
      sel: q("[data-fsel]"),
      fxW: q("[data-fx-w]"), fxS: q("[data-fx-s]"),
      caret: q("[data-cx=caret]"), snip: q("[data-cx=snip]"), snipCaret: q("[data-snip-caret]"),
      ascii: q("[data-ascii]"), wipe: q("[data-wipe]"),
      cr: q("[data-cr]"), crPill: q("[data-cr-pill]"),
      pcur: q("[data-pcur]"),
      statsWrap: q("[data-stats]"),
    };
    $$(root, "[data-art]").forEach((a) => (this.arts[a.dataset.art!] = a));
    this.links = $$<SVGLineElement>(root, "[data-links] line");
    this.nodes = $$(root, "[data-cr] [data-node]");
    this.bars = $$(root, "[data-cr] [data-bar]");
    this.stats = $$(root, "[data-stat]");
    this.statStrips = this.stats.map((s) => $$(s, "[data-strip]"));
    $$(root, "[data-fx]").forEach((f) => (this.fx[f.dataset.fx!] = f));
    this.syms = $$(root, "[data-cx=sym]");
    this.snipLines = $$(root, "[data-snip]");
    // visitors can drive the Figma / code states themselves: hover, or tap on touch screens
    (["figma", "code"] as WordKey[]).forEach((k) => {
      const w = k === "figma" ? this.el.wFigma : this.el.wCode;
      const pick = () => this.pick(k);
      w.addEventListener("pointerenter", pick);
      w.addEventListener("pointerdown", pick);
    });
    this.zoom = new ZoomThrough(q("[data-zoom]"), this.el.cr);
    REGIONS.forEach((k) => {
      const t = $(this.el.cr, `[data-t="${k}"]`);
      // the intent chip reveals together with its label and details
      this.regionEls[k] = k === "intent" ? (t.parentElement as HTMLElement) : t;
    });
    // orange scan highlights for the transformation (one per landing spot)
    [...REGIONS, "flow"].forEach((k) => {
      const d = document.createElement("div");
      d.className = styles.scan;
      d.setAttribute("aria-hidden", "true");
      this.el.board.appendChild(d);
      this.scans[k] = d;
    });
  }

  layout(vw: number, vh: number) {
    this.vw = vw;
    this.vh = vh;
    const port = vw / vh < 1.05;
    const g = (this.g = port ? GEO_PORT : GEO_LAND);
    this.root.dataset.orient = port ? "port" : "land";
    const m = Math.max(12, vw * 0.025);
    const bottom = port ? 70 : 56;
    const s = (this.bs = Math.min((vw - m * 2) / g.W, (vh - m - bottom) / g.H));
    this.bx = (vw - g.W * s) / 2;
    this.by = m + (vh - m - bottom - g.H * s) / 2;
    const b = this.el.board;
    b.style.width = `${g.W}px`;
    b.style.height = `${g.H}px`;
    b.style.transform = `translate3d(${this.bx}px,${this.by}px,0) scale(${s})`;
    this.el.linksSvg.setAttribute("viewBox", `0 0 ${g.W} ${g.H}`);
    // headlines: "complex" sits in the middle of its documents; "clear" just above the product
    this.el.hComplex.style.fontSize = `${g.complex.font}px`;
    this.el.hComplex.style.top = `${g.H / 2 - (g.complex.font * 1.15) / 2}px`;
    this.el.hClear.style.fontSize = `${g.clear.font}px`;
    this.el.hClear.style.top = `${g.clear.y}px`;
    // the two sentences: one block, as large as fits, centred on the board
    const sent = this.el.sent;
    Object.assign(sent.style, { left: "0px", top: "0px", fontSize: `${g.sent.font}px` });
    const font = Math.min(g.sent.font, (g.sent.font * g.sent.maxW) / Math.max(1, sent.offsetWidth));
    sent.style.fontSize = `${font.toFixed(2)}px`;
    const sw = sent.offsetWidth, sh = sent.offsetHeight;
    const sx = (g.W - sw) / 2, sy = (g.H - sh) / 2 - (port ? 60 : 30);
    sent.style.left = `${sx}px`;
    sent.style.top = `${sy}px`;
    const board = this.el.board;
    // measure the words at their prominent weight
    [this.el.wFigma, this.el.wCode].forEach((w) => (w.style.fontWeight = "660"));
    this.words = {};
    $$(sent, "[data-w]").forEach((w) => (this.words[w.dataset.w!] = offsetIn(w, board)));
    const F = this.box("figma"), C = this.box("code");
    const place = (el: HTMLElement | undefined, x: number, y: number, w?: number, h?: number) => {
      if (!el) return;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      if (w !== undefined) el.style.width = `${w}px`;
      if (h !== undefined) el.style.height = `${h}px`;
    };
    // design state around "Figma"
    const fx = this.fx;
    place(fx.tool, F.x, F.y - 56);
    place(fx.guideL, F.x, sy - 40, undefined, sh + 80);
    place(fx.guideR, F.x + F.w, sy - 40, undefined, sh + 80);
    place(fx.guideH, sx - 40, F.y, sw + 80);
    place(fx.ruler, F.x, F.y + F.h + 12, F.w);
    this.el.fxW.textContent = `W ${Math.round(F.w)}`;
    const in1 = this.words.in1;
    const gap = Math.max(4, this.words.figma.x - (in1.x + in1.w));
    place(fx.space, in1.x + in1.w, F.y + F.h * 0.5, gap);
    this.el.fxS.textContent = `${Math.round(gap)}`;
    const lw = fx.layer.offsetWidth;
    if (F.x + F.w + 16 + lw < g.W - 8) place(fx.layer, F.x + F.w + 18, F.y + F.h * 0.5 - 16);
    else place(fx.layer, Math.min(F.x + F.w - lw, g.W - lw - 8), F.y - 56);
    if (F.x + F.w + 16 + lw >= g.W - 8) place(fx.tool, Math.max(8, Math.min(F.x, F.x + F.w - lw - fx.tool.offsetWidth - 12)), F.y - 56);
    // code state around "code"
    const cw = this.words.code;
    place(this.el.caret, cw.x + cw.w + 4, cw.y + cw.h * 0.14, undefined, cw.h * 0.74);
    this.snipLines.forEach((l) => l.style.setProperty("--n", l.dataset.len!));
    const snipW = this.el.snip.offsetWidth;
    const snipX = Math.max(16, Math.min(C.x + C.w - snipW, g.W - snipW - 16));
    const symW = this.syms.map((el) => el.offsetWidth);
    const roomRight = C.x + C.w + 60 + Math.max(...symW) < g.W - 8;
    let snipY = C.y + C.h + 30;
    if (roomRight) {
      const arc: [number, number][] = [
        [C.x + C.w + 44, C.y - 18], [C.x + C.w + 96, C.y + C.h * 0.3], [C.x + C.w + 44, C.y + C.h * 0.78], [C.x + C.w + 120, C.y - 40],
      ];
      this.syms.forEach((el, i) => place(el, Math.min(arc[i][0], g.W - symW[i] - 8), arc[i][1]));
    } else {
      // a row between the word and the snippet
      snipY = C.y + C.h + 74;
      const gapX = (snipW - symW.reduce((a, b) => a + b, 0)) / (this.syms.length - 1);
      let x = snipX;
      this.syms.forEach((el, i) => {
        place(el, x, C.y + C.h + 26);
        x += symW[i] + gapX;
      });
    }
    place(this.el.snip, snipX, snipY);
    [this.el.wFigma, this.el.wCode].forEach((w) => (w.style.fontWeight = ""));
    // the product
    // the product
    const cr = this.el.cr;
    cr.style.width = `${g.crW}px`;
    cr.style.height = `${g.crH}px`;
    $$(cr, "[data-t]").forEach((t) => (this.targets[t.dataset.t!] = offsetIn(t, cr)));
    const btnEl = $(cr, '[data-t="btn"]') as HTMLElement;
    this.zoom.layout(
      {
        rest: g.cr7, crW: g.crW, crH: g.crH, bx: this.bx, by: this.by, bs: this.bs, vw, vh,
        btn: this.targets.btn, label: this.targets.btnDone ?? null,
        radius: parseFloat(getComputedStyle(btnEl).borderTopLeftRadius) || 11,
      },
      { ground: COLORS.orange, warm: COLORS.warm },
    );
    Object.entries(this.arts).forEach(([k, a]) => {
      a.style.width = "";
      a.style.height = "";
      this.artSize[k] = { w: a.offsetWidth, h: a.offsetHeight };
    });
    const setRect = (el: HTMLElement, r: Rect) => Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    Object.entries(this.scans).forEach(([k, d]) => setRect(d, this.crRect(g.cr3, k)));
    // proof: three equal columns, the numbers sized so the widest fits its column
    const grid = $(this.el.statsWrap, "[data-sgrid]") as HTMLElement;
    Object.assign(grid.style, { left: `${g.stats.x}px`, width: `${g.stats.w}px`, top: "0px" });
    grid.style.setProperty("--pad", `${g.stats.pad}px`);
    grid.style.setProperty("--lf", `${g.stats.labelFont}px`);
    const nums = this.stats.map((st) => $(st, "[data-num]") as HTMLElement);
    nums.forEach((n) => (n.style.fontSize = `${g.stats.font}px`));
    const colIn = g.stats.w / 3 - g.stats.pad * 2;
    const widest = Math.max(...nums.map((n) => n.offsetWidth));
    const nf = Math.min(g.stats.font, (g.stats.font * colIn) / Math.max(1, widest));
    nums.forEach((n) => (n.style.fontSize = `${nf.toFixed(2)}px`));
    this.stats.forEach((st) => (($(st, "[data-lab]") as HTMLElement).style.fontSize = `${g.stats.labelFont}px`));
    grid.style.top = `${(g.H - grid.offsetHeight) / 2}px`;
  }

  /** A word's selection box (board units), a little wider than the glyphs. */
  private box(k: string): Rect {
    const w = this.words[k];
    if (!w) return { x: 0, y: 0, w: 0, h: 0 };
    return { x: w.x - w.h * 0.08, y: w.y + w.h * 0.04, w: w.w + w.h * 0.16, h: w.h * 0.92 };
  }

  /** A visitor hovered or tapped a word: it takes over from the scripted cursor. */
  private pick(k: WordKey) {
    const r = this.lastR;
    if (r < T.sent2In[1] || r >= T.sentOut[0]) return;
    const cur = this.activeWord(r);
    if (cur.k === k && (this.user || r >= (k === "figma" ? T.figmaAt : T.codeAt))) return;
    this.user = { k, at: r, prev: cur.k };
  }

  /** Which word is active, how strongly (a), and for how long (t) — per word. */
  private activeWord(r: number): { k: WordKey | null; a: Record<WordKey, number>; t: Record<WordKey, number> } {
    const u = this.user;
    if (u && r >= u.at && r < T.sentOut[1]) {
      const dt = r - u.at;
      const a = { figma: 0, code: 0 };
      a[u.k] = prog(dt, 0, 0.22);
      if (u.prev && u.prev !== u.k) a[u.prev] = 1 - prog(dt, 0, 0.22);
      const t = { figma: -1, code: -1 };
      t[u.k] = dt;
      if (u.prev && u.prev !== u.k) t[u.prev] = 9;
      return { k: u.k, a, t };
    }
    const figA = prog(r, T.figmaAt - 0.05, T.figmaAt + 0.2) * (1 - prog(r, T.toCode[0], T.toCode[0] + 0.25));
    const codeA = prog(r, T.codeAt - 0.05, T.codeAt + 0.2);
    const k: WordKey | null = r >= T.codeAt - 0.05 ? "code" : r >= T.figmaAt - 0.05 && r < T.toCode[0] + 0.25 ? "figma" : null;
    return { k, a: { figma: figA, code: codeA }, t: { figma: r - T.figmaAt, code: r - T.codeAt } };
  }

  private crRect(p: Place, key: string): Rect {
    const t = this.targets[key] ?? { x: 0, y: 0, w: 0, h: 0 };
    const x0 = p.cx - (this.g.crW * p.s) / 2, y0 = p.cy - (this.g.crH * p.s) / 2;
    return { x: x0 + t.x * p.s, y: y0 + t.y * p.s, w: t.w * p.s, h: t.h * p.s };
  }

  toView(x: number, y: number) {
    return { x: this.bx + x * this.bs, y: this.by + y * this.bs };
  }

  /** The centre of the viewport, in board units. */
  private fullCenter() {
    return { x: (this.vw / 2 - this.bx) / this.bs, y: (this.vh / 2 - this.by) / this.bs };
  }

  private placeCR(r: number): { p: Place; a: number } | null {
    const g = this.g;
    if (r >= T.gateIn[0] && r < T.wireOut[1]) return { p: g.cr3, a: outCubic(span(r, T.gateIn)) * (1 - span(r, T.wireOut)) };
    // chapter 7: one camera (zoom.ts) — out of the button, at rest, then through it
    if (r >= T.crIn[0] && r < T.end + 1) return { p: this.zoom.place(r), a: 1 };
    return null;
  }

    render(r: number, origin: { x: number; y: number }) {
    const g = this.g, e = this.el;
    this.lastR = r;
    if (this.user && (r < T.sent1In[0] || r >= T.sentOut[1])) this.user = null;
    // Gradient ASCII mounts shortly before it is shown, so its own intro plays on cue
    const asciiOn = r >= T.asciiMount && r < T.crIn[0] + 0.1;
    if (asciiOn !== this.asciiOn) {
      this.asciiOn = asciiOn;
      this.root.dispatchEvent(new CustomEvent("film-ascii", { detail: asciiOn }));
    }
    const asciiA = r < T.crIn[0] ? outCubic(span(r, T.asciiIn)) : 0;
    // the colour takes over from the button's spot, spreading past every edge
    const tk = r >= T.takeover[0] && r < T.crIn[0] + 0.1;
    show(e.wipe, tk);
    if (tk) {
      const o = this.zoom.origin();
      const far = Math.hypot(Math.max(o.x, this.vw - o.x), Math.max(o.y, this.vh - o.y)) + 2;
      e.wipe.style.clipPath = `circle(${(inOutCubic(span(r, T.takeover)) * far).toFixed(1)}px at ${o.x.toFixed(1)}px ${o.y.toFixed(1)}px)`;
    }
    show(e.ascii, asciiA > 0.001);
    e.ascii.style.opacity = asciiA.toFixed(3);
    const boardOn = r >= T.scatter[0] && (r < T.asciiIn[1] || r >= T.crIn[0]);
    show(e.board, boardOn);
    if (!boardOn) return this.zoom.render(r);

    /* ---------- headlines (2, 3) ---------- */
    const line = (wrap: HTMLElement, u: HTMLElement, inn: readonly number[], out: readonly number[]) => {
      const on = r >= inn[0] && r < out[1];
      show(wrap, on);
      if (on) rise(u, r < out[0] ? outQuint(span(r, inn)) : 1 - inQuint(span(r, out)), r < out[0] ? 1 : -1);
    };
    line(e.hComplex, e.hComplexU, T.complexIn, T.complexOut);
    line(e.hClear, e.hClearU, T.clearIn, T.clearOut);

    /* ---------- 2: documents float, link, gather — 3: clutter clears, pieces → the frame ---------- */
    const gather = inOutQuint(span(r, T.gather));
    const spread = inOutQuint(span(r, T.spread));
    const centroid = (grp: string[]) => {
      const pts = grp.map((k) => g.arts[k]);
      return [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    };
    const centroids = GROUPS.map(centroid);
    const groupOf = (k: string) => GROUPS.findIndex((grp) => grp.includes(k));
    const artPos: Record<string, { x: number; y: number }> = {};
    const lastLand = flowTimes(FLOW[FLOW.length - 1]).b;
    const homeOf = (k: string, i: number, fromSide: boolean) => {
      const [hx, hy] = g.arts[k];
      const t = Math.max(0, r - T.scatter[0]);
      const fx = hx + Math.sin(t * (0.55 + i * 0.05) + i) * 10;
      const fy = hy + Math.cos(t * (0.45 + i * 0.04) + i * 1.7) * 8;
      const st = T.scatter[0] + (fromSide ? 0.25 + (i % 4) * 0.08 : i * 0.035);
      const enter = outQuint(prog(r, st, st + (fromSide ? 0.85 : 0.65)));
      const fromX = fromSide ? (hx < g.W / 2 ? g.sides.offL : g.sides.offR) : origin.x;
      const fromY = fromSide ? hy : origin.y;
      const gi = groupOf(k);
      const c = gi >= 0 ? centroids[gi] : [hx, hy];
      return {
        x: lerp(lerp(fromX, fx, enter), lerp(fx, c[0], 0.16), gather),
        y: lerp(lerp(fromY, fy, enter), lerp(fy, c[1], 0.16), gather),
        enter,
      };
    };

    // clutter: enters from the sides, then is cleared away outwards when the frame opens
    CLUTTER.forEach((k, i) => {
      const a = this.arts[k];
      const h = homeOf(k, i + 3, true);
      const out = inCubic(spread);
      const toX = g.arts[k][0] < g.W / 2 ? g.sides.offL : g.sides.offR;
      const x = lerp(h.x, toX, out), y = h.y;
      const alpha = h.enter * (1 - prog(r, T.spread[0], T.spread[0] + 0.32));
      artPos[k] = { x, y };
      show(a, alpha > 0.001);
      if (alpha <= 0.001) return;
      a.style.opacity = alpha.toFixed(3);
      a.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${g.artSc})`;
    });

    ART_KEYS.forEach((k, i) => {
      const a = this.arts[k];
      const extra = EXTRAS.includes(k);
      const ft = flowTimes(k);
      const size = this.artSize[k];
      const [side, slot] = SIDE[k];
      const sx = side === "L" ? g.sides.lx : g.sides.rx, sy = g.sides.ys[slot];
      let x: number, y: number, sc = g.artSc, rot = 0, alpha: number;
      if (extra) {
        const p = outQuint(prog(r, T.extrasIn[0] + (slot % 2) * 0.12, T.extrasIn[1] + (slot % 2) * 0.12));
        x = lerp(side === "L" ? g.sides.offL : g.sides.offR, sx, p);
        y = sy;
        sc = g.sides.sc;
        rot = TILT[k] * p;
        alpha = p;
      } else {
        const h = homeOf(k, i, false);
        x = lerp(h.x, sx, spread);
        y = lerp(h.y, sy, spread);
        sc = lerp(g.artSc, g.sides.sc, spread);
        rot = TILT[k] * spread;
        alpha = h.enter;
      }
      // the transformation: travel into the frame, straighten, dissolve into the clean part
      const tp = inOutQuint(prog(r, ft.a, ft.b));
      if (tp > 0) {
        const tgt = this.crRect(g.cr3, ART_TARGET[k]);
        x = lerp(x, tgt.x + tgt.w / 2, tp);
        y = lerp(y, tgt.y + tgt.h / 2, tp);
        rot = lerp(rot, 0, tp);
        a.style.width = `${lerp(size.w * sc, tgt.w, prog(tp, 0.4, 1)).toFixed(1)}px`;
        a.style.height = `${lerp(size.h * sc, tgt.h, prog(tp, 0.4, 1)).toFixed(1)}px`;
        a.style.setProperty("--detail", String(1 - tp));
        alpha *= 1 - prog(r, lerp(ft.a, ft.b, 0.72), ft.b + 0.08);
      } else {
        a.style.width = "";
        a.style.height = "";
        a.style.setProperty("--detail", "1");
      }
      if (r > lastLand + 0.3) alpha = 0;
      artPos[k] = { x, y };
      show(a, alpha > 0.001);
      if (alpha <= 0.001) return;
      a.style.opacity = alpha.toFixed(3);
      a.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${tp > 0 ? 1 : sc})`;
      const messy = String((spread > 0.5 || extra) && tp < 0.5);
      if (a.dataset.messy !== messy) a.dataset.messy = messy;
    });
    // relationship lines (chapter 2)
    const linkDraw = outCubic(span(r, T.links));
    const linkFade = 1 - span(r, [T.spread[0], T.spread[0] + 0.4]);
    show(e.linksSvg, linkDraw > 0 && linkFade > 0);
    let li = 0;
    GROUPS.forEach((grp) => {
      for (let j = 0; j < grp.length - 1; j++) {
        const L = this.links[li++];
        const p = artPos[grp[j]], q = artPos[grp[j + 1]];
        if (!L || !p || !q) continue;
        L.setAttribute("x1", p.x.toFixed(1));
        L.setAttribute("y1", p.y.toFixed(1));
        L.setAttribute("x2", lerp(p.x, q.x, linkDraw).toFixed(1));
        L.setAttribute("y2", lerp(p.y, q.y, linkDraw).toFixed(1));
        L.style.opacity = (0.7 * linkFade).toFixed(3);
      }
    });
    for (; li < this.links.length; li++) this.links[li].style.opacity = "0";
    // orange scan as each piece is transformed into its clean part
    Object.entries(this.scans).forEach(([k, d]) => {
      let sv = 0;
      FLOW.filter((f) => ART_TARGET[f] === k).forEach((f) => {
        const { b } = flowTimes(f);
        sv = Math.max(sv, Math.sin(Math.PI * prog(r, b - 0.12, b + 0.38)));
      });
      show(d, sv > 0.01);
      d.style.opacity = sv.toFixed(3);
    });

    /* ---------- 4: proof — all three together ---------- */
    const statsOn = r >= T.statsIn[0] && r < T.statsOut[1];
    show(e.statsWrap, statsOn);
    if (statsOn) {
      const inP = outQuint(span(r, T.statsIn)), outP = inOutQuint(span(r, T.statsOut));
      e.statsWrap.style.opacity = (inP * (1 - outP)).toFixed(3);
      e.statsWrap.style.transform = `translate3d(0,${((1 - inP) * 24 - outP * 18).toFixed(2)}px,0)`;
      this.statStrips.forEach((strips) =>
        strips.forEach((st, c) => {
          const target = 10 + Number(st.dataset.target);
          const p = outQuint(prog(r, T.roll[0] + c * 0.06, T.roll[1] + c * 0.06));
          st.style.transform = `translate3d(0,${(-(target * p) * 5).toFixed(3)}%,0)`;
        }),
      );
      this.stats.forEach((st) => {
        const lab = $(st, "[data-lab]") as HTMLElement;
        const lp = outCubic(span(r, T.labelsIn));
        lab.style.opacity = lp.toFixed(3);
        lab.style.transform = `translate3d(0,${((1 - lp) * 10).toFixed(2)}px,0)`;
      });
    }

    /* ---------- 5–6: the sentences; "Figma" (design) and "code" (code) states ---------- */
    const sentOn = r >= T.sent1In[0] && r < T.sentOut[1];
    show(e.sent, sentOn);
    const out = inOutQuint(span(r, T.sentOut));
    const st = sentOn ? this.activeWord(r) : { k: null, a: { figma: 0, code: 0 }, t: { figma: -1, code: -1 } };
    const fa = st.a.figma, ca = st.a.code;
    if (sentOn) {
      e.sent.style.opacity = (1 - out).toFixed(3);
      e.sent.style.transform = `translate3d(0,${(-out * 16).toFixed(2)}px,0)`;
      rise(e.s1u, outQuint(span(r, T.sent1In)));
      rise(e.s2u, outQuint(span(r, T.sent2In)));
      // the active word stays dark and gains weight; everything else steps back
      const dim = Math.max(fa, ca);
      const base = mixC(COLORS.ink, DIM, dim);
      e.sent.style.color = base;
      e.wFigma.style.color = mixC(COLORS.ink, DIM, dim * (1 - fa));
      e.wCode.style.color = mixC(COLORS.ink, DIM, dim * (1 - ca));
      e.wFigma.style.fontWeight = lerp(580, 660, fa).toFixed(0);
      e.wCode.style.fontWeight = lerp(580, 660, ca).toFixed(0);
    }
    const step = (t: number, a: number, b: number, mult: number) => outCubic(prog(t, a, b)) * mult * (1 - out);
    // design state: selection, then tools, ruler, spacing, guides, layer — one after another
    const ft2 = st.t.figma;
    const sel = step(ft2, 0.0, 0.25, fa);
    show(e.sel, sel > 0.01);
    if (sel > 0.01) {
      const F = this.box("figma");
      const sc2 = 0.94 + 0.06 * sel;
      e.sel.style.opacity = sel.toFixed(3);
      Object.assign(e.sel.style, { left: "0px", top: "0px", width: `${F.w}px`, height: `${F.h}px`, transformOrigin: "50% 50%" });
      e.sel.style.transform = `translate3d(${F.x.toFixed(1)}px,${(F.y - out * 16).toFixed(1)}px,0) scale(${sc2.toFixed(4)})`;
    }
    const detail = (el: HTMLElement | undefined, v: number, dy = 6) => {
      if (!el) return;
      show(el, v > 0.01);
      if (v <= 0.01) return;
      el.style.opacity = v.toFixed(3);
      el.style.transform = `translate3d(0,${((1 - v) * dy - out * 16).toFixed(2)}px,0)`;
    };
    detail(this.fx.tool, step(ft2, 0.3, 0.55, fa));
    detail(this.fx.ruler, step(ft2, 0.5, 0.75, fa), -4);
    detail(this.fx.space, step(ft2, 0.7, 0.95, fa), 0);
    const guides = step(ft2, 0.85, 1.15, fa);
    ["guideL", "guideR"].forEach((k) => {
      const el = this.fx[k];
      show(el, guides > 0.01);
      el.style.opacity = guides.toFixed(3);
      el.style.transformOrigin = "50% 50%";
      el.style.transform = `translate3d(0,${(-out * 16).toFixed(2)}px,0) scaleY(${guides.toFixed(3)})`;
    });
    const gh = this.fx.guideH;
    show(gh, guides > 0.01);
    gh.style.opacity = guides.toFixed(3);
    gh.style.transformOrigin = "0 50%";
    gh.style.transform = `translate3d(0,${(-out * 16).toFixed(2)}px,0) scaleX(${guides.toFixed(3)})`;
    detail(this.fx.layer, step(ft2, 1.05, 1.3, fa));
    // code state: text cursor and caret, symbols, then a snippet being written
    const ct = st.t.code;
    const caretOn = step(ct, 0.05, 0.2, ca);
    show(e.caret, caretOn > 0.01);
    if (caretOn > 0.01) e.caret.style.opacity = (caretOn * (Math.floor((r - T.codeAt) * 2.4) % 2 === 0 ? 1 : 0.15)).toFixed(3);
    this.syms.forEach((el, i) => {
      const v = step(ct, 0.3 + i * 0.12, 0.55 + i * 0.12, ca);
      show(el, v > 0.01);
      if (v <= 0.01) return;
      el.style.opacity = v.toFixed(3);
      const dx = (i === 0 ? -1 : i === 1 ? 0.4 : 1) * (1 - v) * -14;
      el.style.transform = `translate3d(${dx.toFixed(2)}px,${((1 - v) * 12 - out * 16).toFixed(2)}px,0)`;
    });
    const snipA = step(ct, 0.85, 1.05, ca);
    show(e.snip, snipA > 0.01);
    if (snipA > 0.01) {
      e.snip.style.opacity = snipA.toFixed(3);
      e.snip.style.transform = `translate3d(0,${((1 - snipA) * 12 - out * 16).toFixed(2)}px,0)`;
      const total = this.snipLines.reduce((acc, l) => acc + Number(l.dataset.len), 0);
      let left = Math.round(prog(ct, 1.0, 2.0) * total);
      let caretLine = this.snipLines[0], caretN = 0;
      this.snipLines.forEach((l) => {
        const len = Number(l.dataset.len);
        const n = Math.max(0, Math.min(len, left));
        if (left > 0 || l === this.snipLines[0]) {
          caretLine = l;
          caretN = n;
        }
        left -= len;
        l.style.setProperty("--n", String(n));
      });
      const blink = prog(ct, 1.0, 2.0) >= 1 && Math.floor(r * 2.4) % 2 === 1 ? 0 : 1;
      e.snipCaret.style.opacity = String(blink);
      e.snipCaret.style.transform = `translate3d(calc(18px + ${caretN}ch), ${caretLine.offsetTop + 3}px, 0)`;
    }

        /* ---------- 7: the product ---------- */
    const pl = this.placeCR(r);
    show(e.cr, !!pl && !this.zoom.layered(r));
    if (pl) {
      // while the stacked layers carry the picture, park the hidden product at rest (no huge raster)
      const place = this.zoom.layered(r) && r >= T.crIn[0] ? g.cr7 : pl.p;
      e.cr.style.opacity = pl.a.toFixed(3);
      const x0 = place.cx - (g.crW * place.s) / 2, y0 = place.cy - (g.crH * place.s) / 2;
      e.cr.style.transform = `translate3d(${x0.toFixed(2)}px,${y0.toFixed(2)}px,0) scale(${place.s.toFixed(4)})`;
      const ch3 = r < T.crIn[0];
      // chapter 3: the frame glows orange while the pieces are transformed, then calms
      const gate = ch3 ? outCubic(span(r, T.gateIn)) * (1 - outCubic(prog(r, lastLand, lastLand + 0.6))) : 0;
      e.cr.style.setProperty("--gate", gate.toFixed(3));
      if (ch3) {
        REGIONS.forEach((k) => {
          const land = Math.min(...FLOW.filter((f) => ART_TARGET[f] === k).map((f) => flowTimes(f).b));
          this.regionEls[k].style.opacity = outCubic(prog(r, land - 0.14, land + 0.16)).toFixed(3);
        });
      } else REGIONS.forEach((k) => (this.regionEls[k].style.opacity = ""));
      // live states (chapter 7): Draft finishes, Pricing is approved, Review runs and completes
      const draft = ch3 ? 0 : outCubic(span(r, T.draftDone));
      const approvedP = ch3 ? 0 : outCubic(span(r, T.approved));
      const review = ch3 ? 0 : span(r, T.flowDone);
      const doneAt = [0, draft, approvedP, prog(review, 0.75, 1)];
      const states = [
        "done",
        draft >= 0.5 ? "done" : "running",
        approvedP >= 0.5 ? "done" : "approval",
        review >= 1 ? "done" : review > 0 ? "running" : "waiting",
      ];
      const barP = [1, lerp(0.72, 1, draft), approvedP >= 0.5 ? 1 : 0, review];
      this.nodes.forEach((n, i) => {
        if (n.dataset.state !== states[i]) n.dataset.state = states[i];
        n.querySelectorAll<HTMLElement>("[data-m0]").forEach((m) => (m.style.opacity = String(1 - doneAt[i])));
        n.querySelectorAll<HTMLElement>("[data-m1]").forEach((m) => (m.style.opacity = String(doneAt[i])));
        this.bars[i].style.transform = `scaleX(${barP[i].toFixed(4)})`;
      });
      const complete = String(review >= 1);
      if (e.crPill.dataset.complete !== complete) e.crPill.dataset.complete = complete;
      const hover = ch3 ? 0 : outCubic(span(r, T.hover)) * (1 - prog(r, T.click + 0.25, T.click + 0.5));
      const press = r >= T.click && r < T.click + 0.18 ? 1 - Math.sin((Math.PI * (r - T.click)) / 0.18) * 0.05 : 1;
      e.cr.style.setProperty("--hover", hover.toFixed(3));
      e.cr.style.setProperty("--press", press.toFixed(4));
      e.cr.style.setProperty("--approved", approvedP.toFixed(3));
      e.cr.style.setProperty("--lab", this.zoom.label(r).toFixed(3));
      // the camera is moving: keep the plane on the compositor
      const moving = (r > T.crIn[0] && r < T.crIn[1]) || r > T.push[0];
      if (e.cr.style.willChange !== (moving ? "transform" : "")) e.cr.style.willChange = moving ? "transform" : "";
    }

    /* ---------- the named cursor: "Figma" → "code" → the real Approve & send ---------- */
    const curA = r >= T.cursorIn5[0] && r < T.sentOut[1] && !this.user;
    const curB = r >= T.cursorIn[0] && r < T.push[0] + 0.3;
    show(e.pcur, curA || curB);
    let mode = "arrow";
    if (curA || curB) {
      let x: number, y: number, a: number;
      if (curA) {
        const F = this.box("figma"), cw = this.words.code;
        const atF = { x: F.x + F.w - 2, y: F.y + F.h - 2 };
        const atC = { x: cw.x + cw.w + 16, y: cw.y + cw.h * 0.5 };
        if (r < T.toCode[0]) {
          const p = inOutQuint(span(r, T.cursorIn5));
          x = lerp(g.W * 0.84, atF.x, p);
          y = lerp(g.H * 1.02, atF.y, p) - Math.sin(Math.PI * p) * 30;
        } else {
          const p = inOutQuint(span(r, T.toCode));
          x = lerp(atF.x, atC.x, p);
          y = lerp(atF.y, atC.y, p) - Math.sin(Math.PI * p) * 18;
          if (p > 0.85) mode = "text";
        }
        y -= out * 16;
        a = outCubic(prog(r, T.cursorIn5[0], T.cursorIn5[0] + 0.2)) * (1 - out);
      } else {
        // the cursor rides with the dashboard for the moment it stays on screen
        const btn = this.crRect(this.placeCR(r)!.p, "btn");
        // a natural approach: brisk start, a gentle arc, a long slow-down into the button
        const p = approach(span(r, T.cursorIn));
        x = lerp(g.W * 0.92, btn.x + btn.w * 0.6, p);
        y = lerp(g.H * 1.04, btn.y + btn.h * 0.62, p) - Math.sin(Math.PI * Math.min(1, p * 1.1)) * 34;
        a = outCubic(prog(r, T.cursorIn[0], T.cursorIn[0] + 0.2)) * (1 - prog(r, T.push[0], T.push[0] + 0.25));
      }
      const press = r >= T.click && r < T.click + 0.14 ? 0.86 : 1;
      e.pcur.style.opacity = a.toFixed(3);
      e.pcur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${press})`;
    }
    if (e.pcur.dataset.mode !== mode) e.pcur.dataset.mode = mode;
    this.zoom.render(r);
  }
}
