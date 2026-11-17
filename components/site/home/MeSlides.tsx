"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import m from "./me.module.css";

export type MeSlide = { title?: string; parts: { label?: string; text: string }[]; photo: string | null; need: string; sticker: string };

const EVERY = 7000;

/** a little flower sticker on the photo's corner */
function Flower({ color }: { color: string }) {
  return (
    <svg className={m.flower} viewBox="0 0 40 40" aria-hidden="true">
      <g fill={color}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx="20" cy="9" rx="6" ry="9" transform={`rotate(${i * 45} 20 20)`} />
        ))}
      </g>
      <circle cx="20" cy="20" r="5.5" fill="#fff" />
    </svg>
  );
}

/**
 * "What makes me, me?": a few big first-person statements, one at a time,
 * each beside a black-and-white photo. They move on by themselves (paused
 * while hovered or focused, and never with reduced motion); the dots and the
 * ← → keys move between them.
 */
export default function MeSlides({ slides }: { slides: MeSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const n = slides.length;
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    // only run while the panel is on screen
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting && e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] });
    if (el) io.observe(el);
    const t = window.setInterval(() => visible && !document.hidden && setI((v) => (v + 1) % n), EVERY);
    return () => {
      window.clearInterval(t);
      io.disconnect();
    };
  }, [paused, n]);

  return (
    <div
      ref={root}
      className={m.me}
      role="group"
      aria-roledescription="carousel"
      aria-label="What makes me, me"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(i + 1);
        if (e.key === "ArrowLeft") go(i - 1);
      }}
    >
      <div className={m.stage}>
        {slides.map((s, k) => (
            <div key={k} className={`${m.slide} ${k === i ? m.on : ""}`} aria-hidden={k !== i} aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}>
              <div className={m.words}>
                {s.title && <p className={m.title}>{s.title}</p>}
                {s.parts.map((p, j) => (
                  <p key={j} className={p.label ? m.partLabelled : m.part}>
                    {p.label && <span className={m.label}>{p.label}</span>}
                    {p.text}
                  </p>
                ))}
              </div>
              <figure className={m.photo}>
                {s.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo} alt="" loading="lazy" />
                ) : (
                  <div className={m.slot}>
                    <b>Photo coming soon</b>
                    <span>{s.need}</span>
                  </div>
                )}
                <Flower color={s.sticker} />
              </figure>
            </div>
        ))}
      </div>

      <div className={m.dots}>
          {slides.map((_, k) => (
            <button key={k} type="button" aria-label={`Show ${k + 1} of ${n}`} aria-current={k === i} onClick={() => go(k)} className={k === i ? m.dotOn : ""} />
          ))}
      </div>
    </div>
  );
}
