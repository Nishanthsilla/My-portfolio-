import Logo from "@/components/site/Logo";
import o from "./opener.module.css";

/**
 * The opener's screens (montage.ts decides which one shows when). Each is a
 * full-screen layer built around the dead centre, where the logo sits; motion
 * inside a screen reads --m (seconds since the screen came on).
 */
const WORDS = ["Product Design", "Design Systems", "AI Experiences", "Prototyping", "Research", "Motion", "Front-end", "Strategy"];
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


/* seeded random, so the particles and grass are the same on every visit (and on the server) */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** a vortex of particles around the centre (viewBox 200 × 200), clear of the logo */
const PARTICLES = (() => {
  const r = seeded(7);
  return Array.from({ length: 1600 }, () => {
    const arm = Math.floor(r() * 3);
    const d = 24 + Math.pow(r(), 1.3) * 110;
    const a = arm * ((2 * Math.PI) / 3) + d * 0.035 + (r() - 0.5) * 0.55;
    const hot = d < 60;
    return { x: 100 + Math.cos(a) * d, y: 100 + Math.sin(a) * d, s: 0.25 + r() * (hot ? 1.1 : 0.7), c: hot ? (r() > 0.5 ? "#ffd2b0" : "#ff6a3d") : r() > 0.6 ? "#f50427" : "#ff5a36", o: 0.35 + r() * 0.65 };
  });
})();
/** grass blades (viewBox 320 × 200) */
const BLADES = (() => {
  const r = seeded(11);
  return Array.from({ length: 900 }, () => {
    const x = r() * 330 - 5, h = 40 + r() * 150, lean = (r() - 0.5) * 50, w = 0.8 + r() * 1.8;
    const g = Math.floor(70 + r() * 110);
    return { d: `M${x.toFixed(1)} 205 Q${(x + lean * 0.3).toFixed(1)} ${(205 - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(205 - h).toFixed(1)} Q${(x + lean * 0.3 + w).toFixed(1)} ${(205 - h * 0.6).toFixed(1)} ${(x + w * 2).toFixed(1)} 205Z`, c: `rgb(${Math.floor(g * 0.35)},${g},${Math.floor(g * 0.3)})` };
  });
})();
const TYPE_LINES = [
  ["Product", "Design", "2019 — now"], ["Design systems", "AI", "Hyderabad"], ["Clarity", "over", "complexity"],
  ["", "", ""], ["Research", "Prototype", "Ship"], ["Figma", "→", "Code"], ["n.", "Nishanth Silla", "Lead Product Designer"],
];

const Icon = {
  trend: <svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>,
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
      {/* 14 · a dock of tools */}
      <div className={`${o.s} ${o.orange}`} data-screen="dock">
        <div className={o.dock}><i>{Icon.spark}</i><i className={o.dockMe} /><i>{Icon.trend}</i></div>
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
      {/* 19 · zoom: the canvas zooms in and out under the cursor */}
      <div className={`${o.s} ${o.zoom}`} data-screen="zoom">
        <div className={o.zoomDots} />
        <div className={o.zoomFrame}><span>Logo</span></div>
        <svg className={o.zoomCursor} viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" /><path d="M15 15l6 6M7.5 10h5M10 7.5v5" /></svg>
        <span className={o.zoomHud}><b>−</b> Zoom <b>+</b></span>
      </div>

      {/* minimal screens: one idea each */}
      {/* gradients: warm, a blue sky with an orange-red sunrise, a dark glow */}
      <div className={`${o.s} ${o.warm}`} data-screen="warm" />
      <div className={`${o.s} ${o.mesh}`} data-screen="mesh" />
      <div className={`${o.s} ${o.dark}`} data-screen="halftone"><div className={o.halftone} /></div>
      <div className={`${o.s} ${o.sand}`} data-screen="rings"><div className={o.rings} /></div>
      <div className={`${o.s} ${o.paper}`} data-screen="crop">
        <div className={o.crop}><i /><i /><i /><i /></div>
        <span className={`${o.meta} ${o.tl}`}>n. / print</span>
        <span className={`${o.meta} ${o.br}`}>100%</span>
      </div>

      {/* thermal: a heat map, hottest where the logo is */}
      <div className={`${o.s} ${o.thermal}`} data-screen="thermal"><span className={`${o.meta} ${o.tl} ${o.onDark}`}>ir / 36.6°</span></div>
      {/* blueprint: the logo's construction, drawn on a blueprint grid */}
      <div className={`${o.s} ${o.blueprint}`} data-screen="blueprint">
        <div className={o.bpBox}><i /><i /><b>961</b><em>563</em></div>
        <span className={`${o.meta} ${o.tl}`}>DWG. N-01<br />SCALE 1:1</span>
        <span className={`${o.meta} ${o.br}`}>n. / construction</span>
      </div>
      {/* water ripples spreading from the logo */}
      <div className={`${o.s} ${o.water}`} data-screen="ripples"><div className={o.ripples} /></div>
      {/* particles in a vortex */}
      <div className={`${o.s} ${o.dark}`} data-screen="particles">
        <svg className={o.particles} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          {PARTICLES.map((p, i) => <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={p.s.toFixed(2)} fill={p.c} opacity={p.o.toFixed(2)} />)}
        </svg>
      </div>
      {/* typography lines: a Swiss-style type grid with a gap for the logo */}
      <div className={`${o.s} ${o.paper}`} data-screen="typography">
        <div className={o.typeLines}>
          {TYPE_LINES.map((l, i) => <div key={i} className={i === 3 ? o.typeGap : undefined}>{l.map((w, j) => <span key={j}>{w}</span>)}</div>)}
        </div>
      </div>
      {/* refracted glass: colour seen through fluted glass */}
      <div className={`${o.s} ${o.glassBg}`} data-screen="glass"><div className={o.glass} /></div>
      {/* grass */}
      <div className={`${o.s} ${o.grassBg}`} data-screen="grass">
        <svg className={o.grass} viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice">
          {BLADES.map((b, i) => <path key={i} d={b.d} fill={b.c} />)}
        </svg>
      </div>

      {/* the logo: one size, dead centre, on every screen */}
      <div className={o.logo} data-ologo>
        <Logo id="opener-logo" className={o.logoColor} />
        <Logo id="opener-logo-mono" mono="currentColor" className={o.logoMono} />
      </div>
    </>
  );
}
