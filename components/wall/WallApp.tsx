"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { findFlags } from "@/lib/wall/moderation";
import { STICKERS, StickerArt, stickerById } from "@/lib/wall/stickers";
import { LIMITS, type PublicNote } from "@/lib/wall/types";
import { addMine, loadDraft, loadMine, pruneMine, saveDraft, type MyNote } from "@/lib/wall/local";
import NoteCard from "./NoteCard";
import SideEyeEditor from "./SideEyeEditor";
import SideEyeMonkey from "./SideEyeMonkey";
import w from "./wall.module.css";

type Mode = "loading" | "sqlite" | "postgres" | "unconfigured" | "offline";
type Step = "browse" | "place" | "compose" | "sent";
type Draft = { sticker: string; x: number; y: number; rotation: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const X = [0.05, 0.95], Y = [0.04, 0.96];

/** Decoration only (no messages), so the wall never looks empty. */
const DECOR: { id: string; x: number; y: number; r: number; s: number }[] = [
  { id: "sparkles", x: 0.08, y: 0.32, r: 0, s: 38 },
  { id: "rainbow", x: 0.47, y: 0.07, r: -8, s: 56 },
  { id: "star", x: 0.92, y: 0.12, r: 12, s: 46 },
  { id: "blossom", x: 0.88, y: 0.82, r: -10, s: 48 },
  { id: "wave", x: 0.3, y: 0.9, r: 14, s: 46 },
  { id: "sparkles", x: 0.66, y: 0.56, r: 0, s: 28 },
  { id: "coffee", x: 0.04, y: 0.78, r: 8, s: 46 },
];
/** Nishanth's own pinned note (his words from the brief), clearly labelled. */
const PINNED = { sticker: "heart", message: "A thought, a note, or just a little sticker. I'd love to see what you leave.", name: "Nishanth", x: 0.2, y: 0.16, rotation: -4 };

/**
 * The Wall. On the homepage it opens as a full-screen layer over the page
 * (onClose = back to exactly where the visitor was); at /wall it is its own page.
 */
export default function WallApp({ onClose, compose = false }: { onClose?: () => void; compose?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [captcha, setCaptcha] = useState(false);
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("browse");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [honey, setHoney] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // arriving via "Leave a note": a small hint over the sticker toolbar until a sticker is picked
  const fromCompose = useSyncExternalStore(() => () => {}, () => compose || !!new URLSearchParams(location.search).get("compose"), () => compose);
  const [mine, setMine] = useState<MyNote[]>([]);
  const [restored, setRestored] = useState(false);
  const [coachOff, setCoachOff] = useState(false);
  const coach = fromCompose && !coachOff;
  const scroller = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const draftEl = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);

  // load the approved notes; if there is no server (offline copy), say so
  useEffect(() => {
    let alive = true;
    fetch("/api/wall", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { mode: Mode; notes: PublicNote[]; captcha?: boolean }) => {
        if (!alive) return;
        setMode(d.mode);
        setNotes(d.notes);
        setCaptcha(!!d.captcha);
        setMine(pruneMine(new Set(d.notes.map((n) => n.id))));
      })
      .catch(() => alive && setMode("offline"));
    return () => {
      alive = false;
    };
  }, []);

  // a refresh never loses what the visitor was doing: restore the unsent draft and their own notes
  useEffect(() => {
    const saved = loadDraft();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from browser storage */
    setMine(loadMine());
    if (saved?.draft) {
      setDraft(saved.draft);
      setMessage(saved.message);
      setName(saved.name);
      setStep(saved.step);
      setCoachOff(true);
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (!restored) return;
    if (draft && (step === "place" || step === "compose")) saveDraft({ draft, message, name, step });
    else saveDraft(null);
  }, [restored, draft, message, name, step]);

  // no page scrolling behind the wall
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  const close = () => {
    if (onClose) return onClose();
    if (document.referrer.startsWith(location.origin) && history.length > 1) router.back();
    else router.push("/");
  };

  /* ---------- placing ---------- */
  const visibleCenter = () => {
    const sc = scroller.current, b = board.current;
    if (!sc || !b) return { x: 0.5, y: 0.5 };
    return { x: 0.5, y: clamp((sc.scrollTop + sc.clientHeight * 0.45) / b.offsetHeight, Y[0], Y[1]) };
  };
  const toBoard = (cx: number, cy: number) => {
    const r = board.current!.getBoundingClientRect();
    return { x: clamp((cx - r.left) / r.width, X[0], X[1]), y: clamp((cy - r.top) / r.height, Y[0], Y[1]) };
  };
  const pick = (id: string, at?: { x: number; y: number }) => {
    setCoachOff(true);
    setError("");
    setDraft((d) => ({ sticker: id, rotation: d?.rotation ?? Math.round((Math.random() - 0.5) * 12), ...(d && !at ? { x: d.x, y: d.y } : at ?? visibleCenter()) }));
    if (step === "browse" || step === "sent") setStep("place");
    requestAnimationFrame(() => draftEl.current?.focus({ preventScroll: true }));
  };

  // drag a sticker out of the toolbar onto the wall (mouse / pen); a tap or click places it in view
  const dragFromBar = (e: RPointerEvent<HTMLButtonElement>, id: string) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    let dragging = false;
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        dragging = true;
        ghost.current?.setAttribute("data-on", id);
        ghost.current?.querySelectorAll<HTMLElement>("[data-ghost]").forEach((g) => (g.style.display = g.dataset.ghost === id ? "block" : "none"));
      }
      if (dragging && ghost.current) ghost.current.style.transform = `translate(${ev.clientX - 34}px, ${ev.clientY - 34}px)`;
    };
    const up = (ev: PointerEvent) => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      ghost.current?.removeAttribute("data-on");
      if (!dragging) return;
      const r = scroller.current!.getBoundingClientRect();
      if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) pick(id, toBoard(ev.clientX, ev.clientY));
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
  };

  // move / rotate the placed sticker
  const dragDraft = (e: RPointerEvent<HTMLDivElement>) => {
    if (!draft || step !== "place" || (e.target as HTMLElement).closest("[data-rotate]")) return;
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const r = board.current!.getBoundingClientRect();
    const ox = e.clientX - (r.left + draft.x * r.width), oy = e.clientY - (r.top + draft.y * r.height);
    const move = (ev: PointerEvent) => {
      const p = toBoard(ev.clientX - ox, ev.clientY - oy);
      setDraft((d) => (d ? { ...d, ...p } : d));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  const rotateDraft = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!draft) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const c = draftEl.current!.getBoundingClientRect();
    const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    const a0 = Math.atan2(e.clientY - cy, e.clientX - cx), r0 = draft.rotation;
    const move = (ev: PointerEvent) => {
      const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
      setDraft((d) => (d ? { ...d, rotation: Math.round(clamp(r0 + ((a - a0) * 180) / Math.PI, -30, 30)) } : d));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };
  const nudge = (dx: number, dy: number, dr = 0) =>
    setDraft((d) => (d ? { ...d, x: clamp(d.x + dx, X[0], X[1]), y: clamp(d.y + dy, Y[0], Y[1]), rotation: clamp(d.rotation + dr, -30, 30) } : d));
  const keyDraft = (e: KeyboardEvent) => {
    const k = e.shiftKey ? 0.05 : 0.01;
    const map: Record<string, () => void> = {
      ArrowLeft: () => nudge(-k, 0), ArrowRight: () => nudge(k, 0), ArrowUp: () => nudge(0, -k), ArrowDown: () => nudge(0, k),
      "[": () => nudge(0, 0, -3), "]": () => nudge(0, 0, 3), Enter: () => openComposer(), Escape: () => cancel(),
    };
    if (map[e.key] && step === "place") {
      e.preventDefault();
      map[e.key]();
    }
  };

  /* ---------- composing ---------- */
  const openComposer = () => {
    if (!draft) return;
    setStartedAt((t) => t || Date.now());
    setError("");
    setStep("compose");
  };
  const cancel = useCallback(() => {
    setDraft(null);
    setStep("browse");
    setError("");
  }, []);
  const msgFlags = useMemo(() => findFlags(message), [message]);
  const nameFlags = useMemo(() => findFlags(name), [name]);
  const flagged = msgFlags.length + nameFlags.length > 0;
  // the preview never shows blocked words — they are masked there (the editor strikes them through privately)
  const mask = (v: string, flags: typeof msgFlags) => flags.reduceRight((t, f) => t.slice(0, f.start) + "•".repeat(Math.min(6, f.end - f.start)) + t.slice(f.end), v);
  const safeMessage = mask(message, msgFlags), safeName = mask(name, nameFlags);
  const valid = message.trim().length >= LIMITS.minMessage && name.trim().length >= 1 && !flagged && !!draft;

  // Cloudflare Turnstile (only when the server requires it and a site key is configured)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (step !== "compose" || !captcha || !siteKey) return;
    (window as unknown as { __wallCaptcha: (t: string) => void }).__wallCaptcha = setToken;
    if (!document.querySelector("script[data-turnstile]")) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.dataset.turnstile = "";
      document.head.appendChild(s);
    }
  }, [step, captcha, siteKey]);

  const submit = async () => {
    if (!valid || !draft || busy) return;
    if (mode === "offline") {
      // no server in this copy: keep the note on this device (clearly labelled), nothing is sent
      addMine({ id: `local-${Date.now()}`, message, name, ...draft, createdAt: new Date().toISOString(), local: true });
      setMine(loadMine());
      setStep("sent");
      setDraft(null);
      setMessage("");
      setName("");
      setStartedAt(0);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, name, ...draft, website: honey, startedAt, captcha: token || undefined }),
      });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; note?: PublicNote };
      if (res.ok && d.ok) {
        if (d.note) {
          addMine(d.note);
          setMine(loadMine());
        }
        setStep("sent");
        setDraft(null);
        setMessage("");
        setName("");
        setStartedAt(0);
      } else setError(d.error || "Something went wrong — please try again.");
    } catch {
      setError("Couldn't reach the wall — please try again.");
    } finally {
      setBusy(false);
    }
  };

  const report = async (id: string) => {
    setHidden((h) => [...h, id]);
    fetch("/api/wall/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => {});
  };

  const shown = notes.filter((n) => !hidden.includes(n.id));
  const st = draft ? stickerById(draft.sticker) : null;

  return (
    <div className={w.wall}>
      <header className={w.bar}>
        <div>
          <h1 className={w.barTitle}>The Wall</h1>
          <p className={w.barSub}>
            {mode === "loading" ? "Loading…" : mode === "offline" || mode === "unconfigured" ? "Posting isn't connected here yet" : `${shown.length} ${shown.length === 1 ? "note" : "notes"} · new notes appear once approved`}
          </p>
        </div>
        <div className={w.barActions}>
          {step === "browse" && (
            <button type="button" className={w.btnPrimary} onClick={() => pick(STICKERS[0].id)}>
              Add a note
            </button>
          )}
          <button type="button" className={w.close} onClick={close} aria-label="Close the wall">
            ×
          </button>
        </div>
      </header>

      <div ref={scroller} className={w.scroller}>
        <div ref={board} className={w.board} aria-label="The wall">
          {DECOR.map((d, i) => (
            <span key={i} className={w.decor} aria-hidden="true" style={{ left: `${d.x * 100}%`, top: `${d.y * 100}%`, transform: `translate(-50%,-50%) rotate(${d.r}deg)` }}>
              <StickerArt id={d.id} size={d.s} />
            </span>
          ))}

          <div className={w.placed} style={{ left: `${PINNED.x * 100}%`, top: `${PINNED.y * 100}%`, transform: `translate(-50%,-50%) rotate(${PINNED.rotation}deg)` }}>
            <NoteCard sticker={PINNED.sticker} message={PINNED.message} name={PINNED.name} tag="Pinned · from Nishanth" />
          </div>

          {shown.map((n) => (
            <div key={n.id} className={w.placed} style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%`, transform: `translate(-50%,-50%) rotate(${n.rotation}deg)` }}>
              <NoteCard sticker={n.sticker} message={n.message} name={n.name} />
              <button type="button" className={w.report} onClick={() => report(n.id)} aria-label={`Report the note from ${n.name}`}>
                Report
              </button>
            </div>
          ))}

          {mine.map((n) => (
            <div key={n.id} className={`${w.placed} ${w.mine}`} style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%`, transform: `translate(-50%,-50%) rotate(${n.rotation}deg)` }}>
              <NoteCard sticker={n.sticker} message={n.message} name={n.name} tag={n.local ? "Saved on this device · not sent" : "Waiting for approval · only you see this"} />
            </div>
          ))}

          {mode !== "loading" && shown.length === 0 && mine.length === 0 && step === "browse" && (
            <p className={w.empty}>Nothing here yet from visitors — be the first to leave something.</p>
          )}

          {draft && step !== "sent" && (
            <div
              ref={draftEl}
              className={`${w.placed} ${w.draft} ${step === "place" ? w.draftActive : ""}`}
              style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, transform: `translate(-50%,-50%) rotate(${draft.rotation}deg)` }}
              tabIndex={step === "place" ? 0 : -1}
              role="group"
              aria-label={`Your ${st?.label ?? "sticker"}. Arrow keys move it, [ and ] rotate it, Enter to write your note.`}
              onPointerDown={dragDraft}
              onKeyDown={keyDraft}
            >
              <NoteCard sticker={draft.sticker} message={safeMessage} name={safeName} ghost={!message} />
              {step === "place" && (
                <button type="button" data-rotate className={w.rotate} onPointerDown={rotateDraft} aria-label="Rotate (drag)" tabIndex={-1}>
                  ↻
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* placing: what to do next */}
      {step === "place" && draft && (
        <div className={w.placeBar} role="toolbar" aria-label="Place your sticker">
          <span className={w.placeHint}>Drag to place it · ↻ to rotate</span>
          <button type="button" className={w.iconBtn} onClick={() => nudge(0, 0, -6)} aria-label="Rotate left">⟲</button>
          <button type="button" className={w.iconBtn} onClick={() => nudge(0, 0, 6)} aria-label="Rotate right">⟳</button>
          <button type="button" className={w.btnGhost} onClick={cancel}>Cancel</button>
          <button type="button" className={w.btnPrimary} onClick={openComposer}>Write your note →</button>
        </div>
      )}

      {step === "sent" && (
        <div className={w.sent} role="status">
          <StickerArt id="party" size={64} />
          <h2>Your sticker is on its way.</h2>
          <p>
            {mode === "offline"
              ? "Thanks for leaving a little something! This copy of the site isn't connected, so it's saved on this device only."
              : "Thanks for leaving a little something! It'll appear on the wall for everyone once it's approved — until then, only you can see it."}
          </p>
          <button type="button" className={w.btnPrimary} onClick={() => setStep("browse")}>Back to the wall</button>
        </div>
      )}

      {/* the sticker toolbar */}
      <div className={`${w.toolbar} ${coach ? w.toolbarCoach : ""}`}>
        {coach && <p className={w.coach}>Pick a sticker, then drag it where you like.</p>}
        <div className={w.tray} role="listbox" aria-label="Stickers" aria-orientation="horizontal">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={draft?.sticker === s.id}
              className={w.trayItem}
              title={s.label}
              aria-label={s.label}
              onPointerDown={(e) => dragFromBar(e, s.id)}
              onClick={() => pick(s.id)}
              disabled={step === "compose"}
            >
              <StickerArt id={s.id} size={40} />
            </button>
          ))}
        </div>
      </div>
      <div ref={ghost} className={w.dragGhost} aria-hidden="true">
        {STICKERS.map((s) => (
          <span key={s.id} data-ghost={s.id}>
            <StickerArt id={s.id} size={68} />
          </span>
        ))}
      </div>

      {/* the composer */}
      {step === "compose" && draft && (
        <div className={w.scrim} onPointerDown={(e) => e.target === e.currentTarget && setStep("place")}>
          <div className={w.composer} role="dialog" aria-modal="true" aria-labelledby="compose-title" onKeyDown={(e) => e.key === "Escape" && setStep("place")}>
            <h2 id="compose-title" className={w.composeTitle}>What would you like to say?</h2>
            <div className={w.composeGrid}>
              <div className={w.composeFields}>
                <SideEyeEditor value={message} onChange={setMessage} max={LIMITS.message} label="Message" placeholder="Say hi, share a thought…" autoFocus />
                <SideEyeEditor value={name} onChange={setName} max={LIMITS.name} label="Your name" placeholder="Name or nickname" multiline={false} />
                {/* spam trap: hidden from people, filled in by bots */}
                <input className={w.honey} tabIndex={-1} autoComplete="off" aria-hidden="true" value={honey} onChange={(e) => setHoney(e.target.value)} name="website" />
                {flagged && <SideEyeMonkey />}
                {captcha && siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-callback="__wallCaptcha" data-theme="dark" />}
                {error && <p className={w.error} role="alert">{error}</p>}
              </div>
              <div className={w.preview} aria-label="Preview">
                <span className={w.previewLabel}>Preview</span>
                <div style={{ transform: `rotate(${draft.rotation}deg)` }}>
                  <NoteCard sticker={draft.sticker} message={safeMessage} name={safeName} ghost={!message} />
                </div>
              </div>
            </div>
            <div className={w.composeActions}>
              <button type="button" className={w.btnDark} onClick={() => setStep("place")}>Change sticker</button>
              <button type="button" className={w.btnDark} onClick={() => setStep("place")}>Reposition</button>
              <button type="button" className={w.btnDark} onClick={cancel}>Cancel</button>
              <button type="button" className={w.btnPrimary} onClick={submit} disabled={!valid || busy}>
                {busy ? "Sending…" : "Add your sticker"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
