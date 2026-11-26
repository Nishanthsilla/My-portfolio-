/**
 * One page view (sent by the site with navigator.sendBeacon). Bots, the admin pages and visitors
 * with "Do Not Track" are ignored. Nothing personal is stored: see lib/analytics/store.ts.
 */
import { createHash } from "crypto";
import { connection } from "next/server";
import { analyticsReady, recordView } from "@/lib/analytics/store";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|whatsapp|telegram/i;
const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  await connection();
  const ua = req.headers.get("user-agent") ?? "";
  if (!analyticsReady() || BOT.test(ua) || req.headers.get("dnt") === "1") return done();
  const body = (await req.json().catch(() => ({}))) as { path?: string; ref?: string };
  const p = typeof body.path === "string" ? body.path.split("?")[0].split("#")[0].slice(0, 120) : "";
  if (!p.startsWith("/") || /^\/(admin|api)(\/|$)/.test(p)) return done();
  let ref = "";
  try {
    const host = body.ref ? new URL(body.ref).hostname.replace(/^www\./, "") : "";
    if (host && host !== new URL(req.url).hostname) ref = host.slice(0, 80);
  } catch {}
  const device = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|android|iphone/i.test(ua) ? "Phone" : "Desktop";
  const country = (req.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase();
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "local").trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.WALL_ADMIN_TOKEN ?? "salt"}`).digest("hex").slice(0, 20);
  try {
    await recordView({ path: p, ref, device, country, visitor });
  } catch {}
  return done();
}
