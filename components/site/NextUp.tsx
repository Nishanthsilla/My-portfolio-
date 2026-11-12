import Link from "next/link";
import s from "./site.module.css";

/** A considered "in progress" state for pages that are built after the homepage and case-study direction is approved. */
export default function NextUp({ eyebrow, title, line }: { eyebrow: string; title: string; line: string }) {
  return (
    <section className={`${s.container} ${s.csHead}`} style={{ minHeight: "50vh" }}>
      <span className={s.badge}>In progress</span>
      <p className={s.eyebrow} style={{ marginTop: 32 }}>{eyebrow}</p>
      <h1 className={`${s.display} ${s.csTitle}`}>{title}</h1>
      <p className={`${s.lede} ${s.csLede}`}>{line}</p>
      <div style={{ marginTop: 40 }}>
        <Link className={`${s.btn} ${s.btnSecondary}`} href="/#work">← Back to work</Link>
      </div>
    </section>
  );
}
