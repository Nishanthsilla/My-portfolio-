/**
 * The Wall — GIF search for the composer, through GIPHY (rated G only).
 * Needs GIPHY_API_KEY (a free key from developers.giphy.com); without it the
 * composer simply doesn't show the GIFs tab. The key never reaches the browser.
 *   GET ?q=<words>&offset=<n>   (no q → trending)
 */
import { connection } from "next/server";

type Giphy = { data?: { id: string; title?: string; images?: Record<string, { url?: string; webp?: string; width?: string; height?: string }> }[] };

export async function GET(req: Request) {
  await connection();
  const key = process.env.GIPHY_API_KEY;
  if (!key) return Response.json({ ok: false, gifs: [] }, { status: 404 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 50);
  const offset = Math.max(0, Math.min(200, Number(url.searchParams.get("offset")) || 0));
  const api = new URL(`https://api.giphy.com/v1/gifs/${q ? "search" : "trending"}`);
  api.searchParams.set("api_key", key);
  if (q) api.searchParams.set("q", q);
  api.searchParams.set("limit", "24");
  api.searchParams.set("offset", String(offset));
  api.searchParams.set("rating", "g");
  try {
    const r = await fetch(api, { cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const d = (await r.json()) as Giphy;
    const gifs = (d.data ?? [])
      .filter((g) => /^[A-Za-z0-9]{4,64}$/.test(g.id))
      .map((g) => {
        const im = g.images?.fixed_width_small ?? g.images?.fixed_width ?? {};
        return { id: `giphy:${g.id}`, title: (g.title ?? "GIF").slice(0, 80), src: im.webp || im.url || "" };
      })
      .filter((g) => g.src.startsWith("https://"));
    return Response.json({ ok: true, gifs }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch {
    return Response.json({ ok: false, gifs: [] }, { status: 502 });
  }
}
