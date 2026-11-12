import { film } from "./content";
import styles from "./IntroFilm.module.css";

function Card({ k, tag, children, cls = "" }: { k: string; tag?: string; children: React.ReactNode; cls?: string }) {
  return (
    <div className={`${styles.art} ${cls}`} data-art={k}>
      <div className={styles.artIn}>
        {tag && <span className={styles.artTag}>{tag}</span>}
        {children}
      </div>
    </div>
  );
}

/**
 * Chapter 2: the raw material of a product problem — research, data, feedback,
 * requirements, decisions. The core pieces later assemble into the product
 * (chapter 3); the rest is clutter that is cleared away.
 */
export function Artefacts() {
  const a = film.artefacts;
  return (
    <div className={styles.arts}>
      <Card k="research" tag={a.research.tag}>
        <b>{a.research.title}</b>
        <span className={styles.artQuote}>{a.research.line}</span>
        <span className={styles.artLines} aria-hidden="true"><i /><i /><i /></span>
      </Card>
      <Card k="insight" tag={a.insight.tag} cls={styles.artNote}><b>{a.insight.title}</b></Card>
      <Card k="requirement" tag={a.requirement.tag}><b>{a.requirement.title}</b></Card>
      <Card k="decision" tag={a.decision.tag}><b>{a.decision.title}</b></Card>
      <Card k="idea" tag={a.idea.tag} cls={styles.artNote}><b>{a.idea.title}</b></Card>
      <Card k="workflow" tag="Workflow">
        <span className={styles.artFlow}><i>Research</i>→<i>Draft</i>→<i>Review</i></span>
      </Card>
      <Card k="dependency" cls={styles.artChip}><span className={styles.chipDot} />{a.dependency}</Card>
      <Card k="kpi" tag={a.kpi}>
        <svg viewBox="0 0 120 40" className={styles.spark} aria-hidden="true"><path d="M2 34 L22 30 L42 31 L62 22 L82 19 L102 11 L118 6" /></svg>
      </Card>
      <Card k="chart" cls={styles.artChart}>
        <span className={styles.bars}>{[42, 64, 52, 78, 70, 90].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</span>
      </Card>

      {/* documents and data that add to the complexity, then get cleared away */}
      <Card k="sheet" tag={a.sheet.tag}>
        <span className={styles.sheet}>
          {a.sheet.rows.map((r) => r.map((c, j) => <span key={r[0] + j}>{c}</span>))}
        </span>
      </Card>
      <Card k="report" tag={a.report.tag} cls={styles.artDoc}>
        <b>{a.report.title}</b>
        <span className={styles.artLines} aria-hidden="true"><i /><i /><i /><i /></span>
        <span className={styles.docChart} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.artMeta}>{a.report.meta}</span>
      </Card>
      <Card k="feedback1" tag={a.feedback1.who} cls={styles.artQuoteCard}><b>{a.feedback1.quote}</b></Card>
      <Card k="feedback2" tag={a.feedback2.who} cls={styles.artQuoteCard}><b>{a.feedback2.quote}</b></Card>
      <Card k="agent" cls={styles.artAgent}>
        <span className={styles.agentRow}>
          <span className={styles.agentIcon} aria-hidden="true" />
          <b>{a.agent.name}</b>
          <span className={styles.agentStatus}>{a.agent.status}</span>
        </span>
        <span className={styles.artMeta}>{a.agent.meta}</span>
      </Card>
      <Card k="line" tag={a.line}>
        <svg viewBox="0 0 160 60" className={styles.lineChart} aria-hidden="true">
          <path className={styles.grid} d="M0 15 H160 M0 30 H160 M0 45 H160" />
          <path d="M2 50 L28 44 L52 46 L78 30 L104 34 L130 18 L158 12" />
        </svg>
      </Card>
      <div className={`${styles.art} ${styles.artPoints}`} data-art="points" aria-hidden="true">
        <svg viewBox="0 0 200 90">
          <path d="M14 70 L58 34 L104 56 L150 22 L188 44" />
          {[[14, 70], [58, 34], [104, 56], [150, 22], [188, 44]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 3 ? 6 : 4.5} />)}
        </svg>
      </div>

      {/* chapter 3 extras: a rough wireframe sketch and a sticky note */}
      <Card k="sketch" tag="Wireframe v0" cls={styles.artSketch}>
        <span className={styles.sketch} aria-hidden="true">
          <i /><i /><i /><i />
          <svg viewBox="0 0 200 40" preserveAspectRatio="none"><path d="M10 20 C 40 6, 60 34, 95 18 S 160 30, 190 14" /></svg>
        </span>
      </Card>
      <Card k="sticky" cls={styles.artSticky}><b>Need approve step??</b><span className={styles.artQuote}>who signs off?</span></Card>
      <div className={`${styles.art} ${styles.artBtns}`} data-art="button">
        <span className={`${styles.uiBtn} ${styles.uiGhost}`}>{film.product.approval.edit}</span>
        <span className={`${styles.uiBtn} ${styles.uiPrimary}`}>{film.product.approval.approve}</span>
      </div>
    </div>
  );
}

/** Chapter 5: what appears around "Figma" while it is selected — one piece at a time. */
export function DesignDetails() {
  return (
    <>
      <div className={styles.figTool} data-fx="tool" aria-hidden="true">
        <i className={styles.toolOn}>
          <svg viewBox="0 0 16 16"><path d="M3 2 L13 7 L8.5 8.5 L7 13 Z" /></svg>
        </i>
        <i><svg viewBox="0 0 16 16"><path d="M5 1 V15 M11 1 V15 M1 5 H15 M1 11 H15" /></svg></i>
        <i><svg viewBox="0 0 16 16"><path d="M8 2 L13 12 L8 14 L3 12 Z M8 2 V9" /><circle cx="8" cy="10" r="1.3" /></svg></i>
        <i><svg viewBox="0 0 16 16"><path d="M3 3 H13 M8 3 V14" /></svg></i>
        <i><svg viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="2" /></svg></i>
      </div>
      <div className={styles.figGuide} data-fx="guideL" aria-hidden="true" />
      <div className={styles.figGuide} data-fx="guideR" aria-hidden="true" />
      <div className={`${styles.figGuide} ${styles.figGuideH}`} data-fx="guideH" aria-hidden="true" />
      <div className={styles.figRuler} data-fx="ruler" aria-hidden="true"><span data-fx-w>0</span></div>
      <div className={styles.figSpace} data-fx="space" aria-hidden="true"><span data-fx-s>0</span></div>
      <div className={styles.figLayer} data-fx="layer" aria-hidden="true">
        <i>T</i>Figma, <em>Text · Semibold</em>
      </div>
    </>
  );
}

type Tok = [string, string?];
/** A small, readable snippet: the approval button from the film's product. */
const SNIPPET: Tok[][] = [
  [["<", "p"], ["Button", "tag"], [" variant", "at"], ["=", "p"], ['"primary"', "str"], [">", "p"]],
  [["  Approve & send"]],
  [["</", "p"], ["Button", "tag"], [">", "p"]],
];

/** Chapter 6: what appears around "code" — symbols, then a snippet being written. */
export function CodeDetails() {
  return (
    <>
      {["</>", "#", "{ }", "/"].map((sym, i) => (
        <span key={sym} className={styles.codeSym} data-cx="sym" data-i={i} aria-hidden="true">{sym}</span>
      ))}
      <span className={styles.textCaret} data-cx="caret" aria-hidden="true" />
      <div className={styles.snip} data-cx="snip" aria-hidden="true">
        <span className={styles.snipBar}><i /><i /><i /><em>ApproveButton.tsx</em></span>
        {SNIPPET.map((line, i) => (
          <span key={i} className={styles.snipLine} data-snip data-len={line.reduce((a, t) => a + t[0].length, 0)}>
            <span className={styles.snipText}>
              {line.map((t, j) => <span key={j} className={t[1] ? styles[`tk_${t[1]}`] : undefined}>{t[0]}</span>)}
            </span>
          </span>
        ))}
        <span className={styles.snipCaret} data-snip-caret />
      </div>
    </>
  );
}
