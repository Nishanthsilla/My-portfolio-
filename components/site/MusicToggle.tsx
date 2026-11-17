"use client";

import { useEffect, useRef, useState } from "react";
import { onIntroDone } from "@/lib/introState";
import s from "./music.module.css";

const KEY = "nishanth.music.v2"; // (a new key: everyone starts with music on again)
const VOLUME = 0.24; // background level: the sticker and chat sounds (their own audio, lib/sound/ui.ts) stay on top

/**
 * Background music: "Serendipity" by Purrple Cat (lofi, via Pixabay),
 * looped seamlessly (/audio/ambient/serendipity). On by default, but browsers
 * only allow it after the visitor's first click or key press, and it waits
 * for the intro film to finish. The button turns it off (remembered).
 */
export default function MusicToggle() {
  const [on, setOn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<{ ctx: AudioContext; gain: GainNode; src: AudioBufferSourceNode | null; buf: Promise<AudioBuffer | null> } | null>(null);
  const wanted = useRef(true);

  const start = () => {
    if (!wanted.current) return;
    if (!audio.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      const ext = document.createElement("audio").canPlayType('audio/ogg; codecs="opus"') ? "ogg" : "mp3";
      const buf = fetch(`/audio/ambient/serendipity.${ext}`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).catch(() => null);
      audio.current = { ctx, gain, src: null, buf };
    }
    const a = audio.current;
    void a.ctx.resume();
    void a.buf.then((buf) => {
      if (!buf || !wanted.current || a.src) return;
      const src = a.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(a.gain);
      src.start();
      a.src = src;
      a.gain.gain.cancelScheduledValues(a.ctx.currentTime);
      a.gain.gain.setTargetAtTime(VOLUME, a.ctx.currentTime, 1.2); // a slow fade in
      setPlaying(true);
    });
  };
  const stop = () => {
    const a = audio.current;
    if (!a?.src) return;
    const src = a.src;
    a.src = null;
    a.gain.gain.cancelScheduledValues(a.ctx.currentTime);
    a.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.25);
    src.stop(a.ctx.currentTime + 1.2);
    setPlaying(false);
  };

  useEffect(() => {
    if (document.documentElement.hasAttribute("data-embed")) return;
    let pref = true;
    try {
      pref = localStorage.getItem(KEY) !== "off";
    } catch {}
    wanted.current = pref;
    setOn(pref);
    let introDone = false, gesture = false;
    const tryStart = () => introDone && gesture && start();
    const onGesture = () => {
      gesture = true;
      tryStart();
    };
    addEventListener("pointerdown", onGesture, { capture: true });
    addEventListener("keydown", onGesture, { capture: true });
    const off = onIntroDone(() => {
      introDone = true;
      tryStart();
    });
    const vis = () => audio.current && (document.hidden ? audio.current.ctx.suspend() : wanted.current && audio.current.ctx.resume());
    document.addEventListener("visibilitychange", vis);
    return () => {
      removeEventListener("pointerdown", onGesture, { capture: true });
      removeEventListener("keydown", onGesture, { capture: true });
      document.removeEventListener("visibilitychange", vis);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    wanted.current = next;
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    if (next) start();
    else stop();
  };

  return (
    <button type="button" className={s.btn} data-on={on && playing ? "" : undefined} onClick={toggle} aria-pressed={on} aria-label={on ? "Music on: turn off" : "Music off: turn on"} title={on ? "Turn music off" : "Turn music on"}>
      <svg className={s.note} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="2.6" fill="currentColor" />
        <circle cx="17.5" cy="16" r="2.6" fill="currentColor" />
        {!on && <path d="M3 3l18 18" stroke="#ff4938" strokeWidth="2.4" strokeLinecap="round" />}
      </svg>
      <span className={s.label}>{on ? "Music on" : "Music off"}</span>
    </button>
  );
}
