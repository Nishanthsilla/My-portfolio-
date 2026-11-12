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
 *   5–6  "I design it in Figma, / then ship it in code." — typography only, with a
 *      design-tool selection that moves from "Figma," to "code." under a named cursor
 *   7  the finished product: hover, click, success, then a zoom until it fills the screen
 * Everything is a pure function of time r.
 */
import styles from "./IntroFilm.module.css";
import { T, inCubic, inOutQuint, inQuint, lerp, outCubic, outQuint, prog, span } from "./timeline";

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
  stats: { xs: number[]; y: number; font: number; labelFont: number; labelW: number; ruleY: number };
};

/** The pieces that become the product (chapter 3). */
const ART_KEYS = ["research", "workflow", "decision", "requirement", "idea", "insight", "dependency", "kpi", "chart", "button", "sketch", "sticky"] as const;
type ArtKey = (typeof ART_KEYS)[number];
/** Documents and data that only add to the complexity; cleared away in chapter 3. */
const CLUTTER = ["sheet", "report", "feedback1", "feedback2", "agent", "line", "points"] as const;
const ART_TARGET: Record<ArtKey, string> = {
  research: "n0", workflow: "n1", decision: "n2", requirement: "n3", idea: "appr", sticky: "appr",
  insight: "head", dependency: "intent", kpi: "logB", chart: "logA", button: "btn", sketch: "flow",
};
const SIDE: Record<ArtKey, ["L" | "R", number]> = {
  sketch: ["L", 0], insight: ["L", 1], research: ["L", 2], sticky: ["L", 3], chart: ["L", 4], dependency: ["L", 5],
  workflow: ["R", 0], decision: ["R", 1], requirement: ["R", 2], idea: ["R", 3], kpi: ["R", 4], button: ["R", 5],
};
const EXTRAS: ArtKey[] = ["sketch", "sticky"];
const FLOW: ArtKey[] = ["sketch", "insight", "workflow", "dependency", "research", "decision", "requirement", "sticky", "idea", "chart", "kpi", "button"];
const REGIONS = ["head", "intent", "n0", "n1", "n2", "n3", "appr", "logA", "logB"];
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
  stats: { xs: [230, 600, 970], y: 345, font: 150, labelFont: 24, labelW: 300, ruleY: 205 },
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
  stats: { xs: [110, 320, 530], y: 470, font: 78, labelFont: 22, labelW: 190, ruleY: 360 },
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
const lerpP = (a: Place, b: Place, t: number): Place => ({ cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), s: lerp(a.s, b.s, t) });
const lerpR = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
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
  private words: { figma: Rect; code: Rect } = { figma: { x: 0, y: 0, w: 0, h: 0 }, code: { x: 0, y: 0, w: 0, h: 0 } };
  private finaleView = { x: 0, y: 0, r: 0 };

  constructor(private root: HTMLElement) {
    const q = (s: string) => $(root, s);
    this.el = {
      board: q("[data-board]"),
      hComplex: q("[data-h=complex]"), hComplexU: q("[data-h=complex] [data-u]"),
      hClear: q("[data-h=clear]"), hClearU: q("[data-h=clear] [data-u]"),
      sent: q("[data-sent]"), s1u: q("[data-s1u]"), s2: q("[data-s2]"), s2u: q("[data-s2u]"),
      wFigma: q("[data-w=figma]"), wCode: q("[data-w=code]"),
      linksSvg: q("[data-links]"),
      sel: q("[data-fsel]"), selLab: q("[data-fsel-lab]"),
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
    REGIONS.forEach((k) => {
      const t = $(this.el.cr, `[data-t="${k}"]`);
      // the intent chip reveals together with its label and details
      this.regionEls[k] = k === "intent" ? (t.parentElement as HTMLElement) : t;
    });
    // orange scan highlights for the transformation (one per landing spot)
    [...REGIONS, "flow", "btn"].forEach((k) => {
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
    sent.style.left = `${(g.W - sent.offsetWidth) / 2}px`;
    sent.style.top = `${(g.H - sent.offsetHeight) / 2}px`;
    const board = this.el.board;
    this.words = { figma: offsetIn(this.el.wFigma, board), code: offsetIn(this.el.wCode, board) };
    // the product
    const cr = this.el.cr;
    cr.style.width = `${g.crW}px`;
    cr.style.height = `${g.crH}px`;
    $$(cr, "[data-t]").forEach((t) => (this.targets[t.dataset.t!] = offsetIn(t, cr)));
    Object.entries(this.arts).forEach(([k, a]) => {
      a.style.width = "";
      a.style.height = "";
      this.artSize[k] = { w: a.offsetWidth, h: a.offsetHeight };
    });
    const setRect = (el: HTMLElement, r: Rect) => Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    Object.entries(this.scans).forEach(([k, d]) => setRect(d, this.crRect(g.cr3, k)));
    this.stats.forEach((st, i) => {
      st.style.left = `${g.stats.xs[i]}px`;
      st.style.top = `${g.stats.y}px`;
      ($(st, "[data-num]") as HTMLElement).style.fontSize = `${g.stats.font}px`;
      const lab = $(st, "[data-lab]") as HTMLElement;
      lab.style.fontSize = `${g.stats.labelFont}px`;
      lab.style.width = `${g.stats.labelW}px`;
    });
  }

  private crRect(p: Place, key: string): Rect {
    const t = this.targets[key] ?? { x: 0, y: 0, w: 0, h: 0 };
    const x0 = p.cx - (this.g.crW * p.s) / 2, y0 = p.cy - (this.g.crH * p.s) / 2;
    return { x: x0 + t.x * p.s, y: y0 + t.y * p.s, w: t.w * p.s, h: t.h * p.s };
  }

  toView(x: number, y: number) {
    return { x: this.bx + x * this.bs, y: this.by + y * this.bs };
  }

  /** Where the finale's orange circle begins: the product's "Complete" status dot. */
  approveCenter() {
    return this.finaleView;
  }

  /** The product filling the viewport (contain), in board units. */
  private fullPlace(): Place {
    const g = this.g;
    const s = Math.min(this.vw / (g.crW * this.bs), this.vh / (g.crH * this.bs));
    return { cx: (this.vw / 2 - this.bx) / this.bs, cy: (this.vh / 2 - this.by) / this.bs, s };
  }

  private placeCR(r: number): { p: Place; a: number; full: number } | null {
    const g = this.g;
    if (r >= T.gateIn[0] && r < T.wireOut[1]) return { p: g.cr3, a: outCubic(span(r, T.gateIn)) * (1 - span(r, T.wireOut)), full: 0 };
    if (r >= T.crIn[0] && r < T.sweep[1]) {
      const z = inOutQuint(span(r, T.zoom));
      const inP = outQuint(span(r, T.crIn));
      const p = lerpP(g.cr7, this.fullPlace(), z);
      return { p: { cx: p.cx, cy: p.cy + (1 - inP) * 24, s: p.s * (0.98 + 0.02 * inP) }, a: outCubic(span(r, T.crIn)), full: z };
    }
    return null;
  }

  render(r: number, origin: { x: number; y: number }) {
    const g = this.g, e = this.el;
    const boardOn = r >= T.scatter[0] && r < T.sweep[1] + 0.05;
    show(e.board, boardOn);
    if (!boardOn) return;

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
        a.style.width = `${lerp(size.w * sc, tgt.w, tp).toFixed(1)}px`;
        a.style.height = `${lerp(size.h * sc, tgt.h, tp).toFixed(1)}px`;
        a.style.setProperty("--detail", String(1 - tp));
        alpha *= 1 - prog(r, lerp(ft.a, ft.b, 0.5), ft.b + 0.04);
      } else {
        a.style.width = "";
        a.style.height = "";
        a.style.setProperty("--detail", "1");
      }
      if (k === "button") {
        // the button stays on the clean product, then becomes the stats' accent rule
        const tgt = this.crRect(g.cr3, "btn");
        if (r >= ft.b) {
          alpha = 1;
          x = tgt.x + tgt.w / 2;
          y = tgt.y + tgt.h / 2;
          a.style.width = `${tgt.w}px`;
          a.style.height = `${tgt.h}px`;
          rot = 0;
        }
        const toRule = inOutQuint(span(r, T.accentToRule));
        x = lerp(x, g.W / 2, toRule);
        y = lerp(y, g.stats.ruleY, toRule);
        if (toRule > 0) {
          a.style.width = `${lerp(tgt.w, 120, toRule)}px`;
          a.style.height = `${lerp(tgt.h, 6, toRule)}px`;
          a.style.padding = "0";
        } else a.style.padding = "";
        a.style.setProperty("--label", String(1 - prog(r, T.accentToRule[0], T.accentToRule[0] + 0.2)));
        alpha *= 1 - span(r, T.statsOut);
        if (r >= T.sent1In[0]) alpha = 0;
      } else if (r > lastLand + 0.3) alpha = 0;
      artPos[k] = { x, y };
      show(a, alpha > 0.001);
      if (alpha <= 0.001) return;
      a.style.opacity = alpha.toFixed(3);
      a.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${tp > 0 || (k === "button" && r >= ft.b) ? 1 : sc})`;
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
        lab.style.transform = `translate3d(-50%,${((1 - lp) * 10).toFixed(2)}px,0)`;
      });
    }

    /* ---------- 5–6: the sentences + a design-tool selection ---------- */
    const sentOn = r >= T.sent1In[0] && r < T.sentOut[1];
    show(e.sent, sentOn);
    const pad = { x: 0.1, y: 0.02 };
    const box = (w: Rect): Rect => ({ x: w.x - w.h * pad.x, y: w.y + w.h * pad.y, w: w.w + w.h * pad.x * 2, h: w.h * (1 - pad.y * 2) });
    const fBox = box(this.words.figma), cBox = box(this.words.code);
    const selRect = lerpR(fBox, cBox, inOutQuint(span(r, T.selToCode)));
    const out = inOutQuint(span(r, T.sentOut));
    if (sentOn) {
      e.sent.style.opacity = (1 - out).toFixed(3);
      e.sent.style.transform = `translate3d(0,${(-out * 16).toFixed(2)}px,0)`;
      rise(e.s1u, outQuint(span(r, T.sent1In)));
      show(e.s2, r >= T.sent2In[0]);
      rise(e.s2u, outQuint(span(r, T.sent2In)));
      e.wCode.style.setProperty("--hv", outCubic(span(r, T.codeOn)).toFixed(3));
    }
    const selOn = r >= T.selIn[0] && r < T.sentOut[1];
    show(e.sel, selOn);
    if (selOn) {
      const a = outCubic(span(r, T.selIn)) * (1 - out);
      const sIn = 0.94 + 0.06 * outQuint(span(r, T.selIn));
      e.sel.style.opacity = a.toFixed(3);
      e.sel.style.width = `${selRect.w.toFixed(1)}px`;
      e.sel.style.height = `${selRect.h.toFixed(1)}px`;
      e.sel.style.transformOrigin = "50% 50%";
      e.sel.style.transform = `translate3d(${selRect.x.toFixed(1)}px,${(selRect.y - out * 16).toFixed(1)}px,0) scale(${sIn.toFixed(4)})`;
      const lab = `${Math.round(selRect.w)} × ${Math.round(selRect.h)}`;
      if (e.selLab.textContent !== lab) e.selLab.textContent = lab;
    }

    /* ---------- 7: the product ---------- */
    const pl = this.placeCR(r);
    show(e.cr, !!pl);
    if (pl) {
      const place = pl.p;
      e.cr.style.opacity = pl.a.toFixed(3);
      const x0 = place.cx - (g.crW * place.s) / 2, y0 = place.cy - (g.crH * place.s) / 2;
      e.cr.style.transform = `translate3d(${x0.toFixed(2)}px,${y0.toFixed(2)}px,0) scale(${place.s.toFixed(4)})`;
      e.cr.style.borderRadius = `${(22 * (1 - pl.full)).toFixed(2)}px`;
      const ch3 = r < T.crIn[0];
      // chapter 3: the frame glows orange while the pieces are transformed, then calms
      const gate = ch3 ? outCubic(span(r, T.gateIn)) * (1 - outCubic(prog(r, lastLand, lastLand + 0.6))) : 0;
      e.cr.style.setProperty("--gate", gate.toFixed(3));
      if (ch3) {
        REGIONS.forEach((k) => {
          const land = Math.min(...FLOW.filter((f) => ART_TARGET[f] === k).map((f) => flowTimes(f).b));
          this.regionEls[k].style.opacity = outCubic(prog(r, land - 0.32, land + 0.12)).toFixed(3);
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
      if (!ch3) {
        const d = this.crRect(place, "pilldot");
        this.finaleView = { ...this.toView(d.x + d.w / 2, d.y + d.h / 2), r: Math.max(4, (d.w / 2) * this.bs) };
      }
    }

    /* ---------- the named cursor: "Figma," → "code." → Approve & send ---------- */
    const curA = r >= T.cursorIn5[0] && r < T.sentOut[1];
    const curB = r >= T.cursorIn[0] && r < T.zoom[0] + 0.5;
    show(e.pcur, curA || curB);
    if (curA || curB) {
      let x: number, y: number, a: number;
      if (curA) {
        const corner = { x: selRect.x + selRect.w - 2, y: selRect.y + selRect.h - 2 };
        const p = inOutQuint(span(r, T.cursorIn5));
        x = lerp(g.W * 0.82, corner.x, p);
        y = lerp(g.H * 1.02, corner.y, p) - Math.sin(Math.PI * p) * 30;
        y -= out * 16;
        a = outCubic(prog(r, T.cursorIn5[0], T.cursorIn5[0] + 0.2)) * (1 - out);
      } else {
        const btn = this.crRect(this.placeCR(Math.min(r, T.zoom[0]))!.p, "btn");
        const p = inOutQuint(span(r, T.cursorIn));
        x = lerp(g.W * 0.9, btn.x + btn.w * 0.6, p);
        y = lerp(g.H * 1.02, btn.y + btn.h * 0.62, p) - Math.sin(Math.PI * p) * 24;
        a = outCubic(prog(r, T.cursorIn[0], T.cursorIn[0] + 0.2)) * (1 - prog(r, T.zoom[0], T.zoom[0] + 0.3));
      }
      const press = r >= T.click && r < T.click + 0.14 ? 0.86 : 1;
      e.pcur.style.opacity = a.toFixed(3);
      e.pcur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${press})`;
    }
  }
}
