/**
 * Draws the case-study flowcharts (user flow + product architecture) as static
 * images, from the `journey` and `architecture` data in lib/site/studies/*.
 * Each diagram gets a wide version and a tall phone version.
 *
 *   npx tsx scripts/diagrams/render.ts
 *
 * Needs Playwright with Chromium (pre-installed in the cloud sandbox) and
 * writes WebP files to public/images/case-studies/<slug>/diagrams/.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { ambientAi } from "../../lib/site/studies/ambientAi";
import { selfReadyStudy } from "../../lib/site/studies/selfReady";
import type { Study } from "../../lib/site/studies/types";

const require = createRequire(import.meta.url);
/* eslint-disable @typescript-eslint/no-explicit-any -- dev-only script; Playwright is not a project dependency */
const { chromium } = require("playwright") as any;
const sharp = require("sharp") as any;

const ROOT = process.cwd();
const font = (f: string) => "data:font/woff2;base64," + fs.readFileSync(path.join(ROOT, "node_modules/geist/dist/fonts", f)).toString("base64");
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const pad = (n: number) => String(n).padStart(2, "0");

const CSS = `
@font-face { font-family: G; src: url(${font("geist-sans/Geist-Variable.woff2")}); font-weight: 100 900; }
@font-face { font-family: M; src: url(${font("geist-mono/GeistMono-Medium.woff2")}); }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #f4f2ee; font-family: G, sans-serif; color: #222; -webkit-font-smoothing: antialiased; }
#d { position: relative; padding: 56px 56px 60px; }
svg.wires { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.num { font: 13px/1 M, monospace; color: #ff4938; letter-spacing: .02em; }
.lab { font-size: 21px; font-weight: 600; letter-spacing: -.015em; line-height: 1.2; }
.node { position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; min-height: 96px; padding: 18px 20px;
  background: #fff; border: 1.5px solid #d8d3cb; border-radius: 14px; font-size: 18px; line-height: 1.32; letter-spacing: -.005em; }
.dot { flex: none; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #222; color: #fff; font: 13px/1 M, monospace; }
/* user flow */
.row { display: grid; grid-template-columns: 210px 1fr; align-items: center; }
.row + .row { margin-top: 76px; }
.stage { display: grid; gap: 10px; padding-right: 24px; }
.nodes { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 0 54px; }
/* architecture */
.band { position: relative; z-index: 1; display: grid; grid-template-columns: 210px 1fr; align-items: center; padding: 26px 28px; border-radius: 18px; background: #fff; border: 1.5px solid #e2ded7; }
.band + .band { margin-top: 64px; }
.band .node { background: #f7f5f1; border-color: #e3dfd8; min-height: 88px; justify-content: center; text-align: center; font-size: 17px; }
/* phone */
.tall #d { padding: 40px 32px 44px; }
.tall .row, .tall .band { grid-template-columns: 1fr; }
.tall .stage { display: flex; align-items: baseline; gap: 12px; padding: 0 0 18px; }
.tall .nodes { grid-template-columns: 1fr; gap: 40px 0; }
.tall .row + .row { margin-top: 64px; }
.tall .band { padding: 22px 22px 24px; }
.tall .band + .band { margin-top: 60px; }
.tall .node { min-height: 0; font-size: 21px; padding: 18px 20px; }
.tall .band .node { justify-content: flex-start; text-align: left; }
.tall .lab { font-size: 24px; }
`;

/** edges: [from id, to id, kind] — h: side to side · v: top to bottom · r: end of a row back to the start of the next */
const WIRES = `
const ACC = "#ff4938", INK = "#222";
const svg = document.querySelector("svg.wires"), root = document.getElementById("d").getBoundingClientRect();
const box = (id) => { const r = document.getElementById(id).getBoundingClientRect(); return { l: r.left - root.left, r: r.right - root.left, t: r.top - root.top, b: r.bottom - root.top, cx: (r.left + r.right) / 2 - root.left, cy: (r.top + r.bottom) / 2 - root.top }; };
const head = (x, y, dir, c) => { const s = 7; const p = dir === "r" ? [[x, y], [x - s * 1.4, y - s], [x - s * 1.4, y + s]] : [[x, y], [x - s, y - s * 1.4], [x + s, y - s * 1.4]]; return '<path d="M' + p.map(q => q.join(" ")).join("L") + 'Z" fill="' + c + '"/>'; };
let out = "";
for (const [a, b, k] of window.EDGES) {
  const A = box(a), B = box(b);
  if (k === "h") { out += '<path d="M' + (A.r + 2) + ' ' + A.cy + 'H' + (B.l - 3) + '" stroke="' + ACC + '" stroke-width="2"/>' + head(B.l - 1, B.cy, "r", ACC); }
  if (k === "v") { const x = A.cx; out += '<path d="M' + x + ' ' + (A.b + 2) + 'V' + (B.t - 3) + '" stroke="' + INK + '" stroke-width="2"/>' + head(x, B.t - 1, "d", INK); }
  if (k === "r") {
    const y = (A.b + B.t) / 2, R = 14, x1 = A.cx, x2 = B.cx;
    out += '<path d="M' + x1 + ' ' + (A.b + 2) + 'V' + (y - R) + 'Q' + x1 + ' ' + y + ' ' + (x1 - R) + ' ' + y + 'H' + (x2 + R) + 'Q' + x2 + ' ' + y + ' ' + x2 + ' ' + (y + R) + 'V' + (B.t - 3) + '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="1 0"/>' + head(x2, B.t - 1, "d", INK);
  }
}
svg.innerHTML = out;
`;

function journeyHTML(st: Study, tall: boolean) {
  const edges: [string, string, string][] = [];
  let n = 0;
  let prevLast = "";
  const rows = st.journey.stages
    .map((sg, si) => {
      const nodes = sg.steps
        .map((t, i) => {
          const id = `j${n}`;
          if (i > 0) edges.push([`j${n - 1}`, id, tall ? "v" : "h"]);
          else if (prevLast) edges.push([prevLast, id, tall ? "v" : "r"]);
          n++;
          return `<div class="node" id="${id}"><span class="dot">${n}</span><span>${esc(t)}</span></div>`;
        })
        .join("");
      prevLast = `j${n - 1}`;
      return `<div class="row"><div class="stage"><span class="num">${pad(si + 1)}</span><span class="lab">${esc(sg.label)}</span></div><div class="nodes" style="--n:${sg.steps.length}">${nodes}</div></div>`;
    })
    .join("");
  return { body: rows, edges };
}

function archHTML(st: Study, tall: boolean) {
  const edges: [string, string, string][] = [];
  const bands = st.architecture.layers
    .map((l, li) => {
      const nodes = l.items
        .map((t, i) => {
          const id = `a${li}-${i}`;
          if (i > 0) edges.push([`a${li}-${i - 1}`, id, tall ? "v" : "h"]);
          return `<div class="node" id="${id}">${esc(t)}</div>`;
        })
        .join("");
      if (li > 0) edges.push([`b${li - 1}`, `b${li}`, "v"]);
      return `<div class="band" id="b${li}"><div class="stage"><span class="num">${pad(li + 1)}</span><span class="lab">${esc(l.label)}</span></div><div class="nodes" style="--n:${l.items.length}">${nodes}</div></div>`;
    })
    .join("");
  return { body: bands, edges };
}

async function main() {
  const browser = await chromium.launch();
  for (const st of [ambientAi, selfReadyStudy]) {
    const dir = path.join(ROOT, "public/images/case-studies", st.slug, "diagrams");
    fs.mkdirSync(dir, { recursive: true });
    for (const [name, make] of [["user-flow", journeyHTML], ["architecture", archHTML]] as const) {
      for (const tall of [false, true]) {
        const { body, edges } = make(st, tall);
        const page = await browser.newPage({ viewport: { width: tall ? 720 : 1680, height: 800 }, deviceScaleFactor: 2 });
        await page.setContent(`<!doctype html><html class="${tall ? "tall" : ""}"><style>${CSS}</style><body><div id="d"><svg class="wires"></svg>${body}</div><script>window.EDGES=${JSON.stringify(edges)}</script></body></html>`);
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(WIRES);
        const png = await page.locator("#d").screenshot();
        const file = path.join(dir, `${st.slug.replace(/-/g, "_")}_${name.replace("-", "_")}${tall ? "_mobile" : ""}.webp`);
        await sharp(png).webp({ quality: 92 }).toFile(file);
        const m = await sharp(file).metadata();
        console.log(path.relative(ROOT, file), `${m.width}×${m.height}`, `${Math.round(fs.statSync(file).size / 1024)} KB`);
        await page.close();
      }
    }
  }
  await browser.close();
}
main();
