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
      <div className={`${styles.art} ${styles.artBtn}`} data-art="button">
        <span className={styles.artBtnLabel}>{film.product.approval.approve}</span>
      </div>
    </div>
  );
}
