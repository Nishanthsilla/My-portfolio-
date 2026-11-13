"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import a from "./ask.module.css";

type Msg = { role: "user" | "assistant"; content: string; off?: { gif: string | null; line: string } };

const SUGGESTIONS = [
  "What does Nishanth design?",
  "Which of his projects should I explore first?",
  "How does he design for AI agents?",
];
/** off-topic answers: a "nope" GIF (shuffled) and a line (shuffled) */
const NOPE_QUERIES = ["nope", "i don't know", "no idea", "shrug", "not my department", "nope nope nope", "confused"];
const NOPE_LINES = [
  "Nope — I only know about Nishanth.",
  "That's outside my brain. Ask me about Nishanth!",
  "No idea, honestly. I'm here for Nishanth questions.",
  "Not my department. Try asking about his work.",
];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** A shuffled pool of "nope" GIFs, fetched once when the panel opens so one is ready instantly. */
let pool: string[] = [];
async function fillPool() {
  if (pool.length > 8) return;
  const queries = [...NOPE_QUERIES].sort(() => Math.random() - 0.5).slice(0, 3);
  const found = await Promise.all(
    queries.map((q) =>
      fetch(`/api/wall/gifs?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { gifs: [] }))
        .then((d: { gifs: { src: string }[] }) => (d.gifs ?? []).slice(0, 10).map((g) => g.src))
        .catch(() => [] as string[]),
    ),
  );
  pool = [...new Set([...pool, ...found.flat()])].sort(() => Math.random() - 0.5);
}
async function nopeGif(): Promise<string | null> {
  if (!pool.length) await fillPool();
  return pool.length ? pool.splice(Math.floor(Math.random() * pool.length), 1)[0] : null;
}

/**
 * "Ask Nishanth": a sparkle button in the navbar opens a panel where visitors
 * ask about Nishanth. Answers come from the site's own content; anything else
 * gets a "nope" GIF. Hidden entirely until the assistant is switched on.
 */
export default function AskPanel() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setOpen(false);
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };
  const [remaining, setRemaining] = useState(6);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/ask", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { enabled: boolean; remaining: number } | null) => {
        if (!d) return;
        setEnabled(d.enabled);
        setRemaining(d.remaining);
      })
      .catch(() => {});
  }, []);

  // open: lock the page, focus the field; Escape closes
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const t = setTimeout(() => field.current?.focus(), 60);
    void fillPool();
    const key = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    addEventListener("keydown", key);
    return () => {
      html.style.overflow = prev;
      clearTimeout(t);
      removeEventListener("keydown", key);
    };
  }, [open]);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (q: string) => {
    const question = q.trim().slice(0, 400);
    if (!question || busy || remaining <= 0) return;
    setError("");
    setInput("");
    const history = msgs.filter((m) => !m.off).map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: question }] }),
      });
      if (!res.ok || !res.body) {
        const d = (await res.json().catch(() => ({}))) as { error?: string; remaining?: number };
        if (typeof d.remaining === "number") setRemaining(d.remaining);
        setError(d.error || "Couldn't answer that just now — please try again.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let carry = "";
      let started = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        carry += dec.decode(value, { stream: true });
        const lines = carry.split("\n");
        carry = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as { t: string; v?: string; remaining?: number };
          if (ev.t === "text" && ev.v) {
            if (!started) {
              started = true;
              setMsgs((m) => [...m, { role: "assistant", content: ev.v! }]);
            } else setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content: x.content + ev.v } : x)));
          } else if (ev.t === "off") {
            const gif = await nopeGif();
            setMsgs((m) => [...m, { role: "assistant", content: "", off: { gif, line: pick(NOPE_LINES) } }]);
            started = true;
          } else if (ev.t === "done" && typeof ev.remaining === "number") setRemaining(ev.remaining);
          else if (ev.t === "error") setError(ev.v || "Couldn't answer that just now.");
        }
      }
    } catch {
      setError("Couldn't reach the assistant — please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) return null;

  return (
    <>
      <button type="button" className={a.trigger} onClick={() => setOpen(true)} aria-label="Ask about Nishanth" title="Ask about Nishanth">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5 4.6-.5 7-2.9 7.5-7.5Z" />
          <path d="M19 15.5c.2 1.8 1 2.6 2.8 2.8-1.8.2-2.6 1-2.8 2.8-.2-1.8-1-2.6-2.8-2.8 1.8-.2 2.6-1 2.8-2.8Z" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div className={`${a.layer} ${closing ? a.closing : ""}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
            <div className={a.panel} role="dialog" aria-modal="true" aria-label="Ask about Nishanth">
              <button type="button" className={a.close} onClick={close} aria-label="Close">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <div ref={list} className={a.list} aria-live="polite">
                {msgs.length === 0 ? (
                  <div className={a.empty}>
                    <h2 className={a.hello}>
                      Hi there!
                      <br />
                      Ask anything about Nishanth
                    </h2>
                    <div className={a.suggestions}>
                      {SUGGESTIONS.map((s) => (
                        <button key={s} type="button" className={a.suggestion} onClick={() => ask(s)} disabled={remaining <= 0}>
                          <span aria-hidden="true">→</span> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  msgs.map((m, i) =>
                    m.role === "user" ? (
                      <p key={i} className={a.q}>{m.content}</p>
                    ) : m.off ? (
                      <div key={i} className={a.nope}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {m.off.gif && <img src={m.off.gif} alt="A “nope, no idea” GIF" />}
                        <p>{m.off.line}</p>
                      </div>
                    ) : (
                      <div key={i} className={a.answer}>
                        {m.content.split(/\n{2,}/).map((p, j) => <p key={j}>{p}</p>)}
                      </div>
                    ),
                  )
                )}
                {busy && (msgs[msgs.length - 1]?.role === "user") && (
                  <span className={a.dots} aria-label="Thinking"><i /><i /><i /></span>
                )}
                {error && <p className={a.error} role="alert">{error}</p>}
              </div>
              <div className={a.bottom}>
                <p className={a.count}>
                  {remaining > 0 ? <>Questions available: {remaining}</> : <>No questions left today · email Nishanth anytime</>}
                </p>
                <form
                  className={a.bar}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void ask(input);
                  }}
                >
                  <textarea
                    ref={field}
                    className={a.field}
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, 400))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void ask(input);
                      }
                    }}
                    placeholder="Ask about Nishanth…"
                    rows={1}
                    aria-label="Your question"
                    disabled={remaining <= 0}
                  />
                  <button type="submit" className={a.send} disabled={!input.trim() || busy || remaining <= 0} aria-label="Ask">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                  </button>
                </form>
                <p className={a.note}>Answers are written by AI from Nishanth&apos;s portfolio and can be wrong.</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
