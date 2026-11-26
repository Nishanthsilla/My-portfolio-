"use client";

import { useState } from "react";
import { about } from "@/lib/site/about";
import a from "./about.module.css";

/**
 * "Weapons of choice": the tools from Nishanth's CV as a game loadout. Each card flips (hover, focus
 * or tap) to show the fine print. The lines are jokes; the tools are real.
 */
export default function Weapons() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className={a.loadout}>
      {about.weapons.map((w, i) => (
        <li key={w.name} style={{ ["--tilt" as string]: `${((i * 37) % 7) - 3}deg` }}>
          <button
            type="button"
            className={a.weapon}
            data-open={open === w.name ? "" : undefined}
            data-tier={w.tier}
            onClick={() => setOpen((o) => (o === w.name ? null : w.name))}
            aria-label={`${w.name}. ${w.quip} Used: ${w.use}.`}
          >
            <span className={a.weaponInner}>
              <span className={a.weaponFront} aria-hidden="true">
                <span className={a.weaponTier}>{w.tier}</span>
                <span className={a.weaponIcon} style={{ ["--c1" as string]: w.c1, ["--c2" as string]: w.c2 }}>{w.mark}</span>
                <b className={a.weaponName}>{w.name}</b>
                <span className={a.weaponUse}>{w.use}</span>
              </span>
              <span className={a.weaponBack} aria-hidden="true" style={{ ["--c1" as string]: w.c1, ["--c2" as string]: w.c2 }}>
                <span className={a.weaponQuip}>“{w.quip}”</span>
                <span className={a.weaponBackName}>{w.name}</span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
