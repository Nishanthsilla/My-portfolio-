import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import SocialLinks from "@/components/site/SocialLinks";
import WorkTabs from "@/components/site/WorkTabs";
import PhotoFolder from "@/components/site/PhotoFolder";
import EasterSticker from "@/components/site/EasterSticker";
import b from "@/components/site/beyond.module.css";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import s from "@/components/site/site.module.css";
import { intro, socials, workIntro } from "@/lib/site/content";
import { photography } from "@/lib/site/about";

/** Homepage: a short introduction, then the work. (The intro film plays above this on load.) */
export default function HomePage() {
  return (
    <SiteShell>
      <section className={`${s.container} ${s.intro}`} aria-labelledby="intro-title">
        <p className={`${s.eyebrow} ${s.introNow}`}>{intro.now}</p>
        <h1 id="intro-title" className={s.display}>
          <span className={s.introHead}>
            Design for <span className={s.accent}>agents</span>.
          </span>
          <span className={s.introSub}>{intro.headline[1]}</span>
        </h1>
        <AnimatedContent className={s.introGrid} distance={16} duration={0.6} stagger={0.08} trigger="mount" delay={0.1}>
          <div>
            <p className={s.lede}>{intro.lede}</p>
            <div className={s.introActions}>
              <a className={`${s.btn} ${s.btnPrimary}`} href="#contact">Get in touch</a>
              <Link className={`${s.btn} ${s.btnSecondary}`} href="/about">About</Link>
            </div>
          </div>
          <div>
            <dl className={s.facts}>
              {intro.facts.map((f) => (
                <div key={f.k} className={s.fact}>
                  <dt>{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
              <div className={s.fact}>
                <dt>Elsewhere</dt>
                <dd><SocialLinks links={socials} /></dd>
              </div>
            </dl>
          </div>
        </AnimatedContent>
      </section>

      <section id="work" className={s.work} aria-labelledby="work-title">
        <AnimatedContent className={`${s.container} ${s.workHead}`} distance={16} duration={0.6}>
          <div>
            <span className={s.eyebrow}>{workIntro.label}</span>
            <h2 id="work-title" className={s.h2} style={{ marginTop: 12 }}>{workIntro.title}</h2>
          </div>
          <p className={s.body}>{workIntro.line}</p>
        </AnimatedContent>
        <WorkTabs />
        <div className={s.container} style={{ marginTop: 96 }}>
          <AnimatedContent distance={16} duration={0.6}>
            <Link className={s.teaser} href="/beyond">
              <div>
                <span className={s.eyebrow}>Personal explorations</span>
                <h2 className={s.h2} style={{ marginTop: 12 }}>Beyond the Interface</h2>
                <p className={s.body} style={{ marginTop: 12 }}>Photography, 3D printing, MODULAR 01 and other ideas I explore.</p>
              </div>
              <span className={s.arrow} style={{ fontSize: 28 }} aria-hidden="true">→</span>
            </Link>
          </AnimatedContent>
        </div>
      </section>

      <section className={s.container} style={{ paddingTop: 96 }} aria-labelledby="photo-title">
        <div className={b.photoBlock}>
          <div>
            <PhotoFolder compact />
          </div>
          <AnimatedContent distance={16} duration={0.6}>
            <span className={s.eyebrow}>{photography.label}</span>
            <h2 id="photo-title" className={b.h2}>{photography.subtitle}</h2>
            <p className={b.lead} style={{ marginTop: 20 }}>{photography.note}</p>
            <p style={{ marginTop: 20 }}>
              <Link className={s.arrowLink} href="/beyond">
                All {photography.photos.length} photographs <span className={s.arrow} aria-hidden="true">→</span>
              </Link>
            </p>
          </AnimatedContent>
        </div>
      </section>

      <div className={s.container}>
        <EasterSticker />
      </div>
    </SiteShell>
  );
}
