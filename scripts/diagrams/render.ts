/**
 * Draws the case-study flowcharts as static images: one compact user flow and
 * one product architecture per project, main steps only. Each has a wide
 * layout (desktop) and a narrow one that fits a phone screen.
 *
 *   NODE_PATH=$(npm root -g) npx tsx scripts/diagrams/render.ts
 *
 * Needs Playwright with Chromium (pre-installed in the cloud sandbox). Writes
 * WebP files to public/images/case-studies/<slug>/diagrams/.
 * The steps are condensed from the detailed flows in lib/site/studies/*.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-explicit-any -- dev-only script; Playwright is not a project dependency */
const { chromium } = require("playwright") as any;
const sharp = require("sharp") as any;

const ROOT = process.cwd();
const font = (f: string) => "data:font/woff2;base64," + fs.readFileSync(path.join(ROOT, "node_modules/geist/dist/fonts", f)).toString("base64");

// ---------------------------------------------------------------------------
// diagram model
type Kind = "start" | "end" | "step" | "decision" | "system" | "exception";
type Port = "t" | "b" | "l" | "r";
type Node = { id: string; kind: Kind; text: string; sub?: string };
type Edge = { from: string; to: string; ports: [Port, Port]; label?: "Yes" | "No" | string; lane?: number; dashed?: boolean };
type Zone = { label: string; span: [number, number] }; // cols (wide) or rows (tall)
type Layout = { cols: number; rows: number; at: Record<string, [number, number]>; lanes?: Record<string, number>; ports?: Record<string, [Port, Port]>; zones?: Zone[] };
type Diagram = { file: string; nodes: Node[]; edges: Edge[]; wide: Layout; tall: Layout; /** a simpler set for phones */ tallNodes?: Node[]; tallEdges?: Edge[] };

// ---------------------------------------------------------------------------
const ambientFlow: Diagram = {
  file: "ambient-ai/diagrams/ambient_ai_user_flow",
  nodes: [
    { id: "s", kind: "start", text: "Start" },
    { id: "a", kind: "step", text: "Open the Agent workspace" },
    { id: "b", kind: "step", text: "Configure skills, experts and workflow" },
    { id: "c", kind: "step", text: "Run pre-flight checks" },
    { id: "d", kind: "decision", text: "Blockers or warnings?" },
    { id: "e", kind: "exception", text: "Resolve them in context" },
    { id: "f", kind: "step", text: "Publish a versioned configuration" },
    { id: "g", kind: "step", text: "Deploy to device / environment" },
    { id: "h", kind: "decision", text: "Execution OK?" },
    { id: "i", kind: "exception", text: "Inspect logs and retry" },
    { id: "z", kind: "end", text: "Monitor and maintain versions" },
  ],
  edges: [
    { from: "s", to: "a", ports: ["r", "l"] },
    { from: "a", to: "b", ports: ["r", "l"] },
    { from: "b", to: "c", ports: ["r", "l"] },
    { from: "c", to: "d", ports: ["r", "l"] },
    { from: "d", to: "e", ports: ["r", "l"], label: "Yes" },
    { from: "e", to: "c", ports: ["t", "t"], dashed: true },
    { from: "d", to: "f", ports: ["b", "t"], label: "No" },
    { from: "f", to: "g", ports: ["l", "r"] },
    { from: "g", to: "h", ports: ["l", "r"] },
    { from: "h", to: "z", ports: ["l", "r"], label: "Yes" },
    { from: "h", to: "i", ports: ["b", "t"], label: "No" },
    { from: "i", to: "g", ports: ["r", "b"], dashed: true },
  ],
  wide: {
    cols: 6, rows: 3,
    at: { s: [0, 0], a: [1, 0], b: [2, 0], c: [3, 0], d: [4, 0], e: [5, 0], f: [4, 1], g: [3, 1], h: [2, 1], z: [1, 1], i: [2, 2] },
    lanes: { "e>c": -0.62 },
  },
  tall: {
    cols: 2, rows: 9,
    at: { s: [0, 0], a: [0, 1], b: [0, 2], c: [0, 3], d: [0, 4], e: [1, 4], f: [0, 5], g: [0, 6], h: [0, 7], i: [1, 7], z: [0, 8] },
    ports: { "s>a": ["b", "t"], "a>b": ["b", "t"], "b>c": ["b", "t"], "c>d": ["b", "t"], "e>c": ["t", "r"], "f>g": ["b", "t"], "g>h": ["b", "t"], "h>z": ["b", "t"], "h>i": ["r", "l"], "i>g": ["t", "r"] },
  },
};

const selfReadyFlow: Diagram = {
  file: "self-ready/diagrams/self_ready_user_flow",
  nodes: [
    { id: "s", kind: "start", text: "Start" },
    { id: "a", kind: "step", text: "Ingest imagery", sub: "bulk or scheduled" },
    { id: "b", kind: "step", text: "Open the Capture Session" },
    { id: "c", kind: "step", text: "Inspect product crop and shelf label" },
    { id: "d", kind: "decision", text: "Label belongs to product?" },
    { id: "e", kind: "step", text: "Confirm the association" },
    { id: "r", kind: "exception", text: "Reject; review in Blocklist", sub: "when appropriate" },
    { id: "p", kind: "step", text: "Update the Product Database", sub: "Active · Seasonal · Inactive" },
    { id: "x", kind: "step", text: "Refresh the On-device Index" },
    { id: "z", kind: "end", text: "Train / update the device model" },
  ],
  edges: [
    { from: "s", to: "a", ports: ["r", "l"] },
    { from: "a", to: "b", ports: ["r", "l"] },
    { from: "b", to: "c", ports: ["r", "l"] },
    { from: "c", to: "d", ports: ["r", "l"] },
    { from: "d", to: "e", ports: ["r", "l"], label: "Yes" },
    { from: "d", to: "r", ports: ["b", "t"], label: "No" },
    { from: "e", to: "p", ports: ["b", "t"] },
    { from: "r", to: "p", ports: ["r", "l"], label: "Resolved", dashed: true },
    { from: "p", to: "x", ports: ["b", "t"] },
    { from: "x", to: "z", ports: ["l", "r"] },
  ],
  wide: {
    cols: 6, rows: 3,
    at: { s: [0, 0], a: [1, 0], b: [2, 0], c: [3, 0], d: [4, 0], e: [5, 0], r: [4, 1], p: [5, 1], x: [5, 2], z: [4, 2] },
  },
  tall: {
    cols: 2, rows: 9,
    at: { s: [0, 0], a: [0, 1], b: [0, 2], c: [0, 3], d: [0, 4], e: [0, 5], r: [1, 5], p: [0, 6], x: [0, 7], z: [0, 8] },
    ports: { "s>a": ["b", "t"], "a>b": ["b", "t"], "b>c": ["b", "t"], "c>d": ["b", "t"], "d>e": ["b", "t"], "d>r": ["r", "t"], "r>p": ["b", "r"], "x>z": ["b", "t"] },
  },
};

const ambientArch: Diagram = {
  file: "ambient-ai/diagrams/ambient_ai_architecture",
  nodes: [
    { id: "mp", kind: "system", text: "Management Portal", sub: "Agent workspace · Skill Registry · Workflow Builder · Gateway / MAO" },
    { id: "c1", kind: "step", text: "Agent identity, experts and skills" },
    { id: "c2", kind: "step", text: "Trigger profiles and launch parameters" },
    { id: "c3", kind: "step", text: "Workflow graph, templates and orchestrator" },
    { id: "v", kind: "step", text: "Validation and pre-flight" },
    { id: "p", kind: "step", text: "Versioned publish and deployment" },
    { id: "dv", kind: "end", text: "Device / environment" },
  ],
  edges: [
    { from: "mp", to: "c1", ports: ["r", "l"] },
    { from: "mp", to: "c2", ports: ["r", "l"] },
    { from: "mp", to: "c3", ports: ["r", "l"] },
    { from: "c1", to: "v", ports: ["r", "l"] },
    { from: "c2", to: "v", ports: ["r", "l"] },
    { from: "c3", to: "v", ports: ["r", "l"] },
    { from: "v", to: "p", ports: ["b", "t"] },
    { from: "p", to: "dv", ports: ["b", "t"] },
    { from: "dv", to: "mp", ports: ["b", "b"], label: "Execution logs and runtime status", dashed: true },
  ],
  wide: {
    cols: 3, rows: 3,
    at: { mp: [0, 1], c1: [1, 0], c2: [1, 1], c3: [1, 2], v: [2, 0], p: [2, 1], dv: [2, 2] },
    lanes: { "dv>mp": 2.72 },
    ports: { "c1>v": ["r", "l"], "c2>v": ["r", "l"], "c3>v": ["r", "l"] },
    zones: [{ label: "User-facing", span: [0, 0] }, { label: "Configuration", span: [1, 1] }, { label: "Release & runtime", span: [2, 2] }],
  },
  tall: {
    cols: 1.5, rows: 5,
    at: { mp: [0, 0], cf: [0, 1.2], v: [0, 2.4], p: [0, 3.4], dv: [0, 4.3] },
    ports: { "mp>cf": ["b", "t"], "cf>v": ["b", "t"], "dv>mp": ["r", "r"] },
    lanes: { "dv>mp": 0.86 },
  },
  tallNodes: [
    { id: "mp", kind: "system", text: "Management Portal", sub: "Agent workspace · Skill Registry · Workflow Builder · Gateway / MAO" },
    { id: "cf", kind: "step", text: "Agent configuration", sub: "experts, skills, triggers and workflow" },
    { id: "v", kind: "step", text: "Validation and pre-flight" },
    { id: "p", kind: "step", text: "Versioned publish and deployment" },
    { id: "dv", kind: "end", text: "Device / environment" },
  ],
  tallEdges: [
    { from: "mp", to: "cf", ports: ["b", "t"] },
    { from: "cf", to: "v", ports: ["b", "t"] },
    { from: "v", to: "p", ports: ["b", "t"] },
    { from: "p", to: "dv", ports: ["b", "t"] },
    { from: "dv", to: "mp", ports: ["r", "r"], label: "Execution logs and runtime status", dashed: true },
  ],
};

const selfReadyArch: Diagram = {
  file: "self-ready/diagrams/self_ready_architecture",
  nodes: [
    { id: "bi", kind: "step", text: "Manual Bulk Ingestion" },
    { id: "sc", kind: "step", text: "Scheduled Image Capture" },
    { id: "ai", kind: "system", text: "Capture Sessions", sub: "image processing · product and shelf-label association" },
    { id: "rv", kind: "decision", text: "FDE Image Review" },
    { id: "bl", kind: "exception", text: "Blocklist review and resolution" },
    { id: "db", kind: "step", text: "Confirmed Product Database", sub: "Active · Seasonal · Inactive images" },
    { id: "ix", kind: "step", text: "On-device Index" },
    { id: "md", kind: "end", text: "Device model training / update" },
  ],
  edges: [
    { from: "bi", to: "ai", ports: ["r", "l"] },
    { from: "sc", to: "ai", ports: ["r", "l"] },
    { from: "ai", to: "rv", ports: ["r", "l"] },
    { from: "rv", to: "db", ports: ["r", "l"], label: "Confirmed" },
    { from: "rv", to: "bl", ports: ["b", "t"], label: "Rejected" },
    { from: "bl", to: "db", ports: ["r", "b"], label: "Resolved", dashed: true },
    { from: "db", to: "ix", ports: ["r", "l"] },
    { from: "ix", to: "md", ports: ["b", "t"] },
  ],
  wide: {
    cols: 5, rows: 2,
    at: { bi: [0, 0], sc: [0, 1], ai: [1, 0.5], rv: [2, 0.5], bl: [2, 1.5], db: [3, 0.5], ix: [4, 0.5], md: [4, 1.5] },
    zones: [{ label: "Input", span: [0, 0] }, { label: "Intelligence & decision", span: [1, 2] }, { label: "Product data", span: [3, 3] }, { label: "Device readiness", span: [4, 4] }],
  },
  tall: {
    cols: 2, rows: 7.25,
    at: { bi: [0, 0], sc: [1, 0], ai: [0.5, 1.15], rv: [0.5, 2.25], bl: [1.1, 3.2], db: [0.5, 4.3], ix: [0.5, 5.4], md: [0.5, 6.35] },
    ports: { "bi>ai": ["b", "t"], "sc>ai": ["b", "t"], "ai>rv": ["b", "t"], "rv>db": ["b", "t"], "rv>bl": ["r", "t"], "bl>db": ["b", "r"], "db>ix": ["b", "t"] },
  },
};

// ---------------------------------------------------------------------------
// rendering
const DIMS = {
  wide: { cw: 236, rh: 150, w: 200, h: 78, dw: 176, dh: 116, font: 17, pad: 48, top: 40 },
  tall: { cw: 270, rh: 116, w: 236, h: 76, dw: 200, dh: 104, font: 19, pad: 30, top: 28 },
};

function html(d0: Diagram, mode: "wide" | "tall") {
  const d = mode === "tall" && d0.tallNodes ? { ...d0, nodes: d0.tallNodes, edges: d0.tallEdges ?? d0.edges } : d0;
  const L = d[mode], D = DIMS[mode];
  const zoneHead = L.zones ? (mode === "wide" ? 46 : 0) : 0;
  const zoneLeft = 0;
  const W = D.pad * 2 + L.cols * D.cw + zoneLeft;
  const H = D.top + zoneHead + L.rows * D.rh + D.pad;
  const cx = (c: number) => D.pad + zoneLeft + c * D.cw + D.cw / 2;
  const cy = (r: number) => D.top + zoneHead + r * D.rh + D.rh / 2;
  const size = (n: Node) => n.kind === "decision" ? [D.dw, D.dh] : n.kind === "start" ? [D.w * 0.62, D.h * 0.72] : n.kind === "end" ? [D.w, D.h * 0.86] : [D.w, D.h + (n.sub ? 18 : 0) + (n.kind === "system" && n.sub ? 22 : 0)];
  const box: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const n of d.nodes) {
    const [c, r] = L.at[n.id];
    const [w, h] = size(n);
    box[n.id] = { x: cx(c), y: cy(r), w, h };
  }
  const pt = (id: string, p: Port): [number, number] => {
    const b = box[id];
    return p === "t" ? [b.x, b.y - b.h / 2] : p === "b" ? [b.x, b.y + b.h / 2] : p === "l" ? [b.x - b.w / 2, b.y] : [b.x + b.w / 2, b.y];
  };
  const vert = (p: Port) => p === "t" || p === "b";
  const lanePx = (lane: number, axis: "x" | "y") => (axis === "y" ? cy(lane) : cx(lane));

  let svg = "";
  let chips = "";
  for (const e of d.edges) {
    const key = `${e.from}>${e.to}`;
    const [pa, pb] = L.ports?.[key] ?? e.ports;
    const A = pt(e.from, pa), B = pt(e.to, pb);
    const lane = L.lanes?.[key];
    let pts: [number, number][];
    const g = 2; // gap from the shape
    const out = (p: Port, [x, y]: [number, number]): [number, number] => p === "t" ? [x, y - g] : p === "b" ? [x, y + g] : p === "l" ? [x - g, y] : [x + g, y];
    const a = out(pa, A), b = out(pb, B);
    if (vert(pa) && vert(pb)) {
      const m = lane !== undefined ? lanePx(lane, "y") : a[1] === b[1] ? a[1] : (a[1] + b[1]) / 2;
      pts = Math.abs(a[0] - b[0]) < 1 ? [a, b] : [a, [a[0], m], [b[0], m], b];
    } else if (!vert(pa) && !vert(pb)) {
      const m = lane !== undefined ? lanePx(lane, "x") : (a[0] + b[0]) / 2;
      pts = Math.abs(a[1] - b[1]) < 1 ? [a, b] : [a, [m, a[1]], [m, b[1]], b];
    } else if (!vert(pa)) pts = [a, [b[0], a[1]], b];
    else pts = [a, [a[0], b[1]], b];
    // rounded corners
    let dpath = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (i < pts.length - 1) {
        const [px, py] = pts[i - 1], [nx, ny] = pts[i + 1];
        const r = Math.min(12, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2);
        const ux = Math.sign(x - px), uy = Math.sign(y - py), vx = Math.sign(nx - x), vy = Math.sign(ny - y);
        dpath += `L${x - ux * r} ${y - uy * r}Q${x} ${y} ${x + vx * r} ${y + vy * r}`;
      } else dpath += `L${x} ${y}`;
    }
    const col = e.dashed ? "#8a847c" : "#2b2925";
    svg += `<path d="${dpath}" fill="none" stroke="${col}" stroke-width="1.8" ${e.dashed ? 'stroke-dasharray="6 5"' : ""} stroke-linecap="round" stroke-linejoin="round"/>`;
    // arrow head at b, pointing along the last segment
    const [lx, ly] = pts[pts.length - 2];
    const ang = Math.atan2(b[1] - ly, b[0] - lx);
    const s = 7.5;
    const h1 = [b[0] - s * 1.5 * Math.cos(ang) + s * Math.sin(ang), b[1] - s * 1.5 * Math.sin(ang) - s * Math.cos(ang)];
    const h2 = [b[0] - s * 1.5 * Math.cos(ang) - s * Math.sin(ang), b[1] - s * 1.5 * Math.sin(ang) + s * Math.cos(ang)];
    svg += `<path d="M${b[0]} ${b[1]}L${h1[0]} ${h1[1]}L${h2[0]} ${h2[1]}Z" fill="${col}"/>`;
    if (e.label) {
      // on the longest segment, at its middle
      let best = 0, bi = 0;
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (l > best) { best = l; bi = i; } }
      const mx = (pts[bi][0] + pts[bi - 1][0]) / 2, my = (pts[bi][1] + pts[bi - 1][1]) / 2;
      const cls = e.label === "Yes" ? "yes" : e.label === "No" ? "no" : "tag";
      chips += `<span class="chip ${cls}" style="left:${mx}px;top:${my}px">${e.label}</span>`;
    }
  }

  let zones = "";
  for (const z of L.zones ?? []) {
    if (mode === "wide") {
      const x1 = D.pad + z.span[0] * D.cw + 6, x2 = D.pad + (z.span[1] + 1) * D.cw - 6;
      zones += `<div class="zone" style="left:${x1}px;top:${D.top - 14}px;width:${x2 - x1}px;height:${H - D.top - D.pad + 34}px"><b>${z.label}</b></div>`;
    } else {
      const y1 = cy(z.span[0]) - D.rh / 2 + 6, y2 = cy(z.span[1]) + D.rh / 2 - 6;
      zones += `<div class="zone tallz" style="left:${D.pad - 10}px;top:${y1}px;width:${W - 2 * D.pad + 20}px;height:${y2 - y1}px"><b>${z.label}</b></div>`;
    }
  }

  const nodes = d.nodes
    .map((n) => {
      const b = box[n.id];
      const st = `left:${b.x - b.w / 2}px;top:${b.y - b.h / 2}px;width:${b.w}px;height:${b.h}px`;
      const inner = `<span>${n.text}</span>${n.sub ? `<small>${n.sub}</small>` : ""}`;
      if (n.kind === "decision")
        return `<div class="node decision" style="${st}"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,1.5 98.5,50 50,98.5 1.5,50" vector-effect="non-scaling-stroke"/></svg><div class="dtext">${inner}</div></div>`;
      return `<div class="node ${n.kind}" style="${st}">${inner}</div>`;
    })
    .join("");

  const css = `
@font-face { font-family: G; src: url(${font("geist-sans/Geist-Variable.woff2")}); font-weight: 100 900; }
@font-face { font-family: M; src: url(${font("geist-mono/GeistMono-Medium.woff2")}); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #f4f2ee; font-family: G, sans-serif; color: #222; -webkit-font-smoothing: antialiased; }
#d { position: relative; width: ${W}px; height: ${H}px; }
svg.w { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; z-index: 2; }
.zone { position: absolute; border-radius: 18px; background: rgba(255,255,255,.55); border: 1px solid #e6e2dc; z-index: 0; }
.zone b { position: absolute; left: 0; right: 0; top: 14px; text-align: center; font: 12.5px/1 M, monospace; letter-spacing: .05em; text-transform: uppercase; color: #8a847c; font-weight: 400; }
.tallz b { left: 12px; right: auto; top: 50%; white-space: nowrap; transform: translate(-50%, 0) rotate(-90deg) translate(0, 50%); transform-origin: 50% 50%; width: auto; left: 22px; }
.node { position: absolute; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 16px; text-align: center;
  font-size: ${D.font}px; line-height: 1.25; font-weight: 500; letter-spacing: -.01em; border-radius: 14px; }
.node small { font-size: ${D.font - 4}px; font-weight: 400; color: #77716a; line-height: 1.3; }
.step { background: #fff; border: 1.6px solid #cfc9c0; }
.system { background: #fff; border: 1.6px solid #222; box-shadow: 0 10px 24px -16px rgba(0,0,0,.35); }
.exception { background: #fff8f6; border: 1.6px dashed #ff8f80; }
.start, .end { background: #222; color: #fff; border-radius: 999px; font-weight: 560; }
.end small { color: rgba(255,255,255,.7); }
.decision { padding: 0; }
.decision svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.decision polygon { fill: #fff1ee; stroke: #ff4938; stroke-width: 1.8; }
.dtext { position: relative; width: 70%; display: grid; gap: 2px; font-size: ${D.font - 1}px; line-height: 1.2; }
.chip { position: absolute; z-index: 4; transform: translate(-50%, -50%); padding: 5px 10px; border-radius: 7px; font: 600 ${D.font - 3}px/1 G, sans-serif; white-space: nowrap; }
.yes { background: #e2f3e7; color: #1d7a3e; }
.no { background: #ffe6e1; color: #c2301f; }
.tag { background: #fff; color: #5a554e; border: 1px solid #e0dbd3; font-weight: 500; }
.tall .tag { white-space: normal; width: 128px; text-align: center; line-height: 1.25; }
`;
  return `<!doctype html><html class="${mode}"><style>${css}</style><body><div id="d">${zones}<svg class="w">${svg}</svg>${nodes}${chips}</div></body></html>`;
}

async function main() {
  const browser = await chromium.launch();
  const only = process.argv[2];
  for (const d of [ambientFlow, selfReadyFlow, ambientArch, selfReadyArch]) {
    if (only && !d.file.includes(only)) continue;
    for (const mode of ["wide", "tall"] as const) {
      const page = await browser.newPage({ viewport: { width: 1800, height: 1400 }, deviceScaleFactor: 2 });
      await page.setContent(html(d, mode));
      await page.evaluate(() => document.fonts.ready);
      const png = await page.locator("#d").screenshot();
      const file = path.join(ROOT, "public/images/case-studies", `${d.file}${mode === "tall" ? "_mobile" : ""}.webp`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const trimmed = await sharp(png).trim({ background: "#f4f2ee", threshold: 4 }).toBuffer();
      await sharp(trimmed).extend({ top: 56, bottom: 56, left: 56, right: 56, background: "#f4f2ee" }).webp({ quality: 92 }).toFile(file);
      const m = await sharp(file).metadata();
      console.log(path.relative(ROOT, file), `${m.width}×${m.height}`, `${Math.round(fs.statSync(file).size / 1024)} KB`);
      await page.close();
    }
  }
  await browser.close();
}
main();
