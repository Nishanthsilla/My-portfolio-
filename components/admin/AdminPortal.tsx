"use client";

import { useCallback, useEffect, useState } from "react";
import NoteCard from "@/components/wall/NoteCard";
import a from "@/components/wall/admin.module.css";
import type { NoteStatus, WallNote } from "@/lib/wall/types";
import { FONTS_HREF } from "@/lib/wall/fonts";
import AnalyticsPanel from "./AnalyticsPanel";
import { ambientAi } from "@/lib/site/studies/ambientAi";
import { selfReadyStudy } from "@/lib/site/studies/selfReady";

/**
 * Nishanth's admin portal:
 *   Analytics      — visits, pages, sources, devices and countries, with the Wall and requests at a glance
 *   Notes          — approve, reject or remove notes on the Wall
 *   Notifications  — requests to see the confidential screens (approve / decline) and phone alerts
 *   Images         — upload the real confidential screenshots (kept in the database, not the code)
 * Every request carries the moderator token (WALL_ADMIN_TOKEN); the server checks it.
 */
export type AdminTab = "analytics" | "notes" | "notifications" | "images";
type Req = { id: string; name: string; email: string; company: string; reason: string; status: "pending" | "approved" | "declined"; createdAt: string };
type Access = { requests: Req[]; images: string[]; ntfy: boolean };

const KEY = "nishanth.wall.admin";
const NOTE_FILTERS: NoteStatus[] = ["pending", "approved", "rejected"];
const FILTER_LABEL: Record<NoteStatus, string> = { pending: "Waiting", approved: "Approved", rejected: "Rejected" };
const SCREENS = [selfReadyStudy, ambientAi].flatMap((st) => st.screens.filter((s) => s.locked).map((s) => ({ ...s, study: st.title })));
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

export default function AdminPortal({ initial = "notes", fromUrl = false }: { initial?: AdminTab; fromUrl?: boolean }) {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [reveal, setReveal] = useState(false);
  const [tab, setTab] = useState<AdminTab>(initial);
  const [filter, setFilter] = useState<NoteStatus>("pending");
  const [notes, setNotes] = useState<WallNote[]>([]);
  const [waiting, setWaiting] = useState(0);
  const [access, setAccess] = useState<Access | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // the same handwriting fonts as the Wall, so each note looks exactly as its writer made it
  useEffect(() => {
    if (document.querySelector("link[data-wall-fonts]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = FONTS_HREF;
    l.dataset.wallFonts = "";
    document.head.appendChild(l);
  }, []);

  useEffect(() => {
    if (fromUrl) {
      const t = new URLSearchParams(location.search).get("tab");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the tab named in the link, read once
      if (t === "analytics" || t === "notes" || t === "notifications" || t === "images") setTab(t);
    }
    try {
      const t = sessionStorage.getItem(KEY);
      if (t) setToken(t);
    } catch {}
  }, [fromUrl]);

  const signOut = useCallback((why = "") => {
    setToken("");
    setMsg(why);
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  }, []);

  const loadNotes = useCallback(async (t: string, status: NoteStatus) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/wall/admin?status=${status}`, { headers: auth(t), cache: "no-store" });
      const d = (await res.json()) as { ok: boolean; notes?: WallNote[]; error?: string };
      if (res.status === 401) return signOut("That token didn't work.");
      if (!d.ok) return setMsg(d.error || "Couldn't load the notes.");
      setNotes(d.notes ?? []);
      if (status === "pending") setWaiting(d.notes?.length ?? 0);
    } catch {
      setMsg("Can't reach the server.");
    } finally {
      setBusy(false);
    }
  }, [signOut]);

  const loadWaiting = useCallback(async (t: string) => {
    try {
      const d = (await (await fetch("/api/wall/admin?status=pending", { headers: auth(t), cache: "no-store" })).json()) as { ok: boolean; notes?: WallNote[] };
      if (d.ok) setWaiting(d.notes?.length ?? 0);
    } catch {}
  }, []);

  const loadAccess = useCallback(async (t: string) => {
    try {
      const r = await fetch("/api/access/admin", { headers: auth(t), cache: "no-store" });
      if (r.status === 401) return signOut("That token didn't work.");
      setAccess((await r.json()) as Access);
    } catch {
      setMsg("Can't reach the server.");
    }
  }, [signOut]);

  // the counts on the tabs, once signed in
  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data for the signed-in admin
    void loadWaiting(token);
    void loadAccess(token);
  }, [token, loadWaiting, loadAccess]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data for the current tab
    if (token && tab === "notes") void loadNotes(token, filter);
  }, [token, tab, filter, loadNotes]);

  const actOnNote = async (id: string, action: "approve" | "reject" | "remove") => {
    if (action === "remove" && !confirm("Remove this note permanently?")) return;
    const res = await fetch("/api/wall/admin", { method: "POST", headers: { ...auth(token), "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!d.ok) return setMsg(d.error || "That didn't work.");
    setNotes((n) => n.filter((x) => x.id !== id));
    if (filter === "pending") setWaiting((w) => Math.max(0, w - 1));
    setMsg(action === "approve" ? "Approved: it's on the wall now." : action === "reject" ? "Rejected." : "Removed.");
  };
  const decide = async (id: string, status: Req["status"]) => {
    await fetch("/api/access/admin", { method: "POST", headers: { ...auth(token), "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    void loadAccess(token);
  };
  const upload = async (id: string, file: File | undefined) => {
    if (!file) return;
    const f = new FormData();
    f.set("id", id);
    f.set("file", file);
    setMsg("Uploading…");
    const r = await fetch("/api/access/admin", { method: "PUT", headers: auth(token), body: f });
    const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setMsg(d.ok ? "Uploaded ✓" : d.error ?? "Upload failed.");
    void loadAccess(token);
  };

  if (!token)
    return (
      <main className={a.page}>
        <form
          className={a.login}
          onSubmit={(e) => {
            e.preventDefault();
            const t = input.trim();
            try {
              sessionStorage.setItem(KEY, t);
            } catch {}
            setMsg("");
            setToken(t);
          }}
        >
          <h1>Admin</h1>
          <label htmlFor="tok">Moderator token</label>
          <div className={a.tokRow}>
            <input id="tok" type={reveal ? "text" : "password"} value={input} onChange={(e) => setInput(e.target.value)} autoComplete="current-password" autoCapitalize="off" autoCorrect="off" spellCheck={false} required />
            <button type="button" className={a.eye} onClick={() => setReveal((v) => !v)} aria-label={reveal ? "Hide password" : "Show password"} aria-pressed={reveal}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                <circle cx="12" cy="12" r="2.8" />
                {reveal && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>
          <button type="submit">Open</button>
          {msg && <p className={a.msg}>{msg}</p>}
        </form>
      </main>
    );

  const pendingReq = access?.requests.filter((r) => r.status === "pending").length ?? 0;
  const missing = SCREENS.filter((s) => !access?.images.includes(s.id)).length;
  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: "analytics", label: "Analytics" },
    { id: "notes", label: "Notes", count: waiting },
    { id: "notifications", label: "Notifications", count: pendingReq },
    { id: "images", label: "Images" },
  ];

  return (
    <main className={a.page}>
      <header className={a.head}>
        <h1>Admin</h1>
        <div className={a.tabs} role="tablist" aria-label="Sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setMsg(""); }}>
              {t.label}
              {!!t.count && <span className={a.badge} aria-label={`${t.count} waiting`}>{t.count}</span>}
            </button>
          ))}
        </div>
        <a href="/wall" className={a.view}>View the wall ↗</a>
        <button type="button" className={a.signOut} onClick={() => signOut()}>Sign out</button>
      </header>
      {msg && <p className={a.msg} role="status">{msg}</p>}

      {tab === "analytics" && <AnalyticsPanel token={token} onOpen={(t) => setTab(t)} />}

      {tab === "notes" && (
        <section aria-label="Notes">
          <div className={a.filters} role="tablist" aria-label="Show">
            {NOTE_FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
                {FILTER_LABEL[f]}
                {f === "pending" && !!waiting && <span className={a.badge}>{waiting}</span>}
              </button>
            ))}
          </div>
          <p className={a.hint}>
            {filter === "pending" ? "New notes wait here until you approve them. Only approved notes appear on the wall." : filter === "approved" ? "These are on the wall now." : "Rejected notes are hidden from the wall."}
          </p>
          {busy ? <p className={a.msg}>Loading…</p> : notes.length === 0 ? <p className={a.msg}>{filter === "pending" ? "Nothing waiting. All caught up." : `No ${FILTER_LABEL[filter].toLowerCase()} notes.`}</p> : null}
          <ul className={a.list}>
            {notes.map((n) => (
              <li key={n.id} className={a.item}>
                <div className={a.card}>
                  <NoteCard sticker={n.sticker} font={n.font} shape={n.shape} color={n.color} message={n.message} name={n.name} />
                </div>
                <div className={a.meta}>
                  <p>{new Date(n.createdAt).toLocaleString()}</p>
                  {!!n.reports && <p className={a.reports}>Reported {n.reports}×</p>}
                  <div className={a.actions}>
                    {n.status !== "approved" && <button className={a.approve} onClick={() => actOnNote(n.id, "approve")}>Approve</button>}
                    {n.status !== "rejected" && <button onClick={() => actOnNote(n.id, "reject")}>Reject</button>}
                    <button className={a.danger} onClick={() => actOnNote(n.id, "remove")}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "notifications" && (
        <section aria-label="Notifications" className={a.panel}>
          <p className={a.status} data-on={access?.ntfy ? "" : undefined}>
            {access?.ntfy ? "Phone alerts are on: you get a notification for every new note and every access request." : "Phone alerts are off. Set NTFY_TOPIC on the server to get a notification for new notes and requests."}
          </p>
          <h2>Requests to see the confidential screens</h2>
          {!access ? <p className={a.msg}>Loading…</p> : access.requests.length === 0 ? <p className={a.msg}>No requests yet.</p> : null}
          <ul className={a.rows}>
            {access?.requests.map((r) => (
              <li key={r.id}>
                <div>
                  <b>{r.name}</b> <span className={a.dim}>· {r.email}{r.company && ` · ${r.company}`}</span>
                  <p>{r.reason || "No reason given."}</p>
                  <span className={a.dim}>{new Date(r.createdAt).toLocaleString()} · <b data-s={r.status}>{r.status === "pending" ? "waiting" : r.status}</b></span>
                </div>
                <div className={a.actions}>
                  {r.status !== "approved" && <button className={a.approve} onClick={() => decide(r.id, "approved")}>Approve</button>}
                  {r.status !== "declined" && <button className={a.danger} onClick={() => decide(r.id, "declined")}>{r.status === "approved" ? "Revoke" : "Decline"}</button>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === "images" && (
        <section aria-label="Images" className={a.panel}>
          <p className={a.hint}>
            The real screenshots of the confidential client screens. Approved visitors see these instead of the recreations. They&apos;re stored in the database, never in the code.
            {missing > 0 && ` ${missing} still to upload.`}
          </p>
          <ul className={a.rows}>
            {SCREENS.map((s) => {
              const has = access?.images.includes(s.id);
              return (
                <li key={s.id}>
                  <div>
                    <span className={a.dim}>{s.study} · </span>
                    {s.need.split(" — ")[0]}
                  </div>
                  <div className={a.actions}>
                    <span className={has ? a.ok : a.dim}>{has ? "✓ Uploaded" : "Not uploaded"}</span>
                    <label className={a.uploadBtn}>
                      {has ? "Replace" : "Upload"}
                      <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => upload(s.id, e.target.files?.[0])} />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
