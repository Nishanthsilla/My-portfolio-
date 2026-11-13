"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { findFlags } from "@/lib/wall/moderation";
import { DEFAULT_FONT, FONTS, FONTS_HREF } from "@/lib/wall/fonts";
import { COLORS, DEFAULT_COLOR, DEFAULT_SHAPE, SHAPES, paperOf } from "@/lib/wall/notes";
import { GIFS, StickerArt, stickerById } from "@/lib/wall/stickers";
import { LIMITS, type PublicNote } from "@/lib/wall/types";
import { addMine, loadDraft, loadLayout, loadMine, pruneMine, saveDraft, saveLayout, type MyNote, type Spot } from "@/lib/wall/local";
import ElasticSticker from "./ElasticSticker";
import NoteCard from "./NoteCard";
import SideEyeEditor from "./SideEyeEditor";
import SideEyeMonkey from "./SideEyeMonkey";
import w from "./wall.module.css";

type Mode = "loading" | "sqlite" | "postgres" | "unconfigured" | "offline";
type Step = "browse" | "compose" | "sent";
type Draft = { sticker: string; font: string; shape: string; color: string; x: number; y: number; rotation: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** the canvas, in px — bigger than any screen, so there's always room to stick another note */
const WORLD = { w: 2000, h: 1300 };

/** Decoration only (no messages), so the wall never looks empty — these can be moved around too. */
const DECOR: { id: string; x: number; y: number; r: number; s: number }[] = [
  { id: "sparkles", x: 0.3, y: 0.38, r: 0, s: 32 },
  { id: "gif-rainbow", x: 0.5, y: 0.3, r: -8, s: 54 },
  { id: "star", x: 0.68, y: 0.34, r: 12, s: 38 },
  { id: "blossom", x: 0.66, y: 0.68, r: -10, s: 40 },
  { id: "gif-wave", x: 0.42, y: 0.7, r: 10, s: 48 },
  { id: "coffee", x: 0.31, y: 0.62, r: 8, s: 38 },
  { id: "gif-sparkles", x: 0.14, y: 0.2, r: 0, s: 40 },
  { id: "gif-heart", x: 0.86, y: 0.22, r: 8, s: 44 },
  { id: "gif-rocket", x: 0.12, y: 0.78, r: -12, s: 46 },
  { id: "gif-party", x: 0.88, y: 0.8, r: 6, s: 46 },
  { id: "sunflower", x: 0.52, y: 0.1, r: -6, s: 36 },
  { id: "camera", x: 0.5, y: 0.9, r: 8, s: 36 },
];
/** Nishanth's own pinned note (his words from the brief), clearly labelled. */
const PINNED = { id: "pinned", sticker: "gif-heart", font: "scribble", shape: "square", color: "yellow", message: "A thought, a note, or just a little sticker. I'd love to see what you leave.", name: "Nishanth", x: 0.4, y: 0.44, rotation: -4 };

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
  const [tab, setTab] = useState<"animated" | "gifs">("animated");
  const [gifsOn, setGifsOn] = useState(false); // GIPHY search is available (server has a key)
  const [gifQ, setGifQ] = useState("");
  const [gifs, setGifs] = useState<{ id: string; title: string; src: string }[]>([]);
  const [panel, setPanel] = useState<"sticker" | "font" | "note" | null>(null);
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

  /* ---------- the canvas: bigger than the screen; drag (or, full screen, scroll) to look around ---------- */
  const pan = useRef({ x: 0, y: 0 });
  // zoomed out a little in the homepage scene (and on phones), so more notes fit in view
  const zoom = useRef(1);
  const applyPan = useCallback(() => {
    const v = scroller.current, b = board.current;
    if (!v || !b) return;
    const p = pan.current, z = zoom.current;
    p.x = clamp(p.x, Math.min(0, v.clientWidth - WORLD.w * z), 0);
    p.y = clamp(p.y, Math.min(0, v.clientHeight - WORLD.h * z), 0);
    b.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${z})`;
  }, []);
  useEffect(() => {
    const v = scroller.current;
    if (!v) return;
    zoom.current = embedded ? 0.78 : v.clientWidth < 640 ? 0.82 : 1;
    // start in the middle of the wall
    pan.current = { x: (v.clientWidth - WORLD.w * zoom.current) / 2, y: (v.clientHeight - WORLD.h * zoom.current) / 2 };
    applyPan();
    const ro = new ResizeObserver(applyPan);
    ro.observe(v);
    // full screen: the wheel / trackpad moves around the canvas (embedded, it scrolls the page as usual)
    const wheel = (e: WheelEvent) => {
      if (embedded) return;
      e.preventDefault();
      pan.current.x -= e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      pan.current.y -= e.shiftKey && !e.deltaX ? 0 : e.deltaY;
      applyPan();
    };
    v.addEventListener("wheel", wheel, { passive: false });
    return () => {
      ro.disconnect();
      v.removeEventListener("wheel", wheel);
    };
  }, [embedded, applyPan]);
  const panDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-sticker-art], button, input, textarea, [data-nodrag]")) return;
    if (embedded && e.pointerType !== "mouse") return; // phones: the page swipes; "Explore canvas" opens it full screen
    const v = e.currentTarget;
    v.setPointerCapture(e.pointerId);
    v.dataset.panning = "";
    let lx = e.clientX, ly = e.clientY, lt = performance.now(), vx = 0, vy = 0;
    const move = (ev: PointerEvent) => {
      const now = performance.now(), dt = Math.max(8, now - lt);
      const dx = ev.clientX - lx, dy = ev.clientY - ly;
      vx = dx / dt;
      vy = dy / dt;
      lx = ev.clientX;
      ly = ev.clientY;
      lt = now;
      pan.current.x += dx;
      pan.current.y += dy;
      applyPan();
    };
    const up = () => {
      v.removeEventListener("pointermove", move);
      v.removeEventListener("pointerup", up);
      v.removeEventListener("pointercancel", up);
      delete v.dataset.panning;
      // a little glide after letting go
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const glide = () => {
        vx *= 0.92;
        vy *= 0.92;
        if (Math.abs(vx) + Math.abs(vy) < 0.02) return;
        pan.current.x += vx * 16;
        pan.current.y += vy * 16;
        applyPan();
        requestAnimationFrame(glide);
      };
      requestAnimationFrame(glide);
    };
    v.addEventListener("pointermove", move);
    v.addEventListener("pointerup", up);
    v.addEventListener("pointercancel", up);
  };

  // GIF search (GIPHY, through our server): trending first, then whatever is typed
  useEffect(() => {
    if (!gifsOn || tab !== "gifs" || panel !== "sticker") return;
    let alive = true;
    const t = setTimeout(() => {
      fetch(`/api/wall/gifs?q=${encodeURIComponent(gifQ)}`)
        .then((r) => (r.ok ? r.json() : { gifs: [] }))
        .then((d: { gifs: { id: string; title: string; src: string }[] }) => alive && setGifs(d.gifs ?? []))
        .catch(() => alive && setGifs([]));
    }, gifQ ? 350 : 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [gifsOn, tab, panel, gifQ]);

  // load the approved notes; if there is no server (offline copy), say so
  useEffect(() => {
    let alive = true;
    fetch("/api/wall", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { mode: Mode; notes: PublicNote[]; captcha?: boolean; gifs?: boolean }) => {
        if (!alive) return;
        setMode(d.mode);
        setGifsOn(!!d.gifs);
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
      setDraft({ ...saved.draft, font: saved.draft.font ?? DEFAULT_FONT, shape: saved.draft.shape ?? DEFAULT_SHAPE, color: saved.draft.color ?? DEFAULT_COLOR });
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
    const v = scroller.current;
    if (!v) return { x: 0.5, y: 0.45 };
    // the middle of what's in view, a little high (the composer sits at the bottom)
    const z = zoom.current;
    return { x: clamp((v.clientWidth / 2 - pan.current.x) / (WORLD.w * z), 0.05, 0.95), y: clamp((v.clientHeight * 0.36 - pan.current.y) / (WORLD.h * z), 0.05, 0.95) };
  };
  const start = () => {
    if (embedded && onCompose) return onCompose();
    setError("");
    setDraft((d) => d ?? { sticker: "gif-wave", font: DEFAULT_FONT, shape: DEFAULT_SHAPE, color: DEFAULT_COLOR, rotation: Math.round((Math.random() - 0.5) * 10), ...visibleSpot() });
    setStartedAt((t) => t || Date.now());
    setStep("compose");
  };
  const setSticker = (id: string) => setDraft((d) => (d ? { ...d, sticker: id } : d));
  const setFont = (id: string) => setDraft((d) => (d ? { ...d, font: id } : d));
  const setShape = (id: string) => setDraft((d) => (d ? { ...d, shape: id } : d));
  const setColor = (id: string) => setDraft((d) => (d ? { ...d, color: id } : d));

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
  

  return (
    <div className={`${w.wall} ${embedded ? w.wallEmbedded : ""}`}>
      {/* floating controls only — the canvas is the whole thing */}
      {embedded ? (
        <button type="button" className={w.fabExpand} onClick={onExpand} aria-label="Explore the wall full screen" title="Explore the wall">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
          </svg>
        </button>
      ) : (
        <>
          <button type="button" className={w.fabBack} onClick={close}>
            <span aria-hidden="true">←</span> Back to portfolio
          </button>
          {(mode === "offline" || mode === "unconfigured") && <p className={w.fabNote}>Posting isn&apos;t connected here yet</p>}
          {step === "browse" && (
            <div className={w.fabBar}>
              <span className={w.fabHint}>Drag to look around · pick up any sticker to move it</span>
              {moved && (
                <button type="button" className={w.btnLink} onClick={resetLayout} title="Put every sticker back where its writer left it">
                  Reset
                </button>
              )}
              <button type="button" className={w.btnPrimary} onClick={start}>
                Add a note
              </button>
            </div>
          )}
        </>
      )}

      <div ref={scroller} className={w.scroller} onPointerDown={panDown}>
        <div ref={board} className={w.board} style={{ width: WORLD.w, height: WORLD.h }} aria-label="The wall">
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
                <NoteCard sticker={PINNED.sticker} font={PINNED.font} shape={PINNED.shape} color={PINNED.color} message={PINNED.message} name={PINNED.name} />
              </ElasticSticker>
            );
          })()}

          {shown.map((n) => {
            const p = spot(n.id, n.x, n.y);
            return (
              <ElasticSticker key={n.id} board={board} x={p.x} y={p.y} z={p.z} rotation={n.rotation} onMove={moveTo(n.id)} label={`Note from ${n.name}: ${n.message}`} className={w.placed}>
                <NoteCard sticker={n.sticker} font={n.font} shape={n.shape} color={n.color} message={n.message} name={n.name} />
                <button type="button" data-nodrag className={w.report} onClick={() => report(n.id)} aria-label={`Report the note from ${n.name}`}>
                  Report
                </button>
              </ElasticSticker>
            );
          })}

          {mine.map((n) => {
            const p = spot(n.id, n.x, n.y);
            return (
              <ElasticSticker key={n.id} board={board} x={p.x} y={p.y} z={p.z} rotation={n.rotation} onMove={moveTo(n.id)} label={`Your note: ${n.message}`} className={w.placed}>
                <NoteCard sticker={n.sticker} font={n.font} shape={n.shape} color={n.color} message={n.message} name={n.name} />
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
              <NoteCard sticker={draft.sticker} font={draft.font} shape={draft.shape} color={draft.color} message={safeMessage} name={safeName} ghost={!message} />
              <span className={w.draftHint} aria-hidden="true">Drag me anywhere</span>
            </ElasticSticker>
          )}
        </div>
      </div>


      {step === "sent" && (
        <div className={w.sent} role="status">
          <StickerArt id="gif-party" size={72} />
          <h2>Stuck it on the wall!</h2>
          <p>
            {mode === "offline"
              ? "Thanks for leaving a little something! This copy of the site isn't connected, so it's saved on this device only."
              : "Thanks for leaving a little something — it means a lot."}
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
                <button type="button" role="tab" aria-selected={tab === "animated"} className={w.tab} onClick={() => setTab("animated")}>Animated</button>
                {gifsOn && <button type="button" role="tab" aria-selected={tab === "gifs"} className={w.tab} onClick={() => setTab("gifs")}>GIFs</button>}
              </div>
              {tab === "gifs" && gifsOn ? (
                <>
                  <input className={w.gifSearch} type="search" placeholder="Search GIFs" value={gifQ} onChange={(e) => setGifQ(e.target.value.slice(0, 50))} aria-label="Search GIFs" />
                  <div className={w.tray} role="listbox" aria-label="GIFs" aria-orientation="horizontal">
                    {gifs.map((g) => (
                      <button key={g.id} type="button" role="option" aria-selected={draft.sticker === g.id} className={`${w.trayItem} ${w.gifItem}`} title={g.title} aria-label={g.title} onClick={() => setSticker(g.id)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.src} alt="" loading="lazy" draggable={false} />
                      </button>
                    ))}
                    {!gifs.length && <span className={w.gifEmpty}>{gifQ ? "No GIFs for that — try another word." : "Loading…"}</span>}
                  </div>
                  <p className={w.giphyCredit}>Powered by GIPHY</p>
                </>
              ) : (
                <div className={w.tray} role="listbox" aria-label="Animated stickers" aria-orientation="horizontal">
                  {GIFS.map((s) => (
                    <button key={s.id} type="button" role="option" aria-selected={draft.sticker === s.id} className={w.trayItem} title={s.label} aria-label={s.label} onClick={() => setSticker(s.id)}>
                      <StickerArt id={s.id} size={36} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {panel === "note" && (
            <div className={w.pop}>
              <div className={w.shapes} role="radiogroup" aria-label="Note shape">
                {SHAPES.map((sh) => (
                  <button key={sh.id} type="button" role="radio" aria-checked={draft.shape === sh.id} className={w.shapeChip} data-shape={sh.id} onClick={() => setShape(sh.id)} style={{ ["--paper" as string]: paperOf(draft.color) }}>
                    <i />
                    {sh.label}
                  </button>
                ))}
              </div>
              <div className={w.swatches} role="radiogroup" aria-label="Note colour">
                {COLORS.map((co) => (
                  <button key={co.id} type="button" role="radio" aria-checked={draft.color === co.id} aria-label={co.label} title={co.label} className={w.swatch} onClick={() => setColor(co.id)} style={{ ["--paper" as string]: co.paper }} />
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
              <button type="button" className={w.tool} aria-expanded={panel === "note"} onClick={() => setPanel((p) => (p === "note" ? null : "note"))} aria-label="Choose the note's shape and colour" title="Note">
                <span className={w.toolSwatch} style={{ ["--paper" as string]: paperOf(draft.color) }} />
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
