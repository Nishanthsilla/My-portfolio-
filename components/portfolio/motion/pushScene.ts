/**
 * Hero "push scene" — ported from the original script without behavioural
 * changes. Sprite: frame 0 = ready, 1–13 = push cycle.
 * S.walkIn (0→1) walks the character in; S.sp (0→1) is the scroll-driven push.
 */
export type PushState = { walkIn: number; sp: number; spS: number };

export function createPushScene(reduce: boolean) {
  const S: PushState = { walkIn: 0, sp: 0, spS: 0 };
  const scene = document.getElementById("scene")!;
  const svg = document.getElementById("stageSvg")!;
  const pushText = document.getElementById("pushText")!;
  const revealT = document.getElementById("revealText")!;
  const spr = document.getElementById("sprite")!;
  const gEl = {
    excl: document.getElementById("excl")!,
    ground: document.getElementById("ground")!,
    dust: document.getElementById("dust")!,
  };
  const speedLines = Array.from(document.querySelectorAll<SVGLineElement>("#speed line"));
  const NF = 14;
  const ASPECT = 346 / 303;
  let W = 0, H = 0, GY = 0, textW = 0, textH = 0, tl0 = 0, charH = 200, spW = 200, s = 1;
  let startX = 0, standX = 0, contactX = 0, endX = 0;
  let lastTL: number | null = null, lastNow = 0, lastIdx = -1;
  let raf = 0;
  let once = false;
  let stopped = false;

  const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  function layout() {
    const r = scene.getBoundingClientRect();
    W = r.width;
    H = r.height;
    if (!W || !H) return;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    GY = H - 8;
    pushText.style.fontSize = "100px";
    const w100 = pushText.offsetWidth, h100 = pushText.offsetHeight;
    let F = (100 * (W < 700 ? W * 0.5 : W * 0.58)) / w100;
    if ((h100 * F) / 100 > (H - 20) * 0.8) F = (100 * (H - 20) * 0.8) / h100;
    pushText.style.fontSize = F + "px";
    textW = pushText.offsetWidth;
    textH = pushText.offsetHeight;
    tl0 = W - textW - Math.max(16, W * 0.07);
    charH = Math.min(textH * (W < 700 ? 1.05 : 1.12), H - 12);
    spW = charH * ASPECT;
    s = charH / 250;
    spr.style.width = spW + "px";
    spr.style.height = charH + "px";
    revealT.style.fontSize = F * 0.4 + "px";
    revealT.style.left = tl0 + "px";
    contactX = tl0 + 2;
    standX = tl0 - charH * 0.14;
    startX = -12;
    endX = W - charH * 0.3;
    if (standX - spW < 4) standX = spW + 4;
    gEl.ground.setAttribute("x2", String(W));
    gEl.ground.setAttribute("y1", String(GY));
    gEl.ground.setAttribute("y2", String(GY));
  }

  type Puff = { el: SVGCircleElement; x: number; y: number; vx: number; vy: number; r: number; life: number };
  const puffs: Puff[] = [];
  function puff(x: number, y: number) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    gEl.dust.appendChild(c);
    puffs.push({ el: c, x, y, vx: -(0.4 + Math.random() * 1.2), vy: -(0.1 + Math.random() * 0.5), r: (4 + Math.random() * 7) * s * 1.6, life: 1 });
  }
  const cyc = (d: number) => 1 + (Math.floor(Math.abs(d) / (charH * 0.055)) % 13);

  function frame(now?: number) {
    if (stopped) return;
    now = now || 0;
    const t = now / 1000;
    const dt = Math.min(0.05, (now - lastNow) / 1000 || 0.016);
    lastNow = now;
    if (!W) layout();
    S.spS += (S.sp - S.spS) * Math.min(1, dt * 9);
    const sp = S.spS;
    let x: number, idx = 0, tl = tl0, excl = 0, bob = 0;
    const a = 0.08, b = 0.62, c = 0.8;
    if (sp < 0.0005) {
      x = lerp(startX, standX, S.walkIn);
      if (S.walkIn < 1) {
        idx = cyc(x);
        bob = Math.abs(Math.sin(x / (charH * 0.11))) * charH * 0.012;
      } else {
        idx = 0;
        bob = Math.sin(t * 2) * charH * 0.004;
      }
      excl = S.walkIn >= 1 ? 1 : 0;
    } else if (sp < a) {
      const u = sp / a;
      x = lerp(standX, contactX, u);
      idx = u < 0.15 ? 0 : cyc(x);
      excl = 1 - clamp(u * 3, 0, 1);
    } else if (sp < b) {
      const u2 = (sp - a) / (b - a);
      x = lerp(contactX, endX, u2);
      tl = x - 2;
      idx = cyc(x);
    } else if (sp < c) {
      const u3 = (sp - b) / (c - b), e = 1 - Math.pow(1 - u3, 3);
      x = endX;
      tl = lerp(endX - 2, W + 40, e);
      idx = u3 < 0.3 ? cyc(endX) : 0;
    } else {
      x = endX;
      tl = W + 40;
      idx = 0;
      bob = Math.sin(t * 2) * charH * 0.004;
    }
    spr.style.transform = "translate3d(" + (x - spW).toFixed(1) + "px," + (-bob).toFixed(1) + "px,0)";
    if (idx !== lastIdx) {
      spr.style.backgroundPosition = ((idx / (NF - 1)) * 100).toFixed(4) + "% 0";
      lastIdx = idx;
    }
    pushText.style.transform = "translate3d(" + tl.toFixed(1) + "px,0,0)";
    const shown = Math.max(0, tl - tl0);
    revealT.style.clipPath = "inset(0 calc(100% - " + shown.toFixed(1) + "px) 0 0)";
    const hx = x - spW * 0.42, hy = GY - charH * 1.02;
    gEl.excl.setAttribute("transform", "translate(" + hx.toFixed(1) + "," + hy.toFixed(1) + ") scale(" + (s * 1.4 * (0.6 + 0.4 * excl)).toFixed(3) + ")");
    gEl.excl.setAttribute("opacity", excl.toFixed(2));
    const v = lastTL == null ? 0 : Math.abs(tl - lastTL) / Math.max(dt, 0.001);
    lastTL = tl;
    if (v > 40 && tl < W) {
      const n = Math.min(3, Math.ceil(v / 600));
      for (let i = 0; i < n; i++) puff(tl + Math.random() * textW * 0.6, GY - 2);
    }
    for (let j = puffs.length - 1; j >= 0; j--) {
      const p = puffs[j];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt * 1.4;
      p.r *= 1.01;
      if (p.life <= 0) {
        p.el.remove();
        puffs.splice(j, 1);
        continue;
      }
      p.el.setAttribute("cx", p.x.toFixed(1));
      p.el.setAttribute("cy", p.y.toFixed(1));
      p.el.setAttribute("r", p.r.toFixed(1));
      p.el.setAttribute("opacity", p.life.toFixed(2));
    }
    const sv = clamp((v - 150) / 900, 0, 1);
    speedLines.forEach((L, i) => {
      const y = GY - textH * (0.25 + i * 0.25), x0 = tl - 30 - i * 14;
      L.setAttribute("x1", String(x0 - charH * 0.2));
      L.setAttribute("x2", String(x0));
      L.setAttribute("y1", String(y));
      L.setAttribute("y2", String(y));
      L.setAttribute("opacity", (sv * (1 - i * 0.2)).toFixed(2));
    });
    if (!reduce || once !== true) {
      once = true;
      raf = requestAnimationFrame(frame);
    }
  }

  const onResize = () => layout();
  addEventListener("resize", onResize);
  document.fonts?.ready.then(() => !stopped && layout());
  if (reduce) S.walkIn = 1;
  raf = requestAnimationFrame(frame);

  return {
    S,
    layout,
    destroy() {
      stopped = true;
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      puffs.forEach((p) => p.el.remove());
    },
  };
}
