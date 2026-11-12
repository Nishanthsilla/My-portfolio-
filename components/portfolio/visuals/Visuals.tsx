/** The six animated mini-UIs from the work cards, transcribed verbatim (CSS-animated). */

export function SalesVisual() {
  return (
    <div className="v-sales">
      <div className="ui">
        <div className="ui-h"><i></i><i></i><i></i><b>Pipeline · Q4</b></div>
        <div className="deal flag"><span className="av">AK</span><div>Arkline Logistics<small>Proposal sent · 4 days idle</small></div><span className="amt">₹42.0L</span></div>
        <div className="deal"><span className="av">VR</span><div>Veridian Health<small>Demo booked · Thu</small></div><span className="amt">₹18.5L</span></div>
        <div className="deal"><span className="av">NM</span><div>Nimbus Retail<small>Negotiation</small></div><span className="amt">₹66.2L</span></div>
        <div className="deal"><span className="av">OC</span><div>Ocra Finance<small>Discovery</small></div><span className="amt">₹9.8L</span></div>
      </div>
      <div className="ui insight">
        <span className="chip">Follow-up agent</span>
        <p>Arkline went quiet after the proposal.</p>
        <p style={{ color: "var(--muted)" }}><span className="typed">Drafting a nudge on their Q4 rollout…</span></p>
        <div className="conf"><span>Confidence</span><span className="meter"><i></i></span><span>82%</span></div>
        <div className="btns"><span className="btn-s p">Approve &amp; send</span><span className="btn-s">Edit</span></div>
      </div>
    </div>
  );
}

export function OrchestrationVisual() {
  return (
    <div className="v-orch ui">
      <svg viewBox="0 0 420 220" role="img" aria-label="An intent fans out to three agents, one waiting for approval, before human review">
        <path className="ln" d="M96 110 C130 110 130 50 164 50" />
        <path className="flow" d="M96 110 L164 110" />
        <path className="ln" d="M96 110 C130 110 130 170 164 170" />
        <path className="flow" d="M256 50 C290 50 290 110 324 110" />
        <path className="ln" d="M256 110 L324 110" />
        <path className="ln" d="M256 170 C290 170 290 110 324 110" />
        <rect className="na" x="10" y="88" width="86" height="44" rx="10" />
        <text className="t" x="22" y="108">Intent</text><text className="tm" x="22" y="122">Renew Q4 deals</text>
        <rect className="n" x="164" y="28" width="92" height="44" rx="10" />
        <text className="t" x="176" y="48">Research</text><text className="tm" x="176" y="62">done · 12s</text>
        <rect className="na" x="164" y="88" width="92" height="44" rx="10" />
        <text className="t" x="176" y="108">Draft</text><text className="tm" x="176" y="122">running…</text>
        <rect className="nw" x="164" y="148" width="92" height="44" rx="10" />
        <text className="t" x="176" y="168">Pricing</text><text className="tm" x="176" y="182">needs approval</text>
        <circle className="wait" cx="250" cy="154" r="4" />
        <rect className="n" x="324" y="88" width="86" height="44" rx="10" />
        <text className="t" x="336" y="108">Review</text><text className="tm" x="336" y="122">human</text>
      </svg>
    </div>
  );
}

export function DesignSystemVisual() {
  return (
    <div className="v-ds">
      <div className="ui"><span className="tok">color/brand</span><div className="sw"><i style={{ background: "var(--accent)" }}></i><i style={{ background: "var(--accent-soft)" }}></i><i style={{ background: "var(--fg)" }}></i><i style={{ background: "var(--signal)" }}></i></div></div>
      <div className="ui" style={{ alignItems: "flex-start" }}><span className="tok">type/display</span><span className="big-a">Aa</span></div>
      <div className="ui"><span className="tok">toggle</span><span className="tg"></span></div>
      <div className="ui" style={{ gridColumn: "span 2" }}><span className="tok">input/default</span><span className="inp">Search agents…</span></div>
      <div className="ui"><span className="tok">button/primary</span><span className="btn-s p" style={{ textAlign: "center" }}>Run</span></div>
    </div>
  );
}

export function LearningVisual() {
  return (
    <div className="v-edu">
      <div className="ring"><svg viewBox="0 0 84 84"><circle className="bgc" cx="42" cy="42" r="36" /><circle className="fgc" cx="42" cy="42" r="36" /></svg><span>68%</span></div>
      <div className="ui">
        <span className="tok">Skill path · Customer handling</span>
        <div className="xp"><i></i></div>
        <div className="badges"><i></i><i></i><i className="new"></i><i className="off"></i><i className="off"></i></div>
        <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Next: an adaptive module based on your last 3 sessions</span>
      </div>
    </div>
  );
}

export function ABTestVisual() {
  return (
    <div className="v-ab">
      <div className="ui"><span className="tok">Variant A · current</span><div className="k">1.00×</div><div className="bars"><i style={{ height: "40%" }}></i><i style={{ height: "52%" }}></i><i style={{ height: "46%" }}></i><i style={{ height: "55%" }}></i><i style={{ height: "50%" }}></i></div></div>
      <div className="ui win"><span className="tok">Variant B · redesign</span><div className="k">1.12×</div><div className="bars"><i style={{ height: "48%" }}></i><i style={{ height: "60%" }}></i><i style={{ height: "66%" }}></i><i style={{ height: "74%" }}></i><i style={{ height: "86%" }}></i></div></div>
    </div>
  );
}

export function AnalyticsVisual() {
  return (
    <div className="v-kpi ui">
      <div className="ui-h"><i></i><i></i><i></i><b>Learning analytics</b></div>
      <div className="body">
        <svg viewBox="0 0 140 90" role="img" aria-label="Course completion rising">
          <line className="grid" x1="0" y1="22" x2="140" y2="22" /><line className="grid" x1="0" y1="50" x2="140" y2="50" /><line className="grid" x1="0" y1="78" x2="140" y2="78" />
          <path className="area" d="M0 70 L20 64 L40 66 L60 50 L80 46 L100 34 L120 30 L140 18 L140 90 L0 90Z" />
          <path className="curve" d="M0 70 L20 64 L40 66 L60 50 L80 46 L100 34 L120 30 L140 18" />
        </svg>
        <svg viewBox="0 0 90 90" role="img" aria-label="Motion easing curve with a ball travelling along it">
          <line className="hd" x1="8" y1="82" x2="30" y2="20" /><line className="hd" x1="82" y1="8" x2="60" y2="70" />
          <path className="ease" d="M8 82 C30 20 60 70 82 8" />
          <circle cx="30" cy="20" r="3" fill="var(--muted)" /><circle cx="60" cy="70" r="3" fill="var(--muted)" />
          <circle className="ball" r="5" cx="0" cy="0" />
        </svg>
      </div>
    </div>
  );
}
