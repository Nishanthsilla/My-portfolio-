"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FILM_AUDIO_SRC, FILM_REPLAY, FILM_VICTORY_SRC } from "@/lib/introConfig";
import { announceDone, announceReveal, introState } from "@/lib/introState";
import {
  ABTestVisual, AnalyticsVisual, DesignSystemVisual, LearningVisual, OrchestrationVisual, SalesVisual,
} from "@/components/portfolio/visuals/Visuals";
import { film } from "./content";
import { FilmEngine } from "./engine";
import { FilmAudio, type SoundState } from "./audio";
import { DARK_RANGE, T, VICTORY_AT } from "./timeline";
import styles from "./IntroFilm.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const SESSION_KEY = "nishanth.introFilm.seen";
const VISUALS = [SalesVisual, OrchestrationVisual, DesignSystemVisual, LearningVisual, ABTestVisual, AnalyticsVisual];

const Mask = ({ children, className = "", ...rest }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) => (
  <span className={`${styles.mask} ${className}`} {...rest}>{children}</span>
);
const Chars = ({ text, attr }: { text: string; attr: string }) => (
  <>{Array.from(text).map((ch, i) => <span key={i} className={styles.ch} {...{ [attr]: "" }}>{ch === " " ? " " : ch}</span>)}</>
);

/**
 * The motion-film introduction (active intro; see lib/introConfig.ts).
 * One clock drives the visuals (FilmEngine), the score, the level-clear
 * sound and the handoff into the portfolio, which is rendered underneath.
 */
export default function IntroFilm() {
  const [active, setActive] = useState(() => !introState.played);
  const [sound, setSound] = useState<SoundState>("loading");
  const rootRef = useRef<HTMLDivElement>(null);
  const api = useRef({ skip: () => {}, toggleSound: () => {} });

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
    const victory = new Audio(FILM_VICTORY_SRC);
    victory.preload = "auto";
    victory.volume = 0.55;
    let raf = 0, last = 0, t = 0, started = false, done = false, paused = false, ending = false, skipped = false, victoryPlayed = false;
    let soundWanted = true;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      html.classList.remove("intro-lock");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      audio.fadeOut(skipped ? 400 : 1600);
      window.setTimeout(() => audio.destroy(), 1800);
      window.setTimeout(() => victory.pause(), 2500);
      announceDone();
      setActive(false);
    };

    const frame = (now: number) => {
      if (done) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      if (started && !paused) t += dt;
      engine.render(t);
      const tone = t >= DARK_RANGE[0] && t < DARK_RANGE[1] ? "dark" : "light";
      if (root.dataset.tone !== tone) root.dataset.tone = tone;
      if (soundWanted) audio.sync(t);
      // The reward: only on natural completion, only with sound on.
      if (!victoryPlayed && !skipped && !paused && t >= VICTORY_AT) {
        victoryPlayed = true;
        if (soundWanted && !audio.el.paused) victory.play().catch(() => {});
      }
      if (t >= T.handoff[0]) {
        announceReveal();
        if (!ending) {
          ending = true;
          root.dataset.ending = "1";
        }
      }
      if (t >= T.end && !paused) return finish();
      raf = requestAnimationFrame(frame);
    };

    const start = async () => {
      await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
      if (done) return;
      engine.layout();
      engine.render(0);
      started = true;
      last = 0;
      setSound(await audio.play(0));
    };

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        engine.layout();
        engine.render(t);
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") api.current.skip();
    };

    api.current.skip = () => {
      if (done || skipped) return;
      skipped = true;
      root.dataset.skipping = "1";
      announceReveal();
      soundWanted = false;
      audio.fadeOut(400);
      window.setTimeout(finish, 480);
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
    const failsafe = window.setTimeout(finish, (T.end + 15) * 1000);
    raf = requestAnimationFrame(frame);
    start();

    if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_INTRO_QA === "1") {
      (window as unknown as { __film?: unknown }).__film = {
        seek: (seconds: number) => {
          paused = true;
          window.clearTimeout(failsafe);
          t = seconds;
        },
        play: () => {
          paused = false;
        },
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
  const verbs = [...film.verbs.map((v) => v.verb), film.finalVerb];
  const captions = [...film.verbs.map((v) => v.caption), film.finalCaption];

  return (
    <div ref={rootRef} className={styles.root} data-intro-film data-tone="light">
      <p className={styles.srOnly}>
        Intro film. Hello World. I’m Nishanth, {film.title}. I make things that help others do their thing. Even when
        it’s complex, I make it clear. {film.stats.map((s) => `${s.value} ${s.label}`).join(", ")}. I design it in
        Figma, then ship it in code.
      </p>

      <div className={styles.stage} data-stage aria-hidden="true">
        <canvas className={styles.canvas} data-canvas />

        {/* Ch1 */}
        <div className={`${styles.abs} ${styles.hello}`} data-hello>
          {helloChars.map((h, i) => (
            <span key={i} className={h.kind === "mark" ? styles.mark : undefined} data-hc data-kind={h.kind}>{h.c}</span>
          ))}
          <span className={styles.caret} data-caret />
        </div>

        {/* Ch2 */}
        <div className={`${styles.abs} ${styles.name}`} data-name>
          <Mask>
            <span className={styles.unit} data-name-unit>
              {film.name}
              <span className={styles.periodGhost} data-period>.</span>
              <span className={styles.baseline} data-nbase />
            </span>
          </Mask>
        </div>
        <div className={`${styles.abs} ${styles.pillMask}`} data-pillmask>
          <span className={`${styles.unit} ${styles.pill}`} data-pill>{film.title}</span>
        </div>

        {/* Ch3 */}
        <div className={`${styles.abs} ${styles.head}`} data-head>
          <div className={styles.line}><Mask><span className={styles.unit} data-hline>{film.lines[0]}</span></Mask></div>
          <div className={styles.line}><Mask><span className={styles.unit} data-hline>{film.lines[1]}</span></Mask></div>
          <div className={styles.line}>
            <Mask><span className={styles.unit} data-hline>{film.lines[2]}</span></Mask>{" "}
            <Mask className={styles.slot} data-slot>
              {verbs.map((v, i) => (
                <span key={v} className={`${styles.unit} ${styles.verb}`} data-verb>
                  {i === verbs.length - 1 && <span className={styles.hl} data-hl />}
                  {v}
                </span>
              ))}
            </Mask>
          </div>
          <div className={styles.cap} data-cap>
            {captions.map((c) => <div key={c} className={styles.capItem} data-capi>{c}</div>)}
          </div>
        </div>

        {/* Ch2–Ch3 dot / cards, Ch6 charcoal dot */}
        <div className={styles.blob} data-blob>
          {VISUALS.map((V, i) => (
            <div key={i} className={styles.vis} data-vis>
              <div className={styles.visBox}><V /></div>
            </div>
          ))}
        </div>

        {/* Ch4 */}
        <div className={`${styles.abs} ${styles.center}`} data-complex>
          <Mask><span className={styles.unit} data-u>{film.complex}</span></Mask>
        </div>
        <div className={`${styles.abs} ${styles.center}`} data-clear>
          <Mask><span className={styles.unit} data-u>{film.clear}</span></Mask>
        </div>

        {/* Ch5 */}
        <div className={styles.statsWrap} data-stats>
          {film.stats.map((s) => (
            <div key={s.label} className={styles.stat} data-stat>
              <div className={styles.num} data-num>
                {Array.from(s.value).map((ch, i) =>
                  /\d/.test(ch) ? (
                    <span key={i} className={styles.digit}>
                      <span className={styles.strip} data-strip data-target={ch}>
                        {Array.from({ length: 10 }, (_, d) => <span key={d}>{d}</span>)}
                      </span>
                    </span>
                  ) : (
                    <span key={i} className={styles.sym}>{ch}</span>
                  ),
                )}
              </div>
              <div className={styles.lab} data-lab>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Ch6 */}
        <div className={`${styles.abs} ${styles.dark}`} data-dark>
          <div className={styles.dline}><Chars text={film.dark.line1.join(" ")} attr="data-c1" /></div>
          <div className={styles.dline}>
            <Chars text={`${film.dark.line2.join(" ")} `} attr="data-c2" />
            <span className={styles.code}><Chars text={film.dark.code} attr="data-cc" /></span>
          </div>
        </div>
        <div className={styles.block} data-block />
        <div className={styles.sel} data-sel>
          <i /><i /><i /><i />
          <span className={styles.selLab} data-sellab>0 × 0</span>
        </div>
        <div className={styles.cur} data-cur>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1 L14 6.5 L8 8 L6.5 14 Z" /></svg>
          <span>{film.cursorTag}</span>
        </div>
      </div>

      {/* Ch7 */}
      <div className={styles.wipe} data-wipe aria-hidden="true" />

      <div className={styles.controls}>
        <button type="button" className={styles.ctrl} onClick={toggleSound} aria-pressed={sound === "on"}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 8h3l4-3.5v11L6 12H3z" />
            {sound === "on" ? <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" fill="none" /> : <path d="M13 8l4 4M17 8l-4 4" fill="none" />}
          </svg>
          {sound === "blocked" ? "Tap for sound" : sound === "on" ? "Sound on" : sound === "loading" ? "Sound" : "Sound off"}
        </button>
        <button type="button" className={styles.ctrl} onClick={skip}>
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
