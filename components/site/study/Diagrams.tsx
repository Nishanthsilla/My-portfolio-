"use client";

import { useEffect, useRef, useState } from "react";
import type { Architecture, Journey } from "@/lib/site/studies/types";
import s from "./study.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The end-to-end user flow, drawn in HTML: stages read left to right, steps
 * top to bottom, numbered 1…n so the order is never in doubt. "Walk through"
 * steps through it one action at a time (buttons or ← →).
 */
export function JourneyMap({ j, fig }: { j: Journey; fig: string }) {
  const flat = j.stages.flatMap((st, si) => st.steps.map((t) => ({ t, si })));
  const total = flat.length;
  const [at, setAt] = useState<number | null>(null); // null = show everything
  const controls = useRef<HTMLDivElement>(null);
  const go = (d: number) => setAt((v) => (v === null ? 0 : Math.min(total - 1, Math.max(0, v + d))));
  useEffect(() => {
    if (at !== null) controls.current?.querySelector<HTMLButtonElement>("[data-next]")?.focus();
  }, [at === null]); // eslint-disable-line react-hooks/exhaustive-deps

  let n = 0;
  return (
    <figure className={s.dgm} data-diagram="journey">
      <div className={s.dgmPanel}>
        <p className={s.dgmContext}>{j.subtitle}</p>
        <ol className={s.jStages} data-walking={at !== null || undefined}>
          {j.stages.map((st, si) => {
            const stageOn = at !== null && flat[at].si === si;
            const stageDone = at !== null && flat[at].si > si;
            return (
              <li key={st.label} className={`${s.jStage} ${stageOn ? s.on : ""} ${stageDone ? s.done : ""}`}>
                <div className={s.jHead}>
                  <span className={s.jNum}>{pad(si + 1)}</span>
                  <span className={s.jLabel}>{st.label}</span>
                  {si < j.stages.length - 1 && <span className={s.jNext} aria-hidden="true" />}
                </div>
                <ol className={s.jSteps}>
                  {st.steps.map((t) => {
                    const i = n++;
                    const state = at === null ? "" : i === at ? s.on : i < at ? s.done : s.later;
                    return (
                      <li key={t} className={`${s.jStep} ${state}`} aria-current={i === at ? "step" : undefined}>
                        <span className={s.jDot}>{i + 1}</span>
                        <span>{t}</span>
                      </li>
                    );
                  })}
                </ol>
              </li>
            );
          })}
        </ol>
        <div
          ref={controls}
          className={s.walk}
          onKeyDown={(e) => {
            if (at === null) return;
            if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
            if (e.key === "Escape") setAt(null);
          }}
        >
          {at === null ? (
            <button type="button" className={s.walkStart} onClick={() => setAt(0)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7-4.5z" /></svg>
              Walk through the journey
            </button>
          ) : (
            <>
              <button type="button" className={s.walkBtn} onClick={() => go(-1)} disabled={at === 0} aria-label="Previous step">←</button>
              <p className={s.walkNow} aria-live="polite">
                <span>Step {at + 1} of {total} · {j.stages[flat[at].si].label}</span>
                {flat[at].t}
              </p>
              <button type="button" className={s.walkBtn} data-next onClick={() => (at === total - 1 ? setAt(null) : go(1))} aria-label={at === total - 1 ? "Finish" : "Next step"}>
                {at === total - 1 ? "✓" : "→"}
              </button>
              <button type="button" className={s.walkAll} onClick={() => setAt(null)}>Show all</button>
            </>
          )}
        </div>
      </div>
      <figcaption>
        <span className={s.figNum}>Fig. {fig}</span> {j.note}
      </figcaption>
    </figure>
  );
}

/**
 * The product architecture as stacked layers, from what people use at the top
 * to what runs on devices at the bottom. Choosing a layer brings it forward.
 */
export function ArchitectureMap({ a, fig }: { a: Architecture; fig: string }) {
  const [focus, setFocus] = useState<number | null>(null);
  return (
    <figure className={s.dgm} data-diagram="architecture">
      <div className={s.dgmPanel}>
        <p className={s.dgmContext}>{a.subtitle}</p>
        <div className={s.aTabs} role="group" aria-label="Focus a layer">
          <button type="button" aria-pressed={focus === null} onClick={() => setFocus(null)}>All layers</button>
          {a.layers.map((l, i) => (
            <button key={l.label} type="button" aria-pressed={focus === i} onClick={() => setFocus(focus === i ? null : i)}>
              {l.label}
            </button>
          ))}
        </div>
        <ol className={s.aLayers} data-focus={focus !== null || undefined}>
          {a.layers.map((l, i) => (
            <li key={l.label} className={`${s.aLayer} ${focus === i ? s.on : ""}`}>
              <div className={s.aHead}>
                <span className={s.jNum}>{pad(i + 1)}</span>
                <span className={s.aLabel}>{l.label}</span>
              </div>
              <ol className={s.aItems} style={{ ["--cols" as string]: l.items.length }}>
                {l.items.map((t) => <li key={t} className={s.aItem}>{t}</li>)}
              </ol>
              {i < a.layers.length - 1 && <span className={s.aDown} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
      <figcaption>
        <span className={s.figNum}>Fig. {fig}</span> {a.note}
      </figcaption>
    </figure>
  );
}
