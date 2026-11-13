/**
 * The Wall — request guards (server only): rate limits, hashed client
 * identity, optional Cloudflare Turnstile and the moderator token.
 */
import { createHash, timingSafeEqual } from "crypto";

/** Client identity for rate limiting: a salted hash of the IP — the raw address is never stored. */
export function clientHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
  return createHash("sha256").update(`${process.env.WALL_IP_SALT || "the-wall"}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Sliding-window limits kept in memory for this server process: per visitor
 * 3 posts / 10 min and 10 / day; across everyone 60 posts / hour (a flood
 * stop). On serverless hosting each instance keeps its own count — see setup docs.
 */
const hits = new Map<string, number[]>();
function within(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.set(key, list);
  return list.length < max;
}
function record(...keys: string[]) {
  const now = Date.now();
  keys.forEach((k) => hits.set(k, [...(hits.get(k) ?? []), now]));
}
export function rateLimit(id: string): { ok: true } | { ok: false; retryAfter: number } {
  if (!within(`m:${id}`, 3, 10 * 60_000)) return { ok: false, retryAfter: 600 };
  if (!within(`d:${id}`, 10, 24 * 3600_000)) return { ok: false, retryAfter: 3600 };
  if (!within("global", 60, 3600_000)) return { ok: false, retryAfter: 900 };
  return { ok: true };
}
export const recordPost = (id: string) => record(`m:${id}`, `d:${id}`, "global");

/** Reports: 5 per visitor per hour. */
export function reportLimit(id: string) {
  if (!within(`r:${id}`, 5, 3600_000)) return false;
  record(`r:${id}`);
  return true;
}

/** Cloudflare Turnstile — enforced only when TURNSTILE_SECRET_KEY is set. */
export const captchaRequired = () => !!process.env.TURNSTILE_SECRET_KEY;
export async function verifyCaptcha(token: string | undefined, req: Request) {
  if (!captchaRequired()) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false; // fail safe
  }
}

/** Moderator access: a long secret token (WALL_ADMIN_TOKEN). Without one, moderation is off. */
export function adminConfigured() {
  return (process.env.WALL_ADMIN_TOKEN ?? "").length >= 24;
}
export function isAdmin(req: Request) {
  if (!adminConfigured()) return false;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(process.env.WALL_ADMIN_TOKEN!).digest();
  return given.length > 0 && timingSafeEqual(a, b);
}
