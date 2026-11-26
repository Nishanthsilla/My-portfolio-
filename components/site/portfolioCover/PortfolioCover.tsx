import c from "./cover.module.css";

/**
 * The "This portfolio" cover: a little browser playing a tour of the site, on a loop.
 * The hello → the four doors (cards cycling) → the Wall (notes landing) → the footer (on fire).
 * Pure CSS animation, scaled to its frame with container units; still when motion is reduced.
 */
export default function PortfolioCover() {
  return (
    <div className={c.wrap} role="img" aria-label="A tour of this portfolio: the hello, the four doors of work, the Wall of visitor notes, and the burning-room footer">
      <div className={c.browser}>
        <div className={c.bar}>
          <i /><i /><i />
          <span className={c.nav}>
            <b className={c.logo} />
            {["About", "Work", "Beyond", "Wall", "Contact"].map((x, k) => <span key={x} className={c.navItem} style={{ ["--k" as string]: k }}>{x}</span>)}
          </span>
        </div>
        <div className={c.screen}>
          <div className={c.track}>
            {/* 1 · the hello */}
            <section className={`${c.panel} ${c.hello}`}>
              <p>Hi, I&apos;m Nishanth. I make <em>complicated software</em> feel simple to use.</p>
              <span className={c.helloSub}>Product designer in Hyderabad</span>
            </section>
            {/* 2 · the doors */}
            <section className={`${c.panel} ${c.doors}`}>
              <p className={c.doorsTitle}>Four things I do well. Pick a door.</p>
              <div className={c.doorRow}>
                {[
                  ["#ABA0E0", "#E8B07A", "#B9675C"],
                  ["#7A4058", "#5A6FC4", "#B5D9BE"],
                  ["#6A5DAE", "#E8B07A", "#ABA0E0"],
                  ["#222", "#5A6FC4", "#EECBB4"],
                ].map((cols, d) => (
                  <div key={d} className={c.door}>
                    <i className={c.doorText} />
                    <i className={c.doorText2} />
                    <div className={c.win}>
                      <div className={c.cards} style={{ ["--d" as string]: d }}>
                        {[...cols, ...cols].map((col, k) => <span key={k} style={{ background: col }} />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* 3 · the wall */}
            <section className={`${c.panel} ${c.wall}`}>
              {[
                ["#FFE680", "Nice work!", 14, 22, -6],
                ["#FFC3D0", "Made me laugh 😂", 52, 16, 5],
                ["#C9F0D6", "Hire him!", 30, 56, 3],
                ["#CFE3FF", "Love the doors", 66, 54, -4],
              ].map(([bg, t, x, y, r], k) => (
                <span key={k} className={c.note} style={{ background: bg as string, left: `${x}%`, top: `${y}%`, ["--r" as string]: `${r}deg`, ["--k" as string]: k }}>{t}</span>
              ))}
            </section>
            {/* 4 · the footer, on fire */}
            <section className={`${c.panel} ${c.fire}`}>
              <div className={c.room}>
                <span className={c.mug}>☕</span>
                <span className={c.fine}>This is fine.</span>
              </div>
              <div className={c.flames}>{Array.from({ length: 14 }, (_, k) => <i key={k} style={{ ["--k" as string]: k }} />)}</div>
            </section>
          </div>
          <span className={c.cursor} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
