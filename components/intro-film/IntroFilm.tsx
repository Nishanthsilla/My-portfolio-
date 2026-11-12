"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FILM_AUDIO_SRC, FILM_REPLAY } from "@/lib/introConfig";
import { announceDone, announceReveal, introState } from "@/lib/introState";
import {
  ABTestVisual, AnalyticsVisual, DesignSystemVisual, LearningVisual, OrchestrationVisual, SalesVisual,
} from "@/components/portfolio/visuals/Visuals";
import { film } from "./content";
import { FilmEngine } from "./engine";
import { FilmAudio, type SoundState } from "./audio";
import { FILM_END, HANDOFF, PREROLL } from "./timeline";
import styles from "./IntroFilm.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const SESSION_KEY = "nishanth.introFilm.seen";
const VISUALS = [SalesVisual, OrchestrationVisual, DesignSystemVisual, LearningVisual, ABTestVisual, AnalyticsVisual];

const Mask = ({ children, ...rest }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) => (
  <span className={styles.mask} {...rest}>{children}</span>
);

/** Words as individually revealable units, separated by real spaces. */
const Words = ({ words, attr }: { words: string[]; attr: string }) => (
  <>
    {words.map((w, i) => (
      <Fragment key={i}>
        {i > 0 && " "}
        <Mask><span className={styles.unit} {...{ [attr]: "" }}>{w}</span></Mask>
      </Fragment>
    ))}
  </>
);

/**
 * The motion-film introduction (active intro; see lib/introConfig.ts).
 * One clock drives the visuals (FilmEngine), the audio and the handoff into
 * the portfolio, which is rendered underneath the whole time.
 */
export default function IntroFilm() {
  const [active, setActive] = useState(() => !introState.played);
  const [sound, setSound] = useState<SoundState>("loading");
  const rootRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ skip: () => void; toggleSound: () => void }>({ skip: () => {}, toggleSound: () => {} });

  useEffect(() => {
    introState.played = true;
  }, []);

  useIsoLayoutEffect(() => {
    if (!active) return;
    const root = rootRef.current!;
    const html = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = FILM_REPLAY === "once-per-session" && sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    if (reduce || seen) {
      announceDone();
      setActive(false);
      return;
    }

    html.classList.add("intro-lock");
    root.dataset.js = "1";
    const engine = new FilmEngine(root);
    const audio = new FilmAudio(FILM_AUDIO_SRC);
    let raf = 0, last = 0, t = 0, started = false, done = false, paused = false, ending = false;
    let soundWanted = true;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      html.classList.remove("intro-lock");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      audio.fadeOut(900);
      window.setTimeout(() => audio.destroy(), 1000);
      announceDone();
      setActive(false);
    };

    const frame = (now: number) => {
      if (done) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      if (started && !paused) t += dt;
      const r = t - PREROLL;
      engine.render(r);
      root.dataset.tone = r >= 11.03 && r < 13.3 ? "dark" : "light";
      if (soundWanted) audio.sync(t);
      if (r >= HANDOFF[0]) announceReveal();
      if (r >= HANDOFF[0] && !ending) {
        ending = true;
        root.dataset.ending = "1";
      }
      if (r >= FILM_END) return finish();
      raf = requestAnimationFrame(frame);
    };

    const start = async () => {
      // Fonts must be ready before measuring; never wait more than 1.5 s.
      await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
      if (done) return;
      engine.layout();
      engine.render(-PREROLL);
      started = true;
      last = 0;
      setSound(await audio.play(0));
    };

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => engine.layout());
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") api.current.skip();
    };

    api.current.skip = () => {
      if (done || root.dataset.skipping) return;
      root.dataset.skipping = "1";
      announceReveal();
      audio.fadeOut(400);
      soundWanted = false;
      window.setTimeout(finish, 450);
    };
    api.current.toggleSound = async () => {
      if (soundWanted && !audio.el.paused) {
        soundWanted = false;
        audio.mute();
        setSound("off");
      } else {
        soundWanted = true;
        setSound(await audio.play(t));
      }
    };

    addEventListener("resize", onResize);
    addEventListener("keydown", onKey);
    const failsafe = window.setTimeout(finish, 25000);
    raf = requestAnimationFrame(frame);
    start();

    // QA hook (dev, or builds with NEXT_PUBLIC_INTRO_QA=1): render any film time.
    if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_INTRO_QA === "1") {
      (window as unknown as { __film?: unknown }).__film = {
        seek: (refSeconds: number) => {
          paused = true;
          window.clearTimeout(failsafe);
          t = refSeconds + PREROLL;
        },
        play: () => {
          paused = false;
        },
        layout: () => engine.layout(),
      };
    }

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(failsafe);
      removeEventListener("resize", onResize);
      removeEventListener("keydown", onKey);
      html.classList.remove("intro-lock");
      audio.destroy();
    };
  }, [active]);

  const skip = useCallback(() => api.current.skip(), []);
  const toggleSound = useCallback(() => api.current.toggleSound(), []);

  if (!active) return null;

  const helloChars = [
    ...Array.from("/* ").map((c) => ({ c, kind: "mark" })),
    ...Array.from(film.hello.replace(" ", " ")).map((c) => ({ c, kind: "word" })),
    ...Array.from(" */").map((c) => ({ c, kind: "mark" })),
  ];
  const nameParts = film.name.split(" ");
  const verbs = [...film.verbs.map((v) => v.verb), film.finalVerb];
  const captions = [...film.verbs.map((v) => v.caption), film.finalCaption];
  const soundLabel = sound === "on" ? "Sound on" : sound === "loading" ? "Sound" : "Sound off";

  return (
    <div ref={rootRef} className={styles.root} data-intro-film data-tone="light">
      <p className={styles.srOnly}>
        Intro film: Hello World. I’m Nishanth, {film.title}. I make things that help others do their thing. Even when
        it’s complex, I make it clear. I design it in Figma, then ship it in code.
      </p>

      <div className={styles.stage} data-stage aria-hidden="true">
        <canvas className={styles.canvas} data-canvas />

        {/* S1–S2 */}
        <div className={`${styles.abs} ${styles.hello}`} data-hello>
          {helloChars.map((h, i) => (
            <span key={i} className={h.kind === "mark" ? styles.mark : undefined} data-hc data-kind={h.kind}>{h.c}</span>
          ))}
          <span className={styles.caret} data-caret />
        </div>

        {/* S3–S5 */}
        <div className={`${styles.abs} ${styles.name}`} data-name>
          {nameParts.map((part, pi) => (
            <Fragment key={pi}>
              {pi > 0 && " "}
              {Array.from(part).map((ch, i) => (
                <Mask key={i}><span className={styles.unit} data-nl>{ch}</span></Mask>
              ))}
            </Fragment>
          ))}
          <Mask data-period><span className={styles.periodGhost}>.</span></Mask>
          <span className={styles.baseline} data-nbase />
        </div>
        <div className={`${styles.abs} ${styles.pill}`} data-pill>
          <span data-pill-text>&nbsp;</span>
        </div>

        {/* S6–S8 */}
        <div className={`${styles.abs} ${styles.head}`} data-head>
          <div className={styles.line}><Mask><span className={styles.unit} data-hline>{film.lines[0]}</span></Mask></div>
          <div className={styles.line}><Mask><span className={styles.unit} data-hline>{film.lines[1]}</span></Mask></div>
          <div className={styles.line}>
            <Mask><span className={styles.unit} data-hline>{film.lines[2]}</span></Mask>{" "}
            <span className={`${styles.mask} ${styles.slot}`} data-slot>
              {verbs.map((v, i) => (
                <span key={v} className={`${styles.unit} ${styles.verb}`} data-verb>
                  {i === verbs.length - 1 && <span className={styles.hl} data-hl />}
                  {v}
                </span>
              ))}
            </span>
          </div>
          <div className={styles.cap} data-cap>
            {captions.map((c) => (
              <div key={c} className={styles.capItem} data-capi>{c}</div>
            ))}
          </div>
        </div>

        {/* S2–S8 dot → card → square; S13–S14 charcoal circle */}
        <div className={styles.blob} data-blob>
          {VISUALS.map((V, i) => (
            <div key={i} className={styles.vis} data-vis>
              <div className={styles.visBox}><V /></div>
            </div>
          ))}
        </div>

        {/* S9, S11 */}
        <div className={`${styles.abs} ${styles.center}`} data-complex><Words words={film.complex.split(" ")} attr="data-cw" /></div>
        <div className={`${styles.abs} ${styles.center}`} data-clear><Words words={film.clear.split(" ")} attr="data-clw" /></div>

        {/* S12 */}
        <div data-stats>
          {film.stats.map((s) => (
            <div key={s.label} className={`${styles.abs} ${styles.stat}`} data-stat>
              <div className={styles.num}>
                {Array.from(s.value).map((ch, i) => (
                  <Mask key={i}><span className={styles.unit} data-d data-v={ch}>{ch}</span></Mask>
                ))}
              </div>
              <div className={styles.lab} data-lab>{s.label}</div>
            </div>
          ))}
        </div>

        {/* S16 */}
        <div className={`${styles.abs} ${styles.dark}`} data-dark>
          <div className={styles.dline}>
            {film.dark.line1.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <Mask {...(i === film.dark.line1.length - 1 ? { "data-figma": "" } : {})}>
                  <span className={styles.unit} data-dw1>{w}</span>
                </Mask>
              </Fragment>
            ))}
          </div>
          <div className={styles.dline}>
            {film.dark.line2.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <Mask><span className={styles.unit} data-dw2>{w}</span></Mask>
              </Fragment>
            ))}{" "}
            <span className={styles.code} data-code>
              {Array.from(film.dark.code).map((c, i) => (
                <span key={i} className={styles.cm}><span data-cc>{c}</span></span>
              ))}
            </span>
          </div>
        </div>
        <div className={styles.block} data-block />
        <div className={styles.sel} data-sel>
          <i /><i /><i /><i />
          <span className={styles.selLab} data-sellab>0 × 0</span>
        </div>
        <div className={styles.chip} data-chip><b />Thinking</div>
        <div className={styles.cur} data-cur>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1 L14 6.5 L8 8 L6.5 14 Z" /></svg>
          <span>{film.cursorTag}</span>
        </div>
      </div>

      {/* S17 + handoff */}
      <div className={styles.wipe} data-wipe aria-hidden="true" />

      <div className={styles.controls}>
        <button type="button" className={styles.ctrl} onClick={toggleSound} aria-pressed={sound === "on"}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 8h3l4-3.5v11L6 12H3z" />
            {sound === "on" ? <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" fill="none" /> : <path d="M13 8l4 4M17 8l-4 4" fill="none" />}
          </svg>
          {sound === "blocked" ? "Tap for sound" : soundLabel}
        </button>
        <button type="button" className={styles.ctrl} onClick={skip}>
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
