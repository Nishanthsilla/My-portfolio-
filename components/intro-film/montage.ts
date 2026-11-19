/**
 * The opener: an 8-second logo reel before the film proper ("Hello World"),
 * linked like a single shot. Ten scenes (OpenerScreens.tsx), 0.8 s each (two
 * beats of its 150 BPM track); the logo stays one size, dead centre, and its
 * full stop (the dot) carries every scene into the next:
 *
 *   bounce  the dot hops like a ball; where it lands, the next scene opens in a circle
 *   bar     the dot stretches into a bar that sweeps across, then fills the screen
 *   circle  the next scene grows out of the dot
 *   click   a cursor glides in and clicks the dot; the click opens the next scene
 *   final   the dot grows into the warm-white page of "Hello World"
 */
import { INTRO_OPENER } from "@/lib/introConfig";

/** off (lib/introConfig.ts INTRO_OPENER = false): no opener, the film runs exactly as before */
export const MONTAGE = { at: 0, dur: INTRO_OPENER ? 8 : 0 } as const;
/** the logo's width, as a share of the screen's shorter side */
const LOGO_SIZE = 0.16;
/** how long each hand-over takes, at the end of a scene */
const T = 0.34;

type Tx = "bounce" | "bar" | "circle" | "click" | "final";
type Look = { mono?: string; dot?: string };
const SCENES: { screen: string; tx: Tx; look: Look }[] = [
  { screen: "dark", tx: "bounce", look: { mono: "#3a3a3a", dot: "#f50427" } },
  { screen: "warm", tx: "bar", look: { mono: "#fff" } },
  { screen: "blueprint", tx: "circle", look: { mono: "#fff" } },
  { screen: "thermal", tx: "click", look: { mono: "#fff" } },
  { screen: "figma", tx: "circle", look: {} },
  { screen: "particles", tx: "bounce", look: {} },
  { screen: "toggle", tx: "circle", look: {} },
  { screen: "codebg", tx: "bar", look: { mono: "#fff" } },
  { screen: "glass", tx: "circle", look: { mono: "#fff" } },
  { screen: "mesh", tx: "final", look: { mono: "#fff" } },
];
const STEP = MONTAGE.dur / SCENES.length;
export const FRAMES = SCENES.map((s, i) => ({ at: i * STEP, screen: s.screen }));

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out3 = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

export class Montage {
  private box: HTMLElement;
  private screens = new Map<string, HTMLElement>();
  private logo: HTMLElement;
  private dot: HTMLElement;
  private portal: HTMLElement;
  private ring: HTMLElement;
  private cursor: HTMLElement;
  private floor: HTMLElement;
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

  /** the dot's centre on screen (px) */
  private dotCentre() {
    const lh = (this.L * 563) / 961;
    return { x: this.W / 2 + this.L * (872 / 961 - 0.5), y: this.H / 2 + lh * (481 / 563 - 0.5), w: (this.L * 178) / 961, h: (this.L * 164) / 961 };
  }

  private look(l: Look) {
    if (l.mono) this.logo.setAttribute("data-mono", "");
    else this.logo.removeAttribute("data-mono");
    this.logo.style.color = l.mono ?? "";
    this.dot.style.background = l.dot ?? "";
  }

  /** m: seconds into the opener, or null when it isn't playing. */
  render(m: number | null) {
    const on = m !== null && m >= 0 && m < MONTAGE.dur;
    this.box.style.visibility = on ? "visible" : "hidden";
    if (!on || !this.W) return;
    const k = Math.min(SCENES.length - 1, Math.floor(m / STEP));
    const sc = SCENES[k], next = SCENES[k + 1];
    const start = k * STEP, end = start + STEP;
    const p = clamp((m - (end - T)) / T); // 0 until the hand-over starts
    const cur = this.screens.get(sc.screen)!;
    const nxt = next ? this.screens.get(next.screen)! : null;

    this.screens.forEach((s) => {
      if (s !== cur && s !== nxt) {
        s.removeAttribute("data-on");
        s.style.clipPath = "";
        s.style.zIndex = "";
      }
    });
    cur.setAttribute("data-on", "");
    cur.style.clipPath = "";
    cur.style.zIndex = "1";
    cur.style.setProperty("--m", (m - start).toFixed(3));

    const d = this.dotCentre();
    const far = Math.hypot(Math.max(d.x, this.W - d.x), Math.max(d.y, this.H - d.y)) + 4;
    // the next scene stays hidden until its hand-over opens it
    let clip = "circle(0px at 0px 0px)", dotY = 0, sx = 1, sy = 1, showRing = 0, ringScale = 1, cursorAt: { x: number; y: number } | null = null;

    if (p > 0 && next) {
      if (sc.tx === "circle") clip = `circle(${(inOut(p) * far).toFixed(1)}px at ${d.x}px ${d.y}px)`;
      if (sc.tx === "bounce") {
        // up, down, a squash on landing, then the scene opens from the impact
        const air = clamp(p / 0.62);
        dotY = -Math.sin(Math.PI * air) * this.L * 0.9;
        if (p > 0.55 && p < 0.75) { sx = 1.35; sy = 0.7; }
        const r = clamp((p - 0.6) / 0.4);
        if (r > 0) clip = `circle(${(out3(r) * far).toFixed(1)}px at ${d.x}px ${d.y}px)`;
        showRing = p > 0.6 ? 1 - clamp((p - 0.6) / 0.35) : 0;
        ringScale = 0.6 + clamp((p - 0.6) / 0.35) * 0.9;
      }
      if (sc.tx === "bar") {
        // a band the dot's height sweeps out to both edges, then opens to the full screen
        const a = inOut(clamp(p / 0.55)), b = inOut(clamp((p - 0.5) / 0.5));
        const half = d.w / 2 + a * this.W;
        const top = d.y - d.h / 2 - b * this.H, bottom = this.H - (d.y + d.h / 2) - b * this.H;
        clip = `inset(${Math.max(0, top)}px ${Math.max(0, this.W - (d.x + half))}px ${Math.max(0, bottom)}px ${Math.max(0, d.x - half)}px)`;
      }
      if (sc.tx === "click") {
        // the cursor glides to the dot and clicks; the click opens the scene
        const g = inOut(clamp(p / 0.5));
        cursorAt = { x: d.x + this.L * 1.6 * (1 - g), y: d.y + this.L * 1.2 * (1 - g) };
        if (p > 0.48 && p < 0.58) { sx = sy = 0.82; }
        showRing = p > 0.5 ? 1 - clamp((p - 0.5) / 0.35) : 0;
        ringScale = 0.6 + clamp((p - 0.5) / 0.35) * 0.9;
        const r = clamp((p - 0.52) / 0.48);
        if (r > 0) clip = `circle(${(out3(r) * far).toFixed(1)}px at ${d.x}px ${d.y}px)`;
      }
    }
    // the toggle scene's own cursor: it clicks the switch while the scene is up
    if (sc.screen === "toggle") {
      const tm = m - start;
      const tx = this.W / 2 + this.L * 0.3, ty = this.H / 2 + this.L * 0.95;
      const g = inOut(clamp((tm - 0.05) / 0.3));
      if (tm < 0.6) cursorAt = { x: tx + this.L * 1.2 * (1 - g), y: ty + this.L * 0.9 * (1 - g) };
      if (tm > 0.34 && tm < 0.7) { showRing = 1 - clamp((tm - 0.36) / 0.3); ringScale = 0.6 + clamp((tm - 0.36) / 0.3) * 0.9; this.ring.style.left = `${tx}px`; this.ring.style.top = `${ty}px`; }
    } else {
      this.ring.style.left = `${d.x}px`;
      this.ring.style.top = `${d.y}px`;
    }

    if (nxt && p > 0) {
      nxt.setAttribute("data-on", "");
      nxt.style.zIndex = "2";
      nxt.style.clipPath = clip;
      nxt.style.setProperty("--m", "0");
    } else if (nxt) {
      nxt.removeAttribute("data-on");
    }

    // the logo takes the next scene's look once the new scene has reached it
    this.look(p > 0.62 && next ? next.look : sc.look);

    // the dark opening: a line for the dot to land on
    this.floor.style.display = sc.screen === "dark" ? "block" : "none";
    this.floor.style.top = `${d.y + d.h / 2}px`;

    this.dot.style.transform = `translateY(${dotY.toFixed(1)}px) scale(${sx}, ${sy})`;
    this.dot.style.transformOrigin = "50% 100%";
    this.ring.style.setProperty("--ro", showRing.toFixed(3));
    this.ring.style.setProperty("--rs", ringScale.toFixed(3));
    this.ring.style.color = sc.look.mono === "#fff" || sc.screen === "dark" ? "#fff" : "#111";
    if (cursorAt) {
      this.cursor.style.display = "block";
      this.cursor.style.left = `${cursorAt.x}px`;
      this.cursor.style.top = `${cursorAt.y}px`;
    } else this.cursor.style.display = "none";

    // the end: the dot grows into the warm-white page that "Hello World" is typed on
    if (sc.tx === "final" && p > 0) {
      this.portal.style.display = "block";
      this.portal.style.clipPath = `circle(${(inOut(p) * far).toFixed(1)}px at ${d.x}px ${d.y}px)`;
    } else this.portal.style.display = "none";
  }
}
