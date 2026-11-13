"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import SocialLinks from "../SocialLinks";
import { socials } from "@/lib/site/content";
import { story } from "@/lib/site/home";
import h from "./home.module.css";

const PANELS = 3;

/**
 * The introduction as a pinned horizontal story: the section is PANELS screens
 * tall; while it scrolls past, a sticky frame shows a track that moves
 * sideways in step with the vertical scroll. Scrolling simply continues into
 * the work below — nothing is trapped. When scrolling pauses between panels,
 * it settles gently on the nearest one. Reduced motion: the panels stack.
 */
export default function HorizontalIntro() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState(0);

  useEffect(() => {
    const sec = section.current, tr = track.current;
    if (!sec || !tr) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0, shown = -1, target = 0, current = 0, idle = 0, settling = false, lastY = scrollY, dir = 1;

    const range = () => {
      const r = sec.getBoundingClientRect();
      const len = sec.offsetHeight - innerHeight;
      return { top: r.top + scrollY, len: Math.max(1, len) };
    };
    const progressNow = () => {
      const { top, len } = range();
      return Math.min(1, Math.max(0, (scrollY - top) / len));
    };
    const paint = () => {
      raf = 0;
      if (reduce.matches) {
        tr.style.transform = "";
        return;
      }
      // ease toward the scroll position: wheel steps glide instead of jumping
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.0005) current = target;
      tr.style.transform = `translate3d(${(-current * (PANELS - 1) * 100).toFixed(3)}vw,0,0)`;
      const p = Math.round(current * (PANELS - 1));
      if (p !== shown) {
        shown = p;
        setPanel(p);
      }
      if (current !== target) raf = requestAnimationFrame(paint);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    // when scrolling pauses part-way between two panels, settle on the nearest one
    const settle = () => {
      const { top, len } = range();
      const p = (scrollY - top) / len;
      if (p <= 0.002 || p >= 0.998) return;
      // follow the visitor's direction: once ~18% of the way to the next panel, complete the move
      const step = 1 / (PANELS - 1);
      const f = p / step, base = Math.floor(f), frac = f - base;
      const near = (dir > 0 ? (frac > 0.18 ? base + 1 : base) : frac < 0.82 ? base : base + 1) * step;
      if (Math.abs(near - p) * len < 6) return;
      settling = true;
      scrollTo({ top: top + near * len, behavior: "smooth" });
      window.setTimeout(() => (settling = false), 700);
    };
    const onScroll = () => {
      if (scrollY !== lastY) dir = scrollY > lastY ? 1 : -1;
      lastY = scrollY;
      target = progressNow();
      kick();
      window.clearTimeout(idle);
      if (!settling && !reduce.matches) idle = window.setTimeout(settle, 160);
    };
    target = current = progressNow();
    paint();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
  }, []);

  /** Bring a panel into view by scrolling to its point in the section. */
  const go = (i: number) => {
    const sec = section.current;
    if (!sec) return;
    const k = Math.max(0, Math.min(PANELS - 1, i));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sec.querySelectorAll<HTMLElement>("[data-panel]")[k]?.scrollIntoView({ block: "start" });
      return;
    }
    const top = sec.getBoundingClientRect().top + scrollY;
    const len = sec.offsetHeight - innerHeight;
    scrollTo({ top: top + (len * k) / (PANELS - 1), behavior: "smooth" });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(panel + 1);
    else if (e.key === "ArrowLeft") go(panel - 1);
    else return;
    e.preventDefault();
  };

  const st = story;
  return (
    <section
      ref={section}
      className={h.story}
      style={{ height: `${PANELS * 100}svh` }}
      aria-roledescription="carousel"
      aria-label="Introduction"
      onKeyDown={onKey}
    >
      <div className={h.frame}>
        <div ref={track} className={h.track}>
          {/* 1 — introduction */}
          <div className={h.panel} data-panel aria-roledescription="slide" aria-label="1 of 3">
            <div className={h.panelInner}>
              <p className={h.eyebrow}>{st.hello.eyebrow}</p>
              <h1 className={h.headline}>
                {st.hello.headline.before}
                <em>{st.hello.headline.em}</em>
                {st.hello.headline.after}
              </h1>
              <p className={h.kicker}>
                <span className={h.dot} aria-hidden="true" /> {st.hello.kicker}
              </p>
            </div>
          </div>

          {/* 2 — focus and background */}
          <div className={h.panel} data-panel aria-roledescription="slide" aria-label="2 of 3">
            <div className={`${h.panelInner} ${h.factsPanel}`}>
              <dl className={h.facts}>
                {st.facts.map((f) => (
                  <div key={f.k} className={h.fact}>
                    <dt>{f.k}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
              <div className={h.factsSide}>
                <p className={h.now}>
                  <span>{st.now.k}</span> {st.now.v}
                </p>
                <div className={h.elsewhere}>
                  <span className={h.label}>Elsewhere</span>
                  <SocialLinks links={socials} />
                </div>
                <div className={h.actions}>
                  <a className={h.btnPrimary} href="#contact">Get in touch</a>
                  <Link className={h.btnSecondary} href="/about">About</Link>
                </div>
              </div>
            </div>
          </div>

          {/* 3 — how I work */}
          <div className={h.panel} data-panel aria-roledescription="slide" aria-label="3 of 3">
            <div className={`${h.panelInner} ${h.approach}`}>
              <p className={h.eyebrow}>{st.approach.eyebrow}</p>
              <p className={h.approachLine}>{st.approach.line}</p>
              <ol className={h.steps}>
                {st.approach.steps.map((x) => (
                  <li key={x.n}>
                    <span className={h.stepN}>{x.n}</span>
                    <b>{x.t}</b>
                    <span>{x.d}</span>
                  </li>
                ))}
              </ol>
              <p className={h.craft}>{st.approach.craft}</p>
            </div>
          </div>
        </div>

        {/* position + keyboard / pointer controls */}
        <div className={h.nav}>
          <span className={h.count} aria-live="polite">
            {String(panel + 1).padStart(2, "0")} <i>/</i> {String(PANELS).padStart(2, "0")}
          </span>
          <span className={h.bar} aria-hidden="true">
            <i style={{ transform: `scaleX(${(panel + 1) / PANELS})` }} />
          </span>
          <button type="button" className={h.arrowBtn} onClick={() => go(panel - 1)} disabled={panel === 0} aria-label="Previous panel">
            ←
          </button>
          <button type="button" className={h.arrowBtn} onClick={() => go(panel + 1)} disabled={panel === PANELS - 1} aria-label="Next panel">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
