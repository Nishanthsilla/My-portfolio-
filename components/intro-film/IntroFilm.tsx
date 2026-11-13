"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import ControlRoom from "./ControlRoom";
import { Artefacts, CodeDetails, DesignDetails } from "./BoardParts";
import AsciiBridge from "./AsciiBridge";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const SESSION_KEY = "nishanth.introFilm.seen";
const VISUALS = [SalesVisual, OrchestrationVisual, DesignSystemVisual, LearningVisual, ABTestVisual, AnalyticsVisual];

const Mask = ({ children, className = "", ...rest }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) => (
  <span className={`${styles.mask} ${className}`} {...rest}>{children}</span>
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
    // Sound is ON by default. If the browser blocks autoplay, the first click,
    // tap or key press anywhere turns it on — unless the visitor muted it.
    let soundWanted = true;
    let userMuted = false;

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
      // a slow device skips frames rather than slowing the film down
      const dt = last ? Math.min((now - last) / 1000, 0.5) : 1 / 60;
      last = now;
      if (started && !paused) {
        // While the score plays it is the master clock; otherwise the frame clock.
        const at = soundWanted && !skipped ? audio.time(now) : null;
        if (at === null) t += dt;
        else if (at > t || t - at > 0.05) t = at; // never let picture and sound drift
      }
      engine.render(t);
      const tone = t >= DARK_RANGE[0] && t < DARK_RANGE[1] ? "dark" : "light";
      if (root.dataset.tone !== tone) root.dataset.tone = tone;
      // The reward: only on natural completion, only with sound on.
      if (!victoryPlayed && !skipped && !paused && t >= VICTORY_AT) {
        victoryPlayed = true;
        if (soundWanted && audio.playing) victory.play().catch(() => {});
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
      // Start picture and sound together; if the audio is slow to begin, the
      // film starts anyway and the audio joins at the film's time when ready.
      const attempt = audio.play(0);
      const first = await Promise.race([attempt, new Promise<"slow">((r) => setTimeout(() => r("slow"), 900))]);
      if (done) return;
      started = true;
      last = 0;
      if (first === "slow") {
        setSound("loading");
        attempt.then((s) => {
          if (done) return;
          if (s === "on") audio.el.currentTime = t;
          setSound(s);
        });
      } else setSound(first);
    };

    // First interaction anywhere unlocks sound (browsers require a gesture).
    const unlock = (ev: Event) => {
      // the sound/skip controls handle themselves
      if ((ev.target as Element | null)?.closest?.("[data-film-controls]")) return;
      if (done || skipped || userMuted || audio.playing) return;
      soundWanted = true;
      audio.play(t).then((s) => !done && setSound(s));
    };
    const unlockEvents = ["pointerdown", "keydown", "touchend"] as const;
    unlockEvents.forEach((ev) => addEventListener(ev, unlock, { capture: true }));

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
      if (soundWanted && audio.playing) {
        soundWanted = false;
        userMuted = true;
        audio.mute();
        setSound("off");
      } else {
        soundWanted = true;
        userMuted = false;
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
        state: () => ({ t, audio: audio.el.currentTime, playing: audio.playing }),
      };
    }

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(failsafe);
      removeEventListener("resize", onResize);
      removeEventListener("keydown", onKey);
      unlockEvents.forEach((ev) => removeEventListener(ev, unlock, { capture: true }));
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

        {/* Chapters 2–7: the story board (design space, scaled to fit) */}
        <div className={styles.darkbg} data-darkbg aria-hidden="true" />

        <div className={styles.board} data-board>
          {/* headlines */}
          <div className={styles.bh} data-h="complex"><Mask><span className={styles.unit} data-u>{film.complex}</span></Mask></div>
          <div className={styles.bh} data-h="clear"><Mask><span className={styles.unit} data-u>{film.clear}</span></Mask></div>
          {/* 5–6: both sentences, whole; a design-tool selection moves from "Figma," to "code." */}
          <div className={styles.sent} data-sent>
            <div className={styles.sentLine} data-s1>
              <Mask className={styles.sentMask}>
                <span className={`${styles.unit} ${styles.sentUnit}`} data-s1u>
                  I design it <span data-w="in1">in</span> <span className={styles.hw} data-w="figma">Figma,</span>
                </span>
              </Mask>
            </div>
            <div className={styles.sentLine} data-s2>
              <Mask className={styles.sentMask}>
                <span className={`${styles.unit} ${styles.sentUnit}`} data-s2u>
                  then ship it <span data-w="in2">in</span> <span className={styles.hw} data-w="code">code.</span>
                </span>
              </Mask>
            </div>
          </div>

          {/* 2: artefacts + their relationships */}
          <svg className={styles.links} data-links aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => <line key={i} />)}
          </svg>
          <Artefacts />

          {/* 4: proof */}
          <div className={styles.statsWrap} data-stats>
            <div className={styles.statsGrid} data-sgrid>
              {film.stats.map((st) => (
                <div key={st.label} className={styles.stat} data-stat>
                  <i className={styles.statRule} aria-hidden="true" />
                  <div className={styles.num} data-num>
                    {Array.from(st.value).map((ch, i) =>
                      /\d/.test(ch) ? (
                        <span key={i} className={styles.digit}>
                          <span className={styles.strip} data-strip data-target={ch}>
                            {Array.from({ length: 20 }, (_, d) => <span key={d}>{d % 10}</span>)}
                          </span>
                        </span>
                      ) : (
                        <span key={i} className={styles.sym}>{ch}</span>
                      ),
                    )}
                  </div>
                  <div className={styles.lab} data-lab>{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5: design state — tools and details around "Figma" */}
          <DesignDetails />
          {/* 6: code state — symbols and a snippet around "code" */}
          <CodeDetails />

          {/* 3–7: the product */}
          <ControlRoom />

          {/* overlays: selection (chapter 5–6) and the named cursor (5–7) */}
          <div className={styles.fsel} data-fsel>
            <i /><i /><i /><i />
          </div>
          <div className={styles.pcur} data-pcur>
            <svg className={styles.arrow} viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1 L14 6.5 L8 8 L6.5 14 Z" /></svg>
            <svg className={styles.ibeam} viewBox="0 0 12 24" aria-hidden="true"><path d="M3 2 H9 M6 2 V22 M3 22 H9" /></svg>
            <span className={styles.pcurTag}>{film.cursorTag}</span>
          </div>
        </div>
      </div>

      {/* Ch7: after "…ship it in code.", a full-screen Gradient ASCII screen */}
      <div className={styles.ascii} data-ascii aria-hidden="true">
        <AsciiBridge />
      </div>
      {/* (orange wipe layer — not used in the current cut) */}
      <div className={styles.wipe} data-wipe aria-hidden="true" />
      {/* the camera's stacked exposures + the website emerging from the button (zoom.ts) */}
      <div className={styles.zoom} data-zoom aria-hidden="true" />

      <div className={styles.controls} data-film-controls>
        <button type="button" className={styles.ctrl} onClick={toggleSound} aria-pressed={sound === "on"}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 8h3l4-3.5v11L6 12H3z" />
            {sound === "on" ? <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" fill="none" /> : <path d="M13 8l4 4M17 8l-4 4" fill="none" />}
          </svg>
          {sound === "blocked" ? "Tap anywhere for sound" : sound === "on" ? "Sound on" : sound === "loading" ? "Sound" : "Sound off"}
        </button>
        <button type="button" className={styles.ctrl} onClick={skip}>
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
