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
 * Hard cuts: every screen simply appears on its beat and leaves on the next
 * (no sliding or scaling in). A few keep moving while they're up: the words
 * scroll, the ring turns, the stripes run, the zoom breathes.
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
  warm: { v: "mono", c: "#fff" },
  grid: { v: "color" },
  browser: { v: "color" },
  thermal: { v: "mono", c: "#fff" },
  giant: { v: "color" },
  blueprint: { v: "mono", c: "#fff" },
  phone: { v: "color" },
  ripples: { v: "color" },
  ring: { v: "mono", c: "#fff" },
  figma: { v: "color" },
  particles: { v: "color" },
  dock: { v: "mono", c: "#fff" },
  topo: { v: "mono", c: "#fff" },
  mesh: { v: "mono", c: "#fff" },
  zoom: { v: "color" },
  codebg: { v: "mono", c: "#fff" },
  halftone: { v: "color" },
  crop: { v: "color" },
  rings: { v: "color" },
  glass: { v: "mono", c: "#fff" },
};

/** every screen appears once: no repeats */
const SLOW = ["dark", "words", "warm", "grid"];
/** the drop: one 1/8 note each, most holding for two; the last few cut faster into "Hello World" */
const FAST: [string, number][] = [
  ["browser", 2], ["thermal", 2], ["giant", 2], ["blueprint", 2], ["phone", 2], ["ripples", 2], ["ring", 2],
  ["figma", 2], ["particles", 2], ["dock", 2], ["topo", 2], ["mesh", 2], ["zoom", 2], ["codebg", 2],
  ["halftone", 1], ["crop", 1], ["rings", 1], ["glass", 1],
];
export const FRAMES: { at: number; screen: string }[] = [
  ...SLOW.map((screen, i) => ({ at: i * 0.4, screen })),
  ...FAST.reduce<{ at: number; screen: string }[]>((acc, [screen, n], i) => {
    const at = i === 0 ? 1.6 : acc[acc.length - 1].at + FAST[i - 1][1] * 0.2;
    return [...acc, { at, screen }];
  }, []),
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
    // motion inside the screen (the scrolling words, the turning ring, the zoom…): --m is time on screen
    el.style.setProperty("--m", (m - f.at).toFixed(3));
  }
}
