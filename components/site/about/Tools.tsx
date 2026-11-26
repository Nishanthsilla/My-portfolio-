"use client";

import { about } from "@/lib/site/about";
import a from "./about.module.css";

/** keep a tooltip inside the screen: nudge it sideways when it would run off an edge */
function fit(li: HTMLElement) {
  const tip = li.querySelector<HTMLElement>("[data-tip]");
  if (!tip) return;
  tip.style.setProperty("--shift", "0px");
  const r = tip.getBoundingClientRect();
  const pad = 12;
  const shift = r.left < pad ? pad - r.left : r.right > innerWidth - pad ? innerWidth - pad - r.right : 0;
  tip.style.setProperty("--shift", `${Math.round(shift)}px`);
}

/** The tools from Nishanth's CV, as their logos. Hover or focus a logo for its name; it glows in its own colour. */
export default function Tools() {
  return (
    <div className={a.toolGroups}>
      {about.tools.map((g) => (
        <div key={g.group} className={a.toolGroup}>
          <h3>{g.group}</h3>
          <ul className={a.tools}>
            {g.items.map((t) => (
              <li
                key={t.logo}
                tabIndex={0}
                data-mono={"mono" in t && t.mono ? "" : undefined}
                style={{ ["--glow" as string]: t.glow }}
                onPointerEnter={(e) => fit(e.currentTarget)}
                onFocus={(e) => fit(e.currentTarget)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/tools/${t.logo}.svg`} alt={t.name} width={56} height={56} loading="lazy" />
                <span className={a.tip} data-tip aria-hidden="true">{t.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
