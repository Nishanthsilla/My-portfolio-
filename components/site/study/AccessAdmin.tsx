"use client";

import { useCallback, useEffect, useState } from "react";
import { selfReadyStudy } from "@/lib/site/studies/selfReady";

/**
 * Nishanth's page for the confidential Self-Ready screens: upload the real
 * screenshots (kept in the database, never in the public repo) and approve or
 * decline access requests. Uses the Wall's moderator token.
 */
type Req = { id: string; name: string; email: string; company: string; reason: string; status: "pending" | "approved" | "declined"; createdAt: string };
const KEY = "nishanth.wall.admin";
const SCREENS = selfReadyStudy.screens.filter((s) => s.locked);

export default function AccessAdmin() {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<{ requests: Req[]; images: string[]; ntfy: boolean } | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let t = "";
    try { t = sessionStorage.getItem(KEY) ?? ""; } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from session storage after mount
    if (t) setToken(t);
  }, []);

  const load = useCallback(async (t: string) => {
    const r = await fetch("/api/access/admin", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
    if (r.status === 401) { setToken(""); setMsg("That token didn't work."); try { sessionStorage.removeItem(KEY); } catch {} return; }
    setData(await r.json());
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data for the current token
  useEffect(() => { if (token) void load(token); }, [token, load]);

  const decide = async (id: string, status: Req["status"]) => {
    await fetch("/api/access/admin", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    void load(token);
  };
  const upload = async (id: string, file: File | undefined) => {
    if (!file) return;
    const f = new FormData(); f.set("id", id); f.set("file", file);
    setMsg("Uploading…");
    const r = await fetch("/api/access/admin", { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: f });
    const d = await r.json().catch(() => ({}));
    setMsg(d.ok ? "Uploaded ✓" : d.error ?? "Upload failed.");
    void load(token);
  };

  const box: React.CSSProperties = { background: "#fff", border: "1px solid #e7e5e0", borderRadius: 14, padding: 20 };
  const btn = (bg: string, fg = "#fff"): React.CSSProperties => ({ height: 34, padding: "0 14px", borderRadius: 9, border: 0, background: bg, color: fg, font: "600 13px system-ui", cursor: "pointer" });

  if (!token)
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f7f5", font: "15px system-ui" }}>
        <form style={{ ...box, width: 360, display: "grid", gap: 12 }} onSubmit={(e) => { e.preventDefault(); const t = input.trim(); try { sessionStorage.setItem(KEY, t); } catch {} setToken(t); }}>
          <b style={{ fontSize: 18 }}>Confidential screens</b>
          <span style={{ color: "#6b6f76" }}>Enter your moderator token (the Wall one).</span>
          <input type="password" value={input} onChange={(e) => setInput(e.target.value)} style={{ padding: 10, borderRadius: 9, border: "1px solid #ddd", font: "inherit" }} />
          {msg && <span style={{ color: "#c2301f" }}>{msg}</span>}
          <button style={btn("#17191c")}>Open</button>
        </form>
      </main>
    );

  const pending = data?.requests.filter((r) => r.status === "pending") ?? [];
  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f5", font: "15px/1.5 system-ui", color: "#17191c", padding: "32px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 26 }}>Confidential screens</h1>
          <span style={{ color: data?.ntfy ? "#0f7a5f" : "#b45309", fontSize: 13 }}>{data?.ntfy ? "● Phone notifications on" : "● Phone notifications off: set NTFY_TOPIC"}</span>
          {msg && <span style={{ marginLeft: "auto", fontSize: 13 }}>{msg}</span>}
        </div>

        <section style={box}>
          <b>Requests {pending.length > 0 && <span style={{ color: "#b45309" }}>· {pending.length} waiting</span>}</b>
          {!data?.requests.length && <p style={{ color: "#6b6f76" }}>No requests yet.</p>}
          {data?.requests.map((r) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "14px 0", borderTop: "1px solid #eee" }}>
              <div>
                <b>{r.name}</b> <span style={{ color: "#6b6f76" }}>· {r.email}{r.company && ` · ${r.company}`}</span>
                <div style={{ color: "#45484e", fontSize: 14 }}>{r.reason || "No reason given."}</div>
                <div style={{ color: "#8a8d93", fontSize: 12 }}>{new Date(r.createdAt).toLocaleString()} · <b style={{ color: r.status === "approved" ? "#0f7a5f" : r.status === "declined" ? "#c2301f" : "#b45309" }}>{r.status}</b></div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {r.status !== "approved" && <button style={btn("#0f8f7f")} onClick={() => decide(r.id, "approved")}>Approve</button>}
                {r.status !== "declined" && <button style={btn("#fff", "#c2301f")} onClick={() => decide(r.id, "declined")}>{r.status === "approved" ? "Revoke" : "Decline"}</button>}
              </div>
            </div>
          ))}
        </section>

        <section style={box}>
          <b>Real screenshots</b>
          <p style={{ color: "#6b6f76", margin: "4px 0 8px", fontSize: 14 }}>Upload the original for each screen. Approved visitors see these instead of the recreations. They live in the database, not in the code.</p>
          {SCREENS.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #eee", flexWrap: "wrap" }}>
              <span style={{ flex: 1, minWidth: 220 }}>{s.need.split(" — ")[0]} <code style={{ color: "#8a8d93", fontSize: 12 }}>{s.id}</code></span>
              <span style={{ fontSize: 13, color: data?.images.includes(s.id) ? "#0f7a5f" : "#8a8d93" }}>{data?.images.includes(s.id) ? "✓ Uploaded" : "Not uploaded"}</span>
              <label style={{ ...btn("#17191c"), display: "inline-flex", alignItems: "center" }}>
                {data?.images.includes(s.id) ? "Replace" : "Upload"}
                <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => upload(s.id, e.target.files?.[0])} />
              </label>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
