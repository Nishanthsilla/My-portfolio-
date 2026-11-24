"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, ease, easeInOut, prog, useLoop } from "../selfready/engine";
import s from "./ambient.module.css";

/**
 * Ambient AI cover (illustrative): an agent configured in the Control Plane on
 * a laptop travels down a connection to a handheld device and goes live there.
 * 9 s loop: connect → pack the agent → travel → install → ready.
 */
const STEPS = ["Label Reader", "Stock Lookup", "Fill the screen"];

export default function AgentPush() {
  const D = 9;
  const { ref, t } = useLoop(D, 6.6);
  const box = useBox(ref);
  const tall = box.h > box.w * 0.7;
  const out = prog(t, 8.2, 8.9);
  const link = ease(prog(t, 0.4, 1.3)) * (1 - out);               // the cable draws in
  const packed = ease(prog(t, 1.6, 2.2));                          // the agent card lifts off the screen
  const travel = easeInOut(prog(t, 2.4, 4.6));                     // along the cable
  const install = prog(t, 4.6, 6.0);                               // the device installs it
  const ready = t > 6.0 && out < 0.5;
  const steps = STEPS.map((_, i) => ease(prog(t, 4.8 + i * 0.35, 5.2 + i * 0.35)) * (1 - out));

  // geometry (stage 760 × 420): laptop screen on the left, device on the right
  const W = tall ? 520 : 760, H = tall ? 560 : 420;
  const L = tall ? { x: 40, y: 40, w: 440, h: 250 } : { x: 30, y: 60, w: 430, h: 262 };
  const P = tall ? { x: 200, y: 356, w: 120, h: 190 } : { x: 588, y: 92, w: 132, h: 236 };
  const from = tall ? { x: L.x + L.w / 2, y: L.y + L.h + 26 } : { x: L.x + L.w + 8, y: L.y + L.h / 2 + 20 };
  const to = tall ? { x: P.x + P.w / 2, y: P.y - 4 } : { x: P.x - 4, y: P.y + P.h / 2 };
  const mid = tall ? { x: from.x + 80, y: (from.y + to.y) / 2 } : { x: (from.x + to.x) / 2, y: from.y + 60 };
  const q = (k: number) => ({ x: (1 - k) ** 2 * from.x + 2 * (1 - k) * k * mid.x + k * k * to.x, y: (1 - k) ** 2 * from.y + 2 * (1 - k) * k * mid.y + k * k * to.y });
  const pos = q(travel);
  const onScreen = packed < 1 || travel === 0;
  const agentA = (travel > 0 && travel < 1 ? 1 : 0) * (1 - out);

  return (
    <div ref={ref} className={s.wrap}>
      <div style={{ width: box.h ? Math.min(box.w, box.h * (W / H)) : "100%", margin: "0 auto" }}>
        <Stage w={W} h={H} label="Illustrative Ambient AI: an agent configured in the Control Plane on a laptop travels over the connection to a handheld device and goes live there.">
          {/* laptop */}
          <div className={s.laptop} style={{ left: L.x, top: L.y, width: L.w, height: L.h }}>
            <div className={s.screen}>
              <div className={s.side}><i /><b /><b /><b className={s.on} /><b /><b /></div>
              <div className={s.main}>
                <p className={s.k}>Agents</p>
                <div className={s.agent} style={{ opacity: onScreen ? 1 - packed * 0.65 : 0.35, transform: `translateY(${-packed * 6}px)` }}>
                  <span className={s.dot}>✦</span>
                  <div><b>Receiving agent</b><span>3 skills · v2.4.0</span></div>
                  <em className={ready ? s.live : packed > 0.5 ? s.sending : ""}>{ready ? "Live on device" : packed > 0.5 ? "Sending…" : "Ready to push"}</em>
                </div>
                <div className={s.ghost} /><div className={s.ghost} style={{ width: "70%" }} />
                <span className={`${s.push} ${t > 1.45 && t < 1.65 ? s.pressed : ""}`}>Push to device</span>
              </div>
            </div>
            <div className={s.base} />
          </div>

          {/* the connection */}
          <svg className={s.wire} width={W} height={H} aria-hidden="true">
            <path d={`M${from.x} ${from.y} Q${mid.x} ${mid.y} ${to.x} ${to.y}`} fill="none" stroke="#d9d6ff" strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={`${link} 1`} />
            <path d={`M${from.x} ${from.y} Q${mid.x} ${mid.y} ${to.x} ${to.y}`} fill="none" stroke="#6d5cf0" strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={`${travel * link} 1`} />
            {link > 0.98 && <circle cx={from.x} cy={from.y} r={5} fill="#6d5cf0" />}
            {link > 0.98 && <circle cx={to.x} cy={to.y} r={5} fill={ready ? "#22c55e" : "#6d5cf0"} />}
          </svg>

          {/* the travelling agent */}
          <div className={s.packet} style={{ left: pos.x, top: pos.y, opacity: agentA, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * Math.sin(travel * Math.PI)})` }}>
            <span className={s.dot}>✦</span> Receiving agent
          </div>

          {/* device */}
          <div className={s.phone} style={{ left: P.x, top: P.y, width: P.w, height: P.h }}>
            <div className={s.pscreen}>
              <div className={s.pbar}><span className={link > 0.98 ? s.conn : ""}>{link > 0.98 ? "● Connected" : "○ Searching"}</span></div>
              {install > 0 && !ready && (
                <div className={s.installing}>
                  <span>Installing</span>
                  <i><b style={{ width: `${install * 100}%` }} /></i>
                </div>
              )}
              <div className={s.psteps}>
                {STEPS.map((x, i) => (
                  <div key={x} style={{ opacity: steps[i], transform: `translateY(${(1 - steps[i]) * 6}px)` }}><em>{i + 1}</em>{x}</div>
                ))}
              </div>
              {ready && <div className={s.ready}>✓ Agent live</div>}
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
