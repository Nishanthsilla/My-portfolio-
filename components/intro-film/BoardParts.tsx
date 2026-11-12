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

/** Chapter 2: product-design artefacts (each assembles into a part of the product). */
export function Artefacts() {
  const a = film.artefacts;
  return (
    <div className={styles.arts}>
      <Card k="research" tag={a.research.tag}>
        <b>{a.research.title}</b>
        <span className={styles.artQuote}>{a.research.line}</span>
      </Card>
      <Card k="insight" tag={a.insight.tag} cls={styles.artNote}><b>{a.insight.title}</b></Card>
      <Card k="requirement" tag={a.requirement.tag}><b>{a.requirement.title}</b></Card>
      <Card k="decision" tag={a.decision.tag}><b>{a.decision.title}</b></Card>
      <Card k="idea" tag={a.idea.tag} cls={styles.artNote}><b>{a.idea.title}</b></Card>
      <Card k="workflow" tag="Flow">
        <span className={styles.artFlow}><i>Research</i>→<i>Draft</i>→<i>Review</i></span>
      </Card>
      <Card k="dependency" cls={styles.artChip}><span className={styles.chipDot} />{a.dependency}</Card>
      <Card k="kpi" tag={a.kpi}>
        <svg viewBox="0 0 120 40" className={styles.spark} aria-hidden="true"><path d="M2 34 L22 30 L42 31 L62 22 L82 19 L102 11 L118 6" /></svg>
      </Card>
      <Card k="chart" cls={styles.artChart}>
        <span className={styles.bars}>{[42, 64, 52, 78, 70, 90].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</span>
      </Card>
      <div className={`${styles.art} ${styles.artBtn}`} data-art="button">
        <span className={styles.artBtnLabel}>{film.product.approval.approve}</span>
      </div>
    </div>
  );
}

/** Chapter 5: a believable design-tool frame around the product. */
export function FigmaChrome() {
  const layers = [
    { k: "frame", label: "Control Room", depth: 0 },
    { k: "head", label: "Header", depth: 1 },
    { k: "flow", label: "Flow lane", depth: 1 },
    { k: "appr", label: "Approval card", depth: 1 },
    { k: "btn", label: "Button / Primary", depth: 2 },
  ];
  const props = [
    { k: "appr", title: "Layout", value: "Auto layout · 16" },
    { k: "head", title: "Text", value: "Geist · Semibold 22" },
    { k: "btn", title: "Fill", value: "FF4938", swatch: true },
    { k: "flow", title: "Component", value: "Agent node" },
  ];
  return (
    <div className={styles.figma} data-figma data-active="-1">
      <div className={styles.figBar}>
        <span className={styles.figTools}><i /><i /><i /><i /></span>
        <span className={styles.figFile}>{film.product.name}</span>
        <span className={styles.figZoom}>100%</span>
      </div>
      <div className={styles.figLayers} data-layers>
        <span className={styles.figPanelTitle}>Layers</span>
        {layers.map((l) => (
          <span key={l.k} className={styles.figRow} data-row={l.k} style={{ paddingLeft: 12 + l.depth * 14 }}>
            <i />{l.label}
          </span>
        ))}
      </div>
      <div className={styles.figCanvas} />
      <div className={styles.figProps} data-props>
        <span className={styles.figPanelTitle}>Design</span>
        {props.map((p) => (
          <span key={p.k} className={styles.figProp} data-row={p.k}>
            <em>{p.title}</em>
            <b>{p.swatch && <i className={styles.swatch} />}{p.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

type Tok = [string, string?];
const L = (...t: Tok[]) => t;
const CODE: { toks: Tok[]; ghost?: boolean; after?: boolean }[] = [
  { toks: L(["import", "kw"], [" { Flow, Agent, ApprovalCard } "], ["from", "kw"], [' "@/ui"', "str"], [";"]) },
  { toks: [] },
  { toks: L(["export function", "kw"], [" ControlRoom", "fn"], ["() {"]) },
  { toks: L(["  return", "kw"], [" ("]) },
  { toks: L(["    <"], ["Flow", "tag"], [" intent", "at"], ["="], ['"Renew Q4 deals"', "str"], [">"]) },
  { toks: L(["      <"], ["Agent", "tag"], [" name", "at"], ["="], ['"Research"', "str"], [" status", "at"], ["="], ['"done"', "str"], [" />"]) },
  { toks: L(["      <"], ["Agent", "tag"], [" name", "at"], ["="], ['"Draft"', "str"], [" status", "at"], ["="], ['"running"', "str"], [" />"]) },
  { toks: L(["      <"], ["Agent", "tag"], [" name", "at"], ["="], ['"Pricing"', "str"], [" needsApproval", "at"], [" />"]) },
  { toks: L(["      <"], ["Agent", "tag"], [" name", "at"], ["="], ['"Review"', "str"], [" by", "at"], ["="], ['"human"', "str"], [" />"]) },
  { toks: L(["      <"], ["ApprovalCard", "tag"], [" confidence", "at"], ["={"], ["0.82", "num"], ["} />"]), ghost: true },
  { toks: L(["    </"], ["Flow", "tag"], [">"]), after: true },
  { toks: L(["  );"]), after: true },
  { toks: L(["}"]), after: true },
];

/** Chapter 6: the editor (React component typed, with one AI suggestion accepted in place). */
export function CodeEditor() {
  return (
    <div className={styles.editor} data-editor>
      <div className={styles.edTabs}>
        <span className={styles.edTab}>{film.product.file}</span>
      </div>
      <div className={styles.edBody}>
        <div className={styles.edNums}>{CODE.map((_, i) => <span key={i}>{i + 1}</span>)}</div>
        <div className={styles.edCode}>
          {CODE.map((l, i) => {
            const len = l.toks.reduce((a, t) => a + t[0].length, 0);
            return (
              <div
                key={i}
                className={`${styles.edLine} ${l.ghost ? styles.edGhost : ""}`}
                data-line
                data-len={len}
                {...(l.ghost ? { "data-ghost": "1", "data-ghost-line": "" } : {})}
                {...(l.after ? { "data-after": "1" } : {})}
              >
                <span className={styles.edText}>
                  {l.toks.map((t, j) => <span key={j} className={t[1] ? styles[`tk_${t[1]}`] : undefined}>{t[0]}</span>)}
                </span>
                {l.ghost && <span className={styles.ghostChip} data-ghost-chip>AI suggestion · Tab</span>}
              </div>
            );
          })}
          <span className={styles.codeCaret} data-code-caret />
        </div>
      </div>
    </div>
  );
}
