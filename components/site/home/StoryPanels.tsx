import Link from "next/link";
import SocialLinks from "../SocialLinks";
import { socials } from "@/lib/site/content";
import { story } from "@/lib/site/home";
import h from "./home.module.css";

/** Scene 1 of the homepage journey: the three introduction panels. */
export default function StoryPanels() {
  const st = story;
  return (
    <>
    {/* 1 — introduction */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="1 of 3">
      <div className={h.panelInner}>
        <p className={h.eyebrow}>{st.hello.eyebrow}</p>
        <h1 className={h.headline}>
          {st.hello.headline.before}
          <em>{st.hello.headline.em}</em>
          {st.hello.headline.after}
        </h1>
        <p className={h.kicker}>
          <span className={h.dot} aria-hidden="true" /> {st.hello.kicker}
        </p>
      </div>
    </div>

    {/* 2 — focus and background */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="2 of 3">
      <div className={`${h.panelInner} ${h.factsPanel}`}>
        <dl className={h.facts}>
          {st.facts.map((f) => (
            <div key={f.k} className={h.fact}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
        <div className={h.factsSide}>
          <p className={h.now}>
            <span>{st.now.k}</span> {st.now.v}
          </p>
          <div className={h.elsewhere}>
            <span className={h.label}>Elsewhere</span>
            <SocialLinks links={socials} />
          </div>
          <div className={h.actions}>
            <a className={h.btnPrimary} href="#contact">Get in touch</a>
            <Link className={h.btnSecondary} href="/about">About</Link>
          </div>
        </div>
      </div>
    </div>

    {/* 3 — how I work */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="3 of 3">
      <div className={`${h.panelInner} ${h.approach}`}>
        <p className={h.eyebrow}>{st.approach.eyebrow}</p>
        <p className={h.approachLine}>{st.approach.line}</p>
        <ol className={h.steps}>
          {st.approach.steps.map((x) => (
            <li key={x.n}>
              <span className={h.stepN}>{x.n}</span>
              <b>{x.t}</b>
              <span>{x.d}</span>
            </li>
          ))}
        </ol>
        <p className={h.craft}>{st.approach.craft}</p>
      </div>
    </div>
    </>
  );
}
