"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, ease, easeInOut, lerp, prog, useLoop } from "../selfready/engine";
import s from "./ambient.module.css";

/**
 * Ambient AI cover (illustrative), after node-canvas builders: a prompt builds
 * a workflow on the canvas node by node, the wires draw and data flows, the
 * pre-flight check passes, then Publish folds the flow into a bundle that flies
 * into the handheld, where the same steps run. 11 s loop.
 */
const PROMPT = "Build a receiving workflow";
const NODES = [
  { k: "Trigger", t: "“receive delivery”", c: "#f59e0b" },
  { k: "Skill", t: "Label Reader", c: "#6d5cf0" },
  { k: "Skill", t: "Stock Lookup", c: "#6d5cf0" },
  { k: "Control", t: "Fill the screen", c: "#0ea5e9" },
];

export default function AgentPush() {
  const D = 11;
  const { ref, t } = useLoop(D, 7.4);
  const box = useBox(ref);
  const tall = box.h > box.w * 0.75;
  const out = prog(t, 10.2, 10.9);

  // geometry
  const W = tall ? 520 : 820, H = tall ? 660 : 440;
  const C = tall ? { x: 16, y: 16, w: 488, h: 360 } : { x: 16, y: 16, w: 560, h: 408 };
  const P = tall ? { x: 170, y: 392, w: 180, h: 256 } : { x: 630, y: 70, w: 160, h: 290 };
  const nodePos = (i: number) =>
    tall ? { x: C.x + 24 + (i % 2) * 230, y: C.y + 92 + Math.floor(i / 2) * 120 } : { x: C.x + 26 + (i % 2) * 270, y: C.y + 96 + Math.floor(i / 2) * 150 };
  const NW = tall ? 210 : 240, NH = 74;

  const typed = Math.round(PROMPT.length * prog(t, 0.3, 1.5));
  const nodeIn = (i: number) => ease(prog(t, 1.7 + i * 0.45, 2.1 + i * 0.45));
  const wire = (i: number) => ease(prog(t, 2.0 + i * 0.45, 2.5 + i * 0.45));
  const flow = t > 3.6 && t < 6.2;
  const check = ease(prog(t, 4.0, 4.4));
  const press = t > 5.05 && t < 5.25;
  const fold = easeInOut(prog(t, 5.3, 6.0));            // nodes gather into a bundle
  const fly = easeInOut(prog(t, 6.0, 7.1));             // bundle flies to the device
  const run = prog(t, 7.1, 9.6);                        // steps run on the device
  const live = t > 9.0 && out < 0.5;
  const fade = 1 - out;

  const centre = { x: C.x + C.w / 2, y: C.y + C.h / 2 + 10 };
  const target = { x: P.x + P.w / 2, y: P.y + P.h / 2 };
  const bundle = { x: lerp(centre.x, target.x, fly), y: lerp(centre.y, target.y, fly) - Math.sin(fly * Math.PI) * 40 };

  const wires = [0, 1, 2].map((i) => {
    const a = nodePos(i), b = nodePos(i + 1);
    const ax = a.x + NW, ay = a.y + NH / 2, bx = b.x, by = b.y + NH / 2;
    // row → next column, or wrap to the next row
    if (i % 2 === 0) return `M${ax} ${ay} C${ax + 30} ${ay} ${bx - 30} ${by} ${bx} ${by}`;
    return `M${a.x + NW / 2} ${a.y + NH} C${a.x + NW / 2} ${a.y + NH + 40} ${b.x + NW / 2} ${b.y - 40} ${b.x + NW / 2} ${b.y}`;
  });

  return (
    <div ref={ref} className={s.wrap}>
      <div style={{ width: box.h ? Math.min(box.w, box.h * (W / H)) : "100%", margin: "0 auto" }}>
        <Stage w={W} h={H} label="Illustrative Ambient AI: a prompt builds a workflow on a canvas, the checks pass, and publishing sends it to a handheld device where the steps run.">
          {/* canvas */}
          <div className={s.canvas} style={{ left: C.x, top: C.y, width: C.w, height: C.h, opacity: fade }}>
            <div className={s.cbar}>
              <i /><i /><i />
              <b>Goods Receipt</b>
              <span className={s.prompt}>✦ {PROMPT.slice(0, typed)}<em className={typed < PROMPT.length ? s.caret : ""} /></span>
              <span className={`${s.publish} ${press ? s.pressed : ""} ${t > 5.25 ? s.done : ""}`}>{t > 5.25 ? "Published" : "Publish"}</span>
            </div>
            <div className={s.check} style={{ opacity: check * (1 - fold) }}>✓ Pre-flight · 0 issues</div>
          </div>

          <svg className={s.wire} width={W} height={H} aria-hidden="true" style={{ opacity: (1 - fold) * fade }}>
            {wires.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" stroke="#cfcaf8" strokeWidth={2.5} pathLength={1} strokeDasharray={`${wire(i)} 1`} />
                {flow && <path d={d} fill="none" stroke="#6d5cf0" strokeWidth={2.5} pathLength={1} strokeDasharray="0.06 0.14" strokeDashoffset={-((t * 0.6) % 1)} />}
              </g>
            ))}
          </svg>

          {NODES.map((n, i) => {
            const p = nodePos(i), a = nodeIn(i);
            const x = lerp(p.x, centre.x - NW / 2, fold), y = lerp(p.y, centre.y - NH / 2, fold);
            return (
              <div key={n.t} className={s.node} style={{ left: x, top: y, width: NW, opacity: a * (1 - fly > 0 ? 1 - prog(t, 5.8, 6.05) : 0) * fade, transform: `scale(${(0.9 + 0.1 * a) * (1 - 0.4 * fold)})` }}>
                <span className={s.nk} style={{ background: n.c }}>{n.k}</span>
                <b>{n.t}</b>
                <i className={s.portL} /><i className={s.portR} />
              </div>
            );
          })}

          {/* the published bundle */}
          <div className={s.bundle} style={{ left: bundle.x, top: bundle.y, opacity: prog(t, 5.7, 5.95) * (1 - prog(t, 7.0, 7.2)), transform: `translate(-50%, -50%) scale(${1 - 0.35 * fly})` }}>
            <span>✦</span><div><b>Goods Receipt</b><em>v2.4 · 4 steps</em></div>
          </div>

          {/* device */}
          <div className={s.phone} style={{ left: P.x, top: P.y, width: P.w, height: P.h, transform: `scale(${1 + 0.04 * Math.sin(prog(t, 7.0, 7.4) * Math.PI)})` }}>
            <div className={s.pscreen}>
              <div className={s.pbar}><span className={s.conn}>● Handheld H53</span></div>
              {t < 7.1 || out > 0.5 ? (
                <div className={s.idle}>Waiting for a workflow…</div>
              ) : (
                <div className={s.psteps}>
                  {NODES.map((n, i) => {
                    const st = prog(run, i / NODES.length, (i + 0.8) / NODES.length);
                    return (
                      <div key={n.t} className={st >= 1 ? s.stepDone : st > 0 ? s.stepRun : ""} style={{ opacity: Math.min(1, prog(t, 7.1 + i * 0.12, 7.4 + i * 0.12)) }}>
                        <em>{st >= 1 ? "✓" : i + 1}</em>{n.t}
                      </div>
                    );
                  })}
                </div>
              )}
              {live && <div className={s.ready}>✓ Live on device</div>}
            </div>
          </div>
        </Stage>
      </div>
    </div>
  );
}

function useBox(ref: React.RefObject<HTMLElement | null>) {
  const [b, setB] = useState({ w: 0, h: 0 });
  const r = useRef(ref);
  useEffect(() => {
    const el = r.current.current?.parentElement;
    if (!el) return;
    const fit = () => setB({ w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return b;
}
