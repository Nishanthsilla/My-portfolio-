import Link from "next/link";
import Section from "@/components/layout/Section";
import { projects } from "@/lib/projects";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero} aria-label="Introduction">
        <p className={`${styles.eyebrow} placeholder`}>[Role — e.g. Product / UX Designer]</p>
        <h1 className={`${styles.title} placeholder`}>[Hero statement placeholder]</h1>
        <p className={`${styles.lede} placeholder`}>
          [Placeholder] A short introduction will go here once the content is provided.
        </p>
      </section>

      <Section id="work" label="Selected work">
        <ul className={styles.projects}>
          {projects.map((p) => (
            <li key={p.slug}>
              <Link href={`/work/${p.slug}`} className={`${styles.card} placeholder`}>
                <span className={styles.thumb} aria-hidden />
                <span>{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="about" label="About">
        <p className="placeholder">[Placeholder] Biography to be provided.</p>
      </Section>
    </>
  );
}
