/**
 * Confidential screenshots — Nishanth only (the Wall's WALL_ADMIN_TOKEN as a Bearer token).
 *   GET  → requests + which real screenshots are uploaded
 *   POST JSON { id, status }          → approve / decline / back to pending
 *   PUT  multipart { id, file }       → upload (or replace) a real screenshot
 */
import { connection } from "next/server";
import { isAdmin } from "@/lib/access/guard";
import { decide, listImages, listRequests, putImage, type AccessStatus } from "@/lib/access/store";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const deny = () => json({ ok: false, error: "Not allowed." }, 401);

export async function GET(req: Request) {
  await connection();
  if (!isAdmin(req)) return deny();
  const [requests, images] = await Promise.all([listRequests(), listImages()]);
  return json({ ok: true, requests, images: images.map((i) => i.id), ntfy: !!process.env.NTFY_TOPIC });
}

export async function POST(req: Request) {
  await connection();
  if (!isAdmin(req)) return deny();
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: AccessStatus };
  if (!id || !["pending", "approved", "declined"].includes(status ?? "")) return json({ ok: false, error: "Bad request." }, 400);
  return json({ ok: await decide(id, status!) });
}

export async function PUT(req: Request) {
  await connection();
  if (!isAdmin(req)) return deny();
  const form = await req.formData().catch(() => null);
  const id = String(form?.get("id") ?? ""), file = form?.get("file");
  if (!/^[a-z0-9-]{2,60}$/.test(id) || !(file instanceof File)) return json({ ok: false, error: "Pick a screen and a file." }, 400);
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return json({ ok: false, error: "PNG, JPEG or WebP only." }, 415);
  if (file.size > 4_000_000) return json({ ok: false, error: "Keep it under 4 MB." }, 413);
  await putImage(id, file.type, Buffer.from(await file.arrayBuffer()));
  return json({ ok: true });
}
