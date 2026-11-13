import Link from "next/link";
import ProjectCard, { PlaceholderCard } from "./ProjectCard";
import SiteShell from "./SiteShell";
import AnimatedContent from "./reactbits/AnimatedContent";
import CursorScope from "./CursorScope";
import s from "./site.module.css";
import { categories, projectsIn, type CategoryId } from "@/lib/site/content";

/** One line per category, from Nishanth's own description of each in his brief. */
const LINES: Record<CategoryId, string> = {
  "visual-craft": "Visual and interaction design — interface craft, design systems and visual identity work.",
  "product-strategy": "How I think about products and solve problems — end-to-end product design for complex SaaS and enterprise platforms.",
  "design-engineering": "Moving beyond design files — design systems, component libraries, prototypes and working interfaces.",
};

/** A dedicated page for one work category (also reachable as a tab on the homepage). */
export default function CategoryPage({ id }: { id: CategoryId }) {
  const cat = categories.find((c) => c.id === id)!;
  const list = projectsIn(id);
  return (
    <SiteShell>
      <section className={`${s.container} ${s.intro}`} style={{ paddingBottom: 48 }}>
        <span className={s.eyebrow}>Work · {list.length} {list.length === 1 ? "project" : "projects"}</span>
        <h1 className={s.display} style={{ marginTop: 16 }}>{cat.label}</h1>
        <p className={s.lede} style={{ marginTop: 24 }}>{LINES[id]}</p>
        <nav className={s.catSwitch} aria-label="Other categories">
          {categories.map((c) => (
            <Link key={c.id} href={`/${c.id}`} className={s.catLink} aria-current={c.id === id ? "page" : undefined}>
              {c.label} <span className={s.tabCount}>{projectsIn(c.id).length}</span>
            </Link>
          ))}
        </nav>
      </section>
      <div className={s.container}>
        <CursorScope>
        <AnimatedContent className={s.grid} distance={16} duration={0.55} stagger={0.08} threshold={0.05}>
          {[
            ...list.map((p) => <ProjectCard key={p.slug} project={p} />),
            ...(id === "design-engineering"
              ? [<PlaceholderCard key="more" title="More work coming soon" note="Prototypes, component libraries and shipped interfaces — details to be updated." />]
              : []),
          ]}
        </AnimatedContent>
        </CursorScope>
      </div>
    </SiteShell>
  );
}
