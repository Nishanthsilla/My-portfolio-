/**
 * The theme switch's ink bleed. A small WebGL canvas draws, for a progress p
 * (0 → 1), where the new theme's "ink" has reached: a front spreading from
 * the toggle, with a torn, marbled edge (domain-warped noise), streaks and
 * splatter running ahead of it. Each frame becomes the mask of the new page
 * snapshot in the view transition (white = new theme shows).
 */
const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 res; uniform vec2 o; uniform float p; uniform float seed;
float h(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7)) + seed) * 43758.5453); }
float n(vec2 q){ vec2 i = floor(q), f = fract(q); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 q){ float v = 0.0, a = 0.5; for (int i = 0; i < 6; i++){ v += a*n(q); q = q*2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / res;           // 0..1, y up
  uv.y = 1.0 - uv.y;                          // y down, like the page
  vec2 asp = vec2(res.x / res.y, 1.0);
  vec2 q = uv * asp;
  vec2 c = o * asp;
  float far = max(max(length(c), length(c - vec2(asp.x, 0.0))), max(length(c - vec2(0.0, 1.0)), length(c - asp)));
  float d = length(q - c) / far;
  // marbling: the noise is warped by itself, and drifts as the ink travels
  vec2 w = vec2(fbm(q*2.2 + vec2(0.0, p*1.2)), fbm(q*2.2 + vec2(5.2, 1.3) - p*0.9));
  float marble = fbm(q*3.0 + w*2.6);
  float fine = fbm(q*16.0 + w*4.0);
  float v = p*1.6 - d - 0.15 + (marble - 0.5)*0.75 + (fine - 0.5)*0.22;
  float ink = smoothstep(-0.006, 0.006, v);
  // marbled veins along the front: thin streaks of both colours, like ink pulled through water
  float vein = sin((marble*2.4 + fine*0.9 + w.x*0.6)*46.0);
  float thin = smoothstep(0.9, 0.97, vein);
  float band = 1.0 - smoothstep(0.0, 0.07, abs(v));
  ink = mix(ink, 1.0 - ink, thin*band);
  gl_FragColor = vec4(vec3(ink), 1.0);
}`;

export class InkMask {
  ok = false;
  canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};

  constructor(w: number, h: number) {
    this.canvas = document.createElement("canvas");
    // a fraction of the screen size: soft enough to be fast, sharp enough to read as ink
    const k = Math.min(1, 720 / Math.max(w, h));
    this.canvas.width = Math.round(w * k);
    this.canvas.height = Math.round(h * k);
    try {
      const gl = this.canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
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
      for (const k2 of ["res", "o", "p", "seed"]) this.u[k2] = gl.getUniformLocation(pr, k2);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.u.res, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.u.seed, Math.random() * 100);
      this.gl = gl;
      this.ok = true;
    } catch {
      this.ok = false;
    }
  }

  /** origin in 0..1 of the screen; returns the frame as an image URL for mask-image */
  frame(ox: number, oy: number, p: number) {
    const gl = this.gl!;
    gl.uniform2f(this.u.o, ox, oy);
    gl.uniform1f(this.u.p, p);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return this.canvas.toDataURL("image/jpeg", 0.85);
  }
}
