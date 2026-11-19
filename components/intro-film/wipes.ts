/**
 * Linked hand-overs between the film's chapters (from "Hello World" on).
 *
 * The film's own chapters fade out and in at four places; these wipes cover
 * those moments with a bold, moving shape instead, so one chapter flows into
 * the next (the way a motion reel links its scenes). They sit on a layer of
 * their own above the stage, driven by the film's clock: the film underneath
 * is unchanged.
 *
 *   1  "…do their thing."      the dot swells into an orange flood that sweeps off to the left,
 *                              uncovering the documents already flying out
 *   2  complex → clear         two charcoal panels slam shut from the sides and open on "I make it clear."
 *   3  the product → the stats an orange flood grows from the centre, then squeezes into a line
 *                              the numbers roll out of
 *   4  the stats → Figma/code  a charcoal bar sweeps across and carries the screen on
 */
type Wipe = {
  kind: "dotFlood" | "doors" | "floodToLine" | "bar";
  color: string;
  /** film seconds: the shape covers the screen over cover[0]→cover[1], and leaves over uncover[0]→uncover[1] */
  cover: [number, number];
  uncover: [number, number];
};

const WIPES: Wipe[] = [
  { kind: "dotFlood", color: "#ff4938", cover: [13.85, 14.17], uncover: [14.36, 14.72] },
  { kind: "doors", color: "#242424", cover: [17.42, 17.68], uncover: [17.92, 18.28] },
  { kind: "floodToLine", color: "#ff4938", cover: [21.98, 22.26], uncover: [22.4, 22.78] },
  { kind: "bar", color: "#242424", cover: [25.42, 25.68], uncover: [25.88, 26.22] },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const inOut = (t: number) => { t = clamp(t); return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2; };

export class FilmWipes {
  private el: HTMLElement;
  private blob: HTMLElement | null;
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.el = root.querySelector<HTMLElement>("[data-film-wipe]")!;
    this.blob = root.querySelector<HTMLElement>("[data-blob]");
  }

  /** ft: the film's own clock */
  render(ft: number) {
    const w = WIPES.find((x) => ft >= x.cover[0] && ft < x.uncover[1]);
    if (!w) {
      this.el.style.display = "none";
      return;
    }
    const W = this.root.clientWidth, H = this.root.clientHeight;
    const c = inOut((ft - w.cover[0]) / (w.cover[1] - w.cover[0])); // 0 → 1: covering
    const u = inOut((ft - w.uncover[0]) / (w.uncover[1] - w.uncover[0])); // 0 → 1: leaving
    let clip = "none";

    if (w.kind === "dotFlood") {
      // grows out of the dot (wherever the film's dot is), then the flood slides off to the left
      let x = W * 0.66, y = H / 2;
      if (this.blob) {
        const r = this.blob.getBoundingClientRect(), b = this.root.getBoundingClientRect();
        if (r.width) { x = r.left - b.left + r.width / 2; y = r.top - b.top + r.height / 2; }
      }
      const far = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 4;
      clip = u > 0 ? `inset(0 ${(u * 100).toFixed(2)}% 0 0)` : `circle(${(c * far).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
    } else if (w.kind === "doors") {
      // two panels close from the sides, then open again
      const g = u > 0 ? 1 - u : c;
      const half = (g * 50).toFixed(2);
      clip = `polygon(0 0, ${half}% 0, ${half}% 100%, 0 100%, 0 0, 100% 0, 100% 100%, ${100 - +half}% 100%, ${100 - +half}% 0, 100% 0)`;
    } else if (w.kind === "floodToLine") {
      // grows from the centre; then squeezes into a thin line across the middle, which thins away
      const far = Math.hypot(W / 2, H / 2) + 4;
      if (u <= 0) clip = `circle(${(c * far).toFixed(1)}px at 50% 50%)`;
      else {
        const hh = (1 - u) * (H / 2) + u * 1.5; // half-height: full → a hairline
        const side = u > 0.75 ? ((u - 0.75) / 0.25) * 50 : 0;
        clip = `inset(${(H / 2 - hh).toFixed(1)}px ${side.toFixed(2)}% ${(H / 2 - hh).toFixed(1)}px ${side.toFixed(2)}%)`;
      }
    } else if (w.kind === "bar") {
      // sweeps in from the left, then carries on out to the right
      clip = u > 0 ? `inset(0 0 0 ${(u * 100).toFixed(2)}%)` : `inset(0 ${((1 - c) * 100).toFixed(2)}% 0 0)`;
    }

    this.el.style.display = "block";
    this.el.style.background = w.color;
    this.el.style.clipPath = clip;
  }
}
