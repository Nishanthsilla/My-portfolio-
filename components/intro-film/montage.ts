/**
 * The opener: an 8-second logo reel before the film proper ("Hello World"),
 * linked like a single shot. Ten scenes (OpenerScreens.tsx) on the beat of its
 * 150 BPM track; the logo stays one size, dead centre (the kinetic-type scene
 * takes the whole screen instead). Each scene hands over to the next in its
 * own way, over its last 0.5 s. The logo's full stop (the dot) opens the reel
 * and closes it:
 *
 *   bouncebar  the dot hops off the logo, lands, and stretches into a bar that floods the screen
 *   period     the full stop of "SHIPS." grows into the next scene
 *   zoom       the camera rushes in (blur) while the next scene flies up from the centre as a card
 *   ring       a construction circle expands from the centre and becomes the next scene
 *   canvas     the scene shrinks into the design tool's artboard: it was a design on the canvas
 *   burst      a cursor clicks the logo, it bursts into particles, the next scene opens behind them
 *   whip       a fast sideways swipe with motion blur
 *   doors      the scene splits open from the middle, like glass panels sliding apart
 *   push       the scene is pushed up and away by the next
 *   final      the dot grows into the warm-white page of "Hello World"
 */
import { INTRO_OPENER } from "@/lib/introConfig";

/** off (lib/introConfig.ts INTRO_OPENER = false): no opener, the film runs exactly as before */
export const MONTAGE = { at: 0, dur: INTRO_OPENER ? 8 : 0 } as const;
/** the logo's width, as a share of the screen's shorter side */
const LOGO_SIZE = 0.16;
/** how long each hand-over takes, at the end of a scene */
const T = 0.5;

type Tx = "bouncebar" | "period" | "zoom" | "ring" | "canvas" | "burst" | "whip" | "doors" | "push" | "final";
type Look = { mono?: string; dot?: string; hide?: boolean };
const SCENES: { screen: string; dur: number; tx: Tx; look: Look; edge?: string }[] = [
  { screen: "dark", dur: 0.8, tx: "bouncebar", look: { mono: "#3a3a3a", dot: "#f50427" } },
  { screen: "type", dur: 1.2, tx: "period", look: { hide: true }, edge: "#ffffff" },
  { screen: "toggle", dur: 0.8, tx: "zoom", look: {} },
  { screen: "blueprint", dur: 0.8, tx: "ring", look: { mono: "#fff" }, edge: "#ffffff" },
  { screen: "thermal", dur: 0.8, tx: "canvas", look: { mono: "#fff" } },
  { screen: "figma", dur: 0.8, tx: "burst", look: {} },
  { screen: "particles", dur: 0.8, tx: "whip", look: {} },
  { screen: "codebg", dur: 0.8, tx: "doors", look: { mono: "#fff" } },
  { screen: "glass", dur: 0.6, tx: "push", look: { mono: "#fff" } },
  { screen: "mesh", dur: 0.6, tx: "final", look: { mono: "#fff" } },
];
const STARTS = SCENES.reduce<number[]>((a, s, i) => [...a, i ? a[i - 1] + SCENES[i - 1].dur : 0], []);
export const FRAMES = SCENES.map((s, i) => ({ at: STARTS[i], screen: s.screen }));

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (t: number) => { t = clamp(t); return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const out3 = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const in2 = (t: number) => clamp(t) ** 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class Montage {
  private box: HTMLElement;
  private screens = new Map<string, HTMLElement>();
  private logo: HTMLElement;
  private dot: HTMLElement;
  private portal: HTMLElement;
  private ring: HTMLElement;
  private cursor: HTMLElement;
  private floor: HTMLElement;
  private edge: HTMLElement;
  private burst: HTMLElement;
  private bits: HTMLElement[];
  private period: HTMLElement | null;
  private W = 0;
  private H = 0;
  private L = 100;

  constructor(root: HTMLElement) {
    this.box = root.querySelector<HTMLElement>("[data-montage]")!;
    this.box.querySelectorAll<HTMLElement>("[data-screen]").forEach((s) => this.screens.set(s.dataset.screen!, s));
    const q = (s: string) => this.box.querySelector<HTMLElement>(s)!;
    this.logo = q("[data-ologo]");
    this.dot = q("[data-odot]");
    this.portal = q("[data-oportal]");
    this.ring = q("[data-oring]");
    this.cursor = q("[data-ocursor]");
    this.floor = q("[data-ofloor]");
    this.edge = q("[data-oedge]");
    this.burst = q("[data-oburst]");
    this.bits = Array.from(this.burst.children) as HTMLElement[];
    this.period = this.box.querySelector<HTMLElement>("[data-operiod]");
  }

  /** nothing to fetch: every screen is drawn */
  preload() {
    return Promise.resolve();
  }

  layout() {
    this.W = this.box.clientWidth || innerWidth;
    this.H = this.box.clientHeight || innerHeight;
    this.L = Math.min(this.W, this.H) * LOGO_SIZE;
    this.box.style.setProperty("--L", `${this.L}px`);
  }

  /** the dot's resting centre and size (px) */
  private home() {
    const lh = (this.L * 563) / 961;
    return { x: this.W / 2 + this.L * (872 / 961 - 0.5), y: this.H / 2 + lh * (481 / 563 - 0.5), w: (this.L * 178) / 961, h: (this.L * 164) / 961 };
  }

  private look(l: Look) {
    if (l.mono) this.logo.setAttribute("data-mono", "");
    else this.logo.removeAttribute("data-mono");
    this.logo.style.color = l.mono ?? "";
    this.dot.style.background = l.dot ?? "";
    this.logo.style.visibility = l.hide ? "hidden" : "";
  }

  private far(x: number, y: number) {
    return Math.hypot(Math.max(x, this.W - x), Math.max(y, this.H - y)) + 6;
  }

  private reset(s: HTMLElement) {
    s.style.clipPath = "";
    s.style.transform = "";
    s.style.filter = "";
    s.style.opacity = "";
    s.style.zIndex = "";
  }

  /** m: seconds into the opener, or null when it isn't playing. */
  render(m: number | null) {
    const on = m !== null && m >= 0 && m < MONTAGE.dur;
    this.box.style.visibility = on ? "visible" : "hidden";
    if (!on || !this.W) return;
    let k = 0;
    STARTS.forEach((st, i) => { if (m >= st) k = i; });
    const sc = SCENES[k], next = SCENES[k + 1];
    const start = STARTS[k], end = start + sc.dur;
    const p = clamp((m - (end - T)) / T); // 0 until the hand-over starts
    const cur = this.screens.get(sc.screen)!;
    const nxt = next ? this.screens.get(next.screen)! : null;
    const L = this.L, W = this.W, H = this.H, d = this.home();

    this.screens.forEach((s) => {
      if (s !== cur && s !== nxt) { s.removeAttribute("data-on"); this.reset(s); }
    });
    this.reset(cur);
    cur.setAttribute("data-on", "");
    cur.style.zIndex = "1";
    cur.style.setProperty("--m", (m - start).toFixed(3));
    if (nxt) { this.reset(nxt); nxt.style.setProperty("--m", "0"); }

    let dx = 0, dy = 0, sx = 1, sy = 1, grow = 1;
    let showNext = false, nextZ = 2;
    let reveal: { x: number; y: number; r: number } | null = null;
    let ring = 0, ringScale = 1, ringAt = { x: d.x, y: d.y }, edge = false, burstP = -1;
    let cursorAt: { x: number; y: number } | null = null;

    if (p > 0 && next && nxt) {
      switch (sc.tx) {
        case "bouncebar": {
          // hop, land (squash), then stretch into a bar that sweeps out and floods the screen
          const t = clamp(p / 0.4);
          dx = t * L * 1.3;
          dy = -Math.sin(Math.PI * t) * L * 1.2;
          if (p > 0.36 && p < 0.46) { sx = 1.5; sy = 0.6; }
          const a = inOut((p - 0.42) / 0.3), b = inOut((p - 0.62) / 0.38);
          if (p > 0.42) {
            const cx = d.x + L * 1.3, half = d.w / 2 + a * W, bh = d.h * (1 + a * 1.5);
            const top = d.y - bh / 2 - b * H, bottom = H - (d.y + bh / 2) - b * H;
            nxt.style.clipPath = `inset(${Math.max(0, top)}px ${Math.max(0, W - (cx + half))}px ${Math.max(0, bottom)}px ${Math.max(0, cx - half)}px round ${(b > 0 ? 0 : bh / 2).toFixed(1)}px)`;
            showNext = true;
            grow = 0;
          }
          break;
        }
        case "period": {
          // the full stop of "SHIPS." grows into the next scene
          const r0 = this.period?.getBoundingClientRect();
          const bx = this.box.getBoundingClientRect();
          const px = r0 ? r0.left - bx.left + r0.width / 2 : W / 2, py = r0 ? r0.top - bx.top + r0.height / 2 : H / 2;
          reveal = { x: px, y: py, r: lerp((r0?.width ?? 10) / 2, this.far(px, py), inOut(p)) };
          edge = false;
          break;
        }
        case "zoom": {
          // the camera rushes in (blur) while the next scene flies up from the centre as a card
          const z = in2(p);
          cur.style.transform = `scale(${(1 + z * 3).toFixed(3)})`;
          cur.style.filter = `blur(${(z * 14).toFixed(1)}px)`;
          const c = inOut(p);
          nxt.style.transform = `scale(${lerp(0.22, 1, c).toFixed(3)})`;
          nxt.style.clipPath = `inset(0 round ${((1 - c) * 6).toFixed(2)}vmin)`;
          nxt.style.opacity = String(clamp(p / 0.15));
          showNext = true;
          break;
        }
        case "ring": {
          // the construction circle expands from the centre and becomes the next scene
          reveal = { x: W / 2, y: H / 2, r: lerp(L * 1.3, this.far(W / 2, H / 2), inOut(p)) };
          edge = true;
          break;
        }
        case "canvas": {
          // the scene shrinks into the design tool's artboard (2.2 × 1.5 logos, centred)
          nextZ = 1;
          cur.style.zIndex = "2";
          const c = inOut(p / 0.8);
          const fw = L * 2.2, fh = L * 1.5;
          const ix = lerp(0, (W - fw) / 2, c), iy = lerp(0, (H - fh) / 2, c);
          cur.style.clipPath = `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px)`;
          cur.style.opacity = String(1 - clamp((p - 0.82) / 0.18));
          showNext = true;
          break;
        }
        case "burst": {
          // the cursor clicks the logo; it bursts into particles; the next scene opens behind them
          const g = inOut(p / 0.35);
          cursorAt = { x: W / 2 + L * 0.35 + L * 2.2 * (1 - g), y: H / 2 + L * 0.25 + L * 1.6 * (1 - g) };
          if (p > 0.34 && p < 0.42) { sx = sy = 0.8; }
          burstP = clamp((p - 0.38) / 0.62);
          const r = clamp((p - 0.42) / 0.58);
          if (r > 0) reveal = { x: W / 2, y: H / 2, r: out3(r) * this.far(W / 2, H / 2) };
          break;
        }
        case "whip": {
          // a fast sideways swipe with motion blur
          const c = inOut(p), blur = Math.sin(Math.PI * clamp(p)) * 18;
          cur.style.transform = `translateX(${(-c * 100).toFixed(2)}%)`;
          cur.style.filter = `blur(${blur.toFixed(1)}px)`;
          nxt.style.transform = `translateX(${((1 - c) * 100).toFixed(2)}%)`;
          nxt.style.filter = `blur(${blur.toFixed(1)}px)`;
          showNext = true;
          break;
        }
        case "doors": {
          // split open from the middle
          const c = inOut(p);
          nxt.style.clipPath = `inset(0 ${((1 - c) * 50).toFixed(2)}%)`;
          showNext = true;
          break;
        }
        case "push": {
          const c = inOut(p);
          cur.style.transform = `translateY(${(-c * 100).toFixed(2)}%)`;
          nxt.style.transform = `translateY(${((1 - c) * 100).toFixed(2)}%)`;
          showNext = true;
          break;
        }
      }
      if (reveal) {
        nxt.style.clipPath = `circle(${reveal.r.toFixed(1)}px at ${reveal.x.toFixed(1)}px ${reveal.y.toFixed(1)}px)`;
        showNext = true;
      }
    }

    // the toggle scene: the cursor clicks the switch and it turns red
    if (sc.screen === "toggle") {
      const tm = m - start;
      const tx = W / 2 + L * 0.3, ty = H / 2 + L * 0.95;
      const g = inOut(tm / 0.22);
      if (tm < 0.42) cursorAt = { x: tx + L * 1.6 * (1 - g), y: ty + L * 1.1 * (1 - g) };
      if (tm > 0.2 && tm < 0.55) { ring = 1 - clamp((tm - 0.22) / 0.3); ringScale = 0.6 + clamp((tm - 0.22) / 0.3) * 1.2; ringAt = { x: tx, y: ty }; }
    }

    if (nxt && showNext) {
      nxt.setAttribute("data-on", "");
      nxt.style.zIndex = String(nextZ);
    } else if (nxt) nxt.removeAttribute("data-on");

    // the edge of the opening scene, drawn as a bright ring
    const col = sc.edge ?? "#ffffff";
    if (edge && reveal && reveal.r > 2 && reveal.r < this.far(reveal.x, reveal.y) - 6) {
      this.edge.style.display = "block";
      this.edge.style.left = `${reveal.x}px`;
      this.edge.style.top = `${reveal.y}px`;
      this.edge.style.width = this.edge.style.height = `${(reveal.r * 2).toFixed(1)}px`;
      this.edge.style.borderColor = col;
    } else this.edge.style.display = "none";

    // the particles the logo bursts into
    if (burstP > 0 && burstP < 1) {
      this.burst.style.display = "block";
      this.burst.style.color = "#f50427";
      this.bits.forEach((b, i) => {
        const a = (i / this.bits.length) * Math.PI * 2 + i * 0.37;
        const dist = out3(burstP) * L * (1.4 + (i % 5) * 0.5);
        b.style.transform = `translate(${(W / 2 + Math.cos(a) * dist).toFixed(1)}px, ${(H / 2 + Math.sin(a) * dist).toFixed(1)}px) translate(-50%, -50%) scale(${(1.8 - burstP * 1.3).toFixed(2)})`;
        b.style.opacity = String(1 - in2(burstP));
      });
    } else this.burst.style.display = "none";

    // the logo takes the next scene's look once the new scene has reached it
    this.look(p > 0.7 && next ? next.look : sc.look);
    if (sc.tx === "burst" && burstP > 0) this.logo.style.opacity = String(clamp(1 - burstP * 3) + clamp((p - 0.75) / 0.25));
    else this.logo.style.opacity = "";

    // the dark opening: a line for the dot to land on
    this.floor.style.display = sc.screen === "dark" && p < 0.6 ? "block" : "none";
    this.floor.style.top = `${d.y + d.h / 2}px`;

    // the dot itself
    this.dot.style.transformOrigin = "50% 100%";
    this.dot.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${(sx * grow).toFixed(3)}, ${(sy * grow).toFixed(3)})`;

    this.ring.style.left = `${ringAt.x}px`;
    this.ring.style.top = `${ringAt.y}px`;
    this.ring.style.setProperty("--ro", ring.toFixed(3));
    this.ring.style.setProperty("--rs", ringScale.toFixed(3));
    this.ring.style.color = "#111";
    if (cursorAt) {
      this.cursor.style.display = "block";
      this.cursor.style.left = `${cursorAt.x}px`;
      this.cursor.style.top = `${cursorAt.y}px`;
    } else this.cursor.style.display = "none";

    // the end: the dot grows into the warm-white page that "Hello World" is typed on
    if (sc.tx === "final" && p > 0) {
      this.portal.style.display = "block";
      this.portal.style.clipPath = `circle(${(inOut(p) * this.far(d.x, d.y)).toFixed(1)}px at ${d.x}px ${d.y}px)`;
    } else this.portal.style.display = "none";
  }
}
