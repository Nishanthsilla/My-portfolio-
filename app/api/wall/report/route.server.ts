/** The Wall — a visitor reports a note. Three reports send an approved note back to review. */
import { connection } from "next/server";
import { clientHash, reportLimit } from "@/lib/wall/guard";
import { report } from "@/lib/wall/store";

export async function POST(req: Request) {
  await connection();
  const json = (d: unknown, s = 200) => Response.json(d, { status: s, headers: { "Cache-Control": "no-store" } });
  let id = "";
  try {
    id = String(((await req.json()) as { id?: string }).id ?? "");
  } catch {}
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ ok: false }, 400);
  if (!reportLimit(clientHash(req))) return json({ ok: false, error: "Thanks — we've got your reports." }, 429);
  try {
    await report(id);
    return json({ ok: true });
  } catch {
    return json({ ok: false }, 503);
  }
}
