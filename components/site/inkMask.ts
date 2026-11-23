/**
 * The theme switch's ink bleed, as vector outlines.
 *
 * A small WebGL pass samples the ink on a grid (a front spreading from the
 * toggle with a torn, marbled edge, streaks and splatter ahead of it); the
 * outline is then traced (marching squares) into an SVG path. The path is the
 * clip-path of the new page in a view transition. No images are involved, so
 * there is nothing to load or decode mid-animation (phones were flickering when
 * the transition used image masks), and the edge stays crisp at any size.
 */
const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 scr; uniform vec2 grid; uniform float cell; uniform vec2 o; uniform float p; uniform float seed;
float h(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7)) + seed) * 43758.5453); }
float n(vec2 q){ vec2 i = floor(q), f = fract(q); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 q){ float v = 0.0, a = 0.5; for (int i = 0; i < 6; i++){ v += a*n(q); q = q*2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
void main(){
  // this pixel is one grid point; the grid reaches one cell past each edge of the screen
  float gi = gl_FragCoord.x - 0.5;
  float gj = (grid.y - 1.0) - (gl_FragCoord.y - 0.5);
  vec2 uv = vec2((gi - 1.0) * cell, (gj - 1.0) * cell) / scr;   // 0..1, y down
  vec2 asp = vec2(scr.x / scr.y, 1.0);
  vec2 q = uv * asp;
  vec2 c = o * asp;
  float far = max(max(length(c), length(c - vec2(asp.x, 0.0))), max(length(c - vec2(0.0, 1.0)), length(c - asp)));
  float d = length(q - c) / far;
  vec2 w = vec2(fbm(q*2.2 + vec2(0.0, p*1.2)), fbm(q*2.2 + vec2(5.2, 1.3) - p*0.9));
  float marble = fbm(q*3.0 + w*2.6);
  float fine = fbm(q*16.0 + w*4.0);
  float v = p*1.6 - d - 0.15 + (marble - 0.5)*0.75 + (fine - 0.5)*0.22;
  float s = clamp(v*14.0 + 0.5, 0.0, 1.0);
  float vein = sin((marble*2.4 + fine*0.9 + w.x*0.6)*46.0);
  float thin = smoothstep(0.9, 0.97, vein);
  float band = 1.0 - smoothstep(0.0, 0.07, abs(v));
  s = mix(s, 1.0 - s, thin*band);
  gl_FragColor = vec4(s, s, s, 1.0);
}`;

export class InkMask {
  ok = false;
  private gl: WebGLRenderingContext | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private gw: number;
  private gh: number;
  private cell: number;
  private px: Uint8Array;

  constructor(private W: number, private H: number) {
    // a grid point every ~7px (coarser on very large screens), plus one cell beyond each edge
    this.cell = Math.max(6, Math.min(10, Math.max(W, H) / 200));
    this.gw = Math.ceil(W / this.cell) + 3;
    this.gh = Math.ceil(H / this.cell) + 3;
    this.px = new Uint8Array(this.gw * this.gh * 4);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = this.gw;
      canvas.height = this.gh;
      const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
      if (!gl) return;
      const sh = (t: number, src: string) => { const x = gl.createShader(t)!; gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error("shader"); return x; };
      const pr = gl.createProgram()!;
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const k of ["scr", "grid", "cell", "o", "p", "seed"]) this.u[k] = gl.getUniformLocation(pr, k);
      gl.viewport(0, 0, this.gw, this.gh);
      gl.uniform2f(this.u.scr, W, H);
      gl.uniform2f(this.u.grid, this.gw, this.gh);
      gl.uniform1f(this.u.cell, this.cell);
      gl.uniform1f(this.u.seed, Math.random() * 100);
      this.gl = gl;
      this.ok = true;
    } catch {
      this.ok = false;
    }
  }

  /** origin in 0..1 of the screen, progress 0..1 → a clip-path value */
  frame(ox: number, oy: number, p: number) {
    const gl = this.gl!;
    gl.uniform2f(this.u.o, ox, oy);
    gl.uniform1f(this.u.p, p);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.readPixels(0, 0, this.gw, this.gh, gl.RGBA, gl.UNSIGNED_BYTE, this.px);
    return trace(this.px, this.gw, this.gh, this.cell);
  }

  /** prepares the whole bleed ahead of time, in small slices so the page stays responsive */
  async bake(ox: number, oy: number, n: number, ease: (x: number) => number, alive: () => boolean) {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      if (!alive()) return null;
      out.push(this.frame(ox, oy, ease(i / (n - 1))));
      if (i % 3 === 2) await new Promise((r) => setTimeout(r, 0));
    }
    return out;
  }
}

/**
 * Marching squares: the 0.5 outline of the sampled field, as closed loops in
 * one path (even-odd, so holes and islands come out right). The outer ring of
 * the grid counts as "no ink", which closes every loop just off screen.
 */
function trace(px: Uint8Array, gw: number, gh: number, cell: number) {
  const val = (i: number, j: number) => (i <= 0 || j <= 0 || i >= gw - 1 || j >= gh - 1 ? 0 : px[((gh - 1 - j) * gw + i) * 4] / 255);
  const f = new Float32Array(gw * gh);
  let any = false, all = true;
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const v = val(i, j);
    f[j * gw + i] = v;
    if (i > 0 && j > 0 && i < gw - 1 && j < gh - 1) { if (v >= 0.5) any = true; else all = false; }
  }
  if (!any) return "inset(0 0 100% 0)";
  if (all) return "none";
  const X = (i: number) => (i - 1) * cell, Y = (j: number) => (j - 1) * cell;
  // a point on an edge between two grid points, keyed by that edge
  const pts = new Map<number, [number, number]>();
  const hKey = (i: number, j: number) => (j * gw + i) * 2, vKey = (i: number, j: number) => (j * gw + i) * 2 + 1;
  const hPt = (i: number, j: number) => { const k = hKey(i, j); if (!pts.has(k)) { const a = f[j * gw + i], b = f[j * gw + i + 1]; const t = (0.5 - a) / (b - a); pts.set(k, [X(i) + t * cell, Y(j)]); } return k; };
  const vPt = (i: number, j: number) => { const k = vKey(i, j); if (!pts.has(k)) { const a = f[j * gw + i], b = f[(j + 1) * gw + i]; const t = (0.5 - a) / (b - a); pts.set(k, [X(i), Y(j) + t * cell]); } return k; };
  const link = new Map<number, number[]>();
  const seg = (a: number, b: number) => { (link.get(a) ?? link.set(a, []).get(a)!).push(b); (link.get(b) ?? link.set(b, []).get(b)!).push(a); };
  for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
    const tl = f[j * gw + i] >= 0.5 ? 1 : 0, tr = f[j * gw + i + 1] >= 0.5 ? 1 : 0;
    const br = f[(j + 1) * gw + i + 1] >= 0.5 ? 1 : 0, bl = f[(j + 1) * gw + i] >= 0.5 ? 1 : 0;
    const c = tl * 8 + tr * 4 + br * 2 + bl;
    if (c === 0 || c === 15) continue;
    const T = () => hPt(i, j), B = () => hPt(i, j + 1), L = () => vPt(i, j), R = () => vPt(i + 1, j);
    switch (c) {
      case 1: case 14: seg(L(), B()); break;
      case 2: case 13: seg(B(), R()); break;
      case 3: case 12: seg(L(), R()); break;
      case 4: case 11: seg(T(), R()); break;
      case 6: case 9: seg(T(), B()); break;
      case 7: case 8: seg(L(), T()); break;
      case 5: case 10: {
        const mid = (f[j * gw + i] + f[j * gw + i + 1] + f[(j + 1) * gw + i + 1] + f[(j + 1) * gw + i]) / 4 >= 0.5 ? 1 : 0;
        if ((c === 5) === (mid === 1)) { seg(L(), T()); seg(B(), R()); } else { seg(L(), B()); seg(T(), R()); }
        break;
      }
    }
  }
  // walk the links into closed loops
  let d = "";
  const seen = new Set<number>();
  for (const start of link.keys()) {
    if (seen.has(start)) continue;
    let prev = -1, cur = start, first = true, n = 0;
    while (n++ < 100000) {
      seen.add(cur);
      const [x, y] = pts.get(cur)!;
      d += `${first ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      first = false;
      const next = link.get(cur)!.find((x) => x !== prev && !seen.has(x));
      if (next === undefined) break;
      prev = cur;
      cur = next;
    }
    d += "Z";
  }
  return `path(evenodd, "${d}")`;
}
