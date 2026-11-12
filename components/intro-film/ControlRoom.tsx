import { film } from "./content";
import styles from "./IntroFilm.module.css";

/**
 * The Agent Control Room — the product shown in chapter 3 (assembled from the
 * mess) and chapter 7 (approved, then zoomed to full screen). Demo data only.
 * [data-t] marks the regions the chapter-3 pieces land in (and the finale origin).
 */
export default function ControlRoom() {
  const p = film.product;
  const a = p.approval;
  return (
    <div className={styles.cr} data-cr>
      <header className={styles.crHead} data-t="head">
        <span className={styles.crLogo}><i /></span>
        <span className={styles.crTitle}>{p.name}</span>
        <span className={styles.crCrumb}>/ {p.workspace}</span>
        <span className={styles.crPill} data-cr-pill data-complete="false">
          <i data-t="pilldot" />
          <span className={styles.pillRun}>{p.running}</span>
          <span className={styles.pillDone}>{p.complete}</span>
        </span>
        <span className={styles.crAvatar}>{p.user}</span>
      </header>

      <div className={styles.crIntent}>
        <span className={styles.crLabel}>{p.intentLabel}</span>
        <span className={styles.crChip} data-t="intent">{p.intent}</span>
        <span className={styles.crMeta}>
          {p.intentMeta.map((m) => <span key={m}>{m}</span>)}
        </span>
      </div>

      <div className={styles.crFlow} data-t="flow">
        {p.nodes.map((n, i) => (
          <div key={n.name} className={styles.crNode} data-t={`n${i}`} data-node data-state="waiting">
            <span className={styles.nodeTop}>
              <span className={styles.nodeStep}>{n.step}</span>
              <span className={styles.badge}>
                <span className={styles.bdA} data-m0>{n.status}</span>
                <span className={styles.bdB} data-m1>{n.statusAfter}</span>
              </span>
            </span>
            <span className={styles.nodeName}>{n.name}</span>
            <span className={styles.nodeAgent}>{n.agent}</span>
            <span className={styles.nodeMeta}>
              <span data-m0>{n.meta}</span>
              <span data-m1>{n.after}</span>
            </span>
            <span className={styles.nodeBar}><i data-bar={i} /></span>
          </div>
        ))}
      </div>

      <aside className={styles.crAppr} data-t="appr">
        <span className={styles.apprHead}>
          <span className={styles.apprTag}>
            <span className={styles.apprTagA}><i />{a.tag}</span>
            <span className={styles.apprTagB}><i>✓</i>{a.done}</span>
          </span>
          <span className={styles.apprAgent}>{a.agent}</span>
        </span>
        <span className={styles.apprTitle}>{a.title}</span>
        <span className={styles.apprRows}>
          {a.rows.map(([k, v]) => (
            <span key={k} className={styles.apprRow}><em>{k}</em><b>{v}</b></span>
          ))}
        </span>
        <span className={styles.apprConf}>
          <span className={styles.apprRow}><em>{a.confidence}</em><b>{a.pct}</b></span>
          <span className={styles.meter}><i /></span>
        </span>
        <span className={styles.apprBtns}>
          <span className={styles.btnGhost}>{a.edit}</span>
          <span className={styles.btnPrimary} data-t="btn">
            <span className={styles.btnLabel}>{a.approve}</span>
            <span className={styles.btnDone}>✓ Sent</span>
          </span>
        </span>
      </aside>

      <div className={styles.crLogA} data-t="logA">
        <span className={styles.logHead}><em>{p.replies.title}</em><b className={styles.up}>{p.replies.delta}</b></span>
        <span className={styles.logBody}>
          <span className={styles.big}>{p.replies.value}</span>
          <span className={styles.bars}>
            {p.replies.bars.map((h, i) => (
              <span key={i} className={styles.barCol}>
                <i style={{ height: `${h}%` }} />
                <em>{p.replies.days[i]}</em>
              </span>
            ))}
          </span>
        </span>
      </div>
      <div className={styles.crLogB} data-t="logB">
        <span className={styles.logHead}><em>{p.engagement.title}</em><b className={styles.up}>{p.engagement.delta}</b></span>
        <span className={styles.logBody}>
          <span className={styles.big}>{p.engagement.value}</span>
          <svg viewBox="0 0 120 40" className={styles.spark} aria-hidden="true" preserveAspectRatio="none">
            <path className={styles.sparkArea} d="M2 34 L22 30 L42 31 L62 22 L82 19 L102 11 L118 6 L118 40 L2 40 Z" />
            <path d="M2 34 L22 30 L42 31 L62 22 L82 19 L102 11 L118 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}
