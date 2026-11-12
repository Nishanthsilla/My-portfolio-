import SplitWords from "../SplitWords";

export default function Manifesto() {
  return (
    <section className="manifesto sec" data-tone="paper">
      <div className="wrap">
        <div className="label">What I do</div>
        <p id="manifesto">
          <SplitWords className="w" text="AI is becoming a colleague, not a feature. I design the moments where people hand work to agents, keep an eye on it, and" />{" "}
          <em><SplitWords className="w" text="take back control" /></em>{" "}
          <SplitWords className="w" text="when it matters, so they trust what gets done on their behalf." />
        </p>
      </div>
    </section>
  );
}
