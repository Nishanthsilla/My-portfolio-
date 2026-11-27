"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, ease, easeInOut, lerp, prog, useLoop } from "../selfready/engine";
import s from "./ambient.module.css";

/**
 * Ambient AI cover (illustrative), after node-canvas builders: a prompt builds
 * a workflow on the canvas node by node, the wires draw and data flows, the
 * pre-flight check passes; on Push the canvas makes room, the handheld arrives
 * and the flow, folded into a bundle, flies into it and runs. 11.5 s loop.
 */
const PROMPT = "Build a receiving workflow";
const NODES = [
  { k: "Trigger", t: "“receive delivery”", c: "#f59e0b" },
  { k: "Skill", t: "Label Reader", c: "#6d5cf0" },
  { k: "Skill", t: "Stock Lookup", c: "#6d5cf0" },
  { k: "Control", t: "Fill the screen", c: "#0ea5e9" },
];

export default function AgentPush() {
  const D = 11.5;
  const { ref, t } = useLoop(D, 8.6);
  const box = useBox(ref);
  const tall = box.h > box.w * 0.75;
  const out = prog(t, 10.7, 11.4);
  const fade = 1 - out;

  // stage and the canvas (its own coordinates; it is moved and scaled as a whole)
  const W = tall ? 520 : 820, H = tall ? 660 : 440;
  const CW = tall ? 488 : 700, CH = tall ? 380 : 408;
  const big = tall ? { x: 16, y: (H - CH) / 2, s: 1 } : { x: (W - CW) / 2, y: (H - CH) / 2, s: 1 };
  const small = tall ? { x: 16 + (CW * 0.16) / 2, y: 14, s: 0.84 } : { x: 14, y: (H - CH * 0.74) / 2, s: 0.74 };
  const P = tall ? { x: 170, y: 352, w: 180, h: 280 } : { x: 600, y: 60, w: 190, h: 320 };

  // timeline
  const typed = Math.round(PROMPT.length * prog(t, 0.4, 1.6));
  const nodeIn = (i: number) => ease(prog(t, 1.8 + i * 0.45, 2.2 + i * 0.45));
  const wire = (i: number) => ease(prog(t, 2.1 + i * 0.45, 2.6 + i * 0.45));
  const flow = t > 3.7 && t < 6.2;
  const check = ease(prog(t, 4.0, 4.4));
  const press = t > 4.85 && t < 5.05;
  const pushed = t > 5.05;
  const k = easeInOut(prog(t, 5.2, 6.1));              // canvas makes room, the device arrives
  const fold = easeInOut(prog(t, 6.2, 6.8));           // the flow gathers into a bundle
  const fly = easeInOut(prog(t, 6.8, 7.8));            // and travels to the device
  const run = prog(t, 7.8, 10.1);
  const live = t > 9.8 && out < 0.5;

  const cv = { x: lerp(big.x, small.x, k), y: lerp(big.y, small.y, k), s: lerp(big.s, small.s, k) };
  const NW = tall ? 205 : 270, NH = 76;
  const nodePos = (i: number) => (tall ? { x: 28 + (i % 2) * 228, y: 96 + Math.floor(i / 2) * 130 } : { x: 60 + (i % 2) * 320, y: 104 + Math.floor(i / 2) * 150 });
  const mid = { x: CW / 2, y: CH / 2 + 18 };
  const wires = [0, 1, 2].map((i) => {
    const a = nodePos(i), b = nodePos(i + 1);
    if (i % 2 === 0) { const ax = a.x + NW, ay = a.y + NH / 2, bx = b.x, by = b.y + NH / 2; return `M${ax} ${ay} C${ax + 30} ${ay} ${bx - 30} ${by} ${bx} ${by}`; }
    return `M${a.x + NW / 2} ${a.y + NH} C${a.x + NW / 2} ${a.y + NH + 44} ${b.x + NW / 2} ${b.y - 44} ${b.x + NW / 2} ${b.y}`;
  });

  // the bundle starts at the canvas centre (in stage coordinates) and lands in the device
  const from = { x: cv.x + mid.x * cv.s, y: cv.y + mid.y * cv.s };
  const to = { x: P.x + P.w / 2, y: P.y + P.h / 2 };
  const bundle = { x: lerp(from.x, to.x, fly), y: lerp(from.y, to.y, fly) - Math.sin(fly * Math.PI) * 46 };
  const devIn = k; // slides in with the canvas move
  const dev = tall ? { dx: 0, dy: (1 - devIn) * 260 } : { dx: (1 - devIn) * 280, dy: 0 };

  return (
    <div ref={ref} className={s.wrap}>
      <div style={{ width: box.h ? Math.min(box.w, box.h * (W / H)) : "100%", margin: "0 auto" }}>
        <Stage w={W} h={H} label="Illustrative Ambient AI: a workflow is built on a canvas from a prompt; on Push, a handheld device appears and the workflow is sent to it, where the steps run.">
          {/* canvas */}
          <div className={s.canvas} style={{ left: 0, top: 0, width: CW, height: CH, opacity: fade, transform: `translate(${cv.x}px, ${cv.y}px) scale(${cv.s})`, transformOrigin: "0 0" }}>
            <div className={s.cbar}>
              <i /><i /><i />
              <b>Goods Receipt</b>
              <span className={s.prompt}>✦ {PROMPT.slice(0, typed)}<em className={typed < PROMPT.length ? s.caret : ""} /></span>
              <span className={`${s.publish} ${press ? s.pressed : ""} ${pushed ? s.done : ""}`}>{pushed ? "Pushed ✓" : "Push to device"}</span>
            </div>
            <svg className={s.wire} width={CW} height={CH} aria-hidden="true" style={{ opacity: 1 - fold }}>
              {wires.map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="#cfcaf8" strokeWidth={2.5} pathLength={1} strokeDasharray={`${wire(i)} 1`} />
                  {flow && <path d={d} fill="none" stroke="#6d5cf0" strokeWidth={2.5} pathLength={1} strokeDasharray="0.06 0.14" strokeDashoffset={-((t * 0.6) % 1)} />}
                </g>
              ))}
            </svg>
            {NODES.map((n, i) => {
              const p = nodePos(i), a = nodeIn(i);
              return (
                <div key={n.t} className={s.node} style={{ left: lerp(p.x, mid.x - NW / 2, fold), top: lerp(p.y, mid.y - NH / 2, fold), width: NW, opacity: a * (1 - prog(t, 6.6, 6.85)), transform: `scale(${(0.9 + 0.1 * a) * (1 - 0.4 * fold)})` }}>
                  <span className={s.nk} style={{ background: n.c }}>{n.k}</span>
                  <b>{n.t}</b>
                  <i className={s.portL} /><i className={s.portR} />
                </div>
              );
            })}
            <div className={s.check} style={{ opacity: check * (1 - fold) }}>✓ Pre-flight · 0 issues</div>
          </div>

          {/* the pushed bundle */}
          <div className={s.bundle} style={{ left: bundle.x, top: bundle.y, opacity: prog(t, 6.55, 6.8) * (1 - prog(t, 7.7, 7.9)), transform: `translate(-50%, -50%) scale(${1 - 0.35 * fly})` }}>
            <span>✦</span><div><b>Goods Receipt</b><em>v2.4 · 4 steps</em></div>
          </div>

          {/* the device arrives only after Push */}
          <div className={s.phone} style={{ left: P.x, top: P.y, width: P.w, height: P.h, opacity: devIn * fade, transform: `translate(${dev.dx}px, ${dev.dy}px) scale(${1 + 0.04 * Math.sin(prog(t, 7.7, 8.1) * Math.PI)})` }}>
            <div className={s.pscreen}>
              <div className={s.pbar}><span className={s.conn}>● Handheld H53</span></div>
              {t < 7.8 ? (
                <div className={s.idle}>{fly > 0 ? "Receiving…" : "Connected"}</div>
              ) : (
                <div className={s.psteps}>
                  {NODES.map((n, i) => {
                    const st = prog(run, i / NODES.length, (i + 0.8) / NODES.length);
                    return (
                      <div key={n.t} className={st >= 1 ? s.stepDone : st > 0 ? s.stepRun : ""} style={{ opacity: Math.min(1, prog(t, 7.8 + i * 0.12, 8.1 + i * 0.12)) }}>
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
    // the content box (padding left out), so the phone never runs past the card's edge
    const fit = () => {
      const cs = getComputedStyle(el);
      setB({ w: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), h: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return b;
}
