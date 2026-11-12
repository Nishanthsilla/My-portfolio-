/**
 * Chapters 2–7, staged on a design-space "board" (1200×700 landscape,
 * 640×1060 portrait) that is scaled to fit the viewport.
 *
 * One product runs through the story — the Agent Control Room (CR):
 *   2  floating artefacts (research, insights, requirements, decisions…)
 *   3  …are linked, gathered and assembled into the CR wireframe
 *   4  the proof row (all three stats roll together)
 *   5  "I design it in Figma," — the cursor hovers "Figma"; the canvas opens
 *   6  "then ship it in code." — the cursor hovers "code"; editor + live preview
 *   7  the product: wireframe → polished; hover, click, success; camera zoom
 * Everything is a pure function of time r.
 */
import { T, inOutQuint, inQuint, lerp, outCubic, outQuint, prog, span } from "./timeline";

type Rect = { x: number; y: number; w: number; h: number };
type Place = { cx: number; cy: number; s: number };
type Geo = {
  W: number; H: number;
  head: { y: number; font: number };
  crW: number; crH: number;
  cr3: Place; cr5: Place; cr6: Place; cr7: Place;
  sent: { x: number; y: number; w: number; font: number };
  ws: Rect; editor: Rect; preview: Rect;
  arts: Record<string, [number, number]>;
  stats: { xs: number[]; y: number; font: number; labelFont: number; labelW: number; ruleY: number };
};

const ART_KEYS = ["research", "workflow", "decision", "requirement", "idea", "insight", "dependency", "kpi", "chart", "button"] as const;
const ART_TARGET: Record<(typeof ART_KEYS)[number], string> = {
  research: "n0", workflow: "n1", decision: "n2", requirement: "n3", idea: "appr",
  insight: "head", dependency: "intent", kpi: "logB", chart: "logA", button: "btn",
};
const GROUPS = [["research", "workflow", "decision", "requirement"], ["idea", "button"], ["insight", "dependency"], ["kpi", "chart"]];

const GEO_LAND: Geo = {
  W: 1200, H: 700,
  head: { y: 30, font: 58 },
  crW: 1000, crH: 500,
  cr3: { cx: 600, cy: 420, s: 1 },
  cr5: { cx: 805, cy: 472, s: 0.6 },
  cr6: { cx: 805, cy: 504, s: 0.53 },
  cr7: { cx: 600, cy: 360, s: 1.06 },
  sent: { x: 40, y: 0, w: 370, font: 52 },
  ws: { x: 440, y: 50, w: 730, h: 615 },
  editor: { x: 440, y: 50, w: 730, h: 262 },
  preview: { x: 440, y: 330, w: 730, h: 335 },
  arts: {
    research: [190, 235], insight: [600, 205], decision: [1010, 245], requirement: [215, 470], workflow: [985, 470],
    idea: [610, 585], dependency: [420, 355], kpi: [790, 360], chart: [345, 615], button: [880, 625],
  },
  stats: { xs: [230, 600, 970], y: 345, font: 150, labelFont: 24, labelW: 300, ruleY: 205 },
};
const GEO_PORT: Geo = {
  W: 640, H: 1060,
  head: { y: 34, font: 50 },
  crW: 580, crH: 800,
  cr3: { cx: 320, cy: 620, s: 1 },
  cr5: { cx: 320, cy: 762, s: 0.5 },
  cr6: { cx: 320, cy: 856, s: 0.42 },
  cr7: { cx: 320, cy: 540, s: 1.02 },
  sent: { x: 30, y: 30, w: 580, font: 44 },
  ws: { x: 20, y: 300, w: 600, h: 740 },
  editor: { x: 20, y: 300, w: 600, h: 330 },
  preview: { x: 20, y: 645, w: 600, h: 395 },
  arts: {
    research: [170, 235], insight: [465, 300], decision: [180, 440], requirement: [460, 535], workflow: [175, 650],
    idea: [455, 760], dependency: [300, 870], kpi: [165, 950], chart: [470, 975], button: [330, 1030],
  },
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
/** Offset of an element inside an (untransformed) ancestor. */
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

export class Story {
  g: Geo = GEO_LAND;
  bx = 0; by = 0; bs = 1;
  private el: Record<string, HTMLElement>;
  private arts: Record<string, HTMLElement> = {};
  private artSize: Record<string, { w: number; h: number }> = {};
  private targets: Record<string, Rect> = {};
  private links: SVGLineElement[];
  private builds: HTMLElement[];
  private nodes: HTMLElement[];
  private statStrips: HTMLElement[][];
  private stats: HTMLElement[];
  private codeLines: HTMLElement[];
  private words: { figma: Rect; code: Rect } = { figma: { x: 0, y: 0, w: 0, h: 0 }, code: { x: 0, y: 0, w: 0, h: 0 } };
  private editRects: Rect[] = [];
  private btnView = { x: 0, y: 0, r: 0 };

  constructor(private root: HTMLElement) {
    const q = (s: string) => $(root, s);
    this.el = {
      board: q("[data-board]"),
      hComplex: q("[data-h=complex]"), hComplexU: q("[data-h=complex] [data-u]"),
      hClear: q("[data-h=clear]"), hClearU: q("[data-h=clear] [data-u]"),
      sent: q("[data-sent]"), s1: q("[data-s1]"), s1u: q("[data-s1u]"), s2: q("[data-s2]"), s2u: q("[data-s2u]"),
      wFigma: q("[data-w=figma]"), wCode: q("[data-w=code]"),
      linksSvg: q("[data-links]"),
      figma: q("[data-figma]"),
      sel: q("[data-fsel]"), selLab: q("[data-fsel-lab]"),
      editor: q("[data-editor]"), ghostChip: q("[data-ghost-chip]"), codeCaret: q("[data-code-caret]"),
      preview: q("[data-preview]"),
      cr: q("[data-cr]"), crPill: q("[data-cr-pill]"), progress: q("[data-progress]"),
      pcur: q("[data-pcur]"),
      statsWrap: q("[data-stats]"),
    };
    $$(root, "[data-art]").forEach((a) => (this.arts[a.dataset.art!] = a));
    this.links = $$<SVGLineElement>(root, "[data-links] line");
    this.builds = $$(root, "[data-cr] [data-b]");
    this.nodes = $$(root, "[data-cr] [data-node]");
    this.stats = $$(root, "[data-stat]");
    this.statStrips = this.stats.map((s) => $$(s, "[data-strip]"));
    this.codeLines = $$(root, "[data-line]");
  }

  layout(vw: number, vh: number) {
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
    [this.el.hComplex, this.el.hClear].forEach((h) => {
      h.style.fontSize = `${g.head.font}px`;
      h.style.top = `${g.head.y}px`;
    });
    // The two sentences: one column (left on landscape, top on portrait)
    const sent = this.el.sent;
    Object.assign(sent.style, { left: `${g.sent.x}px`, width: `${g.sent.w}px`, fontSize: `${g.sent.font}px` });
    sent.style.top = "0px";
    const sh = sent.offsetHeight;
    sent.style.top = `${port ? g.sent.y : (g.H - sh) / 2}px`;
    // Product + workspace geometry
    const cr = this.el.cr;
    cr.style.width = `${g.crW}px`;
    cr.style.height = `${g.crH}px`;
    const setRect = (el: HTMLElement, r: Rect) => Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    setRect(this.el.figma, g.ws);
    setRect(this.el.editor, g.editor);
    setRect(this.el.preview, g.preview);
    $$(cr, "[data-t]").forEach((t) => (this.targets[t.dataset.t!] = offsetIn(t, cr)));
    Object.entries(this.arts).forEach(([k, a]) => (this.artSize[k] = { w: a.offsetWidth, h: a.offsetHeight }));
    this.editRects = ["appr", "head", "btn", "flow"].map((k) => this.targets[k]);
    // Words the cursor hovers (board coordinates; units have no layout transform)
    const board = this.el.board;
    this.words = { figma: offsetIn(this.el.wFigma, board), code: offsetIn(this.el.wCode, board) };
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

  /** The Approve button (viewport px) where the finale's orange circle begins. */
  approveCenter() {
    return this.btnView;
  }

  /** Final product placement, including the camera zoom onto the button. */
  private livePlace(r: number): Place {
    const g = this.g, p = g.cr7;
    const z = inOutQuint(span(r, T.zoom));
    if (z <= 0) return p;
    const bt = this.targets.btn;
    const bx = bt.x + bt.w / 2, by = bt.y + bt.h / 2;
    const s2 = p.s * lerp(1, 1.75, z);
    const x0 = p.cx - (g.crW * p.s) / 2, y0 = p.cy - (g.crH * p.s) / 2;
    const fromX = x0 + bx * p.s, fromY = y0 + by * p.s;
    const toX = lerp(fromX, g.W / 2, z), toY = lerp(fromY, g.H / 2, z);
    const nx0 = toX - bx * s2, ny0 = toY - by * s2;
    return { cx: nx0 + (g.crW * s2) / 2, cy: ny0 + (g.crH * s2) / 2, s: s2 };
  }

  private placeCR(r: number): { p: Place; a: number } | null {
    const g = this.g;
    if (r < T.wireIn[0] || r >= T.sweep[1]) return null;
    if (r < T.sent1In[0]) return { p: g.cr3, a: outCubic(span(r, T.wireIn)) * (1 - span(r, T.wireOut)) };
    if (r < T.codeReveal[0]) return { p: g.cr5, a: outCubic(span(r, T.figmaReveal)) };
    if (r < T.toLive[0]) return { p: lerpP(g.cr5, g.cr6, inOutQuint(span(r, T.codeReveal))), a: 1 };
    // product: the built preview fades away; the product returns full-size as a wireframe
    const q = span(r, T.toLive);
    if (q < 0.45) return { p: g.cr6, a: 1 - q / 0.45 };
    return { p: this.livePlace(r), a: outCubic((q - 0.5) / 0.5) };
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

    /* ---------- 2 → 3: artefacts float, link, gather, assemble ---------- */
    const artsOn = r < T.wireIn[1] + 0.05;
    const assemble = inOutQuint(span(r, T.assemble));
    const gather = inOutQuint(span(r, T.gather));
    const centroids = GROUPS.map((grp) => {
      const pts = grp.map((k) => g.arts[k]);
      return [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    });
    const groupOf = (k: string) => GROUPS.findIndex((grp) => grp.includes(k));
    const artPos: Record<string, { x: number; y: number }> = {};
    ART_KEYS.forEach((k, i) => {
      const a = this.arts[k];
      if (!artsOn && k !== "button") return show(a, false);
      const size = this.artSize[k];
      const [hx, hy] = g.arts[k];
      const t = Math.max(0, r - T.scatter[0]);
      const fx = hx + Math.sin(t * (0.55 + i * 0.06) + i) * 12;
      const fy = hy + Math.cos(t * (0.45 + i * 0.05) + i * 1.7) * 10;
      const enter = outQuint(prog(r, T.scatter[0] + i * 0.035, T.scatter[0] + i * 0.035 + 0.65));
      const c = centroids[groupOf(k)];
      let x = lerp(lerp(origin.x, fx, enter), lerp(fx, c[0], 0.38), gather);
      let y = lerp(lerp(origin.y, fy, enter), lerp(fy, c[1], 0.38), gather);
      const tgt = this.crRect(g.cr3, ART_TARGET[k]);
      x = lerp(x, tgt.x + tgt.w / 2, assemble);
      y = lerp(y, tgt.y + tgt.h / 2, assemble);
      let w = lerp(size.w, tgt.w, assemble), h = lerp(size.h, tgt.h, assemble);
      let alpha = enter * (1 - prog(r, T.wireIn[0], T.wireIn[1]));
      if (k === "button") {
        alpha = enter;
        const toRule = inOutQuint(span(r, T.accentToRule));
        x = lerp(x, g.W / 2, toRule);
        y = lerp(y, g.stats.ruleY, toRule);
        w = lerp(w, 120, toRule);
        h = lerp(h, 6, toRule);
        a.style.setProperty("--label", String(1 - prog(r, T.accentToRule[0], T.accentToRule[0] + 0.2)));
        alpha *= 1 - span(r, T.statsOut);
        if (r >= T.sent1In[0]) alpha = 0;
      }
      artPos[k] = { x, y };
      show(a, alpha > 0.001);
      a.style.opacity = alpha.toFixed(3);
      a.style.width = `${w.toFixed(1)}px`;
      a.style.height = `${h.toFixed(1)}px`;
      a.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px,${(y - h / 2).toFixed(1)}px,0)`;
      a.style.setProperty("--detail", String(1 - assemble));
    });
    const linkDraw = outCubic(span(r, T.links));
    const linkFade = 1 - span(r, [T.assemble[0], T.assemble[0] + 0.5]);
    show(e.linksSvg, linkDraw > 0 && linkFade > 0);
    let li = 0;
    GROUPS.forEach((grp) => {
      for (let j = 0; j < grp.length - 1; j++) {
        const L = this.links[li++];
        if (!L || !artPos[grp[j]] || !artPos[grp[j + 1]]) continue;
        const p = artPos[grp[j]], q = artPos[grp[j + 1]];
        L.setAttribute("x1", p.x.toFixed(1));
        L.setAttribute("y1", p.y.toFixed(1));
        L.setAttribute("x2", lerp(p.x, q.x, linkDraw).toFixed(1));
        L.setAttribute("y2", lerp(p.y, q.y, linkDraw).toFixed(1));
        L.style.opacity = (0.75 * linkFade).toFixed(3);
      }
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

    /* ---------- 5 + 6: the two sentences (always whole) ---------- */
    const sentOn = r >= T.sent1In[0] && r < T.toLive[1];
    show(e.sent, sentOn);
    if (sentOn) {
      const out = inOutQuint(span(r, [T.toLive[0], T.toLive[0] + 0.4]));
      e.sent.style.opacity = (1 - out).toFixed(3);
      rise(e.s1u, outQuint(span(r, T.sent1In)));
      show(e.s2, r >= T.sent2In[0]);
      rise(e.s2u, outQuint(span(r, T.sent2In)));
      // the first sentence quietens once the second takes over (still fully visible)
      e.s1.style.opacity = (1 - 0.55 * outCubic(span(r, T.sent2In))).toFixed(3);
      const hvF = outCubic(prog(r, T.cursorToFigma[1] - 0.12, T.cursorToFigma[1] + 0.12)) * (1 - outCubic(span(r, [T.cursorToCode[0], T.cursorToCode[0] + 0.25])));
      const hvC = outCubic(prog(r, T.cursorToCode[1] - 0.12, T.cursorToCode[1] + 0.12));
      e.wFigma.style.setProperty("--hv", hvF.toFixed(3));
      e.wCode.style.setProperty("--hv", hvC.toFixed(3));
    }

    /* ---------- the product (one instance, chapters 3–7) ---------- */
    const pl = this.placeCR(r);
    show(e.cr, !!pl);
    if (pl) {
      const place = pl.p;
      e.cr.style.opacity = pl.a.toFixed(3);
      const x0 = place.cx - (g.crW * place.s) / 2, y0 = place.cy - (g.crH * place.s) / 2;
      e.cr.style.transform = `translate3d(${x0.toFixed(2)}px,${y0.toFixed(2)}px,0) scale(${place.s.toFixed(4)})`;
      const live = r >= T.toLive[1] - 0.3;
      // fidelity: wireframe (3) → designed by the Figma edits (5) → built (6);
      // in 7 it restarts as a wireframe and is polished region by region
      let f: number[];
      if (r < T.sent1In[0]) f = [0, 0, 0, 0];
      else if (r < T.toLive[0] + 0.25) f = T.edits.map((ed) => outCubic(prog(r, ed[0] + 0.1, ed[1])));
      else if (r < T.polish[0][0]) f = [0, 0, 0, 0];
      else f = T.polish.map((pp) => inOutQuint(prog(r, pp[0], pp[1])));
      // map polish order (type, components, cards, colour) onto the four regions
      const order = r >= T.polish[0][0] ? [f[2], f[0], f[3], f[1]] : f;
      order.forEach((v, i) => e.cr.style.setProperty(`--f${i + 1}`, v.toFixed(3)));
      e.cr.dataset.polished = String(r >= T.polish[3][1]);
      // build-up in the live preview: each part appears as its code line completes
      const cd = T.code[1] - T.code[0];
      const buildAt = [0.42, 0.57, 0.72, 0.86, 1.0].map((fr) => T.code[0] + fr * cd).concat(T.accept);
      const inCode = r >= T.codeReveal[0] && r < T.toLive[0] + 0.25;
      this.builds.forEach((b) => {
        const k = Number(b.dataset.b);
        let p = 1;
        if (inCode) p = r < T.code[0] ? 1 - prog(r, T.codeReveal[0], T.codeReveal[0] + 0.3) : outQuint(prog(r, buildAt[k], buildAt[k] + 0.32));
        b.style.opacity = p.toFixed(3);
        b.style.transform = p >= 1 ? "" : `translate3d(0,${((1 - p) * 10).toFixed(2)}px,0)`;
      });
      // live states (chapter 7)
      const dp = live ? inOutQuint(span(r, T.draftDone)) : 0;
      e.progress.style.transform = `scaleX(${(live ? lerp(0.35, 1, dp) : 0.35).toFixed(4)})`;
      const flowDone = live ? span(r, T.flowDone) : 0;
      this.nodes.forEach((n, i) => {
        const doneAt = i === 0 ? 0 : i === 1 ? (dp >= 1 ? 1 : 0) : i === 2 ? prog(r, T.flowDone[0], T.flowDone[0] + 0.2) : prog(r, T.flowDone[0] + 0.25, T.flowDone[1]);
        const state = live && doneAt >= 1 ? "done" : i === 0 ? "done" : i === 1 ? "running" : i === 2 ? "approval" : "waiting";
        if (n.dataset.state !== state) n.dataset.state = state;
        const m0 = n.querySelector<HTMLElement>("[data-m0]"), m1 = n.querySelector<HTMLElement>("[data-m1]");
        if (m0 && m1) {
          m0.style.opacity = String(1 - doneAt);
          m1.style.opacity = String(doneAt);
        }
      });
      const complete = flowDone >= 1;
      if (e.crPill.dataset.complete !== String(complete)) e.crPill.dataset.complete = String(complete);
      const hover = live ? outCubic(span(r, T.hover)) : 0;
      const press = r >= T.click && r < T.click + 0.16 ? 1 - Math.sin((Math.PI * (r - T.click)) / 0.16) * 0.06 : 1;
      e.cr.style.setProperty("--hover", hover.toFixed(3));
      e.cr.style.setProperty("--press", press.toFixed(4));
      e.cr.style.setProperty("--approved", String(live ? outCubic(prog(r, T.click + 0.08, T.click + 0.4)) : 0));
      if (r >= T.toLive[0]) {
        const bt = this.crRect(place, "btn");
        this.btnView = { ...this.toView(bt.x + bt.w / 2, bt.y + bt.h / 2), r: (Math.min(bt.w, bt.h) / 2) * this.bs };
      }
    }

    /* ---------- 5: Figma workspace + selection (revealed by hovering "Figma") ---------- */
    const figOn = r >= T.figmaReveal[0] && r < T.codeReveal[1];
    show(e.figma, figOn);
    if (figOn) {
      const inP = outQuint(span(r, T.figmaReveal)), outP = inOutQuint(span(r, T.codeReveal));
      e.figma.style.opacity = (inP * (1 - outP)).toFixed(3);
      e.figma.style.transform = `translate3d(0,${((1 - inP) * 16).toFixed(2)}px,0) scale(${(0.98 + 0.02 * inP).toFixed(4)})`;
      let active = -1;
      T.edits.forEach((ed, i) => { if (r >= ed[0]) active = i; });
      e.figma.dataset.active = String(active);
      const selOn = active >= 0 && r < T.codeReveal[0];
      show(e.sel, selOn);
      if (selOn) {
        const from = active > 0 ? this.editRects[active - 1] : this.editRects[0];
        const to = this.editRects[active];
        const m = inOutQuint(prog(r, T.edits[active][0], T.edits[active][0] + 0.28));
        const rr = { x: lerp(from.x, to.x, m), y: lerp(from.y, to.y, m), w: lerp(from.w, to.w, m), h: lerp(from.h, to.h, m) };
        const p = g.cr5;
        const x0 = p.cx - (g.crW * p.s) / 2, y0 = p.cy - (g.crH * p.s) / 2;
        e.sel.style.transform = `translate3d(${(x0 + rr.x * p.s - 3).toFixed(1)}px,${(y0 + rr.y * p.s - 3).toFixed(1)}px,0)`;
        e.sel.style.width = `${(rr.w * p.s + 6).toFixed(1)}px`;
        e.sel.style.height = `${(rr.h * p.s + 6).toFixed(1)}px`;
        e.sel.style.opacity = outCubic(prog(r, T.edits[0][0], T.edits[0][0] + 0.2)).toFixed(3);
        const lab = `${Math.round(rr.w)} × ${Math.round(rr.h)}`;
        if (e.selLab.textContent !== lab) e.selLab.textContent = lab;
      }
    }

    /* ---------- 6: editor (top) + developed product (bottom), revealed by hovering "code" ---------- */
    const codeOn = r >= T.codeReveal[0] && r < T.toLive[1];
    show(e.editor, codeOn);
    show(e.preview, codeOn);
    if (codeOn) {
      const inP = inOutQuint(span(r, T.codeReveal)), outP = inOutQuint(span(r, [T.toLive[0], T.toLive[0] + 0.4]));
      const a = (inP * (1 - outP)).toFixed(3);
      e.editor.style.opacity = a;
      e.preview.style.opacity = a;
      e.editor.style.transform = `translate3d(0,${((1 - inP) * -14).toFixed(1)}px,0)`;
      e.preview.style.transform = `translate3d(0,${((1 - inP) * 14).toFixed(1)}px,0)`;
      const typedLines = this.codeLines.filter((l) => !l.dataset.ghost && !l.dataset.after);
      const total = typedLines.reduce((acc, l) => acc + Number(l.dataset.len), 0);
      const n = Math.round(prog(r, T.code[0], T.code[1]) * total);
      let left = n, caretLine: HTMLElement | null = null, caretN = 0;
      this.codeLines.forEach((l) => {
        const len = Number(l.dataset.len);
        if (l.dataset.ghost) {
          show(l, r >= T.ghost[0]);
          l.dataset.accepted = String(r >= T.accept);
          l.style.setProperty("--n", String(len));
          if (r >= T.ghost[0] && r < T.accept) { caretLine = l; caretN = 0; }
          return;
        }
        if (l.dataset.after) {
          const k = Math.round(prog(r, T.accept + 0.1, T.accept + 0.35) * len);
          l.style.setProperty("--n", String(k));
          show(l, k > 0);
          if (k > 0 && k < len) { caretLine = l; caretN = k; }
          return;
        }
        const k = Math.max(0, Math.min(len, left));
        left -= len;
        l.style.setProperty("--n", String(k));
        show(l, k > 0 || (len === 0 && left >= 0));
        if (k > 0 && left <= 0 && r < T.ghost[0]) { caretLine = l; caretN = k; }
      });
      const cl = caretLine as HTMLElement | null;
      show(e.codeCaret, !!cl && r < T.codeHold);
      if (cl) e.codeCaret.style.transform = `translate3d(calc(${cl.offsetLeft}px + ${caretN}ch), ${cl.offsetTop}px, 0)`;
      e.ghostChip.style.opacity = (prog(r, T.ghost[0], T.ghost[0] + 0.2) * (1 - prog(r, T.accept, T.accept + 0.25))).toFixed(3);
    }

    /* ---------- the cursor: Figma → code → the Approve button ---------- */
    const curA = r >= T.cursorToFigma[0] && r < T.toLive[0] + 0.35;
    const curB = r >= T.cursorIn[0] && r < T.flowDone[1] + 0.1;
    show(e.pcur, curA || curB);
    if (curA || curB) {
      const wf = this.words.figma, wc = this.words.code;
      const atF = { x: wf.x + wf.w * 0.62, y: wf.y + wf.h * 0.72 };
      const atC = { x: wc.x + wc.w * 0.55, y: wc.y + wc.h * 0.72 };
      let x: number, y: number, a = 1;
      if (curA) {
        if (r < T.cursorToCode[0]) {
          const p = inOutQuint(span(r, T.cursorToFigma));
          // enter from the lower right along a gentle arc
          x = lerp(g.W * 0.58, atF.x, p);
          y = lerp(g.H * 0.98, atF.y, p) - Math.sin(Math.PI * p) * 30;
          a = outCubic(prog(r, T.cursorToFigma[0], T.cursorToFigma[0] + 0.2));
        } else {
          const p = inOutQuint(span(r, T.cursorToCode));
          x = lerp(atF.x, atC.x, p);
          y = lerp(atF.y, atC.y, p) - Math.sin(Math.PI * p) * 14;
        }
        a *= 1 - outCubic(span(r, [T.toLive[0], T.toLive[0] + 0.3]));
      } else {
        const btn = this.crRect(g.cr7, "btn");
        const p = inOutQuint(span(r, T.cursorIn));
        x = lerp(g.W * 0.86, btn.x + btn.w * 0.62, p);
        y = lerp(g.H * 0.98, btn.y + btn.h * 0.66, p) - Math.sin(Math.PI * p) * 24;
        a = outCubic(prog(r, T.cursorIn[0], T.cursorIn[0] + 0.2)) * (1 - prog(r, T.flowDone[1] - 0.15, T.flowDone[1] + 0.1));
        // follow the camera once it starts to zoom (the cursor rests on the button)
        if (r >= T.zoom[0]) {
          const zb = this.crRect(this.livePlace(r), "btn");
          x = zb.x + zb.w * 0.62;
          y = zb.y + zb.h * 0.66;
        }
      }
      const press = r >= T.click && r < T.click + 0.14 ? 0.86 : 1;
      e.pcur.style.opacity = a.toFixed(3);
      e.pcur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${press})`;
    }
  }
}
