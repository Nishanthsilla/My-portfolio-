/**
 * The Wall — public API.
 *   GET  → approved notes only (+ how storage is configured)
 *   POST → a new note; checked here (the authority), stored as PENDING.
 * (The .server.ts name keeps this file out of the static offline preview,
 * which has no server; see next.config.ts.)
 */
import { connection } from "next/server";
import { isClean, normalizeText } from "@/lib/wall/moderation";
import { STICKER_IDS } from "@/lib/wall/stickers";
import { LIMITS, type Submission } from "@/lib/wall/types";
import { captchaRequired, clientHash, rateLimit, recordPost, verifyCaptcha } from "@/lib/wall/guard";
import { countRecentByVisitor, insertPending, listApproved, recentSameMessage, storeMode } from "@/lib/wall/store";

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function GET() {
  await connection();
  try {
    return json({ ok: true, mode: storeMode(), captcha: captchaRequired(), notes: await listApproved() });
  } catch {
    return json({ ok: false, mode: storeMode(), notes: [], error: "The wall can't be loaded right now." }, 503);
  }
}

const num = (v: unknown, lo: number, hi: number) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;

export async function POST(req: Request) {
  await connection();
  let body: Submission;
  try {
    const raw = await req.text();
    if (raw.length > 4000) return json({ ok: false, error: "That's a bit long." }, 413);
    body = JSON.parse(raw) as Submission;
  } catch {
    return json({ ok: false, error: "Something went wrong — please try again." }, 400);
  }

  // spam traps: a hidden field only bots fill in, and a human-speed minimum (3 s)
  if (body.website) return json({ ok: true, status: "pending" }); // quietly ignored
  if (typeof body.startedAt === "number" && Date.now() - body.startedAt < 3000) return json({ ok: false, error: "That was quick! Take a second and try again." }, 429);

  const id = clientHash(req);
  const limit = rateLimit(id);
  if (!limit.ok) return json({ ok: false, error: "You've left a few already — come back a little later." }, 429, { "Retry-After": String(limit.retryAfter) });
  if (!(await verifyCaptcha(body.captcha, req))) return json({ ok: false, error: "Please complete the quick check." }, 400);

  // validate (plain text only: tags are refused, everything is rendered as text)
  const message = normalizeText(String(body.message ?? ""));
  const name = normalizeText(String(body.name ?? "")).replace(/\n/g, " ");
  if (message.length < LIMITS.minMessage || message.length > LIMITS.message) return json({ ok: false, error: `Messages are ${LIMITS.minMessage}–${LIMITS.message} characters.` }, 400);
  if (name.length < 1 || name.length > LIMITS.name) return json({ ok: false, error: `Names are up to ${LIMITS.name} characters.` }, 400);
  if (/<[a-z/!]/i.test(message) || /<[a-z/!]/i.test(name)) return json({ ok: false, error: "Plain text only, please." }, 400);
  if (typeof body.sticker !== "string" || !STICKER_IDS.has(body.sticker)) return json({ ok: false, error: "Pick a sticker first." }, 400);
  if (!num(body.x, 0, 1) || !num(body.y, 0, 1) || !num(body.rotation, -45, 45)) return json({ ok: false, error: "Place your sticker on the wall first." }, 400);

  // the Side-Eye Filter, authoritative: the text as sent and its normalised form
  if (!isClean(String(body.message ?? "")) || !isClean(message) || !isClean(name)) {
    return json({ ok: false, flagged: true, error: "Hmm... let's keep it friendly 🙄" }, 422);
  }

  try {
    // the same limits, checked in the database too: on serverless hosting each instance has its own memory
    if ((await countRecentByVisitor(id, 10 * 60_000)) >= 3 || (await countRecentByVisitor(id, 24 * 3600_000)) >= 10)
      return json({ ok: false, error: "You've left a few already — come back a little later." }, 429, { "Retry-After": "600" });
    if ((await recentSameMessage(message, 24 * 3600_000)) > 0) return json({ ok: false, error: "That note is already on its way." }, 409);
    const note = await insertPending({ message, name, sticker: body.sticker, x: body.x, y: body.y, rotation: body.rotation }, id);
    recordPost(id);
    // the id lets the visitor's browser keep showing its own pending note (to them only) until approved
    return json({ ok: true, status: "pending", note: { id: note.id, message: note.message, name: note.name, sticker: note.sticker, x: note.x, y: note.y, rotation: note.rotation, createdAt: note.createdAt } }, 201);
  } catch {
    // storage unavailable: fail safe — nothing is published
    return json({ ok: false, error: "The wall can't take notes right now. Please try again later." }, 503);
  }
}
