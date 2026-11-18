/**
 * "I'm Nishanth." → a 5-second logo match cut (film time MONTAGE.at … +dur).
 *
 * While it plays the film's own clock holds on the name (see filmClock in
 * timeline.ts) and this layer covers the stage:
 *   0.0 – 0.5   the name, as it was (the music starts slow)
 *   0.5 – 1.4   the logo takes over: same place, a new background, faster and faster
 *   1.4 – 1.75  construction lines draw in; the NS mark lands on the drop (1.5)
 *   1.75 – 4.5  one frame every 1/8 s (16th notes at 120 BPM): mockups, real
 *               photos and graphic frames, the NS mark always dead centre
 *   4.5 – 5.0   back to the name; the film carries on
 *
 * Mockups: AI-generated (Figma AI) blank products, /public/images/intro-montage.
 * The mark is Nishanth's logo (components/site/Logo.tsx), in its own reds on
 * every frame except the red one, where it turns white.
 * Photos: Nishanth's own (/public/images/about), shown in black and white.
 */
export const MONTAGE = { at: 2.25, dur: 5 } as const;

type Img = { kind: "img"; src: string; fx: number; fy: number; w: number; ink?: string; blend?: string; rot?: number; photo?: boolean };
type Txt = { kind: "text"; font: string; bg: string; color: string; italic?: boolean; weight?: number; word?: string; scale?: number };
type Gfx = { kind: "grid" | "soft" | "apps" | "flat" };
/** the logo alone on a plain colour (mono: all white) */
type Plain = { kind: "plain"; bg: string; mono?: boolean };
type Frame = (Img | Txt | Gfx | Plain | { kind: "none" }) & { at: number };

const M = "/images/intro-montage/";
const P = "/images/about/";
const SANS = "var(--film-sans)";
const MONO = "var(--film-mono)";

const STRIP: (Img | Txt | Gfx | Plain)[] = [
  { kind: "soft" },
  { kind: "img", src: M + "cap.webp", fx: 0.5, fy: 0.32, w: 0.06, ink: "#2a2a2a", blend: "multiply" },
  { kind: "img", src: P + "model-4.webp", fx: 0.56, fy: 0.5, w: 0.16, ink: "#fff", photo: true },
  { kind: "apps" },
  { kind: "img", src: M + "keychain.webp", fx: 0.49, fy: 0.655, w: 0.034, ink: "#4a4a4a", blend: "multiply" },
  { kind: "img", src: M + "bottle.webp", fx: 0.55, fy: 0.44, w: 0.05, rot: -20 },
  { kind: "img", src: M + "cards.webp", fx: 0.5, fy: 0.48, w: 0.042, ink: "#c9c9c9" },
  { kind: "img", src: P + "camera-1.webp", fx: 0.72, fy: 0.6, w: 0.13, ink: "#222", blend: "multiply", photo: true },
  { kind: "img", src: M + "tshirt.webp", fx: 0.5, fy: 0.45, w: 0.07, ink: "#f2f2f2" },
  { kind: "img", src: M + "notebook.webp", fx: 0.5, fy: 0.48, w: 0.05, ink: "#e6e6e6" },
  { kind: "img", src: P + "model-3.webp", fx: 0.42, fy: 0.4, w: 0.14, ink: "#222", blend: "multiply", photo: true },
  { kind: "img", src: M + "sticker.webp", fx: 0.5, fy: 0.49, w: 0.042, ink: "#fff" },
  { kind: "img", src: M + "laptop.webp", fx: 0.5, fy: 0.495, w: 0.06, ink: "#3a3a3a", blend: "multiply" },
  { kind: "plain", bg: "#111" },
  { kind: "img", src: M + "tote.webp", fx: 0.5, fy: 0.63, w: 0.05, ink: "#222", blend: "multiply" },
  { kind: "img", src: P + "gym-1.webp", fx: 0.35, fy: 0.74, w: 0.17, ink: "#fff", photo: true },
  { kind: "img", src: M + "mug.webp", fx: 0.485, fy: 0.55, w: 0.05, ink: "#222", blend: "multiply" },
  { kind: "img", src: M + "badge.webp", fx: 0.5, fy: 0.665, w: 0.028, ink: "#222", blend: "multiply" },
  { kind: "img", src: P + "cook-9.webp", fx: 0.48, fy: 0.7, w: 0.2, ink: "#1a1a1a", blend: "multiply", photo: true },
  { kind: "img", src: M + "pin.webp", fx: 0.5, fy: 0.47, w: 0.028, ink: "#f2f2f2" },
  { kind: "img", src: P + "model-2.webp", fx: 0.46, fy: 0.37, w: 0.14, ink: "#fff", photo: true },
  { kind: "flat" },
];

export const FRAMES: Frame[] = [
  { at: 0, kind: "none" },
  // the logo takes over: same place, a new background each time, faster and faster
  { at: 0.5, kind: "plain", bg: "#faf9f6" },
  { at: 0.875, kind: "plain", bg: "#111" },
  { at: 1.125, kind: "plain", bg: "#e8e5e1" },
  { at: 1.3, kind: "plain", bg: "#e60a30", mono: true },
  { at: 1.4, kind: "grid" },
  ...STRIP.map((f, i) => ({ ...f, at: 1.75 + i * 0.125 })),
  { at: 4.5, kind: "none" },
];

export const MONTAGE_IMAGES = [...new Set(STRIP.filter((f): f is Img => f.kind === "img").map((f) => f.src))];

export class Montage {
  private el: { root: HTMLElement; img: HTMLImageElement; text: HTMLElement; mark: HTMLElement; gfx: Record<string, HTMLElement> };
  private sizes = new Map<string, { w: number; h: number }>();
  private current = -2;
  private vw = 0;
  private vh = 0;
  private cache: HTMLImageElement[] = [];

  constructor(root: HTMLElement) {
    const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
    const box = q<HTMLElement>("[data-montage]");
    const gfx: Record<string, HTMLElement> = {};
    box.querySelectorAll<HTMLElement>("[data-mgfx]").forEach((g) => (gfx[g.dataset.mgfx!] = g));
    this.el = { root: box, img: q("[data-mimg]"), text: q("[data-mtext]"), mark: q("[data-mmark]"), gfx };
  }

  /** Load and decode every picture up front, so no cut ever shows a blank frame. */
  preload() {
    return Promise.all(
      MONTAGE_IMAGES.map((src) => {
        const im = new Image();
        im.decoding = "async";
        im.src = src;
        this.cache.push(im);
        return im
          .decode()
          .then(() => this.sizes.set(src, { w: im.naturalWidth, h: im.naturalHeight }))
          .catch(() => {});
      }),
    );
  }

  layout() {
    this.vw = innerWidth;
    this.vh = innerHeight;
    this.current = -2; // re-apply the current frame at the new size
  }

  /** m: seconds into the montage, or null when it isn't playing. */
  render(m: number | null) {
    let k = -1;
    if (m !== null && m >= 0 && m < MONTAGE.dur) FRAMES.forEach((f, i) => { if (m >= f.at) k = i; });
    const f = k >= 0 ? FRAMES[k] : null;
    const on = !!f && f.kind !== "none";
    // the construction lines draw in over the frame's first beat
    if (f?.kind === "grid") {
      const p = Math.min(1, Math.max(0, (m! - 1.4) / 0.1));
      this.el.gfx.grid.style.setProperty("--p", p.toFixed(3));
      this.el.mark.style.opacity = m! >= 1.5 ? "1" : "0";
    }
    if (k === this.current) return;
    this.current = k;
    const { root, img, text, mark, gfx } = this.el;
    root.style.visibility = on ? "visible" : "hidden";
    if (!on || !f) return;
    Object.values(gfx).forEach((g) => (g.style.display = "none"));
    img.style.display = "none";
    text.style.display = "none";
    mark.style.display = "none";
    mark.style.opacity = "1";
    delete mark.dataset.mono;
    mark.style.transform = "translate(-50%,-50%)";
    root.style.background = "#000";
    const base = Math.min(this.vw, this.vh);

    if (f.kind === "img") {
      const size = this.sizes.get(f.src);
      if (!size) return;
      // cover the screen, zoomed just enough that the mark's spot can sit dead centre
      const s = Math.max(this.vw / size.w, this.vh / size.h, this.vw / (2 * Math.min(f.fx, 1 - f.fx) * size.w), this.vh / (2 * Math.min(f.fy, 1 - f.fy) * size.h));
      img.src = f.src;
      img.style.display = "block";
      img.style.width = `${size.w * s}px`;
      img.style.height = `${size.h * s}px`;
      img.style.left = `${this.vw / 2 - f.fx * size.w * s}px`;
      img.style.top = `${this.vh / 2 - f.fy * size.h * s}px`;
      img.style.filter = f.photo ? "grayscale(1) contrast(1.1)" : "none";
      mark.style.display = "block";
      mark.style.width = `${Math.max(36, f.w * size.w * s * 1.15)}px`;
      if (f.rot) mark.style.transform = `translate(-50%,-50%) rotate(${f.rot}deg)`;
    } else if (f.kind === "plain") {
      root.style.background = f.bg;
      mark.style.display = "block";
      mark.style.width = `${base * 0.24}px`;
      if (f.mono) mark.dataset.mono = "1";
    } else if (f.kind === "text") {
      root.style.background = f.bg;
      text.style.display = "block";
      text.textContent = f.word ?? "Nishanth";
      text.style.fontFamily = f.font;
      text.style.fontStyle = f.italic ? "italic" : "normal";
      text.style.fontWeight = String(f.weight ?? 600);
      text.style.color = f.color;
      text.style.fontSize = `${Math.min(this.vw * 0.17, base * 0.3) * (f.scale ?? 1)}px`;
    } else {
      const g = gfx[f.kind];
      g.style.display = "block";
      mark.style.display = "block";
      if (f.kind === "grid") {
        root.style.background = "#000";
        mark.style.width = `${base * 0.22}px`;
        mark.style.opacity = "0";
      } else if (f.kind === "soft") {
        root.style.background = "#fff";
        mark.style.width = `${base * 0.2}px`;
      } else if (f.kind === "apps") {
        root.style.background = "#cfcfcf";
        mark.style.width = `${base * 0.1}px`;
      } else {
        root.style.background = "#e60a30";
        mark.style.width = `${base * 0.36}px`;
        mark.dataset.mono = "1";
      }
    }
  }
}
