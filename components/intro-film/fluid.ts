/**
 * A liquid background for the opener's gradient screens (warm, thermal, blue
 * sky, glass): domain-warped noise mapped onto a five-colour palette, drawn
 * with WebGL. The flow is driven by the opener's clock, so it is the same on
 * every play (and when the film is scrubbed). If WebGL isn't available,
 * `ok` stays false and the screens keep their CSS gradients.
 */
const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec3 c0, c1, c2, c3, c4;
uniform float zoom;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; } return v; }
vec3 pal(float x) {
  x = clamp(x, 0.0, 1.0) * 4.0;
  if (x < 1.0) return mix(c0, c1, x);
  if (x < 2.0) return mix(c1, c2, x - 1.0);
  if (x < 3.0) return mix(c2, c3, x - 2.0);
  return mix(c3, c4, x - 3.0);
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * r) / r.y * zoom;
  vec2 q = vec2(fbm(uv + vec2(0.0, t * 0.45)), fbm(uv + vec2(5.2, 1.3) - t * 0.4));
  vec2 w = vec2(fbm(uv + 3.2 * q + vec2(1.7, 9.2) + t * 0.6), fbm(uv + 3.2 * q + vec2(8.3, 2.8) - t * 0.55));
  float f = fbm(uv + 3.0 * w);
  f = smoothstep(0.18, 0.82, f * 0.6 + length(w) * 0.45 - 0.08);
  gl_FragColor = vec4(pal(f), 1.0);
}`;

const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);

export class FluidBg {
  ok = false;
  private gl: WebGLRenderingContext | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};

  constructor(private canvas: HTMLCanvasElement) {
    try {
      const gl = canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: true });
      if (!gl) return;
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const k of ["r", "t", "c0", "c1", "c2", "c3", "c4", "zoom"]) this.u[k] = gl.getUniformLocation(prog, k);
      this.gl = gl;
      this.ok = true;
    } catch {
      this.ok = false;
    }
  }

  /** size the drawing buffer (half resolution: it's soft, and it keeps phones fast) */
  resize(w: number, h: number) {
    if (!this.gl) return;
    const s = 0.5;
    this.canvas.width = Math.max(2, Math.round(w * s));
    this.canvas.height = Math.max(2, Math.round(h * s));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(colors: string[], t: number, zoom = 1.05) {
    const gl = this.gl;
    if (!gl) return;
    gl.uniform2f(this.u.r, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.u.t, t);
    gl.uniform1f(this.u.zoom, zoom);
    colors.forEach((c, i) => gl.uniform3fv(this.u[`c${i}`], hex(c)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
