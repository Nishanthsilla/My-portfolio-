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


/* seeded random, so the particles and contours are the same on every visit (and on the server) */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** a particle flow field (viewBox 200 × 200): white dots streaming across in curving lanes, around the centre */
const FLOW = (() => {
  const r = seeded(7);
  const lanes: { d: number[][]; o: number }[] = [];
  for (let k = 0; k < 34; k++) {
    const y0 = (k + 0.5) * (200 / 34), amp = 4 + r() * 10, f = 0.02 + r() * 0.025, ph = r() * 6.28;
    const pts: number[][] = [];
    for (let x = -10; x < 420; x += 1.1 + r() * 1.6) {
      // lanes bend away from the centre, leaving the logo clear
      const dy = y0 - 100, push = Math.exp(-(((x % 200) - 100) ** 2) / 900) * Math.sign(dy || 1) * Math.max(0, 22 - Math.abs(dy)) * 0.9;
      pts.push([x, y0 + Math.sin(x * f + ph) * amp + push, 0.12 + r() * 0.3]);
    }
    lanes.push({ d: pts, o: 0.25 + r() * 0.65 });
  }
  return lanes;
})();
/** stepped colour bars: columns of stepped colour, like an equalizer */
const BARS = Array.from({ length: 24 }, (_, i) => ({ ph: i * 0.55, amp: 0.5 + ((i * 7) % 5) / 10 }));
/** topographic contour lines from a smooth random height field (viewBox 160 × 100), via marching squares */
const TOPO = (() => {
  const r = seeded(23);
  const hills = Array.from({ length: 14 }, () => ({ x: r() * 160, y: r() * 100, h: (r() - 0.35) * 2, w: 12 + r() * 30 }));
  const W = 160, H = 100, S = 1.6;
  const f = (x: number, y: number) => hills.reduce((a, k) => a + k.h * Math.exp(-((x - k.x) ** 2 + (y - k.y) ** 2) / (k.w * k.w)), 0);
  const nx = Math.ceil(W / S) + 1, ny = Math.ceil(H / S) + 1;
  const v: number[][] = Array.from({ length: ny }, (_, j) => Array.from({ length: nx }, (_, i) => f(i * S, j * S)));
  const paths: string[] = [];
  for (let L = -1.6; L <= 1.6; L += 0.055) {
    let d = "";
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const a = v[j][i], b = v[j][i + 1], c = v[j + 1][i + 1], e = v[j + 1][i];
        const pts: [number, number][] = [];
        const edge = (p: number, q: number, x1: number, y1: number, x2: number, y2: number) => {
          if ((p < L) !== (q < L)) { const t = (L - p) / (q - p); pts.push([(x1 + (x2 - x1) * t) * S, (y1 + (y2 - y1) * t) * S]); }
        };
        edge(a, b, i, j, i + 1, j); edge(b, c, i + 1, j, i + 1, j + 1); edge(e, c, i, j + 1, i + 1, j + 1); edge(a, e, i, j, i, j + 1);
        for (let k = 0; k + 1 < pts.length; k += 2) d += `M${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)}L${pts[k + 1][0].toFixed(1)} ${pts[k + 1][1].toFixed(1)}`;
      }
    if (d) paths.push(d);
  }
  return paths;
})();

/** the code screen: his process, written as code */
const CODE_BG = [
  "nishanth.design({",
  '  research: ["users", "data", "teams"],',
  '  process: "flexible",',
  "  systems: { tokens: true, chaos: false },",
  "})",
  "",
  'await nishanth.prototype({ figma: true, code: true })',
  "await nishanth.ship()",
  "",
  "while (complexity > clarity) {",
  "  nishanth.simplify()",
  '  nishanth.test("with real users")',
  "  nishanth.iterate()",
  "}",
  "",
  'report.send({ impact: "+15% engagement" })',
  "// this is not decoration. it's design that ships.",
  "",
  'const nishanth = new Designer({ base: "Hyderabad" })',
  "",
];

const Icon = {
  trend: <svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></svg>,
  spark: <svg viewBox="0 0 24 24"><path d="M12 2c.6 5 2.4 7.4 8 8-5.6.6-7.4 3-8 8-.6-5-2.4-7.4-8-8 5.6-.6 7.4-3 8-8z" /></svg>,
};

export default function OpenerScreens() {
  return (
    <>
      {/* the liquid background (montage.ts / fluid.ts), under the screens that use it */}
      <canvas className={o.fluid} data-ofluid aria-hidden="true" />
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
          <span className={o.notif}><b>Nishanth</b> shipped a new design ✦</span>
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
      {/* Bauhaus: bold shapes in his colours, sliding and turning around the logo */}
      <div className={`${o.s} ${o.paper}`} data-screen="bauhaus">
        <div className={o.bh}><i /><i /><i /><i /><i /><i /></div>
      </div>
      <div className={`${o.s} ${o.mesh}`} data-screen="mesh" />
      {/* stepped colour bars, rising and falling like an equalizer */}
      <div className={`${o.s} ${o.paper}`} data-screen="bars">
        <div className={o.bars}>{BARS.map((b, i) => <i key={i} style={{ ["--ph" as string]: b.ph, ["--amp" as string]: b.amp }}><b /><b /><b /><b /></i>)}</div>
      </div>
      <div className={`${o.s} ${o.sand}`} data-screen="rings"><div className={o.rings} /></div>
      <div className={`${o.s} ${o.paper}`} data-screen="crop">
        <div className={o.crop}><i /><i /><i /><i /></div>
        <span className={`${o.meta} ${o.tl}`}>n. / print</span>
        <span className={`${o.meta} ${o.br}`}>100%</span>
      </div>

      {/* thermal: a grainy thermographic sweep */}
      <div className={`${o.s} ${o.thermal}`} data-screen="thermal"><div className={o.thermArc} /><div className={o.grain} /><span className={`${o.meta} ${o.tl} ${o.onDark}`}>thermographic / 36.6°</span></div>
      {/* blueprint: the logo's technical drawing */}
      <div className={`${o.s} ${o.blueprint}`} data-screen="blueprint">
        <div className={o.bpNav}><b>n.</b><span>Work</span><span>About</span><span>Contact</span></div>
        <div className={o.bpCircle} /><div className={o.bpCircle2} />
        <div className={o.bpCross} />
        <div className={o.bpBox}><i /><i /><b>961</b><em>563</em></div>
        <span className={o.bpSpecL}>TO DESIGN PRODUCTS<br />THAT FEEL SIMPLE,<br />FUNCTIONAL, AND HUMAN.</span>
        <span className={o.bpSpecR}>R 0.42 L<br />32°<br />GRID 8PT</span>
        <span className={`${o.meta} ${o.br}`}>DWG. N-01 · SCALE 1:1</span>
      </div>
      {/* a soft, embossed ripple on still white water */}
      <div className={`${o.s} ${o.water}`} data-screen="ripples"><div className={o.rip}><i /><i /><i /></div></div>
      {/* white stipple: a dotted terrain, a starfield, and a sphere of light around the logo */}
      <div className={`${o.s} ${o.dark}`} data-screen="particles">
        <svg className={o.particles} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
          <g className={o.flowLanes}>
            {FLOW.map((l, k) => l.d.map((p, i) => <circle key={`${k}-${i}`} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r={p[2].toFixed(2)} fill="#fff" opacity={l.o.toFixed(2)} />))}
          </g>
        </svg>
      </div>
      {/* topographic contour lines */}
      <div className={`${o.s} ${o.dark}`} data-screen="topo">
        <svg className={o.topo} viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
          {TOPO.map((d, i) => <path key={i} d={d} pathLength={1} style={{ ["--i" as string]: i }} />)}
        </svg>
        <div className={o.topoClear} />
        <span className={`${o.meta} ${o.tl}`}>17.38° N · 78.48° E</span>
        <span className={`${o.meta} ${o.br}`}>elev. 542 m</span>
      </div>
      {/* refracted glass: hot red light through fluted glass panels */}
      <div className={`${o.s} ${o.glassBg}`} data-screen="glass"><div className={o.glass} /><div className={o.panels}><i /><i /><i /><i /></div></div>
      {/* code, full screen and faint: how he works, written as code */}
      <div className={`${o.s} ${o.dark}`} data-screen="codebg">
        <pre className={o.codeBg}>{[...CODE_BG, ...CODE_BG, ...CODE_BG, ...CODE_BG, ...CODE_BG].join("\n")}</pre>
      </div>
      {/* the logo: one size, dead centre, on every screen */}
      <div className={o.logo} data-ologo>
        <Logo id="opener-logo" className={o.logoColor} />
        <Logo id="opener-logo-mono" mono="currentColor" className={o.logoMono} />
      </div>
    </>
  );
}
