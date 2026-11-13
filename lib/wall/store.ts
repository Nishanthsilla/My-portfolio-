/**
 * The Wall — persistent storage (server only).
 *
 *  · Supabase (recommended for a deployed site): set SUPABASE_URL and
 *    SUPABASE_SERVICE_ROLE_KEY. Uses the REST API with the service-role key,
 *    which never reaches the browser. Table + policies: docs/the-wall-setup.md.
 *  · Local file (when Supabase is not configured): data/wall-notes.json on the
 *    machine running `next start`. Shared by every visitor of that server and
 *    persistent on its disk — but NOT on serverless hosting, where the disk is
 *    temporary. The API reports the mode so the interface can say so.
 */
import { promises as fs } from "fs";
import path from "path";
import type { NoteStatus, PublicNote, WallNote } from "./types";

export type StoreMode = "supabase" | "local";

export const storeMode = (): StoreMode => (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "local");

const TABLE = "wall_notes";
const FILE = path.join(process.cwd(), "data", "wall-notes.json");

/* ---------------- Supabase (REST) ---------------- */

type Row = {
  id: string; message: string; name: string; sticker: string; x: number; y: number; rotation: number;
  created_at: string; status: NoteStatus; reports: number | null; ip_hash?: string | null;
};
const fromRow = (r: Row): WallNote => ({
  id: r.id, message: r.message, name: r.name, sticker: r.sticker, x: r.x, y: r.y, rotation: r.rotation,
  createdAt: r.created_at, status: r.status, reports: r.reports ?? 0,
});

async function sb(pathAndQuery: string, init: RequestInit = {}) {
  const base = process.env.SUPABASE_URL!.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${base}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`storage ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ---------------- Local file ---------------- */

type FileData = { notes: (WallNote & { ipHash?: string })[] };
let chain: Promise<unknown> = Promise.resolve();
/** Serialise file writes so concurrent posts can't overwrite each other. */
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn);
  chain = next.catch(() => {});
  return next;
}
async function readFile(): Promise<FileData> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as FileData;
  } catch {
    return { notes: [] };
  }
}
async function writeFile(d: FileData) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(d, null, 2));
  await fs.rename(tmp, FILE);
}

/* ---------------- API ---------------- */

const omitIp = (n: WallNote & { ipHash?: string }): WallNote => {
  const c = { ...n };
  delete c.ipHash;
  return c;
};
const toPublic = (n: WallNote): PublicNote => ({ id: n.id, message: n.message, name: n.name, sticker: n.sticker, x: n.x, y: n.y, rotation: n.rotation, createdAt: n.createdAt });

export async function listApproved(): Promise<PublicNote[]> {
  if (storeMode() === "supabase") {
    const rows = (await sb(`${TABLE}?status=eq.approved&select=id,message,name,sticker,x,y,rotation,created_at,status,reports&order=created_at.asc&limit=400`)) as Row[];
    return rows.map(fromRow).map(toPublic);
  }
  const d = await readFile();
  return d.notes.filter((n) => n.status === "approved").map(toPublic);
}

export async function listAll(status?: NoteStatus): Promise<WallNote[]> {
  if (storeMode() === "supabase") {
    const q = status ? `&status=eq.${status}` : "";
    const rows = (await sb(`${TABLE}?select=id,message,name,sticker,x,y,rotation,created_at,status,reports${q}&order=created_at.desc&limit=500`)) as Row[];
    return rows.map(fromRow);
  }
  const d = await readFile();
  return d.notes
    .filter((n) => !status || n.status === status)
    .map(omitIp)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function insertPending(n: Omit<WallNote, "id" | "createdAt" | "status">, ipHash: string): Promise<WallNote> {
  if (storeMode() === "supabase") {
    const rows = (await sb(TABLE, {
      method: "POST",
      body: JSON.stringify({ message: n.message, name: n.name, sticker: n.sticker, x: n.x, y: n.y, rotation: n.rotation, status: "pending", reports: 0, ip_hash: ipHash }),
    })) as Row[];
    return fromRow(rows[0]);
  }
  return locked(async () => {
    const d = await readFile();
    const note: WallNote & { ipHash: string } = { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "pending", reports: 0, ipHash };
    d.notes.push(note);
    await writeFile(d);
    return omitIp(note);
  });
}

/** Recent notes with the same text (duplicate check), any status. */
export async function recentSameMessage(message: string, sinceMs: number): Promise<number> {
  const since = new Date(Date.now() - sinceMs).toISOString();
  if (storeMode() === "supabase") {
    const rows = (await sb(`${TABLE}?select=id&message=eq.${encodeURIComponent(message)}&created_at=gte.${encodeURIComponent(since)}&limit=5`)) as unknown[];
    return rows.length;
  }
  const d = await readFile();
  return d.notes.filter((n) => n.createdAt >= since && n.message.toLowerCase() === message.toLowerCase()).length;
}

export async function setStatus(id: string, status: NoteStatus): Promise<boolean> {
  if (storeMode() === "supabase") {
    const rows = (await sb(`${TABLE}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) })) as Row[];
    return rows.length > 0;
  }
  return locked(async () => {
    const d = await readFile();
    const n = d.notes.find((x) => x.id === id);
    if (!n) return false;
    n.status = status;
    await writeFile(d);
    return true;
  });
}

export async function removeNote(id: string): Promise<boolean> {
  if (storeMode() === "supabase") {
    const rows = (await sb(`${TABLE}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" })) as Row[];
    return rows.length > 0;
  }
  return locked(async () => {
    const d = await readFile();
    const before = d.notes.length;
    d.notes = d.notes.filter((x) => x.id !== id);
    await writeFile(d);
    return d.notes.length < before;
  });
}

/** A visitor report: after 3, an approved note goes back to pending for review. */
export async function report(id: string): Promise<void> {
  if (storeMode() === "supabase") {
    const rows = (await sb(`${TABLE}?id=eq.${encodeURIComponent(id)}&select=reports,status`)) as Row[];
    if (!rows[0]) return;
    const reports = (rows[0].reports ?? 0) + 1;
    await sb(`${TABLE}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ reports, ...(reports >= 3 && rows[0].status === "approved" ? { status: "pending" } : {}) }) });
    return;
  }
  await locked(async () => {
    const d = await readFile();
    const n = d.notes.find((x) => x.id === id);
    if (!n) return;
    n.reports = (n.reports ?? 0) + 1;
    if (n.reports >= 3 && n.status === "approved") n.status = "pending";
    await writeFile(d);
  });
}
