"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { uiSound } from "@/lib/sound/ui";
import s from "./site.module.css";

/**
 * The one navbar. On the homepage each link moves the journey to its scene
 * (Journey.tsx listens for these hashes) and the current scene is
 * highlighted; elsewhere the links lead back to that scene, and the section a
 * page belongs to is highlighted.
 *
 * The global class names `bar`, `wrap` and `mark` (with its <i> dot) are kept
 * on purpose: the intro film ends by landing its orange dot on `.bar .mark i`.
 */
const NAV = [
  { id: "about", label: "About", page: (p: string) => p.startsWith("/about") },
  { id: "work", label: "Work", page: (p: string) => p.startsWith("/work") || /^\/(visual-craft|product-strategy|design-engineering)/.test(p) },
  { id: "beyond", label: "Beyond", page: (p: string) => p.startsWith("/beyond") || p.startsWith("/photography") },
  { id: "wall", label: "Wall", page: (p: string) => p.startsWith("/wall") },
  { id: "contact", label: "Contact", page: () => false },
] as const;

/** the homepage journey announces its current scene ("intro" counts as About) */
export const SCENE_EVENT = "journey:scene";

export default function Header() {
  const path = usePathname() ?? "/";
  const home = path === "/";
  const [scene, setScene] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!home) return;
    const on = (e: Event) => setScene((e as CustomEvent<string>).detail);
    addEventListener(SCENE_EVENT, on);
    return () => removeEventListener(SCENE_EVENT, on);
  }, [home]);

  const current = (id: string) => (home ? (scene === "intro" ? "about" : scene) === id : NAV.find((n) => n.id === id)!.page(path));

  return (
    <header className={`bar ${s.header}`}>
      <div className={`wrap ${s.container} ${s.headerRow}`}>
        <Link className={`mark ${s.logo} ${s.logoNs}`} href="/" aria-label="Nishanth Silla — home" title="Nishanth Silla" onClick={() => uiSound("logo")}>
          <i aria-hidden="true" />
          NS
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
            <Link
              key={n.id}
              href={`/#${n.id}`}
              className={s.navLink}
              aria-current={current(n.id) ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
