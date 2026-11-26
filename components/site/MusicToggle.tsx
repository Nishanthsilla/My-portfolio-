"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { onIntroDone } from "@/lib/introState";
import s from "./music.module.css";

const KEY = "nishanth.music.v2"; // on/off (remembered)
const VOL_KEY = "nishanth.music.volume";
const MAX = 0.5; // the slider's top; the default sits at 0.24 so the sticker and chat sounds stay on top
const TRACK = { title: "Biting Bullets", artist: "Ridgeclub", src: "/audio/ambient/biting-bullets" };

type Engine = { ctx: AudioContext; gain: GainNode; an: AnalyserNode; src: AudioBufferSourceNode | null; buf: Promise<AudioBuffer | null>; dur: number; startedAt: number; offset: number };

const BARS = 52;
/** the song's own shape: the loudness of each slice, scaled so the loudest slice is 1 */
function waveform(b: AudioBuffer, n: number) {
  const d = b.getChannelData(0), step = Math.floor(d.length / n), out: number[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = i * step, k = 0; k < step; j += 16, k += 16) sum += d[j] * d[j];
    out.push(Math.sqrt(sum / (step / 16)));
  }
  const max = Math.max(...out, 1e-6);
  return out.map((v) => Math.max(0.08, v / max));
}

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
  const [peaks, setPeaks] = useState<number[]>([]);
  const [hoverAt, setHoverAt] = useState<number | null>(null);
  const screen = useRef<HTMLCanvasElement>(null);
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
    const an = ctx.createAnalyser();
    an.fftSize = 256;
    an.smoothingTimeConstant = 0.8;
    gain.connect(an);
    an.connect(ctx.destination);
    const ext = document.createElement("audio").canPlayType('audio/ogg; codecs="opus"') ? "ogg" : "mp3";
    const e: Engine = { ctx, gain, an, src: null, buf: Promise.resolve(null), dur: 0, startedAt: 0, offset: 0 };
    e.buf = fetch(`${TRACK.src}.${ext}`)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((b) => {
        e.dur = b.duration;
        setDur(b.duration);
        setPeaks(waveform(b, BARS));
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

  // the little screen: the music drawn live, like a video of the sound
  useEffect(() => {
    const cv = screen.current;
    if (!open || !cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const freq = new Uint8Array(128);
    let raf = 0, t = 0;
    const draw = () => {
      const w = (cv.width = cv.clientWidth * devicePixelRatio), h = (cv.height = cv.clientHeight * devicePixelRatio);
      const e = eng.current;
      if (e?.src) e.an.getByteFrequencyData(freq);
      else freq.fill(0);
      t += still ? 0 : 0.012;
      const bass = freq.slice(1, 8).reduce((a, b) => a + b, 0) / 7 / 255;
      // a slow-moving colour field that pulses with the beat
      const bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, `hsl(${(12 + Math.sin(t) * 18 + 360) % 360} 85% ${48 + bass * 12}%)`);
      bg.addColorStop(0.55, `hsl(${330 + Math.sin(t * 0.7) * 20} 60% ${34 + bass * 10}%)`);
      bg.addColorStop(1, `hsl(${262 + Math.cos(t * 0.5) * 16} 50% 26%)`);
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      // the spectrum, mirrored from the centre line
      const n = 48, bw = w / n;
      g.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < n; i++) {
        const v = (freq[Math.floor((i / n) * 90) + 2] ?? 0) / 255;
        const bh = Math.max(2 * devicePixelRatio, v * h * 0.8);
        g.fillRect(i * bw + bw * 0.25, (h - bh) / 2, bw * 0.5, bh);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
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
          <canvas ref={screen} className={s.screen} aria-hidden="true" />
          <span className={s.meta}>
            <b>{TRACK.title}</b>
            <span>{TRACK.artist}</span>
          </span>
          <button type="button" className={`${s.ctl} ${s.playBtn}`} onClick={toggle} aria-label={live ? "Pause" : "Play"}>
            {live ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" /><rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" /></svg>
            )}
          </button>
        </div>
        <div className={s.scrub}>
          <div
            className={s.wave}
            role="slider"
            tabIndex={0}
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${fmt(pos)} of ${fmt(dur)}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const r = e.currentTarget.getBoundingClientRect();
              seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
            }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
              setHoverAt(f);
              if (e.buttons) setPos(f * dur);
            }}
            onPointerUp={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
            }}
            onPointerLeave={() => setHoverAt(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seek(Math.min(dur, pos + 5));
              else if (e.key === "ArrowLeft") seek(Math.max(0, pos - 5));
              else return;
              e.preventDefault();
            }}
          >
            {(peaks.length ? peaks : Array.from({ length: BARS }, () => 0.15)).map((v, i) => {
              const at = (i + 0.5) / BARS;
              const played = dur > 0 && at <= pos / dur;
              const ahead = hoverAt !== null && !played && at <= hoverAt;
              return <i key={i} data-p={played ? "" : ahead ? "h" : undefined} style={{ height: `${Math.round(v * 100)}%` }} />;
            })}
          </div>
          <span className={s.times}>
            <span>{fmt(pos)}</span>
            <span>{dur ? fmt(dur) : "–:––"}</span>
          </span>
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
