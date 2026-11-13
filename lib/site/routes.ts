import { caseStudies, categories, type Project } from "./content";

/** Where a project's two levels live. */
export const overviewHref = (p: Project) => p.featured?.overview ?? `/work/${p.slug}`;
export const caseStudyHref = (p: Project) => p.featured?.caseStudy ?? `/work/${p.slug}/case-study`;
export const categoryHref = (id: string) => `/${id}`;
export const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? "";

/** In-site case studies in reading order (category order, then listing order). */
export const readingOrder: Project[] = categories.flatMap((c) => caseStudies.filter((p) => p.category === c.id));

export function neighbours(p: Project) {
  const i = readingOrder.findIndex((x) => x.slug === p.slug);
  const n = readingOrder.length;
  return { prev: readingOrder[(i - 1 + n) % n], next: readingOrder[(i + 1) % n] };
}
