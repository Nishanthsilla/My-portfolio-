import type { Metadata } from "next";
import Link from "next/link";
import PhotoFolder from "@/components/site/PhotoFolder";
import SiteShell from "@/components/site/SiteShell";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import s from "@/components/site/beyond.module.css";
import { explorations, photography, type Exploration } from "@/lib/site/about";

export const metadata: Metadata = { title: "Beyond the Interface — Nishanth Silla" };

const statusClass = (st: Exploration["status"]) => (st === "Status to confirm" ? s.s_confirm : s[`s_${st}`]);

function Visual({ e }: { e: Exploration }) {
  if (e.visual.kind === "photo") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={e.visual.src} alt="" style={{ aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 12 }} />;
  }
  return (
    <div className={s.slot} role="img" aria-label={`Placeholder: ${e.visual.need}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M3 17 L9 12.5 L13 15.5 L16 13 L21 17" /></svg>
      <b>ADD IMAGE HERE — {e.visual.need}</b>
      <span>beyond-{e.slug} · 4:3</span>
    </div>
  );
}

export default function BeyondPage() {
  return (
    <SiteShell>
      <div className={site.container}>
        <header className={s.head}>
          <span className={site.eyebrow}>Personal explorations</span>
          <h1 className={s.title}>Beyond the Interface</h1>
          <p className={s.line}>Photography, 3D printing, MODULAR 01 and other ideas I explore.</p>
        </header>

        {/* Photography */}
        <section className={s.section} aria-labelledby="photo-title">
          <div className={s.photoBlock}>
            <div>
              <PhotoFolder />
            </div>
            <AnimatedContent distance={16} duration={0.6}>
              <span className={site.eyebrow}>{photography.label}</span>
              <h2 id="photo-title" className={s.h2}>{photography.subtitle}</h2>
              <p className={s.lead} style={{ marginTop: 20 }}>{photography.note}</p>
              <p style={{ marginTop: 20 }}>
                <a className={site.arrowLink} href={photography.instagram} target="_blank" rel="noopener noreferrer">
                  More on Instagram <span className={site.arrow} aria-hidden="true">↗</span>
                </a>
              </p>
            </AnimatedContent>
          </div>
        </section>

        {/* Explorations */}
        <section className={s.section} aria-labelledby="explore-title">
          <AnimatedContent className={s.split} distance={16} duration={0.6}>
            <div>
              <span className={site.eyebrow}>Ideas & experiments</span>
              <h2 id="explore-title" className={s.h2}>Things I build because I’m curious.</h2>
            </div>
            <p className={s.p}>Physical products, 3D printing and concepts in progress. Each one is marked with how far along it is.</p>
          </AnimatedContent>
          <div className={s.grid}>
            {explorations.map((e) => {
              const inner = (
                <>
                  <Visual e={e} />
                  <div className={s.cardTop}>
                    <h3 className={s.cardTitle}>
                      {e.title} {e.href && <span className={s.arrow} aria-hidden="true">→</span>}
                    </h3>
                    <span className={`${s.status} ${statusClass(e.status)}`}>{e.status}</span>
                  </div>
                  <p className={s.p} style={{ fontSize: 15 }}>{e.summary}</p>
                </>
              );
              return e.href ? (
                <Link key={e.slug} href={e.href} className={s.card}>{inner}</Link>
              ) : (
                <div key={e.slug} className={s.card}>{inner}</div>
              );
            })}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
