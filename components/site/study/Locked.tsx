"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { requestAccess, useAccess } from "./access";
import Zoomable from "./Zoomable";
import s from "./study.module.css";

/**
 * A confidential client screen. Everyone sees a faithful recreation (no client
 * name, data or photos); the real screenshot shows only once access is
 * approved, and is served by the site, never from the public repository.
 */
export default function Locked({ id, replica, width, height, label, priority }: { id: string; replica: string; width?: number; height?: number; label: string; priority?: boolean }) {
  const access = useAccess();
  const [realFailed, setRealFailed] = useState(false);
  const real = access === "approved" && !realFailed;

  // an approved visitor gets the real screenshot (falls back to the recreation if it isn't uploaded yet)
  useEffect(() => {
    if (access !== "approved") return;
    const im = new Image();
    im.onerror = () => setRealFailed(true);
    im.src = `/api/access/image/${id}`;
  }, [access, id]);

  return (
    <div className={s.locked}>
      <div className={s.frame}>
        <Zoomable src={real ? `/api/access/image/${id}` : replica} alt={real ? `${label}: real screenshot` : `${label}: a recreation of the confidential client screen`} width={width} height={height} label={label} priority={priority} />
      </div>
    </div>
  );
}

export function AskModal({ onClose }: { onClose: () => void }) {
  const access = useAccess();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); html.style.overflow = prev; };
  }, [onClose]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(await requestAccess({ name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), company: "", reason: String(f.get("reason") ?? ""), website: String(f.get("website") ?? "") }));
    setBusy(false);
  };

  const done = access === "pending" || access === "approved";
  return createPortal(
    <div className={s.askLayer} role="dialog" aria-modal="true" aria-labelledby="ask-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.ask}>
        <button type="button" className={s.askClose} onClick={onClose} aria-label="Close">×</button>
        <span className={s.askIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg></span>
        <h2 id="ask-title">{access === "approved" ? "You have access" : done ? "Request sent" : "These screens are confidential"}</h2>
        {access === "approved" ? (
          <p>The real screenshots are showing now. Thanks for keeping them to yourself.</p>
        ) : done ? (
          <p>Thanks! I&rsquo;ll look at it soon. Keep this page open, or come back later: the real screenshots appear here on their own once I approve.</p>
        ) : (
          <>
            <p>Self-Ready is client work, so what you see here are faithful recreations with the client&rsquo;s name, data and photos taken out. Tell me who you are and I&rsquo;ll share the real screens with you.</p>
            <form onSubmit={submit} className={s.askForm}>
              <label><b>Name</b><input ref={first} name="name" required maxLength={60} autoComplete="name" /></label>
              <label><b>Email</b><input name="email" type="email" required maxLength={120} autoComplete="email" /></label>
              <label><b>Why you&rsquo;d like to see them</b><textarea name="reason" required minLength={3} maxLength={400} rows={3} /></label>
              <input name="website" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden="true" />
              {err && <p className={s.askErr} role="alert">{err}</p>}
              <button type="submit" className={s.askSend} disabled={busy}>{busy ? "Sending…" : "Request access"}</button>
            </form>
          </>
        )}
      </div>
    </div>,
    (document.querySelector("[data-site]") as HTMLElement | null) ?? document.body,
  );
}
