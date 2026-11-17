import fs from "node:fs";
import path from "node:path";
import AboutFace from "./AboutFace";
import HoverStory, { type Word } from "./HoverStory";
import m from "./me.module.css";
import { story } from "@/lib/site/home";
import h from "./home.module.css";

/** photos for a living word, once their files exist: /public/images/about/<key>-1.webp, -2, … */
const photosFor = (key: string) => {
  const out: string[] = [];
  for (let n = 1; n <= 30; n++) {
    const ext = ["webp", "jpg", "jpeg", "png"].find((e) => fs.existsSync(path.join(process.cwd(), "public", `images/about/${key}-${n}.${e}`)));
    if (ext) out.push(`/images/about/${key}-${n}.${ext}`);
  }
  return out;
};
const words: Record<string, Word> = Object.fromEntries(Object.entries(story.me.words).map(([k, w]) => [k, { ...w, photos: photosFor(k) }]));

/** Scene 1 of the homepage journey: the five introduction panels. */
export default function StoryPanels() {
  const st = story;
  return (
    <>
    {/* 1 — introduction */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="1 of 5">
      <div className={h.panelInner}>
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
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="2 of 5">
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
          <div className={h.actions}>
            <AboutFace />
          </div>
        </div>
      </div>
    </div>

    {/* 3 — what makes me, me */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="3 of 5">
      <div className={h.panelInner}>
        <div className={m.story}>
          <h2 className={m.title}>{st.me.title}</h2>
          {st.me.story.map((t, i) => <HoverStory key={i} text={t} words={words} className={m.para} />)}
        </div>
      </div>
    </div>

    {/* 4 — life outside work */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="4 of 5">
      <div className={h.panelInner}>
        <HoverStory text={st.me.life} words={words} className={m.big} />
        <a className={m.insta} href={st.me.instagram.href} target="_blank" rel="noopener noreferrer">
          {st.me.instagram.label} <span aria-hidden="true">↗</span>
        </a>
        <p className={m.hint}>
          <span className={m.hintHover}>Hover</span>
          <span className={m.hintTap}>Tap</span> the coloured words
        </p>
      </div>
    </div>

    {/* 5 — how I work */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="5 of 5">
      <div className={h.panelInner}>
        <p className={m.eyebrow}>How I work</p>
        <p className={m.big}>{st.me.howIWork}</p>
      </div>
    </div>
    </>
  );
}
