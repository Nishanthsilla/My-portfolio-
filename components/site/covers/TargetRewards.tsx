"use client";

import { Stage, ease, easeInOut, prog, useLoop } from "../selfready/engine";
import { useFitBox } from "./useFitBox";
import c from "./covers.module.css";

/**
 * Ryzeup cover (illustrative): a frontline worker's quarter. The KPIs that make up the quarterly
 * target fill as they perform, the target is hit, a reward unlocks, and they climb the team
 * leaderboard. 12 s loop.
 */
const KPIS = [
  { k: "Sales closed", to: 60, of: "/ 60" },
  { k: "Customer rating", to: 4.7, of: "★", dec: 1 },
  { k: "On-time shifts", to: 98, of: "%" },
];
const TEAM = ["Priya", "Arjun", "You", "Meera", "Rahul"];

export default function TargetRewards() {
  const D = 12;
  const { ref, t } = useLoop(D, 8.2);
  const box = useFitBox(ref);
  const tall = box.h > box.w * 0.8;
  const W = tall ? 520 : 820, H = tall ? 700 : 500;
  const out = prog(t, 11.5, 11.95);

  const fill = easeInOut(prog(t, 0.6, 5.6)); // the quarter's progress
  const hit = t > 5.7;
  const burst = prog(t, 5.7, 6.6);
  const reward = ease(prog(t, 6.2, 6.7));
  const climb = easeInOut(prog(t, 8.2, 9.4)); // "You" moves from 5th to 2nd
  const rankOf = (name: string, i: number) => {
    if (name === "You") return 4 - 3 * climb; // index 4 → 1
    const base = i < 2 ? i : i - 1; // order without "You": Priya, Arjun, Meera, Rahul
    const at = [0, 1, 2, 3][base];
    return at >= 1 ? at + climb : at; // the ones it passes move down one
  };
  const order = ["Priya", "Arjun", "Meera", "Rahul", "You"];

  return (
    <div ref={ref} className={c.wrap}>
      <div style={{ width: box.h ? Math.min(box.w, box.h * (W / H)) : "100%", margin: "0 auto" }}>
        <Stage w={W} h={H} label="Illustrative Ryzeup: a frontline worker's quarterly KPIs fill up, the quarterly target is hit, a reward unlocks and they climb the team leaderboard.">
          <div className={c.win} style={{ inset: 16, opacity: 1 - out }}>
            <div className={c.bar}>
              <i /><i /><i />
              <b>My quarter · Q3 (Jul – Sep)</b>
              <span className={c.xpChip}>{Math.round(1240 + 500 * reward)} pts</span>
            </div>
            <div className={c.rz} data-tall={tall ? "" : undefined}>
              <div className={c.rzMain}>
                <div className={c.target}>
                  <div className={c.targetTop}>
                    <span>Quarterly target</span>
                    <b>{Math.round(fill * 100)}%</b>
                  </div>
                  <div className={c.track} data-hit={hit ? "" : undefined}><i style={{ width: `${fill * 100}%` }} /></div>
                  <small style={{ opacity: hit ? 1 : 0 }}>Target hit · 3 weeks early</small>
                </div>
                <div className={c.kpis}>
                  {KPIS.map((k, i) => {
                    const v = k.to * easeInOut(prog(t, 0.6 + i * 0.3, 5.2 + i * 0.15));
                    return (
                      <div key={k.k} className={c.kpi}>
                        <span>{k.k}</span>
                        <b>{k.dec ? v.toFixed(1) : Math.round(v)}<em>{k.of}</em></b>
                      </div>
                    );
                  })}
                </div>
                <div className={c.reward} style={{ opacity: reward, transform: `scale(${0.9 + 0.1 * reward})` }}>
                  <span className={c.gift}>🎁</span>
                  <div>
                    <b>Reward unlocked</b>
                    <small>Q3 bonus · +500 points</small>
                  </div>
                  <span className={c.unlocked}>Claim</span>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return <i key={i} className={c.confetti} style={{ opacity: burst > 0 && burst < 1 ? 1 - burst : 0, transform: `translate(${Math.cos(a) * 70 * burst}px, ${Math.sin(a) * 40 * burst}px)`, background: ["#ff6a55", "#f5b400", "#22c55e", "#6d5cf0"][i % 4] }} />;
                  })}
                </div>
              </div>
              <div className={c.board}>
                <p className={c.kicker}>Team leaderboard</p>
                <div className={c.rows}>
                  {order.map((n) => {
                    const r = rankOf(n, TEAM.indexOf(n));
                    return (
                      <div key={n} className={c.row} data-me={n === "You" ? "" : undefined} style={{ transform: `translateY(${r * 45}px)` }}>
                        <em>{Math.round(r) + 1}</em>
                        <span>{n}</span>
                        <b>{n === "You" ? Math.round(1240 + 500 * reward) : [1820, 1690, 0, 1380, 1300][TEAM.indexOf(n)]}</b>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Stage>
      </div>
    </div>
  );
}
