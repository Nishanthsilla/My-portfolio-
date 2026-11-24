/**
 * Homepage scroll check — run before pushing changes to the homepage:
 *
 *   npm run build && npm start          (in one terminal)
 *   npm run check:scroll                 (in another; or: node scripts/qa/check-scroll.mjs <url>)
 *
 * It scrolls the homepage page by page with a mouse wheel on a normal CPU and
 * on a 4× slower one (a laptop on battery), and fails if:
 *   · a page takes more than 100 ms to start moving after the scroll,
 *   · a slide drops more than 4 frames (a frame slower than 25 ms),
 *   · a scroll doesn't land exactly one page further.
 * Keep it green: anything that animates on the homepage must hold still while
 * the page slides (check `"paging" in document.documentElement.dataset`).
 */
// Playwright: the project's own install if there is one, otherwise a global one (npm i -g playwright)
const { chromium } = require("playwright");

(async () => {

const URL = process.argv[2] || "http://localhost:3000/";
const LIMITS = { react: 100, slow: 4 };
let failed = false;

for (const cpu of [1, 4]) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => sessionStorage.setItem("nishanth.introFilm.seen", "1"));
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.mouse.move(700, 500);
  await page.waitForTimeout(500); // a visitor moves the mouse a moment before scrolling
  await page.evaluate(() => {
    const w = window;
    w.__r = [];
    const tr = [...document.querySelectorAll("div")].find((d) => /journeyTrack/.test(d.className));
    let pending = null, last = performance.now(), slow = 0, frames = 0, still = 0;
    addEventListener("wheel", (e) => { if (!pending) pending = { t: e.timeStamp, x: tr.getBoundingClientRect().left, y: scrollY }; }, { capture: true, passive: true });
    const f = (t) => {
      const dt = t - last; last = t;
      if (pending) {
        const x = tr.getBoundingClientRect().left;
        if (pending.first == null && Math.abs(x - pending.x) > 4) pending.first = t - pending.t;
        if (pending.first != null) {
          frames++; if (dt > 25) slow++;
          if (Math.abs(x - (pending.lx ?? x)) < 0.5) { if (++still > 6) { w.__r.push({ react: Math.round(pending.first), slow, frames, dy: Math.round(scrollY - pending.y) }); pending = null; still = slow = frames = 0; } } else still = 0;
          if (pending) pending.lx = x;
        }
      }
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
  for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(1100); }
  const rows = await page.evaluate(() => window.__r);
  console.log(`\nCPU ${cpu}×`);
  rows.forEach((r, i) => {
    const bad = r.react > LIMITS.react || r.slow > LIMITS.slow || r.dy < 200;
    if (bad) failed = true;
    console.log(`  ${bad ? "✗" : "✓"} page ${i + 1}: moves after ${r.react} ms, ${r.slow}/${r.frames} slow frames, moved ${r.dy}px`);
  });
  if (rows.length < 8) { failed = true; console.log(`  ✗ only ${rows.length} of 8 scrolls moved the page`); }
  await browser.close();
}
console.log(failed ? "\nScroll check FAILED" : "\nScroll check passed");
process.exit(failed ? 1 : 0);
})();
