import { loopSteps } from "@/lib/portfolio/content";
import SplitWords from "../SplitWords";

/** The human–agent loop; path drawing and step states are driven by the motion layer. */
export default function Approach() {
  return (
    <section id="approach" className="loop sec" data-tone="paper">
      <div className="wrap loop-inner">
        <div className="loop-fig">
          <svg viewBox="0 0 400 400" aria-hidden="true">
            <path className="track" d="M200 50 A150 150 0 0 1 200 350 A150 150 0 0 1 200 50" />
            <path className="drawn" id="loopPath" d="M200 50 A150 150 0 0 1 200 350 A150 150 0 0 1 200 50" />
            <circle id="loopDot" cx="200" cy="50" r="7" />
            <g className="node on" data-i="0"><circle cx="200" cy="50" r="40" /><text x="200" y="54" textAnchor="middle">Intent</text></g>
            <g className="node" data-i="1"><circle cx="329.9" cy="275" r="40" /><text x="329.9" y="279" textAnchor="middle">Observe</text></g>
            <g className="node" data-i="2"><circle cx="70.1" cy="275" r="40" /><text x="70.1" y="279" textAnchor="middle">Step in</text></g>
          </svg>
          <div className="core"><div><span className="pulse"></span><b>Agent</b><span id="coreState">Intent set</span></div></div>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 14 }}>The human–agent loop</div>
          <h2 className="h-move" style={{ fontSize: "clamp(40px,5.6vw,80px)", fontWeight: 700, letterSpacing: "-.04em", lineHeight: 0.94, marginBottom: 28 }}>
            <SplitWords className="word" text="Three moments to get right" />
          </h2>
          <div className="steps">
            {loopSteps.map((s, i) => (
              <div key={s.no} className={i === 0 ? "step on" : "step"}>
                <span className="no">{s.no}</span><h3>{s.title}</h3><p>{s.text}</p>
                <ul>{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
