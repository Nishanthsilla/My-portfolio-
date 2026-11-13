import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import site from "@/components/site/site.module.css";
import j from "@/components/site/beyond/journal.module.css";
import { explorations, modular01, type Exploration } from "@/lib/site/about";

export const metadata: Metadata = {
  title: "Beyond the Interface — Nishanth Silla",
  description: "Experiments beyond the screen — physical products, prototypes and ideas Nishanth is exploring.",
};

/** Project-specific details, only where Nishanth has supplied them. */
const DETAILS: Record<string, { k: string; v: string }[]> = {
  "modular-01": modular01.parts,
};

function Slot({ e, n }: { e: Exploration; n: number }) {
  if (e.visual.kind === "photo")
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={j.image} src={e.visual.src} alt={e.title} />;
  return (
    <div className={j.slot} role="img" aria-label={`Placeholder: ${e.visual.need}`}>
      <span className={j.slotBadge}>Placeholder</span>
      <b>ADD IMAGE HERE — {e.visual.need}</b>
      <span>beyond-{e.slug}-{n} · 3:2</span>
    </div>
  );
}

/**
 * Beyond the Interface — a curated, vertically scrolling journal of physical
 * products, prototypes and ideas (the first homepage folder). Each entry is an
 * individual project; images are labelled placeholders until supplied.
 */
export default function BeyondPage() {
  return (
    <SiteShell>
      <div className={site.container}>
        <header className={j.head}>
          <Link className={j.back} href="/">
            <span aria-hidden="true">←</span> Back to the folders
          </Link>
          <p className={site.eyebrow} style={{ marginTop: 40 }}>Personal explorations · {explorations.length} entries</p>
          <h1 className={j.title}>Beyond the Interface</h1>
          <p className={j.lede}>Experiments beyond the screen — physical products, prototypes and ideas I&apos;m exploring.</p>
          <nav className={j.index} aria-label="Entries">
            {explorations.map((e, i) => (
              <a key={e.slug} href={`#${e.slug}`}>
                <span>{String(i + 1).padStart(2, "0")}</span> {e.title}
              </a>
            ))}
          </nav>
        </header>

        {explorations.map((e, i) => {
          const details = DETAILS[e.slug];
          return (
            <article key={e.slug} id={e.slug} className={j.entry} aria-labelledby={`${e.slug}-title`}>
              <div className={j.entryHead}>
                <span className={j.num}>{String(i + 1).padStart(2, "0")}</span>
                <h2 id={`${e.slug}-title`} className={j.entryTitle}>{e.title}</h2>
                <span className={`${j.status} ${e.status === "Status to confirm" ? j.confirm : ""}`}>{e.status}</span>
              </div>
              <Slot e={e} n={1} />
              <div className={j.entryBody}>
                <p className={j.summary}>{e.summary}</p>
                <div>
                  {details ? (
                    <dl className={j.details}>
                      {details.map((d) => (
                        <div key={d.k}>
                          <dt>{d.k}</dt>
                          <dd>{d.v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className={j.pending}>Details, process images and outcomes to be added.</p>
                  )}
                  {e.href && (
                    <Link className={j.more} href={e.href}>
                      Read the concept <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
              {e.slug === "modular-01" && (
                <div className={j.pair}>
                  <Slot e={{ ...e, visual: { kind: "slot", need: "MODULAR 01 — modules and attachment detail" } }} n={2} />
                  <Slot e={{ ...e, visual: { kind: "slot", need: "MODULAR 01 — core + expansion configuration" } }} n={3} />
                </div>
              )}
            </article>
          );
        })}

        <footer className={j.end}>
          <p className={site.eyebrow}>Also in the folders</p>
          <Link href="/photography" className={j.endLink}>
            Photography — frames, places and moments <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </div>
    </SiteShell>
  );
}
