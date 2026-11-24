/**
 * Confidential screenshots — the visitor side.
 *   GET  → this browser's access status (none / pending / approved / declined)
 *   POST → ask for access (name, email, company, reason); Nishanth gets a phone push.
 */
import { connection } from "next/server";
import { clientHash, newVisitor, notify, visitorCookie, visitorOf } from "@/lib/access/guard";
import { accessStoreReady, countRecent, createRequest, statusFor } from "@/lib/access/store";

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) => Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function GET(req: Request) {
  await connection();
  const v = visitorOf(req);
  if (!v || !accessStoreReady()) return json({ status: "none" });
  try {
    return json({ status: await statusFor(v) });
  } catch {
    return json({ status: "none" });
  }
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(req: Request) {
  await connection();
  if (!accessStoreReady()) return json({ ok: false, error: "Requests can't be taken right now. Please email me instead." }, 503);
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 4000) return json({ ok: false, error: "That's a bit long." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 400);
  }
  if (clean(body.website, 50)) return json({ ok: true, status: "pending" }); // honeypot
  const name = clean(body.name, 60), email = clean(body.email, 120), company = clean(body.company, 80), reason = clean(body.reason, 400);
  if (name.length < 2) return json({ ok: false, error: "Please add your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: "Please add a valid email." }, 400);
  if (reason.length < 3) return json({ ok: false, error: "Please say briefly why you'd like to see them." }, 400);
  const ip = clientHash(req);
  try {
    if ((await countRecent(ip, 60 * 60_000)) >= 3) return json({ ok: false, error: "You've already asked. I'll get back to you soon." }, 429);
    const visitor = visitorOf(req) ?? newVisitor();
    const r = await createRequest({ visitor, name, email, company, reason }, ip);
    const origin = new URL(req.url).origin;
    await notify(origin, r);
    return json({ ok: true, status: "pending" }, 200, { "Set-Cookie": visitorCookie(visitor) });
  } catch {
    return json({ ok: false, error: "Requests can't be taken right now. Please email me instead." }, 503);
  }
}
