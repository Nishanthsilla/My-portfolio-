import type { Diagram as DiagramT, Screen as ScreenT } from "@/lib/site/studies/types";
import { diagramFile, screenFile } from "./assets";
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

/** A supplied diagram, shown whole: never cropped or stretched, and it opens larger. */
export function Diagram({ slug, d, n }: { slug: string; d: DiagramT; n: string }) {
  const f = diagramFile(slug, d.file);
  return (
    <figure className={s.diagram} data-diagram={d.file}>
      <div className={s.diagramPanel}>
        {f ? (
          <Zoomable src={f.src} alt={d.alt} width={f.width} height={f.height} label={d.title} />
        ) : (
          <div className={`${s.slot} ${s.diagramSlot}`} role="img" aria-label={`Diagram to come: ${d.title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2.5" y="4" width="6" height="5" rx="1" />
              <rect x="15.5" y="4" width="6" height="5" rx="1" />
              <rect x="9" y="15" width="6" height="5" rx="1" />
              <path d="M8.5 6.5h7M12 9v6" />
            </svg>
            <b>Diagram — {d.title}</b>
            <code>diagrams/{d.file}</code>
          </div>
        )}
      </div>
      <figcaption>
        <span className={s.figNum}>Fig. {n}</span> {d.caption}
      </figcaption>
    </figure>
  );
}
