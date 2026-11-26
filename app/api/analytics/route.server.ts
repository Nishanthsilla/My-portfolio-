/** The admin's Analytics tab: visits, pages, sources, devices, countries, plus Wall and access counts. Admin only. */
import { connection } from "next/server";
import { isAdmin } from "@/lib/access/guard";
import { analyticsReady, stats } from "@/lib/analytics/store";
import { listAll } from "@/lib/wall/store";
import { listRequests } from "@/lib/access/store";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  await connection();
  if (!isAdmin(req)) return json({ ok: false, error: "Not allowed." }, 401);
  if (!analyticsReady()) return json({ ok: false, error: "Analytics needs the database (DATABASE_URL)." }, 503);
  const d = Number(new URL(req.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(d) ? d : 30;
  try {
    const [s, notes, reqs] = await Promise.all([stats(days), listAll().catch(() => []), listRequests().catch(() => [])]);
    return json({
      ok: true,
      ...s,
      wall: { waiting: notes.filter((n) => n.status === "pending").length, approved: notes.filter((n) => n.status === "approved").length },
      access: { waiting: reqs.filter((r) => r.status === "pending").length, total: reqs.length },
      ga: true, // Google Analytics: G-1YQK2Z18MY (components/site/Analytics.tsx)
    });
  } catch {
    return json({ ok: false, error: "Couldn't read the numbers." }, 503);
  }
}
