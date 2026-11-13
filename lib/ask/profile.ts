/**
 * Everything "Ask Nishanth" may know, built from the site's own content (so it
 * stays in sync when the site changes). Only published facts: items still
 * awaiting Nishanth's confirmation are left out.
 */
import { about, explorations, photography } from "@/lib/site/about";
import { categories, contact, intro, projects, socials } from "@/lib/site/content";

const label = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

export function buildProfile(): string {
  const lines: string[] = [];
  lines.push("# Nishanth Silla — profile (the only source of truth)");
  lines.push(`Role now: ${intro.now}. Based in ${contact.location}.`);
  lines.push(`Focus: ${intro.lede}`);
  lines.push(`What he does: ${about.whatIDo}`);
  lines.push(`How he works: ${about.aboutLine}`);
  lines.push(`Stats: ${about.stats.filter((s) => !s.confirm).map((s) => `${s.value} ${s.label}`).join("; ")}.`);
  lines.push(`His human–agent loop: ${about.loop.steps.map((s) => `${s.t} — ${s.d}`).join(" ")}`);
  lines.push("\n## Experience");
  lines.push(about.experienceIntro);
  for (const e of about.experience) lines.push(`- ${e.when}: ${e.role} at ${e.org} (${e.where}). ${e.note}`);
  lines.push("\n## Skills");
  for (const s of about.skills) lines.push(`- ${s.k}: ${s.v.join(", ")}`);
  lines.push(`Education: ${about.education.join("; ")}. Languages: ${about.languages.join(", ")}.`);
  lines.push("\n## Projects");
  for (const p of projects) {
    const bits = [`### ${p.title}`, `Category: ${label(p.category)}${p.org ? ` · ${p.org}` : ""}${p.year ? ` · ${p.year}` : ""}${p.role ? ` · role: ${p.role}` : ""}`];
    if (p.description) bits.push(p.description);
    if (p.contribution?.length) bits.push(`What he did: ${p.contribution.join(" ")}`);
    if (p.tags?.length) bits.push(`Highlights: ${p.tags.join(", ")}`);
    if (p.external) bits.push(`(Case study on ${p.external.label}.)`);
    lines.push(bits.join("\n"));
  }
  lines.push("\n## Beyond the Interface (side explorations)");
  for (const x of explorations) lines.push(`- ${x.title} (${x.status}): ${x.summary}`);
  lines.push(`\n## Photography\n${photography.photos.length} photographs on the site — frames, places and moments.`);
  lines.push("\n## Personal");
  lines.push(about.journey);
  lines.push(about.outside);
  lines.push("\n## Contact");
  lines.push(`Email: ${contact.email}. Elsewhere: ${socials.map((s) => s.label).join(", ")} (links on the site).`);
  return lines.join("\n");
}
