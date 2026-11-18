import Logo from "@/components/site/Logo";
import o from "./opener.module.css";

/**
 * The opener's screens (montage.ts decides which one shows when). Each is a
 * full-screen layer built around the dead centre, where the logo sits; motion
 * inside a screen reads --m (seconds since the screen came on).
 */
const WORDS = ["Product Design", "Design Systems", "AI Experiences", "Prototyping", "Research", "Motion", "Front-end", "Strategy"];
const CODE = [
  "export function ship(idea: Idea) {",
  "  const flow = design(idea, { clarity: 1 });",
  "  const ui = build(flow).test(users);",
  "  return ui.ok ? launch(ui) : iterate(ui);",
  "}",
  "",
  "const system = tokens({ color, type, space });",
  "components.map((c) => c.with(system));",
  "",
  "// make the complex feel simple",
  "await review(team).then(ship);",
];

const IDE = [
  'import { LogoN } from "./Logo";',
  "",
  "/** the navbar: logo first, then the links */",
  "export default function Header() {",
  "  const path = usePathname();",
  "  return (",
  '    <header className="bar">',
  '      <Link href="/#about" className="mark">',
  "        <LogoN height={20} />",
  "        <i aria-hidden />",
  "      </Link>",
  "      <nav>{NAV.map(link)}</nav>",
  "    </header>",
  "  );",
  "}",
  "",
  "// design that ships",
  "export const ship = (idea) => build(design(idea));",
];

const Icon = {
  plus: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  pen: <svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3" /></svg>,
  trend: <svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>,
  cursor: <svg viewBox="0 0 24 24"><path d="M5 3l14 7-6 2-2 6z" /></svg>,
  spark: <svg viewBox="0 0 24 24"><path d="M12 2c.6 5 2.4 7.4 8 8-5.6.6-7.4 3-8 8-.6-5-2.4-7.4-8-8 5.6-.6 7.4-3 8-8z" /></svg>,
};

export default function OpenerScreens() {
  return (
    <>
      {/* 1 · dark: the logo, dim, waiting */}
      <div className={`${o.s} ${o.dark}`} data-screen="dark">
        <span className={`${o.meta} ${o.tl}`}>nishanth silla ©2026</span>
        <span className={`${o.meta} ${o.br}`}>portfolio / v2</span>
      </div>
      {/* 2 · what he does, scrolling past */}
      <div className={`${o.s} ${o.words}`} data-screen="words">
        <div className={o.wordList}>{[...WORDS, ...WORDS].map((w, i) => <span key={i}>{w}</span>)}</div>
      </div>
      {/* 3 · an app icon on its own */}
      <div className={`${o.s} ${o.light}`} data-screen="tile">
        <div className={o.tile} />
        <span className={o.tag}>open to work</span>
        <span className={o.tileMeta}><b>Nishanth Silla</b><br />Lead Product Designer<br />Hyderabad, IN</span>
      </div>
      {/* 4 · a tool bar */}
      <div className={`${o.s} ${o.charcoal}`} data-screen="toolbar">
        <div className={o.toolbar}>
          <i>{Icon.plus}</i><i>{Icon.pen}</i><i className={o.gap} /><i>{Icon.trend}</i><i>{Icon.cursor}</i>
        </div>
      </div>
      {/* 5 · the address bar */}
      <div className={`${o.s} ${o.light}`} data-screen="browser">
        <div className={o.dots}><i /><i /><i /></div>
        <div className={o.pill}><span>nishanthsilla.vercel.app</span></div>
      </div>
      {/* 6 · giant letters drifting behind */}
      <div className={`${o.s} ${o.sand}`} data-screen="giant">
        <div className={o.giant}>NISHANTH</div>
        <span className={`${o.meta} ${o.tl}`}>design that ships<br />since 2019</span>
      </div>
      {/* 7 · a phone's lock screen */}
      <div className={`${o.s} ${o.dark}`} data-screen="phone">
        <div className={o.phone}>
          <span className={o.time}>10:29</span>
          <span className={o.phoneName}>NISHANTH SILLA</span>
          <span className={o.phoneSub}>Lead Product Designer</span>
          <span className={o.phoneUrl}>nishanthsilla.vercel.app</span>
        </div>
      </div>
      {/* 8 · the line, going round */}
      <div className={`${o.s} ${o.red}`} data-screen="ring">
        <svg className={o.ring} viewBox="0 0 200 200">
          <defs><path id="opener-ring" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" /></defs>
          <text><textPath href="#opener-ring">DESIGN THAT SHIPS ✦ DESIGN THAT SHIPS ✦ DESIGN THAT SHIPS ✦</textPath></text>
        </svg>
      </div>
      {/* 9 · how the work connects */}
      <div className={`${o.s} ${o.paper}`} data-screen="nodes">
        <div className={o.chips}><span>research</span><span>design</span><span>code</span></div>
        <svg className={o.links} viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M0 12C40 12 60 30 100 30M0 30H100M0 48C40 48 60 30 100 30" /></svg>
        <div className={o.node} />
        <div className={o.half} />
      </div>
      {/* 10 · the search bar */}
      <div className={`${o.s} ${o.light}`} data-screen="search">
        <span className={`${o.meta} ${o.tl}`}>ask anything</span>
        <div className={o.search}><span>Hire a product designer<i /></span></div>
      </div>
      {/* 11 · a star, turning */}
      <div className={`${o.s} ${o.dark}`} data-screen="star">
        <svg className={o.star} viewBox="0 0 100 100"><path d="M50 0C54 34 66 46 100 50 66 54 54 66 50 100 46 66 34 54 0 50 34 46 46 34 50 0z" /></svg>
      </div>
      {/* 12 · the icon with colour in the corners */}
      <div className={`${o.s} ${o.paper}`} data-screen="corners">
        <div className={o.cornerA} /><div className={o.cornerB} />
        <div className={o.tile} />
        <span className={`${o.meta} ${o.tl}`}>brand / mark<br />2026</span>
        <span className={`${o.meta} ${o.br}`}>n.<br />lowercase, folded</span>
      </div>
      {/* 13 · stripes */}
      <div className={`${o.s} ${o.stripes}`} data-screen="stripes"><div className={o.disc} /></div>
      {/* 14 · a dock of tools */}
      <div className={`${o.s} ${o.orange}`} data-screen="dock">
        <div className={o.dock}><i>{Icon.spark}</i><i className={o.dockMe} /><i>{Icon.trend}</i></div>
      </div>
      {/* 15 · code, scrolling */}
      <div className={`${o.s} ${o.charcoal}`} data-screen="code">
        <pre className={o.code}>{[...CODE, "", ...CODE, "", ...CODE].join("\n")}</pre>
      </div>
      {/* 16 · the construction grid, drawing itself around the logo */}
      <div className={`${o.s} ${o.paper}`} data-screen="grid">
        <div className={o.grid}><i /><i /><i /><i /><b /></div>
        <span className={`${o.meta} ${o.tl}`}>construction<br />grid 8pt</span>
        <span className={`${o.meta} ${o.br}`}>n.<br />v2.0</span>
      </div>

      {/* 17 · a design tool, full screen: the logo selected on the canvas */}
      <div className={`${o.s} ${o.fig}`} data-screen="figma">
        <div className={o.figTop}>
          <span className={o.figTools}><i /><i /><i /><i /><i /></span>
          <span className={o.figFile}>Nishanth / Brand <em>— n. logo</em></span>
          <span className={o.figShare}>Share</span>
        </div>
        <div className={o.figLeft}>
          <span className={o.figHead}>Layers</span>
          <span className={o.figLayer}>▾ # Logo</span>
          <span className={`${o.figLayer} ${o.figSel}`}>&nbsp;&nbsp;◇ n.</span>
          <span className={o.figLayer}>&nbsp;&nbsp;&nbsp;&nbsp;▭ stem</span>
          <span className={o.figLayer}>&nbsp;&nbsp;&nbsp;&nbsp;▭ band</span>
          <span className={o.figLayer}>&nbsp;&nbsp;&nbsp;&nbsp;▭ fold</span>
          <span className={o.figLayer}>&nbsp;&nbsp;&nbsp;&nbsp;▢ dot</span>
          <span className={o.figLayer}>▸ # App icon</span>
          <span className={o.figLayer}>▸ # Grid</span>
        </div>
        <div className={o.figRight}>
          <span className={o.figHead}>Design</span>
          <span className={o.figRow}><b>W</b> 961 <b>H</b> 563</span>
          <span className={o.figRow}><b>X</b> 480 <b>Y</b> 320</span>
          <span className={o.figHead}>Fill</span>
          <span className={o.figRow}><i className={o.sw} /> F50427 <em>100%</em></span>
          <span className={o.figRow}><i className={o.sw2} /> FF6A3D <em>100%</em></span>
          <span className={o.figHead}>Export</span>
          <span className={o.figRow}>SVG · PNG 2x</span>
        </div>
        <div className={o.figFrame}><span>Logo</span></div>
        <div className={o.figSelBox}><i /><i /><i /><i /><span>961 × 563</span></div>
        <svg className={o.figCursor} viewBox="0 0 16 16"><path d="M1 1 L14 6.5 L8 8 L6.5 14 Z" /></svg>
      </div>
      {/* 18 · a code editor, full screen, the logo in its preview */}
      <div className={`${o.s} ${o.ide}`} data-screen="editor">
        <div className={o.ideTop}><i /><i /><i /><span>Logo.tsx — portfolio</span></div>
        <div className={o.ideTree}>
          <span>▾ components</span><span>&nbsp;&nbsp;▾ site</span><span className={o.ideOn}>&nbsp;&nbsp;&nbsp;&nbsp;Logo.tsx</span><span>&nbsp;&nbsp;&nbsp;&nbsp;Header.tsx</span><span>&nbsp;&nbsp;▸ intro-film</span><span>▸ app</span><span>▸ lib</span><span>▸ public</span>
        </div>
        <pre className={o.ideCode}>{IDE.map((l, i) => (
          <span key={i}><em>{String(i + 1).padStart(2, " ")}</em> {l}{"\n"}</span>
        ))}</pre>
        <div className={o.idePreview}><span>localhost:3000</span></div>
      </div>
      {/* 19 · zoom: the canvas zooms in and out under the cursor */}
      <div className={`${o.s} ${o.zoom}`} data-screen="zoom">
        <div className={o.zoomDots} />
        <div className={o.zoomFrame}><span>Logo</span></div>
        <svg className={o.zoomCursor} viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" /><path d="M15 15l6 6M7.5 10h5M10 7.5v5" /></svg>
        <span className={o.zoomHud}><b>−</b> Zoom <b>+</b></span>
      </div>

      {/* the logo: one size, dead centre, on every screen */}
      <div className={o.logo} data-ologo>
        <Logo id="opener-logo" className={o.logoColor} />
        <Logo id="opener-logo-mono" mono="currentColor" className={o.logoMono} />
      </div>
    </>
  );
}
