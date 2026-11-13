"use client";

import { useCallback, useEffect, useState } from "react";
import type { NoteStatus, WallNote } from "@/lib/wall/types";
import NoteCard from "./NoteCard";
import a from "./admin.module.css";

const KEY = "nishanth.wall.admin";
const TABS: NoteStatus[] = ["pending", "approved", "rejected"];

/**
 * Moderation for The Wall. Every request carries the moderator token; the
 * server checks it (WALL_ADMIN_TOKEN). Nothing here is trusted by the server.
 */
export default function WallAdmin() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<NoteStatus>("pending");
  const [notes, setNotes] = useState<WallNote[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(KEY);
      // restoring a saved session is a one-off sync from storage
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (t) setToken(t);
    } catch {}
  }, []);

  const load = useCallback(async (t: string, status: NoteStatus) => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/wall/admin?status=${status}`, { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
      const d = (await res.json()) as { ok: boolean; notes?: WallNote[]; error?: string; mode?: string };
      if (!d.ok) {
        setNotes([]);
        setFailed(true);
        setMsg(d.error || "Couldn't load.");
        if (res.status === 401) {
          setToken("");
          try {
            sessionStorage.removeItem(KEY);
          } catch {}
        }
        return;
      }
      setFailed(false);
      setNotes(d.notes ?? []);
      setMsg(d.mode === "sqlite" ? "Database: SQLite (data/wall.db on this server)." : d.mode === "postgres" ? "Database: PostgreSQL." : "");
    } catch {
      setFailed(true);
      setMsg("Can't reach the moderation API here (the offline preview has no server).");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) void load(token, tab);
  }, [token, tab, load]);

  const act = async (id: string, action: "approve" | "reject" | "remove") => {
    if (action === "remove" && !confirm("Remove this note permanently?")) return;
    const res = await fetch("/api/wall/admin", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (d.ok) setNotes((n) => n.filter((x) => x.id !== id));
    else setMsg(d.error || "That didn't work.");
  };

  if (!token)
    return (
      <main className={a.page}>
        <form
          className={a.login}
          onSubmit={(e) => {
            e.preventDefault();
            try {
              sessionStorage.setItem(KEY, input);
            } catch {}
            setToken(input);
          }}
        >
          <h1>The Wall — moderation</h1>
          <label htmlFor="tok">Moderator token</label>
          <input id="tok" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="current-password" required />
          <button type="submit">Open</button>
          {msg && <p className={a.msg}>{msg}</p>}
        </form>
      </main>
    );

  return (
    <main className={a.page}>
      <header className={a.head}>
        <h1>The Wall — moderation</h1>
        <div className={a.tabs} role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <a href="/wall" className={a.view}>View the wall ↗</a>
      </header>
      {msg && <p className={a.msg}>{msg}</p>}
      {busy ? <p className={a.msg}>Loading…</p> : failed ? <p className={a.msg}>Notes can&apos;t be shown until this is fixed — nothing has been lost.</p> : notes.length === 0 ? <p className={a.msg}>Nothing {tab}.</p> : null}
      <ul className={a.list}>
        {notes.map((n) => (
          <li key={n.id} className={a.item}>
            <div className={a.card}>
              <NoteCard sticker={n.sticker} message={n.message} name={n.name} />
            </div>
            <div className={a.meta}>
              <p>{new Date(n.createdAt).toLocaleString()}</p>
              <p>Sticker: {n.sticker} · position {Math.round(n.x * 100)}%, {Math.round(n.y * 100)}% · {n.rotation}°</p>
              {!!n.reports && <p className={a.reports}>Reported {n.reports}×</p>}
              <div className={a.actions}>
                {n.status !== "approved" && <button onClick={() => act(n.id, "approve")}>Approve</button>}
                {n.status !== "rejected" && <button onClick={() => act(n.id, "reject")}>Reject</button>}
                <button className={a.danger} onClick={() => act(n.id, "remove")}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
