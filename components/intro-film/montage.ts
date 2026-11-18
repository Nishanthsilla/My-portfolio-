/**
 * The opener: a 10-second logo reel before the film proper ("Hello World").
 * Logo only, one size, dead centre on every screen (OpenerScreens.tsx); the
 * screens follow the beat of its own track (scripts/audio/compose_intro_montage.py,
 * 150 BPM, one beat = 0.4 s):
 *
 *   0.0 – 1.6   four screens, one per beat (the music is still sparse)
 *   1.6 – 8.0   the drop: a new screen every 1/8 note (0.2 s)
 *   8.0 – 8.4   the break: the logo alone on black
 *   8.4 – 10    the final hit: the end card (the logo, NISHANTH SILLA,
 *               "design that ships."), then it fades into the film
 */
export const MONTAGE = { at: 0, dur: 10 } as const;
/** the logo's width, as a share of the screen's shorter side */
const LOGO_SIZE = 0.16;

type Variant = "color" | "mono" | "dim";
/** screen → how the logo is drawn on it (full colour on neutrals; white on red/orange) */
const LOGO: Record<string, { v: Variant; c?: string }> = {
  dark: { v: "dim", c: "#3a3a3a" },
  words: { v: "mono", c: "#fff" },
  tile: { v: "mono", c: "#fff" },
  toolbar: { v: "color" },
  browser: { v: "color" },
  giant: { v: "color" },
  phone: { v: "color" },
  ring: { v: "mono", c: "#fff" },
  nodes: { v: "color" },
  search: { v: "color" },
  star: { v: "mono", c: "#fff" },
  corners: { v: "mono", c: "#fff" },
  stripes: { v: "color" },
  dock: { v: "mono", c: "#fff" },
  code: { v: "color" },
  blush: { v: "color" },
  black: { v: "color" },
  end: { v: "color" },
};

const SLOW = ["dark", "words", "tile", "toolbar"];
const FAST = [
  "browser", "giant", "phone", "ring", "nodes", "dock", "search", "code",
  "star", "corners", "stripes", "blush", "tile", "words", "toolbar", "ring",
  "dock", "star", "browser", "giant", "phone", "corners", "stripes", "nodes",
  "code", "search", "blush", "tile", "ring", "star", "dock", "stripes",
];
export const FRAMES: { at: number; screen: string }[] = [
  ...SLOW.map((screen, i) => ({ at: i * 0.4, screen })),
  ...FAST.map((screen, i) => ({ at: 1.6 + i * 0.2, screen })),
  { at: 8.0, screen: "black" },
  { at: 8.4, screen: "end" },
];

const outQuint = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 5);

export class Montage {
  private box: HTMLElement;
  private screens = new Map<string, HTMLElement>();
  private logo: HTMLElement;
  private word: HTMLElement | null;
  private current = -2;
  private L = 100;

  constructor(root: HTMLElement) {
    this.box = root.querySelector<HTMLElement>("[data-montage]")!;
    this.box.querySelectorAll<HTMLElement>("[data-screen]").forEach((s) => this.screens.set(s.dataset.screen!, s));
    this.logo = this.box.querySelector<HTMLElement>("[data-ologo]")!;
    this.word = this.box.querySelector<HTMLElement>("[data-screen=end] > div");
  }

  /** nothing to fetch: every screen is drawn */
  preload() {
    return Promise.resolve();
  }

  layout() {
    const w = this.box.clientWidth || innerWidth, h = this.box.clientHeight || innerHeight;
    this.L = Math.min(w, h) * LOGO_SIZE;
    this.box.style.setProperty("--L", `${this.L}px`);
    this.current = -2;
  }

  /** m: seconds into the opener, or null when it isn't playing. */
  render(m: number | null) {
    const on = m !== null && m >= 0 && m < MONTAGE.dur;
    this.box.style.visibility = on ? "visible" : "hidden";
    if (!on) {
      this.current = -2;
      return;
    }
    let k = 0;
    FRAMES.forEach((f, i) => { if (m >= f.at) k = i; });
    const f = FRAMES[k];
    const el = this.screens.get(f.screen === "black" ? "end" : f.screen)!;
    if (k !== this.current) {
      this.current = k;
      this.screens.forEach((s) => s.removeAttribute("data-on"));
      el.setAttribute("data-on", "");
      const lv = LOGO[f.screen];
      if (lv.v === "color") this.logo.removeAttribute("data-mono");
      else this.logo.setAttribute("data-mono", "");
      this.logo.style.color = lv.c ?? "";
    }
    // motion inside the screen
    el.style.setProperty("--m", (m - f.at).toFixed(3));

    // the end card: the logo holds, then slides left as the name is drawn out of it
    let shift = 0, p = 0, q = 0;
    if (f.screen === "end" && this.word) {
      const ww = this.word.offsetWidth, gap = this.L * 0.22;
      const total = this.L + gap + ww;
      p = outQuint((m - 8.65) / 0.45);
      shift = (total / 2 - this.L / 2) * p;
      this.word.style.left = `${this.box.clientWidth / 2 + this.L / 2 - shift + gap}px`;
      q = outQuint((m - 9.0) / 0.4);
    }
    el.style.setProperty("--p", p.toFixed(3));
    el.style.setProperty("--q", q.toFixed(3));
    this.logo.style.transform = `translate(calc(-50% - ${shift.toFixed(1)}px), -50%)`;
    if (f.screen === "black" && this.word) {
      // the break: just the logo on black (the end card, before its name appears)
      el.style.setProperty("--p", "0");
      el.style.setProperty("--q", "0");
    }
    // the last moment: fade into the film
    this.box.style.opacity = String(m > 9.7 ? Math.max(0, 1 - (m - 9.7) / 0.3) : 1);
  }
}
