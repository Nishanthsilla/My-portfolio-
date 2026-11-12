/**
 * The film renderer. render(r) draws the exact state of every element at
 * reference time r (seconds), so the whole film runs off one clock and can be
 * seeked to any frame. Scene numbers match the storyboard (S1–S17).
 */
import { film } from "./content";
import { computeLayout, type Layout } from "./layout";
import { Particles } from "./particles";
import {
  COLORS, HANDOFF, VERB_TIMES, WIPE_FULL, clamp01, inCubic, inOutCubic, lerp, outBack, outCubic, prog,
} from "./timeline";

type Rect = { x: number; y: number; w: number; h: number };
const $ = <T extends Element = HTMLElement>(root: ParentNode, s: string) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(root: ParentNode, s: string) => Array.from(root.querySelectorAll<T>(s));
const rel = (el: Element): Rect => {
  const b = el.getBoundingClientRect();
  return { x: b.left, y: b.top, w: b.width, h: b.height };
};

/** Vertical mask reveal: 1 → resting, 0 → hidden below (dir 1) or above (dir -1). */
function rise(el: HTMLElement, p: number, dir = 1) {
  el.style.transform = p >= 1 ? "none" : `translate3d(0,${((1 - p) * 140 * dir).toFixed(2)}%,0)`;
}
/** Shown elements inherit visibility (so a hidden parent always hides them). */
function show(el: HTMLElement, on: boolean) {
  const v = on ? "inherit" : "hidden";
  if (el.style.visibility !== v) el.style.visibility = v;
}
function setText(el: HTMLElement, s: string) {
  if (el.textContent !== s) el.textContent = s;
}
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export class FilmEngine {
  L!: Layout;
  private particles: Particles;
  private el: Record<string, HTMLElement>;
  private hc: HTMLElement[];
  private nl: HTMLElement[];
  private lines: HTMLElement[];
  private verbs: HTMLElement[];
  private caps: HTMLElement[];
  private vis: HTMLElement[];
  private visSize: { w: number; h: number }[] = [];
  private cw: HTMLElement[];
  private clw: HTMLElement[];
  private stats: { num: HTMLElement[]; lab: HTMLElement; wrap: HTMLElement }[];
  private dw1: HTMLElement[];
  private dw2: HTMLElement[];
  private cc: HTMLElement[];
  private m: {
    helloLeft: number; charRight: number[]; helloY: number; helloH: number;
    period: { x: number; y: number }; dot: number;
    figma: Rect; code: Rect; codeRight: number[]; line2Right: number[];
    cards: { w: number; h: number; s: number }[];
  } = null!;
  private logo: { x: number; y: number; r: number } | null = null;

  constructor(private root: HTMLElement) {
    this.el = {
      stage: $(root, "[data-stage]"),
      hello: $(root, "[data-hello]"),
      caret: $(root, "[data-caret]"),
      name: $(root, "[data-name]"),
      period: $(root, "[data-period]"),
      nbase: $(root, "[data-nbase]"),
      pill: $(root, "[data-pill]"),
      pillText: $(root, "[data-pill-text]"),
      head: $(root, "[data-head]"),
      slot: $(root, "[data-slot]"),
      hl: $(root, "[data-hl]"),
      cap: $(root, "[data-cap]"),
      blob: $(root, "[data-blob]"),
      complex: $(root, "[data-complex]"),
      clear: $(root, "[data-clear]"),
      statsWrap: $(root, "[data-stats]"),
      dark: $(root, "[data-dark]"),
      figmaMask: $(root, "[data-figma]"),
      codeMask: $(root, "[data-code]"),
      block: $(root, "[data-block]"),
      sel: $(root, "[data-sel]"),
      selLab: $(root, "[data-sellab]"),
      chip: $(root, "[data-chip]"),
      cur: $(root, "[data-cur]"),
      wipe: $(root, "[data-wipe]"),
    };
    this.hc = $$(root, "[data-hc]");
    this.nl = $$(root, "[data-nl]");
    this.lines = $$(root, "[data-hline]");
    this.verbs = $$(root, "[data-verb]");
    this.caps = $$(root, "[data-capi]");
    this.vis = $$(root, "[data-vis]");
    this.cw = $$(root, "[data-cw]");
    this.clw = $$(root, "[data-clw]");
    this.stats = $$(root, "[data-stat]").map((s) => ({ wrap: s, num: $$(s, "[data-d]"), lab: $(s, "[data-lab]") }));
    this.dw1 = $$(root, "[data-dw1]");
    this.dw2 = $$(root, "[data-dw2]");
    this.cc = $$(root, "[data-cc]");
    this.particles = new Particles($<HTMLCanvasElement>(root, "[data-canvas]"));
    // Natural sizes of the project visuals (measured once, unscaled).
    this.visSize = this.vis.map((v) => {
      const inner = v.firstElementChild!.firstElementChild as HTMLElement;
      return { w: inner.offsetWidth || 400, h: inner.offsetHeight || 260 };
    });
  }

  /** Recompute the responsive layout and re-measure text. Call on resize. */
  layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cs = getComputedStyle(this.root);
    const sans = cs.getPropertyValue("--film-sans") || "sans-serif";
    const mono = cs.getPropertyValue("--film-mono") || "monospace";
    const L = (this.L = computeLayout(vw, vh, sans, mono));
    const e = this.el;
    const place = (el: HTMLElement, x: number, y: number, font: number) => {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.fontSize = `${font}px`;
    };
    place(e.hello, L.hello.x, L.hello.y, L.hello.font);
    place(e.name, L.name.x, L.name.y, L.name.font);
    place(e.pill, L.pill.x, L.pill.y, L.pill.font);
    place(e.head, L.head.x, L.head.y, L.head.font);
    e.cap.style.fontSize = `${L.head.captionFont}px`;
    e.cap.style.width = `${L.head.captionW}px`;
    place(e.complex, L.center.x, L.center.y, L.center.font);
    place(e.clear, L.center.x, L.center.y, L.center.font);
    this.stats.forEach((s, i) => {
      place(s.wrap, L.stats.pos[i].x, L.stats.pos[i].y, L.stats.numFont);
      s.lab.style.fontSize = `${L.stats.labelFont}px`;
    });
    place(e.dark, L.dark.x, L.dark.y1, L.dark.font);
    // The verb slot is as wide as the widest verb.
    e.slot.style.width = `${Math.max(...this.verbs.map((v) => v.offsetWidth)) + 4}px`;

    // Measurements (masks are never transformed, so rects are stable)
    const hb = rel(e.hello);
    const charRight = this.hc.map((c) => {
      const b = c.getBoundingClientRect();
      return b.right - hb.x;
    });
    const nb = rel(e.period);
    const base = e.nbase.getBoundingClientRect().top;
    const dot = L.name.font * 0.15;
    const figma = rel(e.figmaMask);
    const code = rel(e.codeMask);
    const codeRight = this.cc.map((c) => c.parentElement!.getBoundingClientRect().right);
    const line2Right = this.dw2.map((w) => w.parentElement!.getBoundingClientRect().right);
    const pad = Math.max(10, Math.min(L.card.maxW, L.card.maxH) * 0.07);
    const cards = this.visSize.map(({ w, h }) => {
      const s = Math.min((L.card.maxW - pad * 2) / w, (L.card.maxH - pad * 2) / h, 1.3);
      return { w: w * s + pad * 2, h: h * s + pad * 2, s };
    });
    this.vis.forEach((v, i) => (v.style.setProperty("--s", String(cards[i].s))));
    this.m = {
      helloLeft: hb.x, charRight, helloY: hb.y + hb.h / 2, helloH: hb.h,
      period: { x: nb.x + nb.w / 2, y: base - dot * 0.62 }, dot,
      figma, code, codeRight, line2Right, cards,
    };
    const cr = e.complex.getBoundingClientRect();
    this.particles.layout(L, { hw: cr.width / 2 + L.u, hh: cr.height / 2 });
    this.logo = null;
  }

  /** Where the orange lands at the end: the logo dot in the portfolio header. */
  private logoTarget() {
    if (this.logo) return this.logo;
    const dot = document.querySelector<HTMLElement>(".bar .mark i");
    const bar = document.querySelector<HTMLElement>(".bar");
    const wrap = document.querySelector<HTMLElement>(".bar .wrap");
    if (dot && bar && wrap) {
      // Final (untransformed) position: the header may still be animating in.
      const b = bar.getBoundingClientRect();
      const d = dot.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      const x = b.left + wrap.offsetLeft + (d.left - w.left) + d.width / 2;
      const y = b.top + wrap.offsetTop + (d.top - w.top) + d.height / 2;
      this.logo = { x, y, r: d.width / 2 || 4.5 };
    } else {
      this.logo = { x: 28, y: 32, r: 4.5 };
    }
    return this.logo;
  }

  render(r: number) {
    const L = this.L, m = this.m, e = this.el;
    if (!L || !m) return;

    // Background: white, then charcoal once the circle has filled (S15+).
    const dark = r >= 11.03;
    e.stage.style.background = dark ? COLORS.charcoal : COLORS.white;
    e.stage.style.visibility = r < WIPE_FULL ? "" : "hidden";

    /* ---------------- S1–S2: "/* Hello World *\/" ---------------- */
    show(e.hello, r < 0.82);
    if (r < 0.82) {
      const typed = Math.floor(clamp01((r + 0.2) / 0.53) * this.hc.length);
      const k = Math.floor(prog(r, 0.58, 0.8) * 6.5); // collapse from both ends
      const wordIdx = this.hc.filter((c) => c.dataset.kind === "word");
      this.hc.forEach((c, i) => {
        const isMark = c.dataset.kind === "mark";
        let visible = i < typed;
        if (isMark) {
          c.style.opacity = String(1 - prog(r, 0.42, 0.54));
          c.style.display = r > 0.56 ? "none" : "";
        } else {
          const j = wordIdx.indexOf(c);
          if (j < k || j > wordIdx.length - 1 - k) visible = false;
          c.style.display = r > 0.58 && !visible ? "none" : "";
          c.style.color = r < 0.4 ? COLORS.helloGrey : COLORS.ink;
        }
        c.style.visibility = visible ? "inherit" : "hidden";
      });
      const caretOn = r < 0.42 && Math.floor((r + 0.2) / 0.25) % 2 === 0 ? true : r < 0.36;
      show(e.caret, caretOn && r < 0.42);
      const last = Math.max(0, typed - 1);
      e.caret.style.transform = `translateX(${typed ? m.charRight[last] : 0}px)`;
    }

    /* ---------------- S2–S8: the dot / card / square (one object) ---------------- */
    const blob = e.blob;
    let bx = 0, by = 0, bw = 0, bh = 0, br = 50, bc: string = COLORS.orange, bOn = false, visK = -1, visA = 0;
    const cards = m.cards;
    if (r >= 0.8 && r < 6.45) {
      bOn = true;
      const hx = L.cx, hy = m.helloY;
      if (r < 0.95) {
        const p = outBack(prog(r, 0.8, 0.86));
        const hop = outCubic(prog(r, 0.86, 0.95));
        bx = lerp(hx, hx + L.u * 4, hop);
        by = lerp(hy, hy - L.u * 3, hop);
        bw = bh = m.dot * p;
      } else if (r < 2.42) {
        const p = outBack(prog(r, 0.95, 1.24));
        bx = lerp(L.cx + L.u * 4, m.period.x, p);
        by = lerp(m.helloY - L.u * 3, m.period.y, p) - Math.sin(Math.PI * clamp01(p)) * L.u * 2;
        bw = bh = m.dot;
      } else if (r < 2.86) {
        const p = inOutCubic(prog(r, 2.42, 2.67));
        bx = lerp(m.period.x, L.card.cx, p);
        by = lerp(m.period.y, L.card.cy, p);
        bw = bh = lerp(m.dot, L.bigDot, p);
      } else if (r < 6.0) {
        // morph into the first card, then between cards on each word change
        let k = -1;
        VERB_TIMES.forEach((t, i) => { if (r >= t) k = i; });
        // r < 3.0: dot → first card. Each word change: previous card → next card.
        const from = k <= 0 ? { w: L.bigDot, h: L.bigDot } : cards[k - 1];
        const to = cards[Math.max(0, k)];
        const p = k <= 0 ? inOutCubic(prog(r, 2.86, 3.0)) : inOutCubic(prog(r, VERB_TIMES[k], VERB_TIMES[k] + 0.2));
        bw = lerp(from.w, to.w, p);
        bh = lerp(from.h, to.h, p);
        bx = L.card.cx;
        by = L.card.cy;
        const minSide = Math.min(bw, bh);
        const cardR = (Math.min(28, minSide * 0.1) / minSide) * 100;
        br = k <= 0 ? lerp(50, cardR, p) : cardR;
        bc = r < 2.94 ? COLORS.orange : r < 3.0 ? COLORS.orangeDeep : "#F3F3F3";
        visK = r < 3.0 ? -1 : k;
        visA = r < 3.0 ? 0 : k === 0 ? prog(r, 3.0, 3.12) : prog(r, VERB_TIMES[k] + 0.07, VERB_TIMES[k] + 0.2);
      } else {
        const shrink = inOutCubic(prog(r, 6.0, 6.1));
        const grow = outBack(prog(r, 6.12, 6.4));
        const last = cards[cards.length - 1];
        const small = m.dot * 1.3;
        const sq = L.bigDot * 1.35;
        bw = r < 6.1 ? lerp(last.w, small, shrink) : lerp(small, sq, grow);
        bh = r < 6.1 ? lerp(last.h, small, shrink) : lerp(small, sq, grow);
        br = r < 6.1 ? lerp(8, 50, shrink) : lerp(50, 22, prog(r, 6.12, 6.3));
        bc = COLORS.charcoal;
        bx = L.card.cx;
        by = L.card.cy;
        visK = 5;
        visA = 1 - prog(r, 6.0, 6.05);
      }
    } else if (r >= 10.1 && r < 11.06) {
      // S13–S14: the centre tile becomes charcoal, rounds into a circle and fills the screen
      bOn = true;
      const c = this.particles.center;
      const cover = Math.hypot(L.vw, L.vh) * 1.08;
      // Exponential growth reads as a camera push: slow, then rushing to fill.
      const g = prog(r, 10.6, 11.04);
      const grow = g <= 0 ? 1 : Math.exp(Math.log(cover / c.size) * Math.pow(g, 1.35));
      const settle = 1 - 0.12 * Math.sin(Math.PI * prog(r, 10.25, 10.6));
      bw = bh = c.size * settle * grow;
      br = lerp(22, 50, inOutCubic(prog(r, 10.62, 10.88)));
      bc = COLORS.charcoal;
      bx = c.x;
      by = c.y;
    }
    show(blob, bOn);
    if (bOn) {
      blob.style.transform = `translate3d(${(bx - bw / 2).toFixed(1)}px,${(by - bh / 2).toFixed(1)}px,0)`;
      blob.style.width = `${bw.toFixed(1)}px`;
      blob.style.height = `${bh.toFixed(1)}px`;
      blob.style.borderRadius = br >= 49.9 ? "50%" : `${(br / 100) * Math.min(bw, bh)}px`;
      blob.style.background = bc;
      this.vis.forEach((v, i) => {
        const a = i === visK ? visA : 0;
        v.style.opacity = a.toFixed(3);
        v.style.transform = `translate(-50%,-50%) scale(calc(var(--s) * ${(0.92 + 0.08 * a).toFixed(3)}))`;
      });
    }

    /* ---------------- S3–S5: "I’m Nishanth." + title pill ---------------- */
    show(e.name, r >= 0.9 && r < 2.62);
    if (r >= 0.9 && r < 2.62) {
      this.nl.forEach((l, i) => {
        if (r < 2.25) rise(l, outCubic(prog(r, 0.92 + i * 0.026, 1.08 + i * 0.026)));
        else rise(l, 1 - inCubic(prog(r, 2.25 + i * 0.024, 2.39 + i * 0.024)), 1);
      });
    }
    show(e.pill, r >= 1.28 && r < 2.28);
    if (r >= 1.28 && r < 2.28) {
      const t = film.title;
      const appear = outCubic(prog(r, 1.28, 1.36));
      e.pill.style.opacity = String(appear * (1 - prog(r, 2.2, 2.27)));
      e.pill.style.transform = `translate(-50%,0) scale(${(0.85 + 0.15 * appear).toFixed(3)})`;
      let s: string;
      if (r < 2.0) {
        const n = Math.floor(prog(r, 1.33, 1.67) * t.length);
        const seed = Math.floor(r * 40);
        const noise = n < t.length ? SCRAMBLE[(seed * 7 + n) % SCRAMBLE.length] + SCRAMBLE[(seed * 13 + n * 3) % SCRAMBLE.length] : "";
        s = t.slice(0, n) + noise;
      } else {
        s = t.slice(0, Math.ceil(t.length * (1 - prog(r, 2.0, 2.2))));
      }
      setText(e.pillText, s || " ");
    }

    /* ---------------- S6–S8: "I make things / that help others / do their …" ---------------- */
    show(e.head, r >= 2.62 && r < 6.75);
    if (r >= 2.62 && r < 6.75) {
      this.lines.forEach((l, i) => {
        if (r < 6.5) rise(l, outCubic(prog(r, 2.67 + i * 0.08, 2.87 + i * 0.08)));
        else rise(l, 1 - inCubic(prog(r, 6.5 + i * 0.04, 6.66 + i * 0.04)), -1);
      });
      const starts = [...VERB_TIMES, 6.0];
      this.verbs.forEach((v, i) => {
        const a = starts[i], b = starts[i + 1] ?? 99;
        if (r < a || r >= b + 0.09) return show(v, false);
        show(v, true);
        if (r >= 6.5) return rise(v, 1 - inCubic(prog(r, 6.58, 6.74)), -1);
        if (r < b) rise(v, outCubic(prog(r, a + 0.03, a + 0.17)));
        else rise(v, 1 - inCubic(prog(r, b, b + 0.08)), -1);
      });
      e.hl.style.transform = `scaleX(${outCubic(prog(r, 6.02, 6.16)).toFixed(3)})`;
      this.caps.forEach((c, i) => {
        const a = starts[i], b = starts[i + 1] ?? 99;
        const on = r >= a && r < b;
        show(c, on);
        if (on) {
          const p = prog(r, a + 0.04, a + 0.22);
          c.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(1)}% 0 0)`;
          c.style.opacity = String(1 - prog(r, 6.45, 6.6));
        }
      });
    }

    /* ---------------- S9–S13: burst → grid (canvas) ---------------- */
    this.particles.render(r);

    show(e.complex, r >= 6.8 && r < 7.98);
    if (r >= 6.8 && r < 7.98) {
      this.cw.forEach((w, i) => {
        if (r < 7.75) rise(w, outCubic(prog(r, 6.83 + i * 0.07, 7.03 + i * 0.07)));
        else rise(w, 1 - inCubic(prog(r, 7.75 + i * 0.04, 7.9 + i * 0.04)), 1);
      });
    }
    show(e.clear, r >= 8.14 && r < 8.98);
    if (r >= 8.14 && r < 8.98) {
      this.clw.forEach((w, i) => {
        if (r < 8.75) rise(w, outCubic(prog(r, 8.17 + i * 0.06, 8.37 + i * 0.06)));
        else rise(w, 1 - inCubic(prog(r, 8.75 + i * 0.04, 8.9 + i * 0.04)), 1);
      });
    }

    /* ---------------- S12: stats ---------------- */
    show(e.statsWrap, r >= 8.98 && r < 10.12);
    if (r >= 8.98 && r < 10.12) {
      this.stats.forEach((s, j) => {
        show(s.wrap, true);
        const p = r < 9.97 ? outCubic(prog(r, 9.0 + j * 0.06, 9.2 + j * 0.06)) : 1 - inCubic(prog(r, 9.97 + j * 0.03, 10.09 + j * 0.03));
        s.num.forEach((d, c) => {
          rise(d, p, r < 9.97 ? 1 : -1);
          const target = d.dataset.v!;
          const lock = 9.14 + j * 0.08 + c * 0.05;
          const digit = /\d/.test(target);
          setText(d, digit && r < lock ? String((Math.floor(r * 30) * (c + 3) + j * 7) % 10) : target);
        });
        s.lab.style.opacity = String(outCubic(prog(r, 9.12 + j * 0.06, 9.3 + j * 0.06)) * (1 - prog(r, 9.97, 10.05)));
      });
    }

    /* ---------------- S16: "I design it in Figma, / then ship it in code." ---------------- */
    show(e.dark, r >= 11.3 && r < WIPE_FULL);
    if (r >= 11.3 && r < WIPE_FULL) {
      const t1 = [11.42, 11.5, 11.58, 11.67, 11.75];
      const t2 = [12.08, 12.25, 12.33, 12.42];
      this.dw1.forEach((w, i) => rise(w, outCubic(prog(r, t1[i], t1[i] + 0.12))));
      this.dw2.forEach((w, i) => rise(w, outCubic(prog(r, t2[i], t2[i] + 0.12))));
      const typed = Math.floor(clamp01((r - 12.5) / 0.175) * this.cc.length + (r >= 12.5 ? 1 : 0));
      this.cc.forEach((c, i) => show(c, i < typed));
      // block cursor follows the typing, then grows into the wipe (S17)
      const bOn2 = r >= 12.46;
      show(e.block, bOn2);
      const codeTop = m.code.y;
      const blockH = m.code.h * 0.72;
      const blockX = typed > 0 ? m.codeRight[Math.min(typed, this.cc.length) - 1] + L.dark.font * 0.08 : m.code.x;
      if (bOn2) {
        const g = outBack(prog(r, 12.9, 13.0));
        const w0 = L.dark.font * 0.42;
        const size = lerp(w0, L.bigDot * 1.2, g);
        const h = lerp(blockH, L.bigDot * 1.2, g);
        const y = codeTop + (m.code.h - blockH) / 2 + blockH / 2;
        e.block.style.transform = `translate3d(${(blockX + w0 / 2 - size / 2).toFixed(1)}px,${(y - h / 2).toFixed(1)}px,0)`;
        e.block.style.width = `${size}px`;
        e.block.style.height = `${h}px`;
        e.block.style.borderRadius = `${lerp(3, size * 0.3, g)}px`;
      }
      // Figma-style selection box: on "Figma," at 11.75, hops to "code." at 12.5
      const selOn = r >= 11.75 && r < 12.9;
      show(e.sel, selOn);
      show(e.cur, selOn);
      if (selOn) {
        const hop = inOutCubic(prog(r, 12.5, 12.64));
        const box = {
          x: lerp(m.figma.x, m.code.x, hop) - 4,
          y: lerp(m.figma.y, m.code.y, hop),
          w: lerp(m.figma.w, m.code.w + L.dark.font * 0.5, hop) + 8,
          h: lerp(m.figma.h, m.code.h, hop),
        };
        const pop = outBack(prog(r, 11.75, 11.84));
        e.sel.style.transform = `translate3d(${box.x.toFixed(1)}px,${box.y.toFixed(1)}px,0)`;
        e.sel.style.width = `${box.w.toFixed(1)}px`;
        e.sel.style.height = `${box.h.toFixed(1)}px`;
        e.sel.style.opacity = String(clamp01(pop));
        setText(e.selLab, `${Math.round(box.w)} × ${Math.round(box.h)}`);
        e.cur.style.transform = `translate3d(${(box.x + box.w + 6).toFixed(1)}px,${(box.y + box.h + 6).toFixed(1)}px,0) scale(${clamp01(pop).toFixed(3)})`;
      }
      const chipOn = r >= 12.27 && r < 12.5;
      show(e.chip, chipOn);
      if (chipOn) {
        const words = this.dw2.filter((_, i) => r >= t2[i]).length;
        const x = m.line2Right[Math.max(0, words - 1)] + L.dark.font * 0.25;
        e.chip.style.transform = `translate3d(${x.toFixed(1)}px,${(m.code.y + m.code.h * 0.55).toFixed(1)}px,0)`;
      }
    }

    /* ---------------- S17 + handoff: orange wipe → logo dot ---------------- */
    const wipe = e.wipe;
    if (r >= 13.0) {
      show(wipe, true);
      const cover = Math.hypot(L.vw, L.vh) * 1.05;
      let x: number, y: number, rad: number;
      const bb = e.block.getBoundingClientRect();
      const start = { x: bb.left + bb.width / 2 || L.vw * 0.7, y: bb.top + bb.height / 2 || L.cy };
      if (r < HANDOFF[0]) {
        const p = Math.pow(prog(r, 13.0, 13.38), 1.35);
        x = start.x;
        y = start.y;
        rad = lerp(L.bigDot * 0.6, cover * 1.3, p);
      } else {
        const t = this.logoTarget();
        const p = inOutCubic(prog(r, HANDOFF[0], HANDOFF[1]));
        x = lerp(start.x, t.x, p);
        y = lerp(start.y, t.y, p);
        rad = lerp(cover * 1.3, t.r, Math.pow(p, 0.72));
      }
      wipe.style.clipPath = `circle(${rad.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
    } else {
      show(wipe, false);
    }
  }
}
