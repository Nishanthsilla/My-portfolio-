/**
 * Film renderer: render(r) sets the exact state of every element at film time
 * r (seconds) — one clock, seekable to any frame. The prologue and chapter 1
 * live here; chapters 2–7 are staged by Story (story.ts); the finale sweep and
 * the handoff into the portfolio's logo dot are here again.
 * Motion rules: whole lines/words (never per-letter jitter), quintic easing for
 * travel, no overshoot, one focal movement at a time.
 */
import { computeLayout, type Layout } from "./layout";
import { Story } from "./story";
import { COLORS, T, clamp01, inOutCubic, inOutQuint, inQuint, lerp, outCubic, outQuint, prog, readBrandColors, span } from "./timeline";

const $ = <E extends Element = HTMLElement>(root: ParentNode, s: string) => root.querySelector<E>(s)!;
const $$ = <E extends Element = HTMLElement>(root: ParentNode, s: string) => Array.from(root.querySelectorAll<E>(s));
const rectOf = (el: Element) => {
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
  const s = h.trim().replace("#", "");
  const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(",")})`;
}

const CARD_BG = "#F2EFEB";

export class FilmEngine {
  L!: Layout;
  story: Story;
  private e: Record<string, HTMLElement>;
  private hc: HTMLElement[];
  private lines: HTMLElement[];
  private verbs: HTMLElement[];
  private caps: HTMLElement[];
  private vis: HTMLElement[];
  private visSize: { w: number; h: number }[];
  private m!: { helloY: number; charRight: number[]; period: { x: number; y: number }; dot: number; cards: { w: number; h: number; s: number }[] };
  private logo: { x: number; y: number; r: number } | null = null;

  constructor(private root: HTMLElement) {
    const q = (s: string) => $(root, s);
    this.e = {
      stage: q("[data-stage]"), hello: q("[data-hello]"), caret: q("[data-caret]"),
      name: q("[data-name]"), nameUnit: q("[data-name-unit]"), period: q("[data-period]"), nbase: q("[data-nbase]"),
      pillMask: q("[data-pillmask]"), pill: q("[data-pill]"),
      head: q("[data-head]"), slot: q("[data-slot]"), hl: q("[data-hl]"), cap: q("[data-cap]"),
      blob: q("[data-blob]"), wipe: q("[data-wipe]"),
    };
    this.hc = $$(root, "[data-hc]");
    this.lines = $$(root, "[data-hline]");
    this.verbs = $$(root, "[data-verb]");
    this.caps = $$(root, "[data-capi]");
    this.vis = $$(root, "[data-vis]");
    this.story = new Story(root);
    this.visSize = this.vis.map((v) => {
      const inner = v.firstElementChild!.firstElementChild as HTMLElement;
      return { w: inner.offsetWidth || 400, h: inner.offsetHeight || 260 };
    });
  }

  layout() {
    readBrandColors();
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

    // Verb window: sized from the real font box of the widest/tallest verb, so
    // descenders (g, p, y) and the final full stop are never clipped.
    const vw2 = Math.max(...this.verbs.map((v) => v.offsetWidth));
    const vh2 = Math.max(...this.verbs.map((v) => v.offsetHeight));
    e.slot.style.width = `${Math.ceil(vw2 + L.head.font * 0.12)}px`;
    e.slot.style.height = `${Math.ceil(vh2)}px`;

    const saved = e.nameUnit.style.transform;
    e.nameUnit.style.transform = "none";
    // the caret follows the typing, which happens at Regular weight
    e.hello.style.fontWeight = "400";
    this.hc.forEach((c) => (c.style.transform = ""));
    const hb = rectOf(e.hello);
    const p = rectOf(e.period);
    const base = e.nbase.getBoundingClientRect().top;
    e.nameUnit.style.transform = saved;
    const dot = L.name.font * 0.15;
    const pad = Math.max(12, Math.min(L.card.maxW, L.card.maxH) * 0.08);
    const cards = this.visSize.map(({ w, h }) => {
      const s = Math.min((L.card.maxW - pad * 2) / w, (L.card.maxH - pad * 2) / h, 1.6);
      return { w: w * s + pad * 2, h: h * s + pad * 2, s };
    });
    this.vis.forEach((v, i) => v.style.setProperty("--s", String(cards[i].s)));
    this.m = {
      helloY: hb.y + hb.h / 2,
      charRight: this.hc.map((c) => c.getBoundingClientRect().right - hb.x),
      period: { x: p.x + p.w / 2, y: base - dot * 0.62 },
      dot,
      cards,
    };
    this.story.layout(vw, vh);
    this.logo = null;
  }

  private logoTarget() {
    if (this.logo) return this.logo;
    const dot = document.querySelector<HTMLElement>(".bar .mark i");
    const bar = document.querySelector<HTMLElement>(".bar");
    const wrap = document.querySelector<HTMLElement>(".bar .wrap");
    if (dot && bar && wrap) {
      const b = bar.getBoundingClientRect(), d = dot.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      this.logo = { x: b.left + wrap.offsetLeft + (d.left - w.left) + d.width / 2, y: b.top + wrap.offsetTop + (d.top - w.top) + d.height / 2, r: d.width / 2 || 4.5 };
    } else this.logo = { x: 28, y: 32, r: 4.5 };
    return this.logo;
  }

  render(r: number) {
    const L = this.L, m = this.m, e = this.e;
    if (!L || !m) return;
    // once the ASCII bridge is fully opaque, the stage underneath is no longer needed
    e.stage.style.visibility = r < T.asciiIn[1] || r >= T.crIn[0] ? "" : "hidden";

    /* ---- Prologue: /* Hello World *\/ ---- */
    show(e.hello, r < T.collapse[1]);
    if (r < T.collapse[1]) {
      const typed = Math.floor(prog(r, T.typeStart, T.typeEnd) * this.hc.length + (r >= T.typeStart ? 1 : 0));
      // settle: Regular → Semibold, grey → ink, while the marks part to either side
      const st = inOutCubic(span(r, T.settle));
      const ink = outCubic(span(r, T.settle));
      const wgt = lerp(400, 600, st).toFixed(1);
      if (e.hello.style.fontWeight !== wgt) e.hello.style.fontWeight = wgt;
      const away = (0.15 + 0.85 * st) * st * 0.9; // em, outward
      const markA = 1 - prog(st, 0.55, 1);
      const half = this.hc.length / 2;
      this.hc.forEach((c, i) => {
        show(c, i < typed);
        if (c.dataset.kind === "mark") {
          c.style.opacity = markA.toFixed(3);
          c.style.transform = `translate3d(${((i < half ? -1 : 1) * away).toFixed(4)}em,0,0)`;
        } else c.style.color = mix(COLORS.helloGrey, COLORS.ink, ink);
      });
      show(e.caret, r < T.settle[0]);
      e.caret.style.transform = `translateX(${m.charRight[Math.max(0, Math.min(typed, this.hc.length) - 1)] ?? 0}px)`;
      const c = inOutQuint(span(r, T.collapse));
      e.hello.style.opacity = String(1 - c);
      e.hello.style.transform = `translate(-50%,-50%) scale(${(1 - 0.75 * c).toFixed(4)})`;
    }

    /* ---- The dot and the project cards ---- */
    const blob = e.blob;
    let on = false, bx = 0, by = 0, bw = 0, bh = 0, round = 1, color = COLORS.orange, visK = -1, visA = 0;
    const cards = m.cards;
    if (r >= T.dotIn[0] && r < T.scatter[0] + 0.05) {
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
        const a = k <= 0 ? inOutQuint(span(r, T.cardIn)) : inOutQuint(prog(r, T.verbs[k], T.verbs[k] + 0.4));
        bw = lerp(from.w, to.w, a);
        bh = lerp(from.h, to.h, a);
        bx = L.card.cx; by = L.card.cy;
        round = k <= 0 ? 1 - a : 0;
        color = k <= 0 ? mix(COLORS.charcoal, CARD_BG, prog(a, 0, 0.45)) : CARD_BG;
        const kk = Math.max(0, k);
        visK = kk;
        visA = k <= 0 ? prog(r, T.cardIn[1] - 0.2, T.cardIn[1] + 0.12) : prog(r, T.verbs[kk] + 0.22, T.verbs[kk] + 0.45);
        if (k >= 0 && k < T.verbs.length - 1) visA *= 1 - prog(r, T.verbs[k + 1], T.verbs[k + 1] + 0.14);
      } else {
        const a = inOutQuint(span(r, T.cardToDot));
        const last = cards[cards.length - 1];
        bw = lerp(last.w, m.dot * 1.3, a);
        bh = lerp(last.h, m.dot * 1.3, a);
        bx = L.card.cx; by = L.card.cy;
        round = a;
        color = mix(CARD_BG, COLORS.orange, a);
        visK = cards.length - 1;
        visA = 1 - prog(r, T.cardToDot[0], T.cardToDot[0] + 0.12);
        if (r > T.scatter[0]) bw = bh = m.dot * 1.3 * (1 - prog(r, T.scatter[0], T.scatter[0] + 0.05));
      }
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

    /* ---- Prologue: I’m Nishanth. + title ---- */
    show(e.name, r >= T.nameIn[0] && r < T.nameOut[1]);
    if (r >= T.nameIn[0] && r < T.nameOut[1]) {
      rise(e.nameUnit, r < T.nameOut[0] ? outQuint(span(r, T.nameIn)) : 1 - inQuint(span(r, T.nameOut)), 1);
    }
    show(e.pillMask, r >= T.pillIn[0] && r < T.nameOut[1]);
    if (r >= T.pillIn[0] && r < T.nameOut[1]) {
      rise(e.pill, r < T.nameOut[0] ? outQuint(span(r, T.pillIn)) : 1 - inQuint(prog(r, T.nameOut[0] - 0.05, T.nameOut[1] - 0.1)), -1);
    }

    /* ---- 1: I make things / that help others / do their … ---- */
    show(e.head, r >= T.lines[0] && r < T.headOut[1]);
    if (r >= T.lines[0] && r < T.headOut[1]) {
      this.lines.forEach((l, i) => {
        if (r < T.headOut[0]) rise(l, outQuint(prog(r, T.lines[i], T.lines[i] + T.lineDur)));
        else rise(l, 1 - inQuint(prog(r, T.headOut[0] + i * 0.05, T.headOut[0] + i * 0.05 + 0.25)), -1);
      });
      const starts = [...T.verbs, T.thing];
      this.verbs.forEach((v, i) => {
        const a = starts[i], b = starts[i + 1] ?? Infinity;
        if (r < a || r >= b + 0.24) return show(v, false);
        show(v, true);
        if (r >= T.headOut[0]) return rise(v, 1 - inQuint(prog(r, T.headOut[0] + 0.1, T.headOut[0] + 0.35)), -1);
        if (r < b) rise(v, outQuint(prog(r, a + 0.06, a + 0.36)));
        else rise(v, 1 - inQuint(prog(r, b, b + 0.22)), -1);
      });
      e.hl.style.transform = `scaleX(${outQuint(span(r, T.highlight)).toFixed(4)})`;
      this.caps.forEach((c, i) => {
        const a = starts[i], b = starts[i + 1] ?? T.headOut[0];
        const inP = outCubic(prog(r, a + 0.2, a + 0.42));
        const outP = prog(r, b, b + 0.1);
        const on2 = r >= a + 0.2 && r < b + 0.1;
        show(c, on2);
        if (on2) {
          c.style.opacity = (inP * (1 - outP)).toFixed(3);
          c.style.transform = `translate3d(0,${((1 - inP) * 0.3).toFixed(3)}em,0)`;
        }
      });
    }

    /* ---- 2–7: the story board ---- */
    const s = this.story;
    this.story.render(r, { x: (L.card.cx - s.bx) / s.bs, y: (L.card.cy - s.by) / s.bs });

    /* ---- Finale: Gradient ASCII → the product → one click → Zoom Through into the button
            (story.ts + zoom.ts). ---- */

  }
}
