/**
 * Confidential screenshots — identities, signatures and the phone push (server only).
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

/** the visitor's browser, as a random id in an httpOnly cookie */
export const COOKIE = "sr_access";
export function visitorOf(req: Request) {
  const m = (req.headers.get("cookie") ?? "").match(/(?:^|;\s*)sr_access=([a-f0-9]{32})/);
  return m?.[1] ?? null;
}
export const newVisitor = () => randomBytes(16).toString("hex");
export const visitorCookie = (v: string) => `${COOKIE}=${v}; Path=/; Max-Age=${60 * 60 * 24 * 365}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

/** approve / decline links in the notification are signed, so only Nishanth's phone can use them */
const secret = () => (process.env.ACCESS_SECRET || process.env.WALL_ADMIN_TOKEN || "").trim();
export const signingReady = () => secret().length >= 24;
export const sign = (id: string, action: string) => createHmac("sha256", secret()).update(`${id}:${action}`).digest("hex").slice(0, 40);
export function verify(id: string, action: string, sig: string) {
  if (!signingReady() || !sig) return false;
  const a = Buffer.from(sign(id, action)), b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** the moderator token (the same one as the Wall) */
export function isAdmin(req: Request) {
  const token = (process.env.WALL_ADMIN_TOKEN ?? "").trim();
  if (token.length < 24) return false;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  return given.length > 0 && timingSafeEqual(createHash("sha256").update(given).digest(), createHash("sha256").update(token).digest());
}

export function clientHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
  return createHash("sha256").update(`${process.env.WALL_IP_SALT || "access"}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * A push to Nishanth's phone through ntfy (free, no account): the ntfy app
 * subscribed to the secret topic in NTFY_TOPIC. Approve / Decline buttons call
 * the signed links straight from the notification.
 */
export async function notify(origin: string, r: { id: string; name: string; email: string; company: string; reason: string }) {
  const topic = (process.env.NTFY_TOPIC ?? "").trim();
  if (!topic) return false;
  const server = (process.env.NTFY_SERVER ?? "https://ntfy.sh").replace(/\/$/, "");
  const link = (action: string) => `${origin}/api/access/decide?id=${r.id}&action=${action}&sig=${sign(r.id, action)}`;
  try {
    const res = await fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        title: `Access request: ${r.name}${r.company ? ` (${r.company})` : ""}`,
        message: `${r.email}\n${r.reason || "No reason given."}\n\nWants to see the real client screenshots (Self-Ready, Ambient AI).`,
        tags: ["lock"],
        priority: 4,
        click: `${origin}/admin?tab=notifications`,
        actions: [
          { action: "http", label: "Approve", url: link("approve"), method: "POST", clear: true },
          { action: "http", label: "Decline", url: link("decline"), method: "POST", clear: true },
        ],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** A push to the same phone when someone leaves a note on the Wall (it waits for approval in /admin). */
export async function notifyNote(origin: string, n: { name: string; message: string }) {
  const topic = (process.env.NTFY_TOPIC ?? "").trim();
  if (!topic) return false;
  const server = (process.env.NTFY_SERVER ?? "https://ntfy.sh").replace(/\/$/, "");
  try {
    const res = await fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, title: `New note on the Wall from ${n.name}`, message: `"${n.message}"\n\nIt's waiting for your approval.`, tags: ["memo"], priority: 3, click: `${origin}/admin` }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
