/**
 * The opener: an 8-second logo reel before the film proper ("Hello World").
 * Logo only, one size, dead centre on every screen (OpenerScreens.tsx); the
 * screens follow the beat of its own track (scripts/audio/compose_intro_montage.py,
 * 150 BPM, one beat = 0.4 s):
 *
 *   0.0 – 1.6   four screens, one per beat (the music is still sparse)
 *   1.6 – 8.0   the drop: a new screen every 1/8 note (0.2 s)
 *   8.0         the final hit lands as the film cuts in on "Hello World"
 *
 * Every screen eases in over its first moments (its objects settle from a
 * little bigger, the backgrounds keep moving), so the hard cuts stay punchy
 * without ever looking like a static slide.
 */
import { INTRO_OPENER } from "@/lib/introConfig";

/** off (lib/introConfig.ts INTRO_OPENER = false): no opener, the film runs exactly as before */
export const MONTAGE = { at: 0, dur: INTRO_OPENER ? 8 : 0 } as const;
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
  grid: { v: "color" },
};

const SLOW = ["dark", "words", "tile", "toolbar"];
const FAST = [
  "browser", "giant", "phone", "ring", "nodes", "dock", "search", "code",
  "star", "corners", "stripes", "grid", "tile", "words", "toolbar", "ring",
  "dock", "star", "browser", "giant", "phone", "corners", "grid", "nodes",
  "code", "search", "stripes", "tile", "ring", "star", "dock", "words",
];
export const FRAMES: { at: number; screen: string }[] = [
  ...SLOW.map((screen, i) => ({ at: i * 0.4, screen })),
  ...FAST.map((screen, i) => ({ at: 1.6 + i * 0.2, screen })),
];

export class Montage {
  private box: HTMLElement;
  private screens = new Map<string, HTMLElement>();
  private logo: HTMLElement;
  private current = -2;

  constructor(root: HTMLElement) {
    this.box = root.querySelector<HTMLElement>("[data-montage]")!;
    this.box.querySelectorAll<HTMLElement>("[data-screen]").forEach((s) => this.screens.set(s.dataset.screen!, s));
    this.logo = this.box.querySelector<HTMLElement>("[data-ologo]")!;
  }

  /** nothing to fetch: every screen is drawn */
  preload() {
    return Promise.resolve();
  }

  layout() {
    const w = this.box.clientWidth || innerWidth, h = this.box.clientHeight || innerHeight;
    this.box.style.setProperty("--L", `${Math.min(w, h) * LOGO_SIZE}px`);
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
    const el = this.screens.get(f.screen)!;
    if (k !== this.current) {
      this.current = k;
      this.screens.forEach((s) => s.removeAttribute("data-on"));
      el.setAttribute("data-on", "");
      const lv = LOGO[f.screen];
      if (lv.v === "color") this.logo.removeAttribute("data-mono");
      else this.logo.setAttribute("data-mono", "");
      this.logo.style.color = lv.c ?? "";
    }
    // motion inside the screen: --m is time on screen, --e its eased entrance (0 → 1 over 0.16 s)
    const s = m - f.at;
    const e = 1 - Math.pow(1 - Math.min(1, s / 0.16), 3);
    el.style.setProperty("--m", s.toFixed(3));
    el.style.setProperty("--e", e.toFixed(3));
  }
}
