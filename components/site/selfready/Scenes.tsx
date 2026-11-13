"use client";

import { useRef } from "react";

import { Chip, Crop, Cursor, ITEMS, LABEL, NAME, Shelf, Stage, ease, easeInOut, lerp, prog, useLoop, useNarrow, window01, type ShelfState } from "./engine";
import { selfReady } from "@/lib/site/selfReady";
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
/* 1. Listing-card cover — 10 s: detect → associate → flag → review → confirm → resolved */
/* ======================================================================== */
export function CoverScene() {
  const D = 10;
  const { ref, t } = useLoop(D, 6.9);
  const n = useNarrow(ref);
  const out = prog(t, 8.9, 9.7);
  const flagA = ease(prog(t, 3.5, 3.9));
  const review = window01(t, 4.5, 5.1, 7.2, 7.7);
  const confirmed = ease(prog(t, 6.45, 6.75));
  const st: ShelfState = {
    products: ease(prog(t, 0.5, 1.5)),
    labels: ease(prog(t, 1.1, 2.1)),
    links: [
      ...[0, 2, 6, 11].map((i, k) => ({ i, p: ease(prog(t, 2.2 + k * 0.12, 2.7 + k * 0.12)) })),
      { i: FLAG, p: ease(prog(t, 3.2, 3.6)), tone: confirmed > 0.5 ? ("done" as const) : ("flag" as const) },
    ],
    flag: confirmed > 0.5 ? null : { i: FLAG, a: flagA },
    focus: { i: FLAG, a: review },
    done: confirmed > 0.5 ? [FLAG] : [],
    boxesOut: out,
  };
  // cursor: in from the bottom right, onto Confirm, click, away
  const cIn = easeInOut(prog(t, 5.0, 6.1));
  const cx = n ? lerp(440, 350, cIn) : lerp(860, 712, cIn), cy = n ? lerp(700, 584, cIn) : lerp(520, 368, cIn);
  const cursorA = prog(t, 4.9, 5.1) * (1 - prog(t, 6.9, 7.3));
  const press = t > 6.3 && t < 6.45;
  const resolved = ease(prog(t, 7.5, 8.0)) * (1 - out);
  const listA = ease(prog(t, 2.0, 2.6)) * (1 - review) * (1 - out);
  return (
    <div ref={ref} className={`${s.sceneWrap} ${n ? s.n : ""}`}>
      <Stage w={n ? 420 : 800} h={n ? 640 : 450} label="Illustrative Self-Ready shelf analysis: products and labels are detected, one association needs confirmation, the reviewer inspects the evidence and confirms it.">
        <div className={s.win} style={n ? { left: 10, top: 10, width: 400, height: 620 } : { left: 24, top: 24, width: 752, height: 402 }}>
          <div className={s.winBar}>
            <i /><i /><i />
            <b>Shelf Analysis</b>
            <span className={s.winRight}>
              {resolved > 0.5 ? <Chip tone="done">All reviewed</Chip> : flagA > 0.5 ? <Chip tone="confirm">1 to review</Chip> : <Chip tone="plain">Analysing</Chip>}
            </span>
          </div>
          <div className={s.coverBody}>
            <div className={s.shelfPane}><Shelf st={st} /></div>
            <div className={s.sidePane}>
              {/* list of associations */}
              <div className={s.layer} style={{ opacity: listA, transform: `translateY(${(1 - listA) * 8}px)` }}>
                <p className={s.paneTitle}>Associations</p>
                {[0, 2, 6, FLAG].map((i, k) => {
                  const a = ease(prog(t, 2.2 + k * 0.15, 2.6 + k * 0.15));
                  const isFlag = i === FLAG;
                  return (
                    <div key={i} className={`${s.row} ${isFlag && flagA > 0.5 ? s.rowFlag : ""}`} style={{ opacity: a }}>
                      <span>{NAME(i)} ↔ {LABEL(i)}</span>
                      {isFlag ? (flagA > 0.5 ? <Chip tone="confirm">Needs confirmation</Chip> : null) : <Chip tone="auto">Auto-admitted</Chip>}
                    </div>
                  );
                })}
              </div>
              {/* focused review */}
              <div className={s.layer} style={{ opacity: review, transform: `translateY(${(1 - review) * 10}px)` }}>
                <p className={s.paneTitle}>Review</p>
                <p className={s.reviewTitle}>{NAME(FLAG)} ↔ {LABEL(FLAG)}</p>
                {confirmed > 0.5 ? <Chip tone="done">✓ Confirmed</Chip> : <Chip tone="confirm">Needs confirmation</Chip>}
                <div className={s.evidence}>
                  <figure><Crop i={FLAG} part="product" /><figcaption>Product</figcaption></figure>
                  <figure><Crop i={FLAG} part="label" /><figcaption>Shelf label</figcaption></figure>
                </div>
                <div className={s.kv}><span>Detection quality</span><b>Medium</b></div>
                <div className={s.actions}>
                  <span className={s.btnGhost}>Correct</span>
                  <span className={`${s.btnPrimary} ${press ? s.pressed : ""}`}>{confirmed > 0.5 ? "Confirmed" : "Confirm"}</span>
                </div>
              </div>
              {/* resolved */}
              <div className={s.layer} style={{ opacity: resolved, transform: `translateY(${(1 - resolved) * 8}px)` }}>
                <p className={s.paneTitle}>Associations</p>
                {[0, 2, 6, FLAG].map((i) => (
                  <div key={i} className={s.row}>
                    <span>{NAME(i)} ↔ {LABEL(i)}</span>
                    {i === FLAG ? <Chip tone="done">✓ Confirmed</Chip> : <Chip tone="auto">Auto-admitted</Chip>}
                  </div>
                ))}
                <p className={s.note}>Nothing left to review in this capture.</p>
              </div>
            </div>
          </div>
        </div>
        <Cursor x={cx} y={cy} press={press} a={cursorA} />
      </Stage>
    </div>
  );
}

/* ======================================================================== */
/* 2. Case-study hero — 14 s, a fuller product view                          */
/* ======================================================================== */
export function HeroScene() {
  const probe = useRef<HTMLDivElement>(null);
  const n = useNarrow(probe);
  return <div ref={probe}>{n ? <CoverScene /> : <HeroWide />}</div>;
}

function HeroWide() {
  const D = 14;
  const { ref, t } = useLoop(D, 8.6);
  const out = prog(t, 12.9, 13.7);
  const flagA = ease(prog(t, 4.0, 4.5));
  const tabNeeds = window01(t, 5.3, 5.6, 11.0, 11.4); // filter: "Needs confirmation"
  const review = window01(t, 6.6, 7.2, 10.6, 11.1);
  const confirmed = ease(prog(t, 9.55, 9.85));
  const linkIds = AUTO.slice(0, 8);
  const st: ShelfState = {
    products: ease(prog(t, 0.5, 1.7)),
    labels: ease(prog(t, 1.2, 2.4)),
    links: [
      ...linkIds.map((i, k) => ({ i, p: ease(prog(t, 2.5 + k * 0.1, 3.0 + k * 0.1)) })),
      { i: FLAG, p: ease(prog(t, 3.6, 4.1)), tone: confirmed > 0.5 ? ("done" as const) : ("flag" as const) },
    ],
    flag: confirmed > 0.5 ? null : { i: FLAG, a: flagA },
    focus: { i: FLAG, a: review },
    done: confirmed > 0.5 ? [FLAG] : [],
    boxesOut: out,
  };
  // cursor path: → tab (5.3) → row (6.5) → Confirm (9.4) → away
  const p1 = easeInOut(prog(t, 4.6, 5.25)), p2 = easeInOut(prog(t, 5.8, 6.45)), p3 = easeInOut(prog(t, 8.3, 9.3));
  let cx = lerp(1240, 952, p1), cy = lerp(600, 108, p1);
  cx = lerp(cx, 1010, p2); cy = lerp(cy, 172, p2);
  cx = lerp(cx, 1112, p3); cy = lerp(cy, 424, p3);
  const cursorA = prog(t, 4.5, 4.7) * (1 - prog(t, 10.2, 10.6));
  const press = (t > 5.25 && t < 5.4) || (t > 6.45 && t < 6.6) || (t > 9.4 && t < 9.55);
  const rows = [0, 2, 6, 8, FLAG, 11];
  const listA = ease(prog(t, 2.4, 3.0)) * (1 - out);
  const visibleRows = tabNeeds > 0.5 && confirmed < 0.5 ? [FLAG] : rows;
  return (
    <div ref={ref} className={s.sceneWrap}>
      <Stage w={1200} h={560} label="Illustrative Self-Ready workspace: a capture's shelf is analysed, associations are listed, the reviewer filters to what needs confirmation, inspects the evidence and confirms.">
        <div className={s.win} style={{ left: 24, top: 24, width: 1152, height: 512 }}>
          <div className={s.winBar}>
            <i /><i /><i />
            <b>Self-Ready</b>
            <span className={s.crumb}>/ Shelf Analysis</span>
            <span className={s.winRight}>
              {confirmed > 0.5 && tabNeeds < 0.5 ? <Chip tone="done">All reviewed</Chip> : flagA > 0.5 ? <Chip tone="confirm">{confirmed > 0.5 ? 0 : 1} needs confirmation</Chip> : <Chip tone="plain">Analysing capture</Chip>}
            </span>
          </div>
          <div className={s.heroBody}>
            <nav className={s.sideNav} aria-hidden="true">
              {selfReady.modules.map((m) => (
                <span key={m} className={m === "Shelf Analysis" ? s.navOn : undefined}>{m}</span>
              ))}
            </nav>
            <div className={s.heroShelf}><Shelf st={st} /></div>
            <div className={s.heroSide}>
              <div className={s.tabsMini}>
                <span className={tabNeeds < 0.5 ? s.tabOn : undefined}>All</span>
                <span className={tabNeeds >= 0.5 ? s.tabOn : undefined}>Needs confirmation</span>
                <span>Unresolved</span>
              </div>
              <div className={s.layer} style={{ top: 56, opacity: listA * (1 - review), transform: `translateY(${(1 - listA) * 8}px)` }}>
                {visibleRows.map((i, k) => {
                  const a = ease(prog(t, 2.6 + k * 0.12, 3.0 + k * 0.12));
                  const isFlag = i === FLAG;
                  return (
                    <div key={i} className={`${s.row} ${isFlag && flagA > 0.5 && confirmed < 0.5 ? s.rowFlag : ""} ${isFlag && t > 6.3 && t < 6.6 ? s.rowPress : ""}`} style={{ opacity: a }}>
                      <span>{NAME(i)} ↔ {LABEL(i)}</span>
                      {isFlag ? (confirmed > 0.5 ? <Chip tone="done">✓ Confirmed</Chip> : flagA > 0.5 ? <Chip tone="confirm">Needs confirmation</Chip> : null) : <Chip tone="auto">Auto-admitted</Chip>}
                    </div>
                  );
                })}
              </div>
              <div className={s.layer} style={{ top: 56, opacity: review, transform: `translateY(${(1 - review) * 10}px)` }}>
                <p className={s.reviewTitle}>{NAME(FLAG)} ↔ {LABEL(FLAG)}</p>
                {confirmed > 0.5 ? <Chip tone="done">✓ Confirmed</Chip> : <Chip tone="confirm">Needs confirmation</Chip>}
                <p className={s.why}>The label sits between two products.</p>
                <div className={s.evidence}>
                  <figure><Crop i={FLAG} part="product" /><figcaption>Product</figcaption></figure>
                  <figure><Crop i={FLAG} part="label" /><figcaption>Shelf label</figcaption></figure>
                </div>
                <div className={s.kv}><span>Detection quality</span><b>Medium</b></div>
                <div className={s.actions}>
                  <span className={s.btnGhost}>Correct</span>
                  <span className={`${s.btnPrimary} ${t > 9.4 && t < 9.55 ? s.pressed : ""}`}>{confirmed > 0.5 ? "Confirmed" : "Confirm"}</span>
                </div>
              </div>
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
