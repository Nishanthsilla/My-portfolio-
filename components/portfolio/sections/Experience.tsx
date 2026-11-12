import { experience, kit, stats } from "@/lib/portfolio/content";
import SplitWords from "../SplitWords";

/** Experience ledger plus the About block (same section as the original). */
export default function Experience() {
  return (
    <section id="experience" className="sec" data-tone="paper">
      <div className="wrap">
        <div className="sec-head">
          <h2 className="h-move"><SplitWords className="word" text="Experience" /></h2>
          <p>Six teams in five years — from a consumer-tech internship to leading design for an enterprise agentic AI platform.</p>
        </div>
        <div className="ledger">
          {experience.map((r) => (
            <div className="row" key={r.company}>
              <span className="when">{r.when}</span>
              <h3>{r.company}{r.current && <span className="now">Current</span>}<small>{r.role}</small></h3>
              <p>{r.summary}</p>
              <span className="where">{r.where}</span>
            </div>
          ))}
        </div>

        <div className="about">
          <div>
            <div className="label" style={{ marginBottom: 14 }}>About</div>
            <p className="big">I work hand in hand with product and engineering on complex B2B workflows. Lately that means making <em>AI an active collaborator</em> people can understand, steer and trust.</p>
            <div className="stats">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <b data-count={s.count} data-prefix={s.prefix} data-suffix={s.suffix}>{s.text}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            {kit.map((k) => (
              <div className="kit-row" key={k.label}>
                <span className="label">{k.label}</span>
                <ul>{k.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
