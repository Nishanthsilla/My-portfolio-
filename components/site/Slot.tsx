import s from "./selfready/selfready.module.css";

/**
 * A designed screenshot placeholder: "ADD IMAGE HERE — <need>" plus an id that
 * maps to the screenshot checklist. Pass `src` once the real image exists and it
 * renders in exactly the same box.
 */
export default function Slot({
  id,
  need,
  ratio = "16:10",
  caption,
  solo = false,
  src,
}: {
  id: string;
  need: string;
  ratio?: string;
  caption?: string;
  solo?: boolean;
  src?: string;
}) {
  const [w, h] = ratio.split(":").map(Number);
  return (
    <figure className={`${s.figure} ${solo && !src ? s.solo : ""}`} data-image-slot={id}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.slotImg} src={src} alt={need} loading="lazy" style={{ aspectRatio: `${w} / ${h}` }} />
      ) : (
        <div className={s.slot} style={{ aspectRatio: `${w} / ${h}` }} role="img" aria-label={`Placeholder: ${need}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="1.8" />
            <path d="M3 17 L9 12.5 L13 15.5 L16 13 L21 17" />
          </svg>
          <b>ADD IMAGE HERE — {need}</b>
          <span>
            {id} · {ratio}
          </span>
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
