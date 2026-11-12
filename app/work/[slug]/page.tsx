import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";
import styles from "./page.module.css";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <article className={styles.page}>
      <Link href="/" className={styles.back}>← Back to home</Link>
      <h1 className={`${styles.title} placeholder`}>{project.title}</h1>
      <p className="placeholder">[Placeholder] Case study content to be provided.</p>
    </article>
  );
}
