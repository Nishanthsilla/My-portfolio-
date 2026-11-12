import { film } from "./content";
import styles from "./IntroFilm.module.css";

/**
 * The Agent Control Room — the one product that runs through chapters 3–7.
 * Every text element carries both a wireframe bar (.w) and the real text (.t);
 * CSS variables --f1…--f4 (set by the Figma edits) move each region from
 * wireframe to designed. [data-b] marks build steps for the code chapter;
 * [data-t] marks the targets the chapter-2 artefacts assemble into.
 */
const Tx = ({ children, f, w = "70%" }: { children: React.ReactNode; f: 1 | 2 | 3 | 4; w?: string }) => (
  <span className={styles.tx} style={{ "--f": `var(--f${f})`, "--ww": w } as React.CSSProperties}>
    <span className={styles.w} />
    <span className={styles.t}>{children}</span>
  </span>
);

export default function ControlRoom() {
  const p = film.product;
  return (
    <div className={styles.cr} data-cr>
      <header className={styles.crHead} data-t="head" data-b="0">
        <span className={styles.crLogo} />
        <span className={styles.crTitle}><Tx f={2} w="60%">{p.name}</Tx></span>
        <span className={styles.crPill} data-cr-pill data-complete="false">
          <i />
          <Tx f={4} w="80%">
            <span className={styles.pillRun}>{p.running}</span>
            <span className={styles.pillDone}>{p.complete}</span>
          </Tx>
        </span>
      </header>

      <div className={styles.crIntent} data-b="0">
        <span className={styles.crLabel}><Tx f={2} w="90%">{p.intentLabel}</Tx></span>
        <span className={styles.crChip} data-t="intent"><Tx f={2} w="80%">{p.intent}</Tx></span>
      </div>

      <div className={styles.crFlow} data-t="flow">
        {p.nodes.map((n, i) => (
          <div key={n.name} className={styles.crNode} data-t={`n${i}`} data-node data-b={i + 1} data-state="waiting">
            <span className={styles.nodeDot} />
            <span className={styles.nodeName}><Tx f={4} w="70%">{n.name}</Tx></span>
            <span className={styles.nodeMeta}>
              <Tx f={4} w="55%">
                <span className={styles.m} data-m0>{n.meta}</span>
                <span className={styles.m} data-m1 style={{ opacity: 0 }}>{n.after}</span>
              </Tx>
            </span>
            {i === 1 && <span className={styles.nodeBar}><i data-progress /></span>}
          </div>
        ))}
      </div>

      <aside className={styles.crAppr} data-t="appr" data-b="5">
        <span className={styles.apprTag}><Tx f={1} w="40%">Pricing</Tx></span>
        <span className={styles.apprTitle}><Tx f={1} w="85%">{p.approval.title}</Tx></span>
        <span className={styles.apprConf}>
          <Tx f={1} w="50%">{p.approval.confidence}</Tx>
          <span className={styles.meter}><i /></span>
          <Tx f={1} w="40%">{p.approval.pct}</Tx>
          {/* success replaces the confidence row once approved */}
          <span className={styles.apprDone} aria-hidden="true">
            <i>✓</i>Approved &amp; sent
          </span>
        </span>
        <span className={styles.apprBtns}>
          <span className={styles.btnGhost}><Tx f={2} w="60%">{p.approval.edit}</Tx></span>
          <span className={styles.btnPrimary} data-t="btn">
            <span className={styles.btnFill} />
            <span className={styles.btnLabel}><Tx f={2} w="70%">{p.approval.approve}</Tx></span>
          </span>
        </span>
      </aside>

      <div className={styles.crLogA} data-t="logA" data-b="5">
        <span className={styles.bars}>{[42, 64, 52, 78, 70, 90].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</span>
      </div>
      <div className={styles.crLogB} data-t="logB" data-b="5">
        <Tx f={2} w="60%">{film.artefacts.kpi}</Tx>
        <svg viewBox="0 0 120 40" className={styles.spark} aria-hidden="true">
          <path d="M2 34 L22 30 L42 31 L62 22 L82 19 L102 11 L118 6" />
        </svg>
      </div>
    </div>
  );
}
