"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { respond } from "@/lib/ask/match";
import { SUGGESTED, topicById, type Topic } from "@/lib/ask/faq";
import SwagGlasses from "./SwagGlasses";
import { preloadUiSounds, uiSound } from "@/lib/sound/ui";

import { contact } from "@/lib/site/content";
import a from "./ask.module.css";


type Msg = { role: "user" | "assistant"; content: string; off?: { gif: string | null; line: string }; links?: Topic["links"]; next?: string[]; topic?: string };

const SUGGESTIONS = SUGGESTED.map((id) => topicById(id)!.q);
/** off-topic answers: a "nope" GIF (shuffled) and a line (shuffled) */
const NOPE_QUERIES = ["sus", "suspicious", "angry", "nope", "nope nope nope", "side eye", "really"];
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
 * "Ask Nishanth": the face sticker in the bottom-right corner slides in a panel where
 * visitors ask about Nishanth. No AI and no server: questions are matched to
 * the topics in lib/ask/faq.ts (written from the site's own content), so the
 * answers are instant, free and always the same. Every answer offers follow-up
 * questions; anything unrelated gets a "nope" GIF.
 */
export default function AskPanel({ face }: { face: string | null }) {
  const [swag, setSwag] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(preloadUiSounds, 2500);
    return () => window.clearTimeout(t);
  }, []);
  /*
   * The tooltip, as chat messages:
   *  · hover (or keyboard focus): "Nishanth is typing…" for a moment, then "Hey! 👋" and
   *    "Curious about a project? Ask me anything." pop in one after the other
   *  · now and then, when nobody is near the sticker: a quick "psst… got a question?"
   */
  const [talk, setTalk] = useState<"off" | "typing" | "msgs">("off");
  const [nudge, setNudge] = useState(false);
  const [wave, setWave] = useState(false);
  const near = useRef(false);
  const talkTimer = useRef(0);
  const startTalk = () => {
    near.current = true;
    setNudge(false);
    window.clearTimeout(talkTimer.current);
    setTalk("typing");
    talkTimer.current = window.setTimeout(() => setTalk("msgs"), 900);
  };
  const stopTalk = () => {
    near.current = false;
    window.clearTimeout(talkTimer.current);
    setTalk("off");
  };
  useEffect(() => {
    let t = 0, first = true;
    const run = () => {
      const chatOpen = !!document.querySelector('[role="dialog"][aria-label="Ask about Nishanth"]');
      if (!near.current && !chatOpen && !document.hidden) {
        setNudge(true);
        if (first) setWave(true);
        first = false;
        t = window.setTimeout(() => {
          setNudge(false);
          setWave(false);
          t = window.setTimeout(run, 28000 + Math.random() * 14000);
        }, 4500);
      } else t = window.setTimeout(run, 10000);
    };
    t = window.setTimeout(run, 7000);
    return () => window.clearTimeout(t);
  }, []);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    uiSound("chat-close", true);
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
      uiSound(Math.random() < 0.5 ? "dexter" : "huh", true); // a meme sound for a silly question
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
  // after a project's answer, offer the plain-language version (until it's been given)
  const lastT = !busy && lastMsg?.role === "assistant" && lastMsg.topic ? topicById(lastMsg.topic) : undefined;
  if (lastT?.simple && lastMsg?.content !== lastT.simple) followUps.unshift("Explain it simply");

  return (
    <>
      <div className={`${a.sticker} ${open ? a.stickerHidden : ""} ${wave ? a.waving : ""} ${swag ? a.on : ""}`}>
        <span className={a.chatTip} aria-hidden="true">
          {talk !== "off" ? (
            <>
              <span className={a.who}>
                <i className={a.dotLive} />
                {talk === "typing" ? "Nishanth is typing…" : "Nishanth"}
              </span>
              {talk === "typing" ? (
                <span className={`${a.msg} ${a.typing}`}><i /><i /><i /></span>
              ) : (
                <>
                  <span className={`${a.msg} ${a.msgTop}`}>Hey! 👋</span>
                  <span className={`${a.msg} ${a.msgNext}`}>Curious about a project? Ask me anything.</span>
                </>
              )}
            </>
          ) : nudge ? (
            <>
              <span className={a.who}><i className={a.dotLive} />online</span>
              <span className={a.msg}>psst… got a question?</span>
            </>
          ) : null}
        </span>
        <button
          type="button"
          className={`${a.face} ${face ? "" : a.faceRound}`}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse") return;
            uiSound("swag");
            startTalk();
          }}
          onPointerLeave={(e) => e.pointerType === "mouse" && stopTalk()}
          onFocus={() => {
            preloadUiSounds();
            startTalk();
          }}
          onBlur={stopTalk}
          onClick={() => {
            // phones have no hover: the tap plays the pop-pop with the glasses, then (one sound at a time) the chat opens
            if (matchMedia("(hover: none)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
              uiSound("swag");
              setSwag(true);
              window.setTimeout(() => {
                setSwag(false);
                uiSound("chat-open");
                setOpen(true);
              }, 650);
            } else {
              uiSound("chat-open");
              setOpen(true);
            }
          }}
          aria-label="Talk to me: ask about Nishanth"
        >
          {face ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={face} alt="" width={260} height={394} />
              <SwagGlasses className={a.glasses} />
            </>
          ) : (
            <span className={a.initials} aria-hidden="true">NS</span>
          )}
        </button>
      </div>
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
                <p className={a.note}>
                  Answers come from Nishanth&apos;s portfolio. Want the real me?{" "}
                  <a className={a.wa} href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" /></svg>
                    Chat on WhatsApp
                  </a>
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
