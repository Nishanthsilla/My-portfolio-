import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import SocialLinks from "@/components/site/SocialLinks";
import AnimatedContent from "@/components/site/reactbits/AnimatedContent";
import site from "@/components/site/site.module.css";
import s from "@/components/site/beyond.module.css";
import { about } from "@/lib/site/about";
import { socials } from "@/lib/site/content";

export const metadata: Metadata = { title: "About — Nishanth Silla" };

/** About — every line reused from the current portfolio (plus two personal paragraphs from the Webflow site). */
export default function AboutPage() {
  return (
    <SiteShell>
      <div className={site.container}>
        <header className={s.head}>
          <span className={site.eyebrow}>About</span>
          <h1 className={s.title}>Nishanth Silla</h1>
          <p className={s.line}>{about.aboutLine}</p>
          <div className={s.stats}>
            {about.stats.map((st) => (
              <div key={st.label} className={s.stat}>
                <b>{st.value}</b>
                <span>{st.label}</span>
                {st.confirm && <span className={s.confirm}>Site says 3 · film says 04 — confirm</span>}
              </div>
            ))}
          </div>
        </header>

        <section className={s.section}>
          <AnimatedContent className={s.split} distance={16} duration={0.6}>
            <div>
              <span className={site.eyebrow}>What I do</span>
              <h2 className={s.h2}>Design for agents, and the people who run them.</h2>
            </div>
            <p className={s.lead}>{about.whatIDo}</p>
          </AnimatedContent>
        </section>

        <section className={s.section}>
          <span className={site.eyebrow}>{about.loop.eyebrow}</span>
          <h2 className={s.h2}>{about.loop.title}</h2>
          <div className={s.loop}>
            {about.loop.steps.map((st) => (
              <div key={st.n} className={s.loopStep}>
                <em>{st.n}</em>
                <b>{st.t}</b>
                <p>{st.d}</p>
                <ul className={s.chips}>{st.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>Experience</span>
              <h2 className={s.h2}>Six teams in five years.</h2>
            </div>
            <p className={s.lead}>{about.experienceIntro}</p>
          </div>
          <ol className={s.exp}>
            {about.experience.map((x) => (
              <li key={x.org} className={s.expRow}>
                <span className={s.expWhen}>{x.when}</span>
                <div>
                  <div className={s.expOrg}>
                    {x.org} <em>{x.role}</em> {x.current && <span className={s.now}>Current</span>}
                  </div>
                  <p className={s.expNote}>{x.note}</p>
                </div>
                <span className={s.expWhere}>{x.where}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={s.section}>
          <span className={site.eyebrow}>Skills & tools</span>
          <div className={s.skillGrid}>
            {about.skills.map((g) => (
              <div key={g.k}>
                <h3>{g.k}</h3>
                <ul className={s.chips}>{g.v.map((v) => <li key={v}>{v}</li>)}</ul>
              </div>
            ))}
            <div>
              <h3>Education</h3>
              <ul className={s.chips}>{about.education.map((v) => <li key={v}>{v}</li>)}</ul>
            </div>
            <div>
              <h3>Languages</h3>
              <ul className={s.chips}>{about.languages.map((v) => <li key={v}>{v}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>Outside work</span>
              <h2 className={s.h2}>How I started, and what I love.</h2>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <p className={s.lead}>{about.journey}</p>
              <p className={s.p}>{about.outside}</p>
              <div style={{ marginTop: 8 }}>
                <SocialLinks links={socials} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
