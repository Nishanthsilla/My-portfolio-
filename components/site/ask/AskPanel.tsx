"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { respond } from "@/lib/ask/match";
import { SUGGESTED, topicById, type Topic } from "@/lib/ask/faq";
import a from "./ask.module.css";

type Msg = { role: "user" | "assistant"; content: string; off?: { gif: string | null; line: string }; links?: Topic["links"]; next?: string[]; topic?: string };

const SUGGESTIONS = SUGGESTED.map((id) => topicById(id)!.q);
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
 * "Ask Nishanth": a sparkle button in the navbar slides in a panel where
 * visitors ask about Nishanth. No AI and no server: questions are matched to
 * the topics in lib/ask/faq.ts (written from the site's own content), so the
 * answers are instant, free and always the same. Every answer offers follow-up
 * questions; anything unrelated gets a "nope" GIF.
 */
export default function AskPanel() {
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
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });
  const field = useRef<HTMLTextAreaElement>(null);


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

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const ask = async (q: string) => {
    const question = q.trim().slice(0, 400);
    if (!question || busy) return;
    setInput("");
    const lastTopic = [...msgs].reverse().find((m) => m.topic)?.topic;
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    const reply = respond(question, lastTopic);
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reply.kind === "off") {
      const [gif] = await Promise.all([nopeGif(), wait(calm ? 0 : 650)]);
      setMsgs((m) => [...m, { role: "assistant", content: "", off: { gif, line: pick(NOPE_LINES) }, next: reply.next }]);
      setBusy(false);
      return;
    }
    // a short "typing" pause, then the answer appears word by word
    await wait(calm ? 0 : 550 + Math.min(500, reply.text.length * 2));
    const words = reply.text.split(/(\s+)/);
    setMsgs((m) => [...m, { role: "assistant", content: calm ? reply.text : "", topic: reply.topic }]);
    if (!calm) {
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join("");
        setMsgs((m) => m.map((x, k) => (k === m.length - 1 ? { ...x, content: x.content + chunk } : x)));
        await wait(18);
      }
    }
    setMsgs((m) => m.map((x, k) => (k === m.length - 1 ? { ...x, links: reply.links, next: reply.next } : x)));
    setBusy(false);
  };

  // follow-up questions under the latest answer (not ones already asked)
  const asked = new Set(msgs.filter((m) => m.role === "user").map((m) => m.content));
  const lastMsg = msgs[msgs.length - 1];
  const followUps = !busy && lastMsg?.role === "assistant" ? (lastMsg.next ?? []).map((id) => topicById(id)?.q).filter((q): q is string => !!q && !asked.has(q)) : [];

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
                        <button key={s} type="button" className={a.suggestion} onClick={() => ask(s)}>
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
                        {m.links?.length ? (
                          <div className={a.links}>
                            {m.links.map((l) => (
                              <a key={l.href} href={l.href} className={a.link} {...(l.href.startsWith("http") || l.href.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={() => !l.href.startsWith("mailto:") && close()}>
                                {l.label} <span aria-hidden="true">↗</span>
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ),
                  )
                )}
                {followUps.length > 0 && (
                  <div className={a.followUps} aria-label="Ask next">
                    {followUps.map((f) => (
                      <button key={f} type="button" className={a.followUp} onClick={() => ask(f)}>
                        {f}
                      </button>
                    ))}
                  </div>
                )}
                {busy && (msgs[msgs.length - 1]?.role === "user") && (
                  <span className={a.dots} aria-label="Thinking"><i /><i /><i /></span>
                )}
              </div>
              <div className={a.bottom}>
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
                  />
                  <button type="submit" className={a.send} disabled={!input.trim() || busy} aria-label="Ask">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                  </button>
                </form>
                <p className={a.note}>Answers come straight from Nishanth&apos;s portfolio.</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
