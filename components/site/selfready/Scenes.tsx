"use client";

import { useEffect, useState } from "react";

import { Chip, Crop, Cursor, ITEMS, KINDS, LABEL, NAME, PALETTE, PH, PW, Product, Shelf, ShelfLabel, Stage, ease, easeInOut, lerp, prog, useLoop, useNarrow, window01, type ShelfState } from "./engine";
import s from "./selfready.module.css";

/*
 * Self-Ready interface scenes — illustrative reconstructions built from the
 * brief only: generic items, qualitative levels, and the working terms from
 * the project discussions (to be confirmed). Each scene is a pure function of
 * its loop time, so loops restart without a jump.
 */

const FLAG = 13; // the ambiguous association (its label sits between two products)
const AUTO = [0, 1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 14];

/* ======================================================================== */
/* 1. Listing-card cover — 8 s, deliberately simple: one shelf row, its       */
/*    labels, each product matched to its label, and the matches listed.      */
/* ======================================================================== */
const ROW = [0, 1, 2, 3];
export function CoverScene() {
  const D = 8;
  const { ref, t } = useLoop(D, 5.6);
  const box = useTall(ref);
  const tall = box.tall;
  const out = prog(t, 7.0, 7.7);
  const boxes = ease(prog(t, 0.3, 1.0)) * (1 - out);
  const link = (k: number) => ease(prog(t, 1.2 + k * 0.6, 1.7 + k * 0.6)) * (1 - out);
  const matched = ROW.filter((_, k) => link(k) > 0.95).length;
  const shelf = (
    <div className={s.rowShelf}>
      <svg viewBox="10 4 470 156" aria-hidden="true">
        <rect x="0" y="0" width="600" height="160" fill="#F4F1EC" />
        <rect x="10" y={24 + PH + 2} width="580" height="8" fill="#CBC3B7" />
        <rect x="10" y={24 + PH + 10} width="580" height="30" fill="#E7E2DA" />
        {ROW.map((i) => (
          <g key={i}>
            <Product x={ITEMS[i].x} y={ITEMS[i].y} kind={KINDS[i]} color={PALETTE[i % PALETTE.length]} />
            <ShelfLabel x={ITEMS[i].x + 8} y={ITEMS[i].ly} />
          </g>
        ))}
        {ROW.map((i, k) => {
          const it = ITEMS[i], p = link(k);
          const x1 = it.x + PW / 2, y1 = it.y + PH + 2, x2 = it.x + 48, y2 = it.ly - 3;
          return (
            <g key={i}>
              <rect x={it.x + 6} y={it.y} width={PW - 12} height={PH + 2} rx={5} fill="none" stroke={p > 0.95 ? "#2f7d5b" : "#FF4938"} strokeWidth={1.8} opacity={boxes} />
              <g opacity={p}>
                <line x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke="#2f7d5b" strokeWidth={2.2} />
                <circle cx={x1} cy={y1} r={3.5} fill="#2f7d5b" />
                <circle cx={lerp(x1, x2, p)} cy={lerp(y1, y2, p)} r={3.5} fill="#2f7d5b" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
  const list = (
    <div className={s.matchList}>
      <p className={s.paneTitle}>Associations</p>
      {ROW.map((i, k) => {
        const p = link(k);
        return (
          <div key={i} className={s.row} style={{ opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 8}px)` }}>
            <span>{NAME(i)} ↔ {LABEL(i)}</span>
            {p > 0.95 ? <Chip tone="done">✓ Matched</Chip> : <span className={s.pending} />}
          </div>
        );
      })}
    </div>
  );
  // a wide tile: shelf and list side by side; a tall tile (phones, portrait cards): the row on top, the matches below
  const W = tall ? 520 : 760, H = tall ? 560 : 400;
  return (
    <div ref={ref} className={`${s.sceneWrap} ${s.coverCenter}`}>
      {/* as wide as the card allows, without getting taller than it */}
      <div style={{ width: box.h ? Math.min(box.w, box.h * 0.94 * (W / H)) : "100%", margin: "0 auto" }}>
        <Stage w={W} h={H} label="Illustrative Self-Ready shelf analysis: each product on a shelf row is matched to its shelf label, and the matches are listed.">
          <div className={s.win} style={{ left: 20, top: 20, width: W - 40, height: H - 40 }}>
            <div className={s.winBar}>
              <i /><i /><i />
              <b>Self-Ready</b>
              {!tall && <span className={s.crumb}>/ Shelf Analysis</span>}
              <span className={s.winRight}>
                {matched === ROW.length ? <Chip tone="done">✓ All matched</Chip> : <Chip tone="plain">Matching · {matched}/{ROW.length}</Chip>}
              </span>
            </div>
            <div className={tall ? s.coverBodyTall : s.coverBody2}>
              {shelf}
              {list}
            </div>
          </div>
        </Stage>
      </div>
    </div>
  );
}

/** True when the scene's box is taller than it is wide-ish (a portrait card). */
function useTall(ref: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ tall: false, w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const fit = () => setBox({ tall: el.clientHeight > el.clientWidth * 0.7, w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

/* ======================================================================== */
/* 2. Case-study hero — 12 s, a different scene: a scan sweeps two shelf      */
/*    rows, matches stream into the list with their confidence, one weak      */
/*    match is flagged, the reviewer confirms it, and the totals settle.      */
/* ======================================================================== */
const HERO = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const WEAK = 7;
const CONF = [96, 94, 98, 91, 95, 93, 97, 62, 92, 96];
export function HeroScene() {
  const D = 12;
  const { ref, t } = useLoop(D, 9.6);
  const out = prog(t, 11.0, 11.7);
  const scan = prog(t, 0.4, 3.6); // 0 → 1 across the shelf
  const seen = (i: number) => scan * 600 > ITEMS[i].x + PW / 2;
  const link = (k: number) => ease(prog(t, 1.2 + k * 0.32, 1.7 + k * 0.32)) * (1 - out);
  const flagA = ease(prog(t, 4.4, 4.8)) * (1 - out);
  const confirmed = t > 7.6 && out < 0.5;
  const press = t > 7.45 && t < 7.6;
  const cIn = easeInOut(prog(t, 5.6, 7.3));
  const cx = lerp(1180, 1046, cIn), cy = lerp(560, 452, cIn);
  const cursorA = prog(t, 5.5, 5.8) * (1 - prog(t, 8.3, 8.7));
  const listed = HERO.filter((_, k) => link(k) > 0.5);
  const matched = listed.filter((i) => i !== WEAK || confirmed).length;
  const review = listed.includes(WEAK) && !confirmed && flagA > 0.5 ? 1 : 0;
  return (
    <div ref={ref} className={s.sceneWrap}>
      <Stage w={1200} h={560} label="Illustrative Self-Ready workspace: a scan sweeps the shelf, products are matched to their labels with a confidence score, one weak match is flagged and the reviewer confirms it.">
        <div className={s.win} style={{ left: 24, top: 24, width: 1152, height: 512 }}>
          <div className={s.winBar}>
            <i /><i /><i />
            <b>Self-Ready</b>
            <span className={s.crumb}>/ Capture 214 · Aisle 4</span>
            <span className={s.winRight}>
              {scan < 1 ? <Chip tone="plain">Scanning shelf…</Chip> : review ? <Chip tone="confirm">1 needs confirmation</Chip> : <Chip tone="done">✓ Ready for the device</Chip>}
            </span>
          </div>
          <div className={s.heroBody2}>
            <div className={s.heroShelf2}>
              <div className={s.stats}>
                <span><b>{HERO.filter(seen).length}</b> products</span>
                <span><b>{matched}</b> matched</span>
                <span className={review ? s.statWarn : undefined}><b>{review}</b> to review</span>
              </div>
              <svg viewBox="0 0 600 270" aria-hidden="true">
                <rect width="600" height="270" fill="#F4F1EC" />
                {[24, 148].map((y) => (
                  <g key={y}>
                    <rect x="10" y={y + PH + 2} width="580" height="8" fill="#CBC3B7" />
                    <rect x="10" y={y + PH + 10} width="580" height="30" fill="#E7E2DA" />
                  </g>
                ))}
                {HERO.map((i) => (
                  <g key={i}>
                    <Product x={ITEMS[i].x} y={ITEMS[i].y} kind={KINDS[i]} color={PALETTE[i % PALETTE.length]} />
                    <ShelfLabel x={ITEMS[i].x + 8} y={ITEMS[i].ly} />
                  </g>
                ))}
                <g opacity={1 - out}>
                  {HERO.map((i, k) => {
                    const it = ITEMS[i], p = link(k), weak = i === WEAK && !confirmed;
                    const col = weak && flagA > 0.5 ? "#FF4938" : "#2f7d5b";
                    const x1 = it.x + PW / 2, y1 = it.y + PH + 2, x2 = it.x + 48, y2 = it.ly - 3;
                    return (
                      <g key={i}>
                        {seen(i) && <rect x={it.x + 6} y={it.y} width={PW - 12} height={PH + 2} rx={5} fill="none" stroke={col} strokeWidth={weak && flagA > 0.5 ? 2.6 : 1.6} strokeDasharray={weak && flagA > 0.5 ? "5 4" : undefined} />}
                        <g opacity={p}>
                          <line x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={col} strokeWidth={2} />
                          <circle cx={lerp(x1, x2, p)} cy={lerp(y1, y2, p)} r={3.5} fill={col} />
                        </g>
                      </g>
                    );
                  })}
                  {scan > 0 && scan < 1 && (
                    <g>
                      <rect x={scan * 600 - 40} y="0" width="40" height="270" fill="url(#beam)" />
                      <rect x={scan * 600 - 1} y="0" width="2" height="270" fill="#FF4938" />
                    </g>
                  )}
                </g>
                <defs>
                  <linearGradient id="beam" x1="0" x2="1">
                    <stop offset="0" stopColor="#FF4938" stopOpacity="0" />
                    <stop offset="1" stopColor="#FF4938" stopOpacity="0.18" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className={s.heroList}>
              <p className={s.paneTitle}>Associations · confidence</p>
              {HERO.map((i, k) => {
                const p = link(k), weak = i === WEAK;
                if (p < 0.02) return null;
                return (
                  <div key={i} className={`${s.confRow} ${weak && review ? s.confFlag : ""}`} style={{ opacity: p, transform: `translateY(${(1 - p) * 6}px)` }}>
                    <span className={s.confName}>{NAME(i)} ↔ {LABEL(i)}</span>
                    <span className={s.confBar}><i style={{ width: `${CONF[i] * p}%`, background: weak && !confirmed ? "#FF4938" : "#2f7d5b" }} /></span>
                    <b>{Math.round(CONF[i] * p)}%</b>
                    {weak && review ? <span className={`${s.miniBtn} ${press ? s.pressed : ""}`}>Confirm</span> : weak && confirmed ? <span className={s.okMark}>✓</span> : <span className={s.okMark}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Cursor x={cx} y={cy} press={press} a={cursorA} />
      </Stage>
    </div>
  );
}

/* ======================================================================== */
/* 3. Result first → evidence second → technical detail when needed — 9 s    */
/* ======================================================================== */
export function HierarchyScene() {
  const D = 9;
  const { ref, t } = useLoop(D, 3.6);
  const n = useNarrow(ref);
  const ev = window01(t, 1.4, 2.1, 8.2, 8.8);
  const tech = window01(t, 4.3, 5.0, 6.7, 7.3);
  const I = 2;
  const p = easeInOut(prog(t, 3.4, 4.2));
  const cx = n ? lerp(470, 400, p) : lerp(1040, 772, p), cy = n ? lerp(560, 400, p) : lerp(620, 470, p);
  const cursorA = prog(t, 3.3, 3.5) * (1 - prog(t, 5.2, 5.6));
  const steps = [1, ev > 0.5 ? 1 : 0.4, tech > 0.5 ? 1 : 0.4];
  return (
    <div ref={ref} className={`${s.sceneWrap} ${n ? s.n : ""}`}>
      <Stage w={n ? 440 : 1000} h={n ? 600 : 560} label="Illustrative: the association result is shown first, supporting evidence opens beneath it, and technical detail is only opened on request.">
        <div className={s.hierShelf}><Shelf st={{ products: 1, labels: 1, links: [{ i: I, p: 1 }], focus: { i: I, a: 1 } }} /></div>
        <div className={s.hierPanel}>
          <div className={s.hierStep} style={{ opacity: steps[0] }}><em>1</em>Result</div>
          <div className={s.card}>
            <p className={s.reviewTitle}>{NAME(I)} ↔ {LABEL(I)}</p>
            <Chip tone="auto">Auto-admitted</Chip>
          </div>
          <div className={s.hierStep} style={{ opacity: steps[1] }}><em>2</em>Supporting evidence</div>
          <div className={s.card} style={{ height: lerp(46, 196, ev), overflow: "hidden" }}>
            <p className={s.cardHead}>Evidence <span>{ev > 0.5 ? "−" : "+"}</span></p>
            <div style={{ opacity: ev }}>
              <div className={s.evidence}>
                <figure><Crop i={I} part="product" /><figcaption>Product</figcaption></figure>
                <figure><Crop i={I} part="label" /><figcaption>Shelf label</figcaption></figure>
              </div>
              <div className={s.kv}><span>Detection quality</span><b>High</b></div>
            </div>
          </div>
          <div className={s.hierStep} style={{ opacity: steps[2] }}><em>3</em>Technical detail — only when needed</div>
          <div className={`${s.card} ${s.cardMuted}`} style={{ height: lerp(46, 150, tech), overflow: "hidden" }}>
            <p className={s.cardHead}>Technical detail <span>{tech > 0.5 ? "−" : "+"}</span></p>
            <div className={s.techLines} style={{ opacity: tech }} aria-hidden="true">
              <i style={{ width: "86%" }} /><i style={{ width: "64%" }} /><i style={{ width: "74%" }} /><i style={{ width: "52%" }} />
            </div>
          </div>
        </div>
        <Cursor x={cx} y={cy} press={t > 4.2 && t < 4.35} a={cursorA} />
      </Stage>
    </div>
  );
}

/* ======================================================================== */
/* 4. Reviewing one association — six steps, ~10 s, with a synced stepper    */
/* ======================================================================== */
export const REVIEW_STEPS = [
  "The detected product",
  "The corresponding shelf label",
  "The current association state",
  "The available supporting evidence",
  "The action required from the reviewer",
  "What happens after that action",
];
export function ReviewScene() {
  const STEP = 1.75, D = STEP * 6 + 0.6;
  const { ref, t } = useLoop(D, STEP * 4.4);
  const n = useNarrow(ref);
  const step = Math.min(5, Math.floor(t / STEP));
  const I = FLAG;
  const at = (k: number) => ease(prog(t, k * STEP, k * STEP + 0.5));
  const reset = prog(t, D - 0.6, D);
  const st: ShelfState = {
    products: at(0),
    labels: at(1),
    links: [{ i: I, p: at(2), tone: step >= 5 && t % STEP > 0.6 ? "done" : "flag" }],
    focus: { i: I, a: at(0) },
    flag: step >= 2 && !(step >= 5 && t % STEP > 0.6) ? { i: I, a: 1 } : null,
    done: step >= 5 && t % STEP > 0.6 ? [I] : [],
    boxesOut: reset,
  };
  const evA = at(3) * (1 - reset);
  const inspect = step === 4 ? ease(prog(t, 4 * STEP + 0.2, 4 * STEP + 0.8)) : step > 4 ? 1 : 0;
  const pc = easeInOut(prog(t, 4 * STEP, 4 * STEP + 0.7)), pb = easeInOut(prog(t, 5 * STEP - 0.2, 5 * STEP + 0.3));
  let cx = n ? lerp(470, 120, pc) : lerp(980, 690, pc), cy = n ? lerp(700, 420, pc) : lerp(600, 250, pc);
  cx = lerp(cx, n ? 382 : 760, pb); cy = lerp(cy, n ? 566 : 452, pb);
  const cursorA = prog(t, 4 * STEP - 0.1, 4 * STEP + 0.1) * (1 - reset);
  const pressed = t > 5 * STEP + 0.35 && t < 5 * STEP + 0.5;
  const doneNow = step >= 5 && t % STEP > 0.6;
  return (
    <div ref={ref} className={`${s.reviewWrap} ${n ? s.n : ""}`}>
      <ol className={s.stepper}>
        {REVIEW_STEPS.map((x, k) => (
          <li key={x} className={k === step && reset < 0.5 ? s.stepOn : k < step ? s.stepDone : undefined}>
            <em>{String(k + 1).padStart(2, "0")}</em>
            {x}
          </li>
        ))}
      </ol>
      <div className={s.sceneWrap}>
        <Stage w={n ? 440 : 900} h={n ? 650 : 560} label="Illustrative six-step review of one product–label association.">
          <div className={s.revShelf}><Shelf st={st} /></div>
          <div className={s.revPanel} style={{ opacity: evA }}>
            <p className={s.reviewTitle}>{NAME(I)} ↔ {LABEL(I)}</p>
            {doneNow ? <Chip tone="done">✓ Confirmed</Chip> : <Chip tone="confirm">Needs confirmation</Chip>}
            <div className={s.evidence} style={{ transform: `scale(${1 + 0.06 * inspect})`, transformOrigin: "0 0" }}>
              <figure className={inspect > 0.5 ? s.figOn : undefined}><Crop i={I} part="product" /><figcaption>Product</figcaption></figure>
              <figure className={inspect > 0.5 ? s.figOn : undefined}><Crop i={I} part="label" /><figcaption>Shelf label</figcaption></figure>
            </div>
            <div className={s.kv}><span>Detection quality</span><b>Medium</b></div>
            <div className={s.actions}>
              <span className={s.btnGhost}>Correct</span>
              <span className={`${s.btnPrimary} ${pressed ? s.pressed : ""}`}>{doneNow ? "Confirmed" : "Confirm"}</span>
            </div>
          </div>
          <div className={s.toast} style={{ opacity: doneNow ? ease(prog(t, 5 * STEP + 0.6, 5 * STEP + 0.9)) * (1 - reset) : 0 }}>
            ✓ Association confirmed
          </div>
          <Cursor x={cx} y={cy} press={pressed} a={cursorA} />
        </Stage>
      </div>
    </div>
  );
}

/* ======================================================================== */
/* 5. Exceptions — what needs a person, why, and what they can do — 11 s     */
/* ======================================================================== */
export function ExceptionScene() {
  const D = 11;
  const { ref, t } = useLoop(D, 3.2);
  const n = useNarrow(ref);
  // two exceptions: H (needs confirmation → confirmed) and N (needs confirmation → left unresolved)
  const H = 7, N = FLAG, U = 9;
  const selH = window01(t, 1.0, 1.4, 4.6, 5.0);
  const doneH = ease(prog(t, 3.9, 4.3));
  const selN = window01(t, 5.6, 6.0, 9.2, 9.6);
  const unresN = ease(prog(t, 8.5, 8.9));
  const reset = prog(t, 10.3, 11);
  const needs = [H, N].filter((i) => !(i === H && doneH > 0.5) && !(i === N && unresN > 0.5));
  const unresolved = [U, ...(unresN > 0.5 ? [N] : [])];
  const p1 = easeInOut(prog(t, 0.4, 1.0)), p2 = easeInOut(prog(t, 3.0, 3.8)), p3 = easeInOut(prog(t, 5.0, 5.6)), p4 = easeInOut(prog(t, 7.5, 8.4));
  // wide: list left, detail right · narrow: list on top, detail below
  const T = n
    ? { row1: [200, 52], row2: [200, 100], confirm: [392, 742], leave: [178, 742], start: [470, 900] }
    : { row1: [250, 52], row2: [250, 100], confirm: [928, 470], leave: [674, 470], start: [1040, 600] };
  let cx = lerp(T.start[0], T.row1[0], p1), cy = lerp(T.start[1], T.row1[1], p1);
  cx = lerp(cx, T.confirm[0], p2); cy = lerp(cy, T.confirm[1], p2);
  cx = lerp(cx, T.row1[0], p3); cy = lerp(cy, needs.length > 1 ? T.row2[1] : T.row1[1], p3);
  cx = lerp(cx, T.leave[0], p4); cy = lerp(cy, T.leave[1], p4);
  const press = (t > 1.0 && t < 1.15) || (t > 3.85 && t < 4.0) || (t > 5.6 && t < 5.75) || (t > 8.45 && t < 8.6);
  const sel = selH > 0.01 ? { i: H, a: selH, done: doneH > 0.5, unres: false } : selN > 0.01 ? { i: N, a: selN, done: false, unres: unresN > 0.5 } : null;
  const why = sel?.i === H ? "Detection quality is low for this product." : "The label sits between two products.";
  return (
    <div ref={ref} className={`${s.sceneWrap} ${n ? s.n : ""}`}>
      <Stage w={n ? 440 : 1000} h={n ? 820 : 560} label="Illustrative exception review: associations are grouped by state; the reviewer opens one, sees why it needs attention, and confirms it or leaves it unresolved.">
        <div className={s.excList} style={{ opacity: 1 - reset * 0.4 }}>
          <p className={s.groupHead}><span>Needs confirmation</span><b>{needs.length}</b></p>
          {needs.map((i) => (
            <div key={i} className={`${s.row} ${sel?.i === i ? s.rowSel : ""}`}>
              <span>{NAME(i)} ↔ {LABEL(i)}</span><Chip tone="confirm">Needs confirmation</Chip>
            </div>
          ))}
          <p className={s.groupHead}><span>Unresolved</span><b>{unresolved.length}</b></p>
          {unresolved.map((i) => (
            <div key={i} className={`${s.row} ${i === N && unresN > 0.5 ? s.rowNew : ""}`}>
              <span>{NAME(i)} ↔ {LABEL(i)}</span><Chip tone="unresolved">Unresolved</Chip>
            </div>
          ))}
          <p className={s.groupHead}><span>Auto-admitted</span><b>{AUTO.length + (doneH > 0.5 ? 0 : 0)}</b></p>
          <div className={s.row}><span>{AUTO.length} associations</span><Chip tone="auto">Auto-admitted</Chip></div>
          {doneH > 0.5 && (
            <>
              <p className={s.groupHead}><span>Confirmed by reviewer</span><b>1</b></p>
              <div className={`${s.row} ${s.rowNew}`}><span>{NAME(H)} ↔ {LABEL(H)}</span><Chip tone="done">✓ Confirmed</Chip></div>
            </>
          )}
        </div>
        <div className={s.excDetail} style={{ opacity: sel ? sel.a : 0, transform: `translateX(${sel ? (1 - sel.a) * 12 : 12}px)` }}>
          {sel && (
            <>
              <p className={s.reviewTitle}>{NAME(sel.i)} ↔ {LABEL(sel.i)}</p>
              {sel.done ? <Chip tone="done">✓ Confirmed</Chip> : sel.unres ? <Chip tone="unresolved">Unresolved</Chip> : <Chip tone="confirm">Needs confirmation</Chip>}
              <p className={s.whyHead}>Why this needs attention</p>
              <p className={s.why}>{why}</p>
              <div className={s.evidence}>
                <figure><Crop i={sel.i} part="product" /><figcaption>Product</figcaption></figure>
                <figure><Crop i={sel.i} part="label" /><figcaption>Shelf label</figcaption></figure>
              </div>
              <div className={s.kv}><span>Detection quality</span><b>{sel.i === H ? "Low" : "Medium"}</b></div>
              <div className={s.kv}><span>Business signal</span><b className={s.tbc}>to confirm</b></div>
              <div className={s.actions}>
                <span className={`${s.btnGhost} ${t > 8.45 && t < 8.6 ? s.pressed : ""}`}>Leave unresolved</span>
                <span className={s.btnGhost}>Correct</span>
                <span className={`${s.btnPrimary} ${t > 3.85 && t < 4.0 ? s.pressed : ""}`}>Confirm</span>
              </div>
            </>
          )}
        </div>
        <Cursor x={cx} y={cy} press={press} a={prog(t, 0.3, 0.5) * (1 - prog(t, 9.6, 10))} />
      </Stage>
    </div>
  );
}

/* ======================================================================== */
/* 6. Workflow — the draft's narrative: Capture → Analyse → Review → Resolve → Publish */
/* ======================================================================== */
export const STAGES = [
  { k: "Capture", d: "Shelf information is captured and organised into sessions." },
  { k: "Analyse", d: "The system processes the shelf information and identifies relevant products and labels." },
  { k: "Review", d: "Users inspect the detected product-label associations and understand which results require attention." },
  { k: "Resolve", d: "Users review uncertain or unresolved results and take the appropriate supported action." },
  { k: "Publish", d: "Reviewed information can move forward through the relevant publishing workflow, if confirmed as part of Self-Ready." },
];
export function WorkflowScene() {
  const D = 10;
  const { ref, t } = useLoop(D, 4.2);
  const per = D / STAGES.length;
  const active = Math.floor(t / per) % STAGES.length;
  const within = (t % per) / per;
  return (
    <div ref={ref} className={s.stages} aria-label="Workflow: capture, analyse, review, resolve, publish">
      {STAGES.map((n, k) => {
        const on = k === active, past = k < active;
        return (
          <div key={n.k} className={`${s.stage5} ${on ? s.flowOn : past ? s.flowPast : ""}`}>
            <span className={s.stageDot} aria-hidden="true" />
            {k < STAGES.length - 1 && (
              <span className={s.stageLink} aria-hidden="true">
                <i style={{ transform: `scaleX(${past ? 1 : on ? ease(within) : 0})` }} />
              </span>
            )}
            <span className={s.flowGroup}>{String(k + 1).padStart(2, "0")}</span>
            <b>{n.k}</b>
            <p>{n.d}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ======================================================================== */
/* 7. Product–label association — keep the relationship visible, 9 s         */
/* ======================================================================== */
export function AssociationScene() {
  const D = 9;
  const { ref, t } = useLoop(D, 6.6);
  const n = useNarrow(ref);
  const SEQ = [2, 6, FLAG];
  const k = Math.min(2, Math.floor(t / 3));
  const local = t - k * 3;
  const I = SEQ[k];
  const a = window01(local, 0.1, 0.6, 2.5, 2.95);
  const flag = I === FLAG;
  const st: ShelfState = {
    products: 1,
    labels: 1,
    links: SEQ.slice(0, k + 1).map((i, j) => ({ i, p: j < k ? 1 : ease(prog(local, 0.1, 0.7)), tone: i === FLAG ? ("flag" as const) : undefined })),
    focus: { i: I, a },
    flag: flag ? { i: I, a: 1 } : null,
  };
  return (
    <div ref={ref} className={`${s.sceneWrap} ${n ? s.n : ""}`}>
      <Stage w={n ? 440 : 1000} h={n ? 600 : 470} label="Illustrative: each detected product stays visibly connected to its shelf label, with its state and evidence beside it.">
        <div className={s.assocShelf}><Shelf st={st} /></div>
        <div className={s.assocCard} style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
          <p className={s.paneTitle}>Association</p>
          <p className={s.reviewTitle}>{NAME(I)} ↔ {LABEL(I)}</p>
          {flag ? <Chip tone="confirm">Needs confirmation</Chip> : <Chip tone="auto">Auto-admitted</Chip>}
          <div className={s.evidence}>
            <figure><Crop i={I} part="product" /><figcaption>Product</figcaption></figure>
            <figure><Crop i={I} part="label" /><figcaption>Shelf label</figcaption></figure>
          </div>
        </div>
      </Stage>
    </div>
  );
}

/** Static outline used where the source supports no animation (reduced detail). */
export const sceneItems = ITEMS;
