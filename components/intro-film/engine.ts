/**
 * Film renderer: render(r) sets the exact state of every element at film time
 * r (seconds). One clock, seekable to any frame. Motion rules: whole lines
 * (never per-letter jitter), quintic ease for travel, no overshoot or bounce,
 * one focal movement at a time.
 */
import { computeLayout, type Layout } from "./layout";
import { SystemScene } from "./system";
import {
  COLORS, DARK_RANGE, T, clamp01, inOutQuint, inQuint, lerp, outCubic, outQuint, prog, span,
} from "./timeline";

type Rect = { x: number; y: number; w: number; h: number };
const $ = <T extends Element = HTMLElement>(root: ParentNode, s: string) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(root: ParentNode, s: string) => Array.from(root.querySelectorAll<T>(s));
const rectOf = (el: Element): Rect => {
  const b = el.getBoundingClientRect();
  return { x: b.left, y: b.top, w: b.width, h: b.height };
};
/** Mask reveal: p=1 resting; p=0 hidden below (dir 1) or above (dir -1). */
function rise(el: HTMLElement, p: number, dir = 1) {
  el.style.transform = p >= 1 ? "none" : `translate3d(0,${((1 - p) * 140 * dir).toFixed(2)}%,0)`;
}
/** Shown elements inherit visibility, so a hidden parent always hides them. */
function show(el: HTMLElement, on: boolean) {
  const v = on ? "inherit" : "hidden";
  if (el.style.visibility !== v) el.style.visibility = v;
}
function hex(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(",")})`;
}
/** Measure an element with its own transform neutralised. */
function measureFlat<T>(els: HTMLElement[], fn: () => T): T {
  const saved = els.map((e) => e.style.transform);
  els.forEach((e) => (e.style.transform = "none"));
  const out = fn();
  els.forEach((e, i) => (e.style.transform = saved[i]));
  return out;
}

const CARD_BG = "#F1EEEA";

export class FilmEngine {
  L!: Layout;
  private system: SystemScene;
  private e: Record<string, HTMLElement>;
  private hc: HTMLElement[];
  private lines: HTMLElement[];
  private verbs: HTMLElement[];
  private caps: HTMLElement[];
  private vis: HTMLElement[];
  private visSize: { w: number; h: number }[];
  private stats: { wrap: HTMLElement; num: HTMLElement; strips: HTMLElement[]; lab: HTMLElement }[];
  private c1: HTMLElement[];
  private c2: HTMLElement[];
  private cc: HTMLElement[];
  private m!: {
    helloY: number; charRight: number[]; period: { x: number; y: number }; dot: number;
    cards: { w: number; h: number; s: number }[];
    caret: { x: number; y: number; h: number }[]; // after each typed char of the dark chapter
    figma: Rect; code: Rect; labelGap: number;
  };
  private logo: { x: number; y: number; r: number } | null = null;

  constructor(private root: HTMLElement) {
    const q = (s: string) => $(root, s);
    this.e = {
      stage: q("[data-stage]"), hello: q("[data-hello]"), caret: q("[data-caret]"),
      name: q("[data-name]"), nameUnit: q("[data-name-unit]"), period: q("[data-period]"), nbase: q("[data-nbase]"),
      pillMask: q("[data-pillmask]"), pill: q("[data-pill]"),
      head: q("[data-head]"), slot: q("[data-slot]"), hl: q("[data-hl]"), cap: q("[data-cap]"),
      blob: q("[data-blob]"),
      complex: q("[data-complex]"), complexU: q("[data-complex] [data-u]"),
      clear: q("[data-clear]"), clearU: q("[data-clear] [data-u]"),
      statsWrap: q("[data-stats]"),
      dark: q("[data-dark]"), block: q("[data-block]"), sel: q("[data-sel]"), selLab: q("[data-sellab]"), cur: q("[data-cur]"),
      wipe: q("[data-wipe]"),
    };
    this.hc = $$(root, "[data-hc]");
    this.lines = $$(root, "[data-hline]");
    this.verbs = $$(root, "[data-verb]");
    this.caps = $$(root, "[data-capi]");
    this.vis = $$(root, "[data-vis]");
    this.stats = $$(root, "[data-stat]").map((s) => ({ wrap: s, num: $(s, "[data-num]"), strips: $$(s, "[data-strip]"), lab: $(s, "[data-lab]") }));
    this.c1 = $$(root, "[data-c1]");
    this.c2 = $$(root, "[data-c2]");
    this.cc = $$(root, "[data-cc]");
    this.system = new SystemScene($<HTMLCanvasElement>(root, "[data-canvas]"));
    this.visSize = this.vis.map((v) => {
      const inner = v.firstElementChild!.firstElementChild as HTMLElement;
      return { w: inner.offsetWidth || 400, h: inner.offsetHeight || 260 };
    });
  }

  layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cs = getComputedStyle(this.root);
    const L = (this.L = computeLayout(vw, vh, cs.getPropertyValue("--film-sans") || "sans-serif", cs.getPropertyValue("--film-mono") || "monospace"));
    const e = this.e;
    const place = (el: HTMLElement, x: number, y: number, font: number) => {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.fontSize = `${font}px`;
    };
    place(e.hello, L.hello.x, L.hello.y, L.hello.font);
    place(e.name, L.name.x, L.name.y, L.name.font);
    place(e.pillMask, L.name.x, L.name.y + L.name.font * 0.62, L.pill.font);
    place(e.head, L.head.x, L.head.y, L.head.font);
    e.cap.style.fontSize = `${L.head.captionFont}px`;
    e.cap.style.width = `${L.head.captionW}px`;
    place(e.complex, L.ch4.x, L.ch4.y, L.ch4.font);
    place(e.clear, L.ch4.x, L.ch4.y, L.ch4.font);
    this.stats.forEach((s) => {
      s.num.style.fontSize = `${L.stats.heroFont}px`;
      s.lab.style.fontSize = `${L.stats.labelFont}px`;
    });
    place(e.dark, L.dark.x, L.dark.y1, L.dark.font);
    e.slot.style.width = `${Math.max(...this.verbs.map((v) => v.offsetWidth)) + 4}px`;

    const m = measureFlat([e.nameUnit], () => {
      const hb = rectOf(e.hello);
      const charRight = this.hc.map((c) => c.getBoundingClientRect().right - hb.x);
      const p = rectOf(e.period);
      const base = e.nbase.getBoundingClientRect().top;
      const dot = L.name.font * 0.15;
      const chars = [...this.c1, ...this.c2, ...this.cc].map((c) => rectOf(c));
      const caret = chars.map((r) => ({ x: r.x + r.w, y: r.y + r.h / 2, h: r.h }));
      const union = (rs: Rect[]): Rect => {
        const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
        return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
      };
      const figmaChars = this.c1.slice(-"Figma,".length).map((c) => rectOf(c));
      return {
        helloY: hb.y + hb.h / 2, charRight,
        period: { x: p.x + p.w / 2, y: base - dot * 0.62 }, dot,
        caret, figma: union(figmaChars), code: union(this.cc.map((c) => rectOf(c))), labelGap: 8,
      };
    });
    const pad = Math.max(12, Math.min(L.card.maxW, L.card.maxH) * 0.08);
    const cards = this.visSize.map(({ w, h }) => {
      const s = Math.min((L.card.maxW - pad * 2) / w, (L.card.maxH - pad * 2) / h, 1.3);
      return { w: w * s + pad * 2, h: h * s + pad * 2, s };
    });
    this.vis.forEach((v, i) => v.style.setProperty("--s", String(cards[i].s)));
    this.m = { ...m, cards };
    this.system.layout(L);
    this.logo = null;
  }

  private logoTarget() {
    if (this.logo) return this.logo;
    const dot = document.querySelector<HTMLElement>(".bar .mark i");
    const bar = document.querySelector<HTMLElement>(".bar");
    const wrap = document.querySelector<HTMLElement>(".bar .wrap");
    if (dot && bar && wrap) {
      const b = bar.getBoundingClientRect(), d = dot.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      this.logo = {
        x: b.left + wrap.offsetLeft + (d.left - w.left) + d.width / 2,
        y: b.top + wrap.offsetTop + (d.top - w.top) + d.height / 2,
        r: d.width / 2 || 4.5,
      };
    } else this.logo = { x: 28, y: 32, r: 4.5 };
    return this.logo;
  }

  render(r: number) {
    const L = this.L, m = this.m, e = this.e;
    if (!L || !m) return;
    const dark = r >= DARK_RANGE[0] - 0.05 && r < T.sweep[1];
    e.stage.style.background = dark ? COLORS.charcoal : COLORS.warm;
    e.stage.style.visibility = r < T.sweep[1] ? "" : "hidden";

    /* ---- Ch1: /* Hello World *\/ ---- */
    show(e.hello, r < T.collapse[1]);
    if (r < T.collapse[1]) {
      const typed = Math.floor(prog(r, T.typeStart, T.typeEnd) * this.hc.length + (r >= T.typeStart ? 1 : 0));
      const ink = prog(r, T.marksOut[0] - 0.15, T.marksOut[0] + 0.1);
      const marks = 1 - outCubic(span(r, T.marksOut));
      this.hc.forEach((c, i) => {
        show(c, i < typed);
        if (c.dataset.kind === "mark") c.style.opacity = String(marks);
        else c.style.color = mix(COLORS.helloGrey, COLORS.ink, ink);
      });
      const caretOn = r < T.marksOut[0] && (r < T.typeEnd + 0.1 || Math.floor((r - T.typeEnd) / 0.5) % 2 === 1);
      show(e.caret, caretOn);
      e.caret.style.transform = `translateX(${m.charRight[Math.max(0, Math.min(typed, this.hc.length) - 1)] ?? 0}px)`;
      const c = inOutQuint(span(r, T.collapse));
      e.hello.style.opacity = String(1 - c);
      e.hello.style.transform = `translate(-50%,-50%) scale(${(1 - 0.75 * c).toFixed(4)})`;
    }

    /* ---- The dot / cards (one object from Ch1 to Ch3) ---- */
    const blob = e.blob;
    let on = false, bx = 0, by = 0, bw = 0, bh = 0, round = 1, color = COLORS.orange, visK = -1, visA = 0;
    const cards = m.cards;
    if (r >= T.dotIn[0] && r < T.unfurl[0] + 0.05) {
      on = true;
      if (r < T.dotToPeriod[1]) {
        const a = inOutQuint(span(r, T.dotToPeriod));
        bx = lerp(L.cx, m.period.x, a);
        by = lerp(m.helloY, m.period.y, a) - Math.sin(Math.PI * a) * L.vh * 0.06;
        bw = bh = m.dot * outQuint(span(r, T.dotIn));
      } else if (r < T.dotToCard[0]) {
        bx = m.period.x; by = m.period.y; bw = bh = m.dot;
      } else if (r < T.cardIn[0]) {
        const a = inOutQuint(span(r, T.dotToCard));
        bx = lerp(m.period.x, L.card.cx, a);
        by = lerp(m.period.y, L.card.cy, a);
        bw = bh = lerp(m.dot, L.bigDot, a);
        color = mix(COLORS.orange, COLORS.charcoal, a);
      } else if (r < T.thing) {
        let k = -1;
        T.verbs.forEach((t, i) => { if (r >= t) k = i; });
        const from = k <= 0 ? { w: L.bigDot, h: L.bigDot } : cards[k - 1];
        const to = cards[Math.max(0, k)];
        const a = k <= 0 ? inOutQuint(span(r, T.cardIn)) : inOutQuint(prog(r, T.verbs[k], T.verbs[k] + 0.55));
        bw = lerp(from.w, to.w, a);
        bh = lerp(from.h, to.h, a);
        bx = L.card.cx; by = L.card.cy;
        round = k <= 0 ? 1 - a : 0;
        color = k <= 0 ? mix(COLORS.charcoal, CARD_BG, prog(a, 0, 0.45)) : CARD_BG;
        // visuals: in after the card has taken shape, out as the next one starts
        const kk = Math.max(0, k);
        visK = kk;
        const inA = k <= 0 ? prog(r, T.cardIn[1] - 0.25, T.cardIn[1] + 0.15) : prog(r, T.verbs[kk] + 0.3, T.verbs[kk] + 0.65);
        visA = inA;
        if (k >= 0 && k < T.verbs.length - 1) visA *= 1 - prog(r, T.verbs[k + 1], T.verbs[k + 1] + 0.18);
      } else {
        const a = inOutQuint(span(r, T.cardToDot));
        const last = cards[cards.length - 1];
        bw = lerp(last.w, m.dot * 1.3, a);
        bh = lerp(last.h, m.dot * 1.3, a);
        bx = L.card.cx; by = L.card.cy;
        round = a;
        color = mix(CARD_BG, COLORS.charcoal, a);
        visK = cards.length - 1;
        visA = 1 - prog(r, T.cardToDot[0], T.cardToDot[0] + 0.15);
        if (r > T.unfurl[0]) bw = bh = m.dot * 1.3 * (1 - prog(r, T.unfurl[0], T.unfurl[0] + 0.05));
      }
    } else if (r >= T.pullBack[0] + 0.25 && r < DARK_RANGE[0]) {
      // Ch6: a charcoal dot appears where the stats gathered, then opens into the dark chapter
      on = true;
      color = COLORS.charcoal;
      bx = L.cx; by = L.cy;
      const cover = Math.hypot(L.vw, L.vh) * 1.08;
      const d0 = m.dot * 1.4 * outQuint(prog(r, T.pullBack[0] + 0.25, T.pullBack[1]));
      const g = span(r, T.darkGrow);
      bw = bh = g <= 0 ? d0 : d0 * Math.exp(Math.log(cover / Math.max(d0, 1)) * inOutQuint(g));
    }
    show(blob, on);
    if (on) {
      blob.style.transform = `translate3d(${(bx - bw / 2).toFixed(2)}px,${(by - bh / 2).toFixed(2)}px,0)`;
      blob.style.width = `${bw.toFixed(2)}px`;
      blob.style.height = `${bh.toFixed(2)}px`;
      const min = Math.min(bw, bh);
      blob.style.borderRadius = `${lerp(Math.min(24, min * 0.09), min / 2, round).toFixed(2)}px`;
      blob.style.background = color;
      this.vis.forEach((v, i) => {
        const a = i === visK ? visA : 0;
        v.style.opacity = a.toFixed(3);
        v.style.transform = `translate(-50%,-50%) scale(calc(var(--s) * ${(0.97 + 0.03 * outCubic(a)).toFixed(4)}))`;
      });
    }

    /* ---- Ch2: I’m Nishanth. + title ---- */
    show(e.name, r >= T.nameIn[0] && r < T.nameOut[1]);
    if (r >= T.nameIn[0] && r < T.nameOut[1]) {
      rise(e.nameUnit, r < T.nameOut[0] ? outQuint(span(r, T.nameIn)) : 1 - inQuint(span(r, T.nameOut)), 1);
    }
    show(e.pillMask, r >= T.pillIn[0] && r < T.nameOut[1]);
    if (r >= T.pillIn[0] && r < T.nameOut[1]) {
      rise(e.pill, r < T.nameOut[0] ? outQuint(span(r, T.pillIn)) : 1 - inQuint(prog(r, T.nameOut[0] - 0.05, T.nameOut[1] - 0.1)), -1);
    }

    /* ---- Ch3: I make things / that help others / do their … ---- */
    show(e.head, r >= T.lines[0] && r < T.headOut[1]);
    if (r >= T.lines[0] && r < T.headOut[1]) {
      this.lines.forEach((l, i) => {
        if (r < T.headOut[0]) rise(l, outQuint(prog(r, T.lines[i], T.lines[i] + T.lineDur)));
        else rise(l, 1 - inQuint(prog(r, T.headOut[0] + i * 0.06, T.headOut[0] + i * 0.06 + 0.32)), -1);
      });
      const starts = [...T.verbs, T.thing];
      this.verbs.forEach((v, i) => {
        const a = starts[i], b = starts[i + 1] ?? Infinity;
        if (r < a || r >= b + 0.3) return show(v, false);
        show(v, true);
        if (r >= T.headOut[0]) return rise(v, 1 - inQuint(prog(r, T.headOut[0] + 0.12, T.headOut[0] + 0.44)), -1);
        if (r < b) rise(v, outQuint(prog(r, a + 0.12, a + 0.57)));
        else rise(v, 1 - inQuint(prog(r, b, b + 0.3)), -1);
      });
      e.hl.style.transform = `scaleX(${outQuint(span(r, T.highlight)).toFixed(4)})`;
      this.caps.forEach((c, i) => {
        const a = starts[i], b = starts[i + 1] ?? T.headOut[0];
        const inP = outCubic(prog(r, a + 0.45, a + 0.85));
        const outP = prog(r, b, b + 0.15);
        const on2 = r >= a + 0.45 && r < b + 0.15;
        show(c, on2);
        if (on2) {
          c.style.opacity = (inP * (1 - outP)).toFixed(3);
          c.style.transform = `translate3d(0,${((1 - inP) * 0.35).toFixed(3)}em,0)`;
        }
      });
    }

    /* ---- Ch4: complexity → clarity ---- */
    this.system.render(r);
    show(e.complex, r >= T.complexIn[0] && r < T.complexOut[1]);
    if (r >= T.complexIn[0] && r < T.complexOut[1]) {
      rise(e.complexU, r < T.complexOut[0] ? outQuint(span(r, T.complexIn)) : 1 - inQuint(span(r, T.complexOut)), r < T.complexOut[0] ? 1 : -1);
    }
    show(e.clear, r >= T.clearIn[0] && r < T.clearOut[1]);
    if (r >= T.clearIn[0] && r < T.clearOut[1]) {
      rise(e.clearU, r < T.clearOut[0] ? outQuint(span(r, T.clearIn)) : 1 - inQuint(span(r, T.clearOut)), r < T.clearOut[0] ? 1 : -1);
    }

    /* ---- Ch5: proof — one number at a time, then a calm row ---- */
    const statsOn = r >= T.statStart && r < T.pullBack[1];
    show(e.statsWrap, statsOn);
    if (statsOn) {
      const pull = inOutQuint(span(r, T.pullBack));
      this.stats.forEach((s, k) => {
        const S = T.statStart + k * T.statEvery;
        const onK = r >= S;
        show(s.wrap, onK);
        if (!onK) return;
        const mv = inOutQuint(prog(r, S + T.statToRow, S + T.statToRow + 0.6));
        const settle = inOutQuint(span(r, T.rowSettle));
        const stage = L.stats.stage[k], fin = L.stats.slots[k];
        const sx = lerp(stage.x, fin.x, settle), sy = lerp(stage.y, fin.y, settle);
        let x = lerp(L.stats.heroX, sx, mv);
        let y = lerp(L.stats.heroY, sy, mv);
        let sc = lerp(1, L.stats.rowScale, mv);
        x = lerp(x, L.cx, pull); y = lerp(y, L.cy, pull); sc *= 1 - 0.25 * pull;
        s.wrap.style.opacity = String(1 - pull);
        // the number rises gently into place while its digits roll once and settle
        const up = outQuint(prog(r, S, S + 0.7));
        const lift = (1 - up) * L.stats.heroFont * 0.18 * sc;
        s.num.style.opacity = up.toFixed(3);
        s.num.style.transform = `translate3d(${x.toFixed(2)}px,${(y + lift).toFixed(2)}px,0) translate(-50%,-50%) scale(${sc.toFixed(4)})`;
        s.strips.forEach((st, c) => {
          const target = Number(st.dataset.target);
          const p = outQuint(prog(r, S + 0.05 + c * 0.08, S + 1.0 + c * 0.08));
          st.style.transform = `translate3d(0,${(-target * p * 10).toFixed(3)}%,0)`;
        });
        const lp = outCubic(prog(r, S + 0.55, S + 0.95));
        const numH = L.stats.heroFont * 0.78 * sc;
        s.lab.style.opacity = String(lp * (1 - pull));
        s.lab.style.transform = `translate3d(${x.toFixed(2)}px,${(y + numH / 2 + L.stats.labelFont * 0.9 + (1 - lp) * 8).toFixed(2)}px,0) translateX(-50%)`;
      });
    }

    /* ---- Ch6: craft — I design it in Figma, / then ship it in code. ---- */
    const darkOn = r >= DARK_RANGE[0] && r < T.sweep[1];
    show(e.dark, darkOn);
    show(e.block, darkOn);
    const all = [...this.c1, ...this.c2, ...this.cc];
    if (darkOn) {
      const n1 = this.c1.length, n2 = this.c2.length, n3 = this.cc.length;
      const t1 = Math.round(prog(r, T.type1[0], T.type1[1]) * n1);
      const t2 = Math.round(prog(r, T.type2[0], T.type2[1]) * n2);
      const t3 = Math.round(prog(r, T.typeCode[0], T.typeCode[1]) * n3);
      const typed = t1 + (t1 >= n1 ? t2 : 0) + (t2 >= n2 ? t3 : 0);
      all.forEach((c, i) => show(c, i < typed));
      // solid block cursor after the last typed character; grows into the finale circle
      const at = typed > 0 ? m.caret[typed - 1] : { x: L.dark.x, y: L.dark.y1 + L.dark.font * 0.62, h: L.dark.font * 1.2 };
      const g = inOutQuint(span(r, T.blockToCircle));
      const w0 = L.dark.font * 0.42, h0 = at.h * 0.72;
      const size = lerp(w0, L.bigDot * 1.4, g), hh = lerp(h0, L.bigDot * 1.4, g);
      const cx = at.x + L.dark.font * 0.06 + w0 / 2;
      e.block.style.transform = `translate3d(${(cx - size / 2).toFixed(2)}px,${(at.y - hh / 2).toFixed(2)}px,0)`;
      e.block.style.width = `${size.toFixed(2)}px`;
      e.block.style.height = `${hh.toFixed(2)}px`;
      e.block.style.borderRadius = `${lerp(3, Math.min(size, hh) / 2, g).toFixed(2)}px`;
      e.block.dataset.cx = String(cx);
      e.block.dataset.cy = String(at.y);
      // Figma-style selection: draws around "Figma,", later glides to "code."
      const selOn = r >= T.selIn[0] && r < T.blockToCircle[0];
      show(e.sel, selOn);
      show(e.cur, selOn);
      if (selOn) {
        const hop = inOutQuint(span(r, T.selToCode));
        const box = {
          x: lerp(m.figma.x, m.code.x, hop) - 5,
          y: lerp(m.figma.y, m.code.y, hop) - 2,
          w: lerp(m.figma.w, m.code.w + w0 * 1.4, hop) + 10,
          h: lerp(m.figma.h, m.code.h, hop) + 4,
        };
        const draw = outQuint(span(r, T.selIn));
        e.sel.style.transform = `translate3d(${box.x.toFixed(2)}px,${box.y.toFixed(2)}px,0)`;
        e.sel.style.width = `${box.w.toFixed(2)}px`;
        e.sel.style.height = `${box.h.toFixed(2)}px`;
        e.sel.style.clipPath = `inset(-12px ${((1 - draw) * 100).toFixed(2)}% ${((1 - draw) * 100).toFixed(2)}% -12px)`;
        const lab = `${Math.round(box.w)} × ${Math.round(box.h)}`;
        if (e.selLab.textContent !== lab) e.selLab.textContent = lab;
        e.selLab.style.opacity = String(prog(r, T.selIn[1] - 0.1, T.selIn[1] + 0.15));
        e.cur.style.opacity = e.selLab.style.opacity;
        e.cur.style.transform = `translate3d(${(box.x + box.w + 4).toFixed(2)}px,${(box.y + box.h + 4).toFixed(2)}px,0)`;
      }
    }

    /* ---- Ch7: the sweep and the handoff into the logo dot ---- */
    if (r >= T.sweep[0]) {
      show(e.wipe, true);
      const cover = Math.hypot(L.vw, L.vh) * 1.15;
      const sx = Number(e.block.dataset.cx) || L.cx, sy = Number(e.block.dataset.cy) || L.cy;
      let x = sx, y = sy, rad: number;
      if (r < T.handoff[0]) {
        rad = lerp(L.bigDot * 0.7, cover, inOutQuint(span(r, T.sweep)));
      } else {
        const t = this.logoTarget();
        const p = inOutQuint(span(r, T.handoff));
        x = lerp(sx, t.x, p);
        y = lerp(sy, t.y, p);
        rad = lerp(cover, t.r, Math.pow(p, 0.8));
      }
      e.wipe.style.clipPath = `circle(${rad.toFixed(2)}px at ${x.toFixed(2)}px ${y.toFixed(2)}px)`;
    } else show(e.wipe, false);
  }
}
