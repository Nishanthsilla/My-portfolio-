"use client";

import { useEffect, useSyncExternalStore } from "react";
import { sound } from "@/lib/sound/engine";
import s from "./site.module.css";

const snap = () => `${sound.prefs.on ? 1 : 0}:${sound.prefs.volume}`;

/**
 * The website's sound switch, in the floating navbar. Click: sound on / off.
 * Hover or focus: a slim volume slider. Off until the visitor turns it on;
 * the choice is remembered across pages and visits. (The intro film keeps its
 * own sound button.)
 */
export default function SoundToggle() {
  useEffect(() => sound.init(), []);
  const state = useSyncExternalStore(sound.subscribe, snap, () => "0:0.6");
  const [onStr, volStr] = state.split(":");
  const on = onStr === "1";
  const volume = Number(volStr);

  return (
    <div className={s.sound} data-on={on ? "" : undefined}>
      <button
        type="button"
        className={s.soundBtn}
        onClick={() => sound.setOn(!on)}
        aria-pressed={on}
        aria-label={on ? "Sound is on — turn it off" : "Sound is off — turn it on"}
        title={on ? "Sound on" : "Sound off"}
      >
        <span className={s.soundBars} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className={s.soundPop}>
        <span className={s.soundLabel}>{on ? "Sound on" : "Sound off"}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(volume * 100)}
          onChange={(e) => {
            sound.setVolume(Number(e.target.value) / 100);
            if (!on) sound.setOn(true);
          }}
          aria-label="Volume"
          className={s.soundRange}
          style={{ ["--v" as string]: `${Math.round(volume * 100)}%` }}
        />
      </div>
    </div>
  );
}
