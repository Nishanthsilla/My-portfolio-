"use client";

import { Stage, ease, easeInOut, prog, useLoop, window01 } from "../selfready/engine";
import { useFitBox } from "./useFitBox";
import c from "./covers.module.css";

/**
 * Thriving Springs cover (illustrative): the learning loop a frontline worker goes through —
 * watch a short lesson, take a quick quiz, see the analytics of their skills, then get the
 * next module to upskill. 12 s loop.
 */
const STEPS = ["Watch", "Quiz", "Analytics", "Upskill"];
const AT = [0, 3, 6, 9]; // when each step starts
const OPTS = ["Offer a discount straight away", "Listen and acknowledge the problem", "Pass it to the manager"];
const SKILLS = [
  { k: "Product knowledge", v: 0.84 },
  { k: "Listening", v: 0.76 },
  { k: "De-escalation", v: 0.42, weak: true },
];

export default function LearnLoop() {
  const D = 12;
  const { ref, t } = useLoop(D, 7.6);
  const box = useFitBox(ref);
  const tall = box.h > box.w * 0.8;
  const W = tall ? 520 : 820, H = tall ? 640 : 500;
  const out = prog(t, 11.5, 11.95);
  const step = t < 3 ? 0 : t < 6 ? 1 : t < 9 ? 2 : 3;
  // the last step stays until the whole window fades out
  const show = (i: number) => (i === 3 ? ease(prog(t, AT[3] + 0.05, AT[3] + 0.45)) : window01(t, AT[i] + 0.05, AT[i] + 0.45, AT[i + 1] - 0.3, AT[i + 1]));

  // watch
  const played = prog(t, 0.4, 2.8);
  const secs = Math.round(180 * played);
  // quiz
  const pick = t > 4.4 ? 1 : -1;
  const xp = ease(prog(t, 4.9, 5.3)) * (1 - prog(t, 5.6, 5.9));
  // analytics
  const grow = (i: number) => easeInOut(prog(t, 6.4 + i * 0.25, 7.4 + i * 0.25));
  // upskill
  const unlock = ease(prog(t, 9.4, 9.8));
  const lvl = easeInOut(prog(t, 10, 10.9));

  return (
    <div ref={ref} className={c.wrap}>
      <div style={{ width: box.h ? Math.min(box.w, box.h * (W / H)) : "100%", margin: "0 auto" }}>
        <Stage w={W} h={H} label="Illustrative Thriving Springs learning loop: a worker watches a short lesson, answers a quiz, sees analytics of their skills, and is given the next module to upskill.">
          <div className={c.win} style={{ inset: 16, opacity: 1 - out }}>
            <div className={c.bar}>
              <i /><i /><i />
              <b>Skill path · Customer handling</b>
              <span className={c.xpChip}>Level {lvl > 0.5 ? 4 : 3}</span>
            </div>
            <ol className={c.steps}>
              {STEPS.map((s, i) => (
                <li key={s} data-on={step === i ? "" : undefined} data-done={step > i ? "" : undefined}>
                  <em>{step > i ? "✓" : i + 1}</em>
                  {s}
                </li>
              ))}
            </ol>
            <div className={c.panel}>
              {/* 1 · watch the lesson */}
              <div className={c.layer} style={{ opacity: show(0) }}>
                <div className={c.video}>
                  <div className={c.scene}>
                    <span className={c.person} />
                    <span className={`${c.person} ${c.person2}`} />
                    <span className={c.bubble}>“My order is late…”</span>
                  </div>
                  <span className={c.play} style={{ opacity: 1 - prog(t, 0.3, 0.6) }}>▶</span>
                  <div className={c.vbar}>
                    <span>{`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} / 3:00`}</span>
                    <div><i style={{ width: `${played * 100}%` }} /></div>
                  </div>
                </div>
                <p className={c.cap}><b>Lesson 3</b> · Calming an upset customer</p>
              </div>

              {/* 2 · quiz */}
              <div className={c.layer} style={{ opacity: show(1) }}>
                <p className={c.kicker}>Quick check · 1 of 3</p>
                <p className={c.q}>A customer is upset about a late order. What do you do first?</p>
                <div className={c.opts}>
                  {OPTS.map((o, i) => (
                    <div key={o} className={c.opt} data-pick={pick === i ? "" : undefined} style={{ opacity: ease(prog(t, 3.3 + i * 0.15, 3.6 + i * 0.15)) }}>
                      <em>{String.fromCharCode(65 + i)}</em>
                      {o}
                      {pick === i && <strong>✓ Correct</strong>}
                    </div>
                  ))}
                </div>
                <span className={c.pop} style={{ opacity: xp, transform: `translateY(${(1 - xp) * 10 - prog(t, 4.9, 5.9) * 16}px)` }}>+20 XP</span>
              </div>

              {/* 3 · analytics */}
              <div className={c.layer} style={{ opacity: show(2) }}>
                <div className={c.anaHead}>
                  <div className={c.ring} style={{ ["--p" as string]: 0.8 * grow(0) }}>
                    <span>{Math.round(8 * grow(0))}/10</span>
                  </div>
                  <div>
                    <p className={c.kicker}>Your analytics</p>
                    <p className={c.q} style={{ margin: 0 }}>Quiz score and skills this week</p>
                  </div>
                </div>
                <div className={c.skills}>
                  {SKILLS.map((s, i) => (
                    <div key={s.k} className={c.skill} data-weak={s.weak ? "" : undefined}>
                      <span>{s.k}</span>
                      <b>{Math.round(s.v * 100 * grow(i))}%</b>
                      <div><i style={{ width: `${s.v * 100 * grow(i)}%` }} /></div>
                      {s.weak && <small style={{ opacity: ease(prog(t, 7.9, 8.2)) }}>Needs work</small>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 · upskill */}
              <div className={c.layer} style={{ opacity: show(3) }}>
                <p className={c.kicker}>Recommended for you</p>
                <div className={c.module} style={{ transform: `translateY(${(1 - unlock) * 14}px)`, opacity: unlock }}>
                  <span className={c.modIcon}>▶</span>
                  <div>
                    <b>De-escalation basics</b>
                    <small>6 min · picked from your quiz results</small>
                  </div>
                  <span className={c.unlocked}>Unlocked</span>
                </div>
                <div className={c.level}>
                  <span>Level 3</span>
                  <div><i style={{ width: `${40 + lvl * 60}%` }} /></div>
                  <span>Level 4</span>
                </div>
                <div className={c.badges}>
                  {[0, 1, 2, 3].map((i) => (
                    <i key={i} data-new={i === 2 ? "" : undefined} style={i === 2 ? { transform: `scale(${0.4 + 0.6 * ease(prog(t, 10.6, 11))})`, opacity: prog(t, 10.6, 10.8) } : undefined} />
                  ))}
                  <span style={{ opacity: prog(t, 10.8, 11) }}>New badge: Calm under pressure</span>
                </div>
              </div>
            </div>
          </div>
        </Stage>
      </div>
    </div>
  );
}
