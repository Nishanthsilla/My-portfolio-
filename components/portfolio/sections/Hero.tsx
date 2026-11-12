/** Hero "push scene". The character, ground, dust and speed lines are driven by motion/pushScene.ts. */
export default function Hero() {
  return (
    <section className="hero" id="hero" data-tone="paper">
      <div className="wrap hero-top hero-reveal">
        <span className="status"><span className="pill">Now</span><span><b>Nishanth Silla</b> · Lead Product Designer, Covasant</span></span>
        <span className="label">Agentic AI · UX · Systems</span>
      </div>
      <div className="scene" id="scene" data-cursor="Scroll">
        <div className="reveal-text" id="revealText" aria-hidden="true">…and the <em>humans</em><br />who run them.</div>
        <h1 className="push-text" id="pushText" aria-label="Design for agents, and the humans who run them."><span>Design</span> <span>for</span><span className="nl">agents.</span></h1>
        <div className="sprite" id="sprite" role="img" aria-label="Illustrated character pushing the headline"></div>
        <svg className="stage-svg" id="stageSvg" aria-hidden="true">
          <line className="gl" id="ground" x1="0" y1="0" x2="100" y2="0" />
          <g id="dust"></g>
          <g id="speed"><line /><line /><line /></g>
          <g id="excl" opacity="0"><path d="M-6 0 L-10 -16" /><path d="M6 -2 L9 -18" /><path d="M-16 6 L-24 0" /></g>
        </svg>
      </div>
      <div className="wrap hero-grid">
        <div className="hero-reveal"><p className="lede">I design the interfaces where people set intent, watch <strong>AI agents</strong> work, and step in at the right moment.</p></div>
        <div className="meta hero-reveal"><div className="label">Focus</div><p>Multi-agent orchestration, human–AI handoff</p></div>
        <div className="meta hero-reveal"><div className="label">Background</div><p>5+ years · Enterprise AI, FinTech, EdTech</p></div>
        <div className="scrollhint hero-reveal"><span></span><div className="label">Scroll to push</div></div>
      </div>
    </section>
  );
}
