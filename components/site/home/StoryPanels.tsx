import fs from "node:fs";
import path from "node:path";
import AboutFace from "./AboutFace";
import MeSlides from "./MeSlides";
import { story } from "@/lib/site/home";
import h from "./home.module.css";

/** a photo for the "me" slides, once its file exists: /public/images/about/<name>.(webp|jpg|png) */
const photo = (name: string) => {
  for (const ext of ["webp", "jpg", "jpeg", "png"]) {
    const rel = `/images/about/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
};

/** Scene 1 of the homepage journey: the three introduction panels. */
export default function StoryPanels() {
  const st = story;
  return (
    <>
    {/* 1 — introduction */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="1 of 3">
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
          <div className={h.actions}>
            <AboutFace />
          </div>
        </div>
      </div>
    </div>

    {/* 3 — what makes me, me */}
    <div className={h.panel} data-snap aria-roledescription="slide" aria-label="3 of 3">
      <div className={h.panelInner}>
        <MeSlides
          slides={st.me.slides.map((x) => ({ ...x, photo: photo(x.photo) }))}
        />
      </div>
    </div>
    </>
  );
}
