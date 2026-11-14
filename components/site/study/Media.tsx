import type { Screen as ScreenT } from "@/lib/site/studies/types";
import { diagramFiles, screenFile } from "./assets";
import Zoomable from "./Zoomable";
import s from "./study.module.css";

/**
 * A product screenshot. Until its file exists it is a designed placeholder of
 * the same shape, naming exactly what to add and where.
 */
export function Screen({ slug, screen, priority = false }: { slug: string; screen: ScreenT; priority?: boolean }) {
  const f = screenFile(slug, screen.id);
  const [w, h] = (screen.ratio ?? "16:10").split(":").map(Number);
  return (
    <figure className={s.shot} data-screen={screen.id}>
      {f ? (
        <div className={s.frame}>
          <Zoomable src={f.src} alt={screen.need} width={f.width} height={f.height} label={screen.need.split(" — ")[0]} priority={priority} />
        </div>
      ) : (
        <div className={s.slot} style={{ aspectRatio: `${w} / ${h}` }} role="img" aria-label={`Screenshot to come: ${screen.need}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 8h18" />
            <circle cx="6" cy="6" r=".6" />
            <circle cx="8" cy="6" r=".6" />
          </svg>
          <b>Screenshot — {screen.need.split(" — ")[0]}</b>
          <span className={s.slotNeed}>{screen.need.split(" — ")[1] ?? screen.need}</span>
          <code>screens/{screen.id}.webp</code>
        </div>
      )}
      <figcaption>{screen.caption}</figcaption>
    </figure>
  );
}

/** A static flowchart image: the wide version on larger screens, the tall one on phones. */
export function Flowchart({ slug, name, alt, note, fig }: { slug: string; name: "user_flow" | "architecture"; alt: string; note: string; fig: string }) {
  const { wide, tall } = diagramFiles(slug, name);
  if (!wide) return null;
  return (
    <figure className={s.dgm} data-diagram={name}>
      <picture>
        {tall && <source media="(max-width: 760px)" srcSet={tall.src} width={tall.width} height={tall.height} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.dgmImg} src={wide.src} width={wide.width} height={wide.height} alt={alt} loading="lazy" decoding="async" />
      </picture>
      <figcaption>
        <span className={s.figNum}>Fig. {fig}</span> {note}
      </figcaption>
    </figure>
  );
}
