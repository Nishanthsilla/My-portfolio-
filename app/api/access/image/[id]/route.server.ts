/** A real (confidential) screenshot: only for a browser whose access request was approved. */
import { connection } from "next/server";
import { visitorOf } from "@/lib/access/guard";
import { getImage, statusFor } from "@/lib/access/store";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await ctx.params;
  const v = visitorOf(req);
  if (!v || !/^[a-z0-9-]{2,60}$/.test(id)) return new Response("Not available", { status: 403 });
  try {
    if ((await statusFor(v)) !== "approved") return new Response("Not available", { status: 403 });
    const img = await getImage(id);
    if (!img) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(img.data), { headers: { "Content-Type": img.mime, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "Content-Disposition": "inline" } });
  } catch {
    return new Response("Not available", { status: 503 });
  }
}
