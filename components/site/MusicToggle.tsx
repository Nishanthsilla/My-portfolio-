"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { onIntroDone } from "@/lib/introState";
import s from "./music.module.css";

const KEY = "nishanth.music.v2"; // on/off (remembered)
const VOL_KEY = "nishanth.music.volume";
const MAX = 0.5; // the slider's top; the default sits at 0.24 so the sticker and chat sounds stay on top
const TRACK = { title: "Biting Bullets", artist: "Ridgeclub", src: "/audio/ambient/biting-bullets" };

type Engine = { ctx: AudioContext; gain: GainNode; src: AudioBufferSourceNode | null; buf: Promise<AudioBuffer | null>; dur: number; startedAt: number; offset: number };

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/**
 * Background music ("Biting Bullets" by Ridgeclub), looped. On by default, but browsers only allow
 * it after the visitor's first tap, click or key press, and it waits for the intro film to finish.
 * The round button turns it on and off; hovering it (on phones: tapping it) opens a small player
 * with play/pause, a scrubber, the time and a volume slider.
 */
export default function MusicToggle({ hidden = false }: { hidden?: boolean }) {
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.24 / MAX);
  const eng = useRef<Engine | null>(null);
  const wanted = useRef(true);
  const volRef = useRef(vol);
  const closeT = useRef(0);
  // phones and tablets (no hover): a tap opens the player instead of toggling the music
  const isTouch = useSyncExternalStore(
    (cb) => {
      const m = matchMedia("(hover: none)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia("(hover: none)").matches,
    () => false,
  );

  const now = () => {
    const e = eng.current;
    if (!e || !e.dur) return 0;
    return e.src ? (e.ctx.currentTime - e.startedAt) % e.dur : e.offset;
  };

  const engine = () => {
    if (eng.current) return eng.current;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const ext = document.createElement("audio").canPlayType('audio/ogg; codecs="opus"') ? "ogg" : "mp3";
    const e: Engine = { ctx, gain, src: null, buf: Promise.resolve(null), dur: 0, startedAt: 0, offset: 0 };
    e.buf = fetch(`${TRACK.src}.${ext}`)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((b) => {
        e.dur = b.duration;
        setDur(b.duration);
        return b;
      })
      .catch(() => null);
    eng.current = e;
    return e;
  };

  /** start playing from `from` seconds (default: where it left off), fading in */
  const play = (from?: number) => {
    const e = engine();
    if (!e) return;
    void e.ctx.resume();
    void e.buf.then((buf) => {
      if (!buf || !wanted.current || e.src) return;
      const at = Math.max(0, Math.min((from ?? e.offset) % buf.duration, buf.duration - 0.05));
      const src = e.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(e.gain);
      src.start(0, at);
      e.src = src;
      e.startedAt = e.ctx.currentTime - at;
      e.gain.gain.cancelScheduledValues(e.ctx.currentTime);
      e.gain.gain.setTargetAtTime(volRef.current * MAX, e.ctx.currentTime, from === undefined && at === 0 ? 1.2 : 0.15);
      setPlaying(true);
    });
  };
  /** stop, remembering the spot */
  const pause = (fade = 0.25) => {
    const e = eng.current;
    if (!e?.src) return;
    e.offset = now();
    const src = e.src;
    e.src = null;
    e.gain.gain.cancelScheduledValues(e.ctx.currentTime);
    e.gain.gain.setTargetAtTime(0, e.ctx.currentTime, fade);
    src.stop(e.ctx.currentTime + fade * 4);
    setPlaying(false);
  };

  useEffect(() => {
    if (document.documentElement.hasAttribute("data-embed")) return;
    let pref = true;
    try {
      pref = localStorage.getItem(KEY) !== "off";
      const v = Number(localStorage.getItem(VOL_KEY));
      if (localStorage.getItem(VOL_KEY) !== null && v >= 0 && v <= 1) {
        volRef.current = v;
        setVol(v);
      }
    } catch {}
    wanted.current = pref;
    setOn(pref);
    let introDone = false, gesture = false;
    const tryStart = () => introDone && gesture && play();
    const onGesture = () => {
      gesture = true;
      tryStart();
    };
    const GESTURES = ["pointerdown", "touchend", "click", "keydown"];
    for (const ev of GESTURES) addEventListener(ev, onGesture, { capture: true });
    const off = onIntroDone(() => {
      introDone = true;
      tryStart();
    });
    const vis = () => eng.current && (document.hidden ? eng.current.ctx.suspend() : wanted.current && eng.current.ctx.resume());
    document.addEventListener("visibilitychange", vis);
    return () => {
      for (const ev of GESTURES) removeEventListener(ev, onGesture, { capture: true });
      document.removeEventListener("visibilitychange", vis);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the time and scrubber moving while the player is open
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const tick = () => {
      setPos(now());
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // phones: a tap outside the player closes it
  useEffect(() => {
    if (!open || !isTouch) return;
    const away = (e: PointerEvent) => !(e.target as HTMLElement).closest?.("[data-music]") && setOpen(false);
    addEventListener("pointerdown", away, true);
    return () => removeEventListener("pointerdown", away, true);
  }, [open, isTouch]);

  const setWanted = (next: boolean) => {
    setOn(next);
    wanted.current = next;
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
  };
  const toggle = () => {
    if (on && playing) {
      setWanted(false);
      pause();
    } else {
      setWanted(true);
      play();
    }
  };
  const seek = (t: number) => {
    const e = eng.current;
    if (!e) return;
    setPos(t);
    if (e.src) {
      pause(0.03);
      setWanted(true);
      play(t);
    } else e.offset = t;
  };
  const changeVol = (v: number) => {
    volRef.current = v;
    setVol(v);
    try {
      localStorage.setItem(VOL_KEY, String(v));
    } catch {}
    const e = eng.current;
    if (e?.src) e.gain.gain.setTargetAtTime(v * MAX, e.ctx.currentTime, 0.05);
  };

  const show = () => {
    clearTimeout(closeT.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => setOpen(false), 260);
  };

  if (hidden) return null;
  const live = on && playing;
  return (
    <div className={s.dock} data-music onPointerEnter={(e) => e.pointerType === "mouse" && show()} onPointerLeave={(e) => e.pointerType === "mouse" && hide()} onFocus={() => !isTouch && show()} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide()}>
      <div className={s.player} data-open={open ? "" : undefined} role="group" aria-label="Music player" aria-hidden={!open} inert={!open}>
        <div className={s.track}>
          <span className={s.art} data-on={live ? "" : undefined} aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          <span className={s.meta}>
            <b>{TRACK.title}</b>
            <span>{TRACK.artist}</span>
          </span>
        </div>
        <div className={s.scrub}>
          <input
            type="range"
            min={0}
            max={dur || 1}
            step={0.1}
            value={Math.min(pos, dur || 1)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            style={{ ["--p" as string]: `${dur ? (pos / dur) * 100 : 0}%` }}
          />
          <span className={s.times}>
            <span>{fmt(pos)}</span>
            <span>{dur ? fmt(dur) : "–:––"}</span>
          </span>
        </div>
        <div className={s.controls}>
          <button type="button" className={s.ctl} onClick={() => seek(0)} aria-label="Back to the start">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M18 6 9 12l9 6V6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className={`${s.ctl} ${s.playBtn}`} onClick={toggle} aria-label={live ? "Pause" : "Play"}>
            {live ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
            )}
          </button>
          <label className={s.vol}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5Z" fill="currentColor" />{vol > 0.02 && <path d="M15.5 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}</svg>
            <input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => changeVol(Number(e.target.value))} aria-label="Volume" style={{ ["--p" as string]: `${vol * 100}%` }} />
          </label>
        </div>
      </div>
      <button
        type="button"
        className={s.btn}
        data-on={live ? "" : undefined}
        onClick={() => (isTouch ? setOpen((o) => !o) : toggle())}
        aria-pressed={on}
        aria-expanded={open}
        aria-label={isTouch ? "Music player" : on ? "Music on: turn off" : "Music off: turn on"}
      >
        <svg className={s.note} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="6.5" cy="18" r="2.6" fill="currentColor" />
          <circle cx="17.5" cy="16" r="2.6" fill="currentColor" />
          {!on && <path d="M3 3l18 18" stroke="#ff4938" strokeWidth="2.4" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}
