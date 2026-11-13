import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import ImageSlot from "@/components/site/selfready/ImageSlot";
import { NeedsConfirmation } from "@/components/site/selfready/engine";
import { CoverScene } from "@/components/site/selfready/Scenes";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import s from "@/components/site/selfready/selfready.module.css";
import { selfReady } from "@/lib/site/selfReady";

export const metadata: Metadata = {
  title: "Self-Ready — Nishanth Silla",
  description: selfReady.oneLiner,
};

/** Level 1: the short overview — understandable in 20–30 seconds. */
export default function SelfReadyOverview() {
  return (
    <SiteShell>
      <article className={site.container}>
        <header className={s.hero}>
          <Link className={site.back} href="/?c=product-strategy#work">
            <span aria-hidden="true">←</span> Product Strategy
          </Link>
          <span className={site.eyebrow}>Project overview</span>
          <h1 className={s.heroTitle}>{selfReady.title}</h1>
          <p className={s.heroLine}>{selfReady.oneLiner}</p>
          <dl className={s.metaRow}>
            {selfReady.meta.map((m) => (
              <div key={m.k}>
                <dt>{m.k}</dt>
                <dd>{m.status === "confirm" ? <NeedsConfirmation>{m.v}</NeedsConfirmation> : m.v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className={s.heroMedia}>
          <CoverScene />
        </div>
        <p className={s.legend}>
          <span className={s.illus}>Illustrative reconstruction · not a product screenshot</span>
        </p>

        <AnimatedContent className={`${s.section} ${s.split}`} distance={16} duration={0.6}>
          <div>
            <span className={s.num}>Overview</span>
            <h2 className={s.h2}>Make AI-generated information easier for people to trust, validate and act on.</h2>
          </div>
          <div style={{ display: "grid", gap: 16 }}>
            <p className={s.lead}>
              Self-Ready is associated with an AI-powered retail shelf intelligence experience designed around analysing
              shelf information and helping users review the results.
            </p>
            <p className={s.p}>
              The central design challenge was not simply displaying what AI had detected. It was making those results
              understandable and actionable for the people responsible for reviewing them.
            </p>
          </div>
        </AnimatedContent>

        <AnimatedContent className={s.section} distance={16} duration={0.6}>
          <span className={s.num}>Areas of work</span>
          <div className={s.focusGrid} style={{ marginTop: 24 }}>
            {selfReady.focus.map((f) => (
              <div key={f.t} className={s.focusItem}>
                <b>{f.t}</b>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </AnimatedContent>

        <div className={`${s.section} ${s.grid2}`}>
          <ImageSlot id="sr-shelf-analysis" />
          <ImageSlot id="sr-review" />
        </div>

        <div className={s.section}>
          <Link className={s.ctaBlock} href="/work/self-ready/case-study">
            <span className={s.cta}>
              Read full case study <span aria-hidden="true">→</span>
            </span>
            <span className={s.p}>Explore the complete process, design decisions, key workflows and outcomes.</span>
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}
