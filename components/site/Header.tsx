"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import s from "./site.module.css";

const NAV = [
  { href: "/", label: "Work", match: (p: string) => p === "/" || p.startsWith("/work") },
  { href: "/beyond", label: "Beyond the Interface", match: (p: string) => p.startsWith("/beyond") },
  { href: "/about", label: "About", match: (p: string) => p.startsWith("/about") },
];

/**
 * Site header. The global class names `bar`, `wrap` and `mark` (with its <i>
 * dot) are kept on purpose: the intro film ends by landing its orange dot on
 * `.bar .mark i`.
 */
export default function Header() {
  const path = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(scrollY > 8);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`bar ${s.header} ${scrolled ? s.headerScrolled : ""}`}>
      <div className={`wrap ${s.container} ${s.headerRow}`}>
        <Link className={`mark ${s.logo}`} href="/" aria-label="Nishanth Silla — home">
          <i aria-hidden="true" />
          Nishanth Silla
        </Link>
        <button
          type="button"
          className={s.menuBtn}
          aria-expanded={menu}
          aria-controls="site-nav"
          aria-label={menu ? "Close menu" : "Open menu"}
          onClick={() => setMenu((m) => !m)}
        >
          <span />
        </button>
        <nav id="site-nav" className={`${s.nav} ${menu ? s.navOpen : ""}`} aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={s.navLink} aria-current={n.match(path) ? "page" : undefined} onClick={() => setMenu(false)}>
              {n.label}
            </Link>
          ))}
          <a className={`${s.btn} ${s.btnPrimary} ${s.btnSmall}`} href="#contact" onClick={() => setMenu(false)}>
            Get in touch
          </a>
        </nav>
      </div>
    </header>
  );
}
