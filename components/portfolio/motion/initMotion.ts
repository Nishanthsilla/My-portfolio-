/**
 * Scroll and interaction motion, ported from the original inline script.
 * Behaviour is unchanged except:
 *  - the old loader (counter, progress bar, slide-up) is gone;
 *  - the hero entrance that followed it now plays when the cinematic intro
 *    starts revealing the page (onIntroReveal);
 *  - nav scramble and copy-email live in React components;
 *  - everything is torn down on unmount.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIntroDone, onIntroReveal } from "@/lib/introState";
import { createPushScene } from "./pushScene";
import { initPointer } from "./pointer";

export function initPortfolioMotion(): () => void {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const G = gsap;
  const ST = ScrollTrigger;
  const q = <T extends Element = HTMLElement>(s: string, c?: ParentNode) => (c || document).querySelector<T>(s)!;
  const qa = <T extends Element = HTMLElement>(s: string, c?: ParentNode) => Array.from((c || document).querySelectorAll<T>(s));

  const cleanups: (() => void)[] = [];
  const listen = (t: EventTarget, type: string, fn: EventListener) => {
    t.addEventListener(type, fn);
    cleanups.push(() => t.removeEventListener(type, fn));
  };

  body.dataset.tone = "paper";
  G.registerPlugin(ST);

  const push = createPushScene(reduce);
  const S = push.S;
  cleanups.push(push.destroy);

  const ctx = G.context(() => {
    /* tone switching */
    qa<HTMLElement>("section[data-tone]").forEach((s) => {
      ST.create({ trigger: s, start: "top 55%", end: "bottom 55%", onToggle: (self) => { if (self.isActive) body.dataset.tone = s.dataset.tone; } });
    });

    if (reduce) {
      S.walkIn = 1;
      return;
    }

    /* hero entrance (formerly chained after the old loader) */
    let safety = 0;
    const intro = G.timeline({ paused: true, onComplete: () => window.clearTimeout(safety) });
    intro
      .from(".hero-reveal", { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 })
      .to(S, { walkIn: 1, duration: 2.6, ease: "none" }, "-=.7")
      .from(".bar .wrap", { yPercent: -120, opacity: 0, duration: 0.8, ease: "power3.out" }, "<");
    cleanups.push(
      onIntroReveal(() => {
        safety = window.setTimeout(() => {
          G.set(".hero-reveal,.bar .wrap", { clearProps: "all" });
          S.walkIn = 1;
        }, 6000);
        intro.play();
      }),
    );
    cleanups.push(() => window.clearTimeout(safety));

    /* scroll progress + hide header */
    G.to(".progress i", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    const bar = document.getElementById("bar")!;
    ST.create({ start: 0, end: "max", onUpdate: (self) => { bar.classList.toggle("hide", self.direction === 1 && self.scroll() > 240); } });

    /* hero: pin and drive the push with scroll */
    ST.create({
      trigger: "#hero", start: "top top", end: "+=230%", pin: true, anticipatePin: 1,
      onUpdate: (self) => {
        S.sp = self.progress;
        if (self.progress > 0.001 && S.walkIn < 1) { intro.progress(1); S.walkIn = 1; }
      },
      onRefresh: push.layout,
    });

    /* velocity marquee */
    const mq = document.getElementById("mq")!;
    let mx = 0, dir = 1, boost = 0, half = mq.scrollWidth / 2;
    listen(window, "resize", () => { half = mq.scrollWidth / 2; });
    ST.create({ start: 0, end: "max", onUpdate: (self) => { dir = self.direction; boost = Math.min(Math.abs(self.getVelocity()) / 90, 14); } });
    const tickMarquee = (_time: number, dt: number) => {
      mx -= (0.9 + boost) * dir * dt * 0.06;
      boost *= 0.93;
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      mq.style.transform = "translate3d(" + mx + "px,0,0)";
    };
    G.ticker.add(tickMarquee);
    cleanups.push(() => G.ticker.remove(tickMarquee));

    /* manifesto word fill (text stays legible at rest) */
    G.fromTo("#manifesto .w", { opacity: 0.3 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: "#manifesto", start: "top 80%", end: "bottom 45%", scrub: true } });

    /* headings settle into place */
    qa(".h-move").forEach((h) => {
      G.fromTo(h.querySelectorAll(".word"), { yPercent: 55, rotate: 5 }, { yPercent: 0, rotate: 0, stagger: 0.06, ease: "none", scrollTrigger: { trigger: h, start: "top 98%", end: "top 55%", scrub: 0.6 } });
    });

    /* horizontal work + per-card parallax */
    const mm = G.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const sec = q("#work"), track = document.getElementById("track")!;
      sec.classList.add("h-on");
      ST.refresh();
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const nowEl = document.getElementById("wNow")!;
      const tween = G.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: ".work-pin", pin: true, scrub: 0.8, start: "top top", end: () => "+=" + dist(), invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { const n = Math.min(6, Math.max(1, Math.round(self.progress * 6 + 0.5))); nowEl.textContent = String(n).padStart(2, "0"); },
        },
      });
      qa("#track .card").forEach((card) => {
        G.fromTo(card.querySelector(".parallax"), { xPercent: -9 }, { xPercent: 9, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
        G.fromTo(card, { rotate: 2.5, y: 30 }, { rotate: 0, y: 0, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "left 55%", scrub: true } });
      });
      return () => { sec.classList.remove("h-on"); G.set(track, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 899px)", () => {
      qa("#track .card").forEach((card) => {
        G.fromTo(card.querySelector(".parallax"), { y: 30 }, { y: -30, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });

    /* human–agent loop */
    const path = document.getElementById("loopPath") as unknown as SVGPathElement;
    const len = path.getTotalLength(), dot = document.getElementById("loopDot")!;
    const steps = qa(".step"), nodes = qa(".loop-fig .node"), coreState = document.getElementById("coreState")!;
    const states = ["Intent set", "Running · 82% sure", "Awaiting approval"];
    G.set(path, { strokeDasharray: len, strokeDashoffset: len });
    let cur = -1;
    const loopUpdate = (p: number) => {
      const pt = path.getPointAtLength(Math.min(p, 0.999) * len);
      dot.setAttribute("cx", String(pt.x));
      dot.setAttribute("cy", String(pt.y));
      const i = Math.min(2, Math.floor(p * 3));
      if (i !== cur) {
        cur = i;
        steps.forEach((s, k) => s.classList.toggle("on", k === i));
        nodes.forEach((n, k) => n.classList.toggle("on", k <= i));
        G.fromTo(coreState, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });
        coreState.textContent = states[i];
      }
    };
    mm.add("(min-width: 900px)", () => {
      G.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "#approach", start: "top top", end: "+=170%", pin: true, scrub: 0.5, onUpdate: (s) => loopUpdate(s.progress) } });
    });
    mm.add("(max-width: 899px)", () => {
      q("#approach").classList.add("no-pin");
      G.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".loop-fig", start: "top 80%", end: "bottom 20%", scrub: 0.5, onUpdate: (s) => loopUpdate(s.progress) } });
      return () => q("#approach").classList.remove("no-pin");
    });

    /* experience rows slide in from the side (visible at rest) */
    qa(".row").forEach((r, i) => {
      G.fromTo(r, { x: i % 2 ? 40 : -40 }, { x: 0, ease: "none", scrollTrigger: { trigger: r, start: "top bottom", end: "top 70%", scrub: 0.6 } });
    });

    /* count-ups */
    qa<HTMLElement>("[data-count]").forEach((el) => {
      const o = { v: 0 }, target = +el.dataset.count!, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
      ST.create({ trigger: el, start: "top 88%", once: true, onEnter: () => { G.fromTo(o, { v: 0 }, { v: target, duration: 1.6, ease: "power3.out", onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; } }); } });
    });

    /* contact headline slides */
    G.fromTo(".contact .c1", { xPercent: -14 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 25%", scrub: true } });
    G.fromTo(".contact .c2", { xPercent: 16 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 25%", scrub: true } });
    G.fromTo(".contact .c3", { xPercent: -8 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "top 25%", scrub: true } });

    document.fonts?.ready.then(() => ST.refresh());
    // Re-measure once the intro has handed over (it briefly transforms the page).
    cleanups.push(onIntroDone(() => ST.refresh()));

    if (!fine) return;
    cleanups.push(initPointer(root));
  });

  return () => {
    cleanups.splice(0).reverse().forEach((fn) => fn());
    ctx.revert();
    root.classList.remove("has-cursor");
  };
}
