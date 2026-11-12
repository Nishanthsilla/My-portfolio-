import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = { id?: string; label: string; children?: ReactNode };

/** Generic content section container; real section designs come later. */
export default function Section({ id, label, children }: Props) {
  return (
    <section id={id} className={styles.section} aria-label={label}>
      <h2 className={styles.label}>{label}</h2>
      {children}
    </section>
  );
}
