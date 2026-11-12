import { slot } from "@/lib/site/selfReady";
import s from "./selfready.module.css";

/**
 * A designed screenshot placeholder. When the real image exists, set `src` on
 * the slot in lib/site/selfReady.ts (file: /public/images/self-ready/<id>.webp)
 * and it renders in exactly the same box.
 */
export default function ImageSlot({ id, caption, solo = false }: { id: string; caption?: string; solo?: boolean }) {
  const sl = slot(id);
  const [w, h] = sl.ratio.split(":").map(Number);
  return (
    // a lone placeholder is capped in width so it never becomes a huge empty block
    <figure className={`${s.figure} ${solo && !sl.src ? s.solo : ""}`} data-image-slot={sl.id}>
      {sl.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.slotImg} src={sl.src} alt={sl.need} loading="lazy" style={{ aspectRatio: `${w} / ${h}` }} />
      ) : (
        <div className={s.slot} style={{ aspectRatio: `${w} / ${h}` }} role="img" aria-label={`Placeholder: ${sl.need}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="1.8" />
            <path d="M3 17 L9 12.5 L13 15.5 L16 13 L21 17" />
          </svg>
          <b>ADD IMAGE HERE — {sl.need}</b>
          <span>
            {sl.id} · {sl.ratio}
          </span>
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
