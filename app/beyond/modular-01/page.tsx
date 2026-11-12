import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import site from "@/components/site/site.module.css";
import s from "@/components/site/beyond.module.css";
import { modular01 } from "@/lib/site/about";

export const metadata: Metadata = { title: "MODULAR 01 — Beyond the Interface — Nishanth Silla" };

function Slot({ id, need, ratio = "16 / 9" }: { id: string; need: string; ratio?: string }) {
  return (
    <div className={s.slot} style={{ aspectRatio: ratio }} role="img" aria-label={`Placeholder: ${need}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M3 17 L9 12.5 L13 15.5 L16 13 L21 17" /></svg>
      <b>ADD IMAGE HERE — {need}</b>
      <span>{id}</span>
    </div>
  );
}

/** A physical-product concept. Content is exactly as Nishanth described it; nothing is presented as built. */
export default function Modular01() {
  return (
    <SiteShell>
      <article className={site.container}>
        <header className={s.head}>
          <Link className={site.back} href="/beyond"><span aria-hidden="true">←</span> Beyond the Interface</Link>
          <span className={`${s.status} ${s.s_Concept}`}>{modular01.status}</span>
          <h1 className={s.title}>{modular01.title}</h1>
          <p className={s.line}>{modular01.line}</p>
        </header>

        <div className={s.section} style={{ paddingTop: 48 }}>
          <Slot id="modular01-hero" need="MODULAR 01 hero visualisation" />
        </div>

        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>The problem</span>
              <h2 className={s.h2}>Why a modular bag?</h2>
            </div>
            <div className={s.pending}>
              <span className={s.confirm}>Needs your words</span>
              <p>What problem with everyday bags made you start MODULAR 01? Who is it for, and when does a fixed bag fall short?</p>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <span className={site.eyebrow}>The concept</span>
          <h2 className={s.h2}>One system, five parts.</h2>
          <div className={s.parts}>
            {modular01.parts.map((p) => (
              <div key={p.k} className={s.part}><span>{p.k}</span><b>{p.v}</b></div>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>Modular architecture</span>
              <h2 className={s.h2}>Core, expansion, and modules on either side.</h2>
              <p className={s.p} style={{ marginTop: 16 }}>A diagram of the parts as described — not a final layout.</p>
            </div>
            <div className={s.arch} aria-label="Diagram: modules on either side of a 25L core bag, with a detachable 10–15L expansion">
              <div className={s.archCell}><b>Module</b><span>attaches to either side</span></div>
              <div className={`${s.archCell} ${s.archCore}`}><b>Core · 25L</b><span>the main bag</span></div>
              <div className={s.archCell}><b>Module</b><span>attaches to either side</span></div>
              <div className={`${s.archCell} ${s.archExp}`}><b>Expansion · 10–15L</b><span>detachable</span></div>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>Attachment system</span>
              <h2 className={s.h2}>Rails, straps and snaps.</h2>
              <p className={s.lead} style={{ marginTop: 16 }}>A combination of rails, straps and snap-based attachment systems.</p>
            </div>
            <Slot id="modular01-attachment" need="Attachment system detail (rails, straps, snaps)" ratio="4 / 3" />
          </div>
        </section>

        <section className={s.section}>
          <span className={site.eyebrow}>Sketches & visualisations</span>
          <div className={s.grid} style={{ marginTop: 24 }}>
            <Slot id="modular01-sketch-1" need="Concept sketch" ratio="4 / 3" />
            <Slot id="modular01-sketch-2" need="Module sketch" ratio="4 / 3" />
            <Slot id="modular01-render" need="Visualisation / render" ratio="4 / 3" />
          </div>
        </section>

        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>Ecosystem & prototype direction</span>
              <h2 className={s.h2}>Buy a module, or a kit.</h2>
              <p className={s.lead} style={{ marginTop: 16 }}>A modular ecosystem where users can purchase individual modules or ready-made kits.</p>
            </div>
            <div className={s.pending}>
              <span className={s.confirm}>Prototype direction to add</span>
              <p>What will you prototype first, and how (3D printing, sewing, off-the-shelf hardware)? This is a concept — nothing here is presented as built.</p>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <Link className={site.nextLink} href="/beyond">
            <span className={site.eyebrow}>Back to</span>
            <span className={site.nextTitle}>Beyond the Interface <span className={site.arrow} aria-hidden="true">→</span></span>
          </Link>
        </section>
      </article>
    </SiteShell>
  );
}
