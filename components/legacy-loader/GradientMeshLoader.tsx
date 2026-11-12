"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import GradientMesh from "./GradientMesh";
import { measureCounter, type Focal } from "./measureCounter";
import {
  APERTURE_FIT_END,
  FAILSAFE_MS,
  MAX_READY_WAIT,
  T,
  T_REDUCED,
  easeOutCubic,
  easeOutExpo,
  lerp,
  range,
  zoomCurves,
} from "./timeline";
import { announceDone, announceReveal, introState } from "@/lib/introState";
import styles from "./GradientMeshLoader.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Feather width of the homepage aperture edge, as a fraction of its radius. */
const FEATHER = 0.08;
/** Zoom progress at which the homepage starts its own entrance animation. */
const REVEAL_AT = 0.26;

/**
 * Cinematic intro. Layers (bottom → top), all inside one fixed overlay:
 *   scene: animated gradient mesh + glass diffusion (masked by the aperture)
 *   type:  the statement (never blurred, never masked)
 * The real site (#site-root) is rendered underneath the whole time.
 */
export default function GradientMeshLoader() {
  // Plays once per full document load (first entry or refresh). The portfolio is
  // a single page; client-side navigation never replays it (module state).
  const [active, setActive] = useState(() => !introState.played);
  const [energized, setEnergized] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const atmosRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const focalRef = useRef<HTMLSpanElement>(null);
  const baselineRef = useRef<HTMLSpanElement>(null);
  const finishRef = useRef<() => void>(() => {});

  const skip = useCallback(() => finishRef.current(), []);

  useEffect(() => {
    introState.played = true;
    // No intro on this load: the page is revealed and at rest immediately.
    if (!active) announceDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsoLayoutEffect(() => {
    if (!active) return;
    const root = rootRef.current!;
    const scene = sceneRef.current!;
    const atmos = atmosRef.current!;
    const mesh = meshRef.current!;
    const type = typeRef.current!;
    const l1 = line1Ref.current!;
    const l2 = line2Ref.current!;
    const site = document.getElementById("site-root");
    const html = document.documentElement;

    html.classList.add("intro-lock");
    root.dataset.js = "1"; // hands control from the CSS failsafe to the timeline

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = 0;
    let t = 0;
    let done = false;
    let ready = false;
    let waited = 0;
    let focal: Focal | null = null;
    let f0x = 0;
    let f0y = 0;
    let originSet = false;
    let maxScale = 1;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      html.classList.remove("intro-lock");
      if (site) {
        site.style.transform = "";
        site.style.transformOrigin = "";
        site.style.willChange = "";
      }
      setActive(false);
      announceDone();
    };
    finishRef.current = finish;

    // Homepage readiness: fonts + document fully loaded.
    const markReady = () => {
      ready = document.readyState === "complete";
    };
    document.fonts?.ready.then(() => {
      markReady();
      if (document.readyState !== "complete") window.addEventListener("load", markReady, { once: true });
    }, markReady);

    const failsafe = window.setTimeout(finish, FAILSAFE_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);

    const setLine = (el: HTMLElement, p: number) => {
      const e = easeOutExpo(p);
      // Vertical clip-mask reveal: the line rises into its mask, with a small lift.
      el.style.transform = `translate3d(0, ${lerp(108, 0, e)}%, 0)`;
    };

    const prepareZoom = () => {
      focal = measureCounter(focalRef.current!, baselineRef.current!);
      const rect = type.getBoundingClientRect();
      f0x = focal.x;
      f0y = focal.y;
      type.style.transformOrigin = `${f0x - rect.left}px ${f0y - rect.top}px`;
      // Final scale is exactly where the whole viewport sits inside the
      // aperture (centred, fully fitted), so the reveal completes as the camera
      // settles rather than long before.
      const k = APERTURE_FIT_END * (1 - FEATHER);
      const hx = window.innerWidth / 2 / (Math.max(focal.rx, 2) * k);
      const hy = window.innerHeight / 2 / (Math.max(focal.ry, 2) * k);
      maxScale = Math.max(12, Math.hypot(hx, hy) * 1.02);
      // Unclip the line masks so nothing crops the letterforms mid-zoom.
      l1.parentElement!.style.overflow = "visible";
      l2.parentElement!.style.overflow = "visible";
      originSet = true;
      setEnergized(true);
    };

    const renderFull = () => {
      // Phase 1: background entrance
      const bg = easeOutCubic(range(t, T.bgIn));
      atmos.style.opacity = String(bg);

      // Phase 2: typography reveal
      setLine(l1, range(t, T.line1));
      setLine(l2, range(t, T.line2));

      // Phase 4 + 5: one progress value drives zoom, aperture and homepage.
      const z = range(t, T.zoom);
      if (z <= 0) return;
      if (!originSet) prepareZoom();
      const { scaleE, travel, aperture, apertureFit, settle } = zoomCurves(z);
      // The portfolio's own entrance starts as the aperture begins to open.
      if (z >= REVEAL_AT) announceReveal();

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.exp(Math.log(maxScale) * scaleE);
      const dx = (vw / 2 - f0x) * travel;
      const dy = (vh / 2 - f0y) * travel;
      type.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;

      // Atmosphere pushes in a little behind the type for parallax depth.
      mesh.style.transform = `scale(${1 + 0.14 * scaleE})`;

      // Aperture: an elliptical hole in the scene fitted to the letter's counter.
      const cx = f0x + dx;
      const cy = f0y + dy;
      const fit = s * apertureFit * aperture;
      const rx = focal!.rx * fit;
      const ry = focal!.ry * fit;
      if (rx > 0.5) {
        const mask = `radial-gradient(${rx}px ${ry}px at ${cx}px ${cy}px, transparent ${(1 - FEATHER) * 100}%, #000 100%)`;
        scene.style.maskImage = mask;
        scene.style.webkitMaskImage = mask;
      }

      // Homepage emerges: settles from a slight push-in to its natural scale.
      if (site) {
        if (!site.style.willChange) {
          site.style.willChange = "transform";
          site.style.transformOrigin = `${vw / 2}px ${window.scrollY + vh / 2}px`;
        }
        site.style.transform = settle >= 1 ? "" : `scale(${lerp(1.08, 1, settle)})`;
      }

      // Once the clear part of the aperture contains every corner, the intro is visually gone.
      const ix = rx * (1 - FEATHER);
      const iy = ry * (1 - FEATHER);
      const inside = (px: number, py: number) =>
        ix > 0 && ((px - cx) / ix) ** 2 + ((py - cy) / iy) ** 2 <= 1;
      const covered = inside(0, 0) && inside(vw, 0) && inside(0, vh) && inside(vw, vh);
      if (covered) {
        type.style.visibility = "hidden";
        scene.style.visibility = "hidden";
      }
      if (z >= 1) finish();
    };

    const renderReduced = () => {
      atmos.style.opacity = String(range(t, T_REDUCED.bgIn));
      const p = range(t, T_REDUCED.text);
      l1.style.transform = l2.style.transform = "none";
      type.style.opacity = String(p);
      const out = range(t, T_REDUCED.out);
      if (out > 0) announceReveal();
      root.style.opacity = String(1 - out);
      if (out >= 1) finish();
    };

    const holdEnd = reduced ? T_REDUCED.holdEnd : T.holdEnd;

    let paused = false;

    const frame = (now: number) => {
      if (done) return;
      if (paused) {
        raf = requestAnimationFrame(frame);
        return;
      }
      // Real elapsed time keeps the choreography on schedule on slow devices;
      // only very long gaps (a backgrounded tab) are clamped.
      const dt = last ? Math.min(now - last, 120) : 16.7;
      last = now;
      // Hold at the end of the statement until the homepage is ready (bounded).
      if (t + dt >= holdEnd && !ready && waited < MAX_READY_WAIT) {
        waited += dt;
        t = holdEnd - 0.001;
      } else {
        t += dt;
      }
      if (reduced) renderReduced();
      else renderFull();
      raf = requestAnimationFrame(frame);
    };

    // First paint of the initial state, before any frame runs.
    if (reduced) {
      type.style.opacity = "0";
    } else {
      setLine(l1, 0);
      setLine(l2, 0);
    }
    raf = requestAnimationFrame(frame);

    // QA hook (dev, or builds with NEXT_PUBLIC_INTRO_QA=1): render the exact
    // timeline state at any time for frame-by-frame review.
    if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_INTRO_QA === "1") {
      (window as unknown as { __intro?: unknown }).__intro = {
        seek: (ms: number) => {
          paused = true;
          ready = true;
          window.clearTimeout(failsafe);
          t = ms;
          if (reduced) renderReduced();
          else renderFull();
        },
        play: () => {
          paused = false;
          last = 0;
        },
      };
    }

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("load", markReady);
      html.classList.remove("intro-lock");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={rootRef} className={styles.root} data-intro-loader aria-hidden={false}>
      <div ref={sceneRef} className={styles.scene}>
        <div ref={atmosRef} className={styles.atmos}>
          <div ref={meshRef} className={styles.meshWrap}>
            <GradientMesh energized={energized} />
          </div>
          {/* Glass diffusion: its own layer between mesh and type. */}
          <div className={styles.glass} aria-hidden />
        </div>
      </div>

      <div ref={typeRef} className={styles.type}>
        <p className={styles.statement} aria-label="Ideas into experiences.">
          <span className={styles.mask} aria-hidden>
            <span ref={line1Ref} className={styles.line}>
              Ideas into
            </span>
          </span>
          <span className={styles.mask} aria-hidden>
            <span ref={line2Ref} className={styles.line}>
              ex<span ref={focalRef}>p</span>eriences.
              <span ref={baselineRef} className={styles.baseline} />
            </span>
          </span>
        </p>
      </div>

      <button type="button" className={styles.skip} onClick={skip}>
        Skip intro
      </button>
    </div>
  );
}
