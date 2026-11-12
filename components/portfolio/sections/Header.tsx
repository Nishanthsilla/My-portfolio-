import { navLinks } from "@/lib/portfolio/content";
import Clock from "../chrome/Clock";
import ScrambleLink from "../chrome/ScrambleLink";

export default function Header() {
  return (
    <header className="bar" id="bar">
      <div className="wrap">
        <a className="mark magnetic" href="#top" aria-label="Back to top"><i></i>NS</a>
        <nav className="nav" aria-label="Sections">
          {navLinks.map((l) => (
            <ScrambleLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>
        <Clock />
      </div>
    </header>
  );
}
