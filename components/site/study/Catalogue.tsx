"use client";

import { useEffect, useRef, useState } from "react";
import { useAccess } from "./access";
import { AskModal } from "./Locked";
import Zoomable from "./Zoomable";
import s from "./study.module.css";
import Button from "@/components/site/ui/Button";

/** the screen drawn at a tiny size and scaled back up, so it reads as big blocks of colour at any zoom */
function Pixelated({ src, width = 16, height = 9 }: { src: string; width?: number; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const im = new Image();
    im.onload = () => {
      const w = 64, h = Math.max(1, Math.round((w * im.naturalHeight) / im.naturalWidth));
      c.width = w;
      c.height = h;
      c.getContext("2d")?.drawImage(im, 0, 0, w, h);
    };
    im.src = src;
  }, [src]);
  return <canvas ref={ref} className={s.pixel} style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true" />;
}

type Item = { id: string; label: string; caption: string; replica: string; width?: number; height?: number };

/**
 * "See all platform screenshots": every confidential screen in one place.
 * Locked, it shows the recreations behind a request-access button; once
 * Nishanth approves, the same grid shows the real screenshots, each opening large.
 */
export default function Catalogue({ items }: { items: Item[] }) {
  const access = useAccess();
  const [ask, setAsk] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const open = access === "approved";

  // only switch a tile to the real screenshot once it has loaded (no broken images)
  useEffect(() => {
    if (!open) return;
    items.forEach((it) => {
      const im = new Image();
      im.onload = () => setReady((r) => ({ ...r, [it.id]: true }));
      im.src = `/api/access/image/${it.id}`;
    });
  }, [open, items]);

  return (
    <div className={s.cat}>
      <div className={`${s.catGrid} ${open ? "" : s.catShut}`}>
        {items.map((it) => {
          const real = open && ready[it.id];
          return (
            <figure key={it.id} className={s.catItem}>
              <div className={s.frame}>
                {real ? (
                  <Zoomable src={`/api/access/image/${it.id}`} alt={`${it.label}: real screenshot`} width={it.width} height={it.height} label={it.label} />
                ) : open ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.replica} alt={`${it.label}: recreation`} width={it.width} height={it.height} loading="lazy" className={s.img} />
                ) : (
                  <Pixelated src={it.replica} width={it.width} height={it.height} />
                )}
              </div>
              <figcaption><b>{it.label}</b>{real ? " · real screen" : ""}</figcaption>
            </figure>
          );
        })}
      </div>
      {!open && (
        <div className={s.catGate}>
          <span className={s.askIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg></span>
          <b>{access === "pending" ? "Access requested" : "The real screens are confidential"}</b>
          <p>{access === "pending" ? "I'll look at your request soon. They open here on their own once I approve it." : "What you see above are recreations. Ask for access and, once I approve it, every real screen opens right here."}</p>
          {access !== "pending" && (
            <Button variant="primary" className={s.catAsk} onClick={() => setAsk(true)} disabled={access === "loading"}>Request access</Button>
          )}
        </div>
      )}
      {ask && <AskModal onClose={() => setAsk(false)} />}
    </div>
  );
}
