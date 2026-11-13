"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SoundToggle from "./SoundToggle";
import s from "./site.module.css";
import { projectBySlug } from "@/lib/site/content";

/** A category page, or a project page that belongs to that category. */
function inCategory(path: string, id: string) {
  if (path.startsWith(`/${id}`)) return true;
  const slug = path.match(/^\/work\/([^/]+)/)?.[1];
  return !!slug && projectBySlug(slug)?.category === id;
}

const NAV = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/visual-craft", label: "Visual Craft", match: (p: string) => inCategory(p, "visual-craft"), work: true },
  { href: "/product-strategy", label: "Product Strategy", match: (p: string) => inCategory(p, "product-strategy"), work: true },
  { href: "/design-engineering", label: "Design Engineering", match: (p: string) => inCategory(p, "design-engineering"), work: true },
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
        <SoundToggle />
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
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${s.navLink} ${n.work ? s.navWork : ""} ${n.work && !NAV[i - 1]?.work ? s.navWorkFirst : ""}`}
              aria-current={n.match(path) ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
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
