/**
 * Approve / decline an access request from the signed links in the phone push.
 *   POST (the notification's buttons) → decides at once.
 *   GET  (opening the link in a browser) → a small page with a button, so a link preview can't decide by itself.
 */
import { connection } from "next/server";
import { verify } from "@/lib/access/guard";
import { decide, getRequest } from "@/lib/access/store";

const ACTIONS = { approve: "approved", decline: "declined" } as const;
type Action = keyof typeof ACTIONS;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const page = (title: string, body: string, status = 200) =>
  new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><body style="font:16px system-ui;margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f8;color:#17191c"><main style="max-width:420px;padding:32px;background:#fff;border:1px solid #e7e7ea;border-radius:16px;text-align:center">${body}</main>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

function params(req: Request) {
  const u = new URL(req.url);
  return { id: u.searchParams.get("id") ?? "", action: (u.searchParams.get("action") ?? "") as Action, sig: u.searchParams.get("sig") ?? "" };
}

export async function GET(req: Request) {
  await connection();
  const { id, action, sig } = params(req);
  if (!(action in ACTIONS) || !verify(id, action, sig)) return page("Link not valid", "<h2>This link isn't valid.</h2>", 403);
  const r = await getRequest(id);
  if (!r) return page("Not found", "<h2>Request not found.</h2>", 404);
  return page("Access request", `<h2 style="margin:0 0 8px">${esc(r.name)}</h2><p style="margin:0;color:#6b6f76">${esc(r.email)}${r.company ? ` · ${esc(r.company)}` : ""}</p><p>${esc(r.reason || "No reason given.")}</p><p style="color:#6b6f76">Currently: <b>${r.status}</b></p><form method="post"><button style="font:600 16px system-ui;padding:12px 22px;border-radius:10px;border:0;color:#fff;background:${action === "approve" ? "#0f8f7f" : "#dc2626"}">${action === "approve" ? "Approve access" : "Decline"}</button></form>`);
}

export async function POST(req: Request) {
  await connection();
  const { id, action, sig } = params(req);
  if (!(action in ACTIONS) || !verify(id, action, sig)) return page("Link not valid", "<h2>This link isn't valid.</h2>", 403);
  const ok = await decide(id, ACTIONS[action]);
  if (!ok) return page("Not found", "<h2>Request not found.</h2>", 404);
  return page("Done", `<h2>${action === "approve" ? "Approved ✓" : "Declined"}</h2><p style="color:#6b6f76">${action === "approve" ? "Their browser unlocks the real screenshots the next time it checks." : "They'll keep seeing the recreated screens."}</p>`);
}
