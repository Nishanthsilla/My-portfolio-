import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import SocialLinks from "@/components/site/SocialLinks";
import Tools from "@/components/site/about/Tools";
import site from "@/components/site/site.module.css";
import s from "@/components/site/beyond.module.css";
import a from "@/components/site/about/about.module.css";
import { about } from "@/lib/site/about";
import { socials } from "@/lib/site/content";
import Button from "@/components/site/ui/Button";

export const metadata: Metadata = { title: "About — Nishanth Silla" };

/** About: who Nishanth is, the five layers he works through, his tools, the teams he's been on, and life outside work. Facts are from his CV. */
export default function AboutPage() {
  return (
    <SiteShell>
      <div className={site.container}>
        {/* hello */}
        <header className={a.hero}>
          <div className={a.heroText}>
            <span className={site.eyebrow}>About</span>
            <h1 className={a.hello}>{about.hello}</h1>
            <p className={a.intro}>{about.intro}</p>
            <p className={a.where}><i aria-hidden="true" />{about.where}</p>
            <div className={a.heroCtas}>
              <Button variant="primary" href={about.cv} target="_blank" rel="noopener">
                Download my CV <span aria-hidden="true">↓</span>
              </Button>
              <Button href="/#contact">Say hi</Button>
            </div>
          </div>
          <figure className={a.heroPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={about.photos.hero.src} alt={about.photos.hero.alt} fetchPriority="high" />
          </figure>
        </header>

        {/* numbers */}
        <ul className={a.stats}>
          {about.stats.map((st) => (
            <li key={st.label}>
              <b>{st.value}</b>
              <span>{st.label}</span>
            </li>
          ))}
        </ul>

        {/* how I work: five layers */}
        <section className={s.section}>
          <div className={s.split}>
            <div>
              <span className={site.eyebrow}>How I work</span>
              <h2 className={s.h2}>Five layers in every project.</h2>
            </div>
            <p className={s.lead}>Good design isn&apos;t only the screens. It starts with the business and ends with what ships, and I work through every layer in between.</p>
          </div>
          <ol className={a.layers}>
            {about.layers.map((l, i) => (
              <li key={l.t} style={{ ["--i" as string]: i }}>
                <em>0{i + 1}</em>
                <div>
                  <b>{l.t}</b>
                  <p>{l.d}</p>
                </div>
                <ul className={s.chips}>{l.does.map((d) => <li key={d}>{d}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>

        {/* tools */}
        <section className={s.section}>
          <div className={a.loadoutHead}>
            <span className={site.eyebrow}>Toolkit</span>
            <h2 className={s.h2}>Tools I excel at.</h2>
          </div>
          <Tools />
        </section>

        {/* experience */}
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

        {/* outside work */}
        <section className={s.section}>
          <div className={a.life}>
            <figure className={a.lifePhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about.photos.sunset.src} alt={about.photos.sunset.alt} loading="lazy" />
            </figure>
            <div className={a.lifeText}>
              <span className={site.eyebrow}>Outside work</span>
              <h2 className={s.h2}>How I started, and what I love.</h2>
              <p className={s.lead}>{about.journey}</p>
              <p className={s.p}>{about.outside}</p>
              <p className={s.p}>{about.teaching}</p>
              <ul className={a.polaroids}>
                {about.photos.life.map((ph, i) => (
                  <li key={ph.src} style={{ ["--r" as string]: `${[-4, 3, -2][i]}deg` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.src} alt={ph.alt} loading="lazy" />
                    <span>{ph.label}</span>
                  </li>
                ))}
              </ul>
              <SocialLinks links={socials} />
              <div className={a.lifeLinks}>
                <Button size="sm" href="/photography">See my photography <span aria-hidden="true">→</span></Button>
                <Button size="sm" href="/beyond">Beyond the interface <span aria-hidden="true">→</span></Button>
              </div>
            </div>
          </div>
        </section>

        {/* the small print */}
        <section className={a.facts}>
          <div>
            <h3>Education</h3>
            <ul>{about.education.map((v) => <li key={v}>{v}</li>)}</ul>
          </div>
          <div>
            <h3>Languages</h3>
            <ul className={a.badges}>{about.languages.map((v) => <li key={v}>{v}</li>)}</ul>
          </div>
        </section>

      </div>
    </SiteShell>
  );
}
