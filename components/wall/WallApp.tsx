"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { findFlags } from "@/lib/wall/moderation";
import { DEFAULT_FONT, FONTS, FONTS_HREF } from "@/lib/wall/fonts";
import { GIFS, STICKERS, StickerArt, stickerById } from "@/lib/wall/stickers";
import { LIMITS, type PublicNote } from "@/lib/wall/types";
import { addMine, loadDraft, loadLayout, loadMine, pruneMine, saveDraft, saveLayout, type MyNote, type Spot } from "@/lib/wall/local";
import ElasticSticker from "./ElasticSticker";
import NoteCard from "./NoteCard";
import SideEyeEditor from "./SideEyeEditor";
import SideEyeMonkey from "./SideEyeMonkey";
import w from "./wall.module.css";

type Mode = "loading" | "sqlite" | "postgres" | "unconfigured" | "offline";
type Step = "browse" | "compose" | "sent";
type Draft = { sticker: string; font: string; x: number; y: number; rotation: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Decoration only (no messages), so the wall never looks empty — these can be moved around too. */
const DECOR: { id: string; x: number; y: number; r: number; s: number }[] = [
  { id: "sparkles", x: 0.08, y: 0.34, r: 0, s: 38 },
  { id: "gif-rainbow", x: 0.5, y: 0.07, r: -8, s: 64 },
  { id: "star", x: 0.92, y: 0.12, r: 12, s: 46 },
  { id: "blossom", x: 0.88, y: 0.82, r: -10, s: 48 },
  { id: "gif-wave", x: 0.3, y: 0.88, r: 10, s: 58 },
  { id: "sparkles", x: 0.66, y: 0.56, r: 0, s: 28 },
  { id: "coffee", x: 0.05, y: 0.78, r: 8, s: 46 },
];
/** Nishanth's own pinned note (his words from the brief), clearly labelled. */
const PINNED = { id: "pinned", sticker: "gif-heart", font: "scribble", message: "A thought, a note, or just a little sticker. I'd love to see what you leave.", name: "Nishanth", x: 0.22, y: 0.2, rotation: -4 };

/**
 * The Wall. On the homepage it lives in its own scene (embedded) and opens full
 * screen over the page (onClose = back to exactly where the visitor was); at
 * /wall it is its own page.
 *
 * Every note is a "HELLO" name-tag sticker. Anyone can pick up any sticker and
 * move it (an elastic drag), but that arrangement is theirs alone — kept on
 * this device. A new note is posted where its writer drops it.
 */
export default function WallApp({
  onClose,
  compose = false,
  embedded = false,
  onExpand,
  onCompose,
}: {
  onClose?: () => void;
  compose?: boolean;
  /** inside the homepage journey (scene 4): fits its scene, doesn't lock the page */
  embedded?: boolean;
  onExpand?: () => void;
  /** embedded: "Add a note" opens the full-screen wall with the composer */
  onCompose?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [captcha, setCaptcha] = useState(false);
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [step, setStep] = useState<Step>("browse");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [tab, setTab] = useState<"gifs" | "emoji">("gifs");
  const [panel, setPanel] = useState<"sticker" | "font" | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [honey, setHoney] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fromCompose = useSyncExternalStore(() => () => {}, () => compose || !!new URLSearchParams(location.search).get("compose"), () => compose);
  const [mine, setMine] = useState<MyNote[]>([]);
  const [layout, setLayout] = useState<Record<string, Spot>>({});
  const [restored, setRestored] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);

  // the handwriting fonts (Google Fonts), loaded only where the wall is
  useEffect(() => {
    if (document.querySelector("link[data-wall-fonts]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONTS_HREF;
    l.dataset.wallFonts = "";
    document.head.appendChild(l);
  }, []);

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
    setLayout(loadLayout());
    if (saved?.draft && !embedded) {
      setDraft({ ...saved.draft, font: saved.draft.font ?? DEFAULT_FONT });
      setMessage(saved.message);
      setName(saved.name);
      setStep("compose");
    }
    setRestored(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!restored) return;
    if (embedded) return; // only the full-screen wall writes the draft
    if (draft && step === "compose") saveDraft({ draft, message, name, step });
    else saveDraft(null);
  }, [restored, embedded, draft, message, name, step]);

  // no page scrolling behind the full-screen wall
  useEffect(() => {
    if (embedded) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [embedded]);

  const close = () => {
    if (onClose) return onClose();
    if (document.referrer.startsWith(location.origin) && history.length > 1) router.back();
    else router.push("/");
  };

  /* ---------- the visitor's own arrangement (this device only) ---------- */
  const spot = (id: string, x: number, y: number) => layout[id] ?? { x, y, z: 1 };
  const moveTo = (id: string) => (x: number, y: number) =>
    setLayout((l) => {
      const top = Object.values(l).reduce((m, v) => Math.max(m, v.z), 1);
      const next = { ...l, [id]: { x, y, z: top + 1 } };
      saveLayout(next);
      return next;
    });
  const resetLayout = () => {
    setLayout({});
    saveLayout(null);
  };

  /* ---------- writing a note ---------- */
  const visibleSpot = () => {
    const sc = scroller.current, b = board.current;
    if (!sc || !b) return { x: 0.5, y: 0.4 };
    // a little above the middle of what's in view (the composer sits at the bottom)
    return { x: 0.5, y: clamp((sc.scrollTop + sc.clientHeight * 0.32) / b.offsetHeight, 0.12, 0.9) };
  };
  const start = () => {
    if (embedded && onCompose) return onCompose();
    setError("");
    setDraft((d) => d ?? { sticker: "gif-wave", font: DEFAULT_FONT, rotation: Math.round((Math.random() - 0.5) * 10), ...visibleSpot() });
    setStartedAt((t) => t || Date.now());
    setStep("compose");
  };
  const setSticker = (id: string) => setDraft((d) => (d ? { ...d, sticker: id } : d));
  const setFont = (id: string) => setDraft((d) => (d ? { ...d, font: id } : d));

  // arriving via "Leave a note" (or from the homepage scene): open the composer straight away
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!restored || autoStarted.current || !fromCompose || embedded) return;
    autoStarted.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restored, fromCompose, embedded]);

  /* ---------- composing ---------- */
  const cancel = useCallback(() => {
    setDraft(null);
    setPanel(null);
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
        setPanel(null);
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
        setPanel(null);
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
  const moved = Object.keys(layout).length > 0;
  const tray = tab === "gifs" ? GIFS : STICKERS;

  return (
    <div className={`${w.wall} ${embedded ? w.wallEmbedded : ""}`}>
      <header className={w.bar}>
        <div>
          <h1 className={w.barTitle}>The Wall</h1>
          <p className={w.barSub}>
            {mode === "loading" ? "Loading…" : mode === "offline" || mode === "unconfigured" ? "Posting isn't connected here yet" : `${shown.length} ${shown.length === 1 ? "note" : "notes"} · new notes appear once approved`}
          </p>
        </div>
        <div className={w.barActions}>
          {moved && step !== "compose" && (
            <button type="button" className={w.btnLink} onClick={resetLayout} title="Put every sticker back where its writer left it">
              Reset layout
            </button>
          )}
          {step !== "compose" && (
            <button type="button" className={w.btnPrimary} onClick={start}>
              Add a note
            </button>
          )}
          {embedded ? (
            <button type="button" className={w.expand} onClick={onExpand} aria-label="Open the wall full screen">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
              </svg>
            </button>
          ) : (
            <button type="button" className={w.close} onClick={close} aria-label="Close the wall">
              ×
            </button>
          )}
        </div>
      </header>

      <div ref={scroller} className={w.scroller}>
        <div ref={board} className={w.board} aria-label="The wall">
          {DECOR.map((d, i) => {
            const id = `decor-${i}`, p = spot(id, d.x, d.y);
            return (
              <ElasticSticker key={id} board={board} x={p.x} y={p.y} z={p.z} rotation={d.r} onMove={moveTo(id)} label={stickerById(d.id)?.label ?? "Sticker"} className={`${w.placed} ${w.decor}`}>
                <StickerArt id={d.id} size={d.s} />
              </ElasticSticker>
            );
          })}

          {(() => {
            const p = spot(PINNED.id, PINNED.x, PINNED.y);
            return (
              <ElasticSticker board={board} x={p.x} y={p.y} z={p.z} rotation={PINNED.rotation} onMove={moveTo(PINNED.id)} label="Pinned note from Nishanth" className={w.placed}>
                <NoteCard sticker={PINNED.sticker} font={PINNED.font} message={PINNED.message} name={PINNED.name} tag="Pinned · from Nishanth" />
              </ElasticSticker>
            );
          })()}

          {shown.map((n) => {
            const p = spot(n.id, n.x, n.y);
            return (
              <ElasticSticker key={n.id} board={board} x={p.x} y={p.y} z={p.z} rotation={n.rotation} onMove={moveTo(n.id)} label={`Note from ${n.name}: ${n.message}`} className={w.placed}>
                <NoteCard sticker={n.sticker} font={n.font} message={n.message} name={n.name} />
                <button type="button" data-nodrag className={w.report} onClick={() => report(n.id)} aria-label={`Report the note from ${n.name}`}>
                  Report
                </button>
              </ElasticSticker>
            );
          })}

          {mine.map((n) => {
            const p = spot(n.id, n.x, n.y);
            return (
              <ElasticSticker key={n.id} board={board} x={p.x} y={p.y} z={p.z} rotation={n.rotation} onMove={moveTo(n.id)} label={`Your note: ${n.message}`} className={`${w.placed} ${w.mine}`}>
                <NoteCard sticker={n.sticker} font={n.font} message={n.message} name={n.name} tag={n.local ? "Saved on this device · not sent" : "Waiting for approval · only you see this"} />
              </ElasticSticker>
            );
          })}

          {mode !== "loading" && shown.length === 0 && mine.length === 0 && step === "browse" && (
            <p className={w.empty}>Nothing here yet from visitors — be the first to leave something.</p>
          )}

          {draft && step === "compose" && (
            <ElasticSticker
              board={board}
              x={draft.x}
              y={draft.y}
              z={2000}
              rotation={draft.rotation}
              onMove={(x, y) => setDraft((d) => (d ? { ...d, x, y } : d))}
              label={`Your note${st ? ` with ${st.label}` : ""} — it will be posted where you leave it`}
              className={`${w.placed} ${w.draft}`}
            >
              <NoteCard sticker={draft.sticker} font={draft.font} message={safeMessage} name={safeName} ghost={!message} />
              <span className={w.draftHint} aria-hidden="true">Drag me anywhere</span>
            </ElasticSticker>
          )}
        </div>
      </div>

      {/* browsing: a quiet hint that everything moves */}
      {step === "browse" && !embedded && (
        <p className={w.moveHint}>Pick up any sticker and move it around — only you see your layout.</p>
      )}

      {step === "sent" && (
        <div className={w.sent} role="status">
          <StickerArt id="gif-party" size={72} />
          <h2>Your sticker is on its way.</h2>
          <p>
            {mode === "offline"
              ? "Thanks for leaving a little something! This copy of the site isn't connected, so it's saved on this device only."
              : "Thanks for leaving a little something! It'll appear on the wall for everyone once it's approved — until then, only you can see it."}
          </p>
          <button type="button" className={w.btnPrimary} onClick={() => setStep("browse")}>Back to the wall</button>
        </div>
      )}

      {/* the composer: a minimal prompt bar — words on top, a slim row of tools below */}
      {step === "compose" && draft && (
        <div className={w.prompt} role="dialog" aria-label="Write your note">
          {panel === "sticker" && (
            <div className={w.pop}>
              <div className={w.tabs} role="tablist" aria-label="Sticker type">
                <button type="button" role="tab" aria-selected={tab === "gifs"} className={w.tab} onClick={() => setTab("gifs")}>Animated</button>
                <button type="button" role="tab" aria-selected={tab === "emoji"} className={w.tab} onClick={() => setTab("emoji")}>Emoji</button>
              </div>
              <div className={w.tray} role="listbox" aria-label={tab === "gifs" ? "Animated stickers" : "Emoji stickers"} aria-orientation="horizontal">
                {tray.map((s) => (
                  <button key={s.id} type="button" role="option" aria-selected={draft.sticker === s.id} className={w.trayItem} title={s.label} aria-label={s.label} onClick={() => setSticker(s.id)}>
                    <StickerArt id={s.id} size={36} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {panel === "font" && (
            <div className={w.pop}>
              <div className={w.fonts} role="radiogroup" aria-label="Handwriting">
                {FONTS.map((f) => (
                  <button key={f.id} type="button" role="radio" aria-checked={draft.font === f.id} className={w.fontChip} onClick={() => setFont(f.id)} style={{ fontFamily: f.family, fontWeight: f.weight ?? 400, fontSize: 15 * f.scale }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(flagged || error) && (
            <div className={w.promptNotes}>
              {flagged && <SideEyeMonkey />}
              {error && <p className={w.error} role="alert">{error}</p>}
            </div>
          )}
          <div className={w.promptBox}>
            <SideEyeEditor bare value={message} onChange={setMessage} max={LIMITS.message} label="Message" placeholder="Write something…" autoFocus />
            <div className={w.promptRow}>
              <button type="button" className={w.tool} aria-expanded={panel === "sticker"} onClick={() => setPanel((p) => (p === "sticker" ? null : "sticker"))} aria-label="Choose a sticker" title="Sticker">
                <StickerArt id={draft.sticker} size={24} />
              </button>
              <button type="button" className={w.tool} aria-expanded={panel === "font"} onClick={() => setPanel((p) => (p === "font" ? null : "font"))} aria-label="Choose the handwriting" title="Font">
                <span style={{ fontFamily: FONTS.find((f) => f.id === draft.font)?.family, fontSize: 17 }}>Aa</span>
              </button>
              <div className={w.promptName}>
                <SideEyeEditor bare value={name} onChange={setName} max={LIMITS.name} label="Your name" placeholder="your name" multiline={false} />
              </div>
              <button type="button" className={w.toolGhost} onClick={cancel} aria-label="Cancel" title="Cancel">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <button type="button" className={w.send} onClick={submit} disabled={!valid || busy} aria-label={busy ? "Sending" : "Stick it on the wall"} title="Stick it on the wall">
                {busy ? (
                  <span className={w.spin} aria-hidden="true" />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                )}
              </button>
            </div>
          </div>
          {/* spam trap: hidden from people, filled in by bots */}
          <input className={w.honey} tabIndex={-1} autoComplete="off" aria-hidden="true" value={honey} onChange={(e) => setHoney(e.target.value)} name="website" />
          {captcha && siteKey && <div className="cf-turnstile" data-sitekey={siteKey} data-callback="__wallCaptcha" data-theme="light" />}
          <p className={w.promptHint}>Drag your note anywhere on the wall · stickers: Noto Emoji (CC BY 4.0)</p>
        </div>
      )}
    </div>
  );
}
