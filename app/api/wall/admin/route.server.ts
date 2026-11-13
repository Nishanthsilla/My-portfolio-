/**
 * The Wall — moderation API (Nishanth only). Requires the WALL_ADMIN_TOKEN as
 * a Bearer token; without that variable configured, moderation is disabled.
 *   GET  ?status=pending|approved|rejected → notes for review
 *   POST { id, action: "approve" | "reject" | "remove" }
 */
import { connection } from "next/server";
import { adminConfigured, clientHash, isAdmin, reportLimit } from "@/lib/wall/guard";
import { listAll, removeNote, setStatus, storeMode } from "@/lib/wall/store";
import type { NoteStatus } from "@/lib/wall/types";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Wrong tokens are throttled (shares the small per-visitor limiter). */
function deny(req: Request) {
  if (!adminConfigured()) return json({ ok: false, error: "Moderation is not configured (set WALL_ADMIN_TOKEN)." }, 503);
  if (!reportLimit(`admin:${clientHash(req)}`)) return json({ ok: false, error: "Too many attempts. Try again later." }, 429);
  return json({ ok: false, error: "Not authorised." }, 401);
}

export async function GET(req: Request) {
  await connection();
  if (!isAdmin(req)) return deny(req);
  const s = new URL(req.url).searchParams.get("status");
  const status = (["pending", "approved", "rejected"] as const).includes(s as NoteStatus) ? (s as NoteStatus) : undefined;
  try {
    return json({ ok: true, mode: storeMode(), notes: await listAll(status) });
  } catch {
    return json({ ok: false, error: "Storage unavailable." }, 503);
  }
}

export async function POST(req: Request) {
  await connection();
  if (!isAdmin(req)) return deny(req);
  let body: { id?: string; action?: string };
  try {
    body = (await req.json()) as { id?: string; action?: string };
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }
  if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id)) return json({ ok: false, error: "Bad id." }, 400);
  try {
    const done =
      body.action === "approve" ? await setStatus(body.id, "approved")
      : body.action === "reject" ? await setStatus(body.id, "rejected")
      : body.action === "remove" ? await removeNote(body.id)
      : null;
    if (done === null) return json({ ok: false, error: "Unknown action." }, 400);
    return json({ ok: done });
  } catch {
    return json({ ok: false, error: "Storage unavailable." }, 503);
  }
}
