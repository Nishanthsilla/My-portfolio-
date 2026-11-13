/**
 * The Wall — storage in an open-source database (server only).
 *
 *  · SQLite (default): a single database file, data/wall.db, on the machine
 *    running `next start`. Uses the SQLite built into Node.js (node:sqlite) —
 *    nothing to install or sign up for. Right for a server with a disk
 *    (a VPS, Railway/Render/Fly with a volume, your own machine).
 *  · PostgreSQL: set DATABASE_URL to any Postgres database (self-hosted, or a
 *    hosted one such as Neon or Supabase). Required on serverless hosting
 *    (e.g. Vercel), where the server's disk is temporary.
 *
 * Both create the table on first use. Every query uses bound parameters —
 * visitor text is never spliced into SQL. Notes from the earlier JSON file
 * (data/wall-notes.json) are imported into SQLite once, automatically.
 */
import { existsSync, mkdirSync, readFileSync, renameSync } from "fs";
import path from "path";
import { Pool } from "pg";
import type { NoteStatus, PublicNote, WallNote } from "./types";

export type StoreMode = "postgres" | "sqlite" | "unconfigured";
/** On serverless hosting (temporary disk) SQLite would lose notes, so there the wall refuses to store anything without DATABASE_URL. */
const serverless = () => !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
/** The Postgres connection string: DATABASE_URL, or the names Vercel's storage integrations may use. */
const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || "";
export const storeMode = (): StoreMode => (databaseUrl() ? "postgres" : serverless() ? "unconfigured" : "sqlite");

const COLS = "id, message, name, sticker, x, y, rotation, status, reports, created_at";
type Row = { id: string; message: string; name: string; sticker: string; x: number; y: number; rotation: number; status: NoteStatus; reports: number | null; created_at: string | Date };
const fromRow = (r: Row): WallNote => ({
  id: r.id, message: r.message, name: r.name, sticker: r.sticker, x: Number(r.x), y: Number(r.y), rotation: Number(r.rotation),
  status: r.status, reports: Number(r.reports ?? 0), createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
});
const toPublic = (n: WallNote): PublicNote => ({ id: n.id, message: n.message, name: n.name, sticker: n.sticker, x: n.x, y: n.y, rotation: n.rotation, createdAt: n.createdAt });

/** The same queries for both databases; `?` placeholders are rewritten to $1, $2… for Postgres. */
interface Db {
  all(sql: string, params?: unknown[]): Promise<Row[]>;
  run(sql: string, params?: unknown[]): Promise<number>; // rows changed
}

/* ---------------- SQLite (node:sqlite, built into Node.js) ---------------- */

type SqliteStmt = { all(...p: unknown[]): unknown[]; run(...p: unknown[]): { changes: number | bigint } };
type SqliteDb = { exec(sql: string): void; prepare(sql: string): SqliteStmt };
const DIR = path.join(process.cwd(), "data");

function openSqlite(): Db {
  // loaded at runtime (not bundled): node:sqlite is a Node.js built-in
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as { DatabaseSync: new (file: string) => SqliteDb };
  mkdirSync(DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DIR, "wall.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS wall_notes (
      id         TEXT PRIMARY KEY,
      message    TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 140),
      name       TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 32),
      sticker    TEXT NOT NULL,
      x          REAL NOT NULL CHECK (x BETWEEN 0 AND 1),
      y          REAL NOT NULL CHECK (y BETWEEN 0 AND 1),
      rotation   REAL NOT NULL CHECK (rotation BETWEEN -45 AND 45),
      status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      reports    INTEGER NOT NULL DEFAULT 0,
      ip_hash    TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS wall_notes_status ON wall_notes (status, created_at);
  `);
  importLegacyJson(db);
  return {
    all: async (sql, p = []) => db.prepare(sql).all(...p) as Row[],
    run: async (sql, p = []) => Number(db.prepare(sql).run(...p).changes),
  };
}

/** One-time import of notes saved by the earlier JSON-file storage. */
function importLegacyJson(db: SqliteDb) {
  const file = path.join(DIR, "wall-notes.json");
  if (!existsSync(file)) return;
  try {
    const { notes } = JSON.parse(readFileSync(file, "utf8")) as { notes: (WallNote & { ipHash?: string })[] };
    const ins = db.prepare(`INSERT OR IGNORE INTO wall_notes (${COLS}, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const n of notes) ins.run(n.id, n.message, n.name, n.sticker, n.x, n.y, n.rotation, n.status, n.reports ?? 0, n.createdAt, n.ipHash ?? null);
    renameSync(file, `${file}.imported`);
  } catch {}
}

/* ---------------- PostgreSQL ---------------- */

function openPostgres(): Db {
  const pool = new Pool({ connectionString: databaseUrl(), max: 5 });
  const ready = pool.query(`
    CREATE TABLE IF NOT EXISTS wall_notes (
      id         uuid PRIMARY KEY,
      message    text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 140),
      name       text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 32),
      sticker    text NOT NULL,
      x          real NOT NULL CHECK (x BETWEEN 0 AND 1),
      y          real NOT NULL CHECK (y BETWEEN 0 AND 1),
      rotation   real NOT NULL CHECK (rotation BETWEEN -45 AND 45),
      status     text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      reports    integer NOT NULL DEFAULT 0,
      ip_hash    text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS wall_notes_status ON wall_notes (status, created_at);
  `);
  const pg = (sql: string) => {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  };
  return {
    all: async (sql, p = []) => {
      await ready;
      return (await pool.query(pg(sql), p)).rows as Row[];
    },
    run: async (sql, p = []) => {
      await ready;
      return (await pool.query(pg(sql), p)).rowCount ?? 0;
    },
  };
}

/* one connection per server process (kept across dev reloads) */
const g = globalThis as unknown as { __wallDb?: { mode: StoreMode; db: Db } };
function db(): Db {
  const mode = storeMode();
  if (mode === "unconfigured") throw new Error("The wall has no database: set DATABASE_URL (see docs/deploy.md).");
  if (!g.__wallDb || g.__wallDb.mode !== mode) g.__wallDb = { mode, db: mode === "postgres" ? openPostgres() : openSqlite() };
  return g.__wallDb.db;
}

/* ---------------- API ---------------- */

export async function listApproved(): Promise<PublicNote[]> {
  const rows = await db().all(`SELECT ${COLS} FROM wall_notes WHERE status = 'approved' ORDER BY created_at ASC LIMIT 400`);
  return rows.map(fromRow).map(toPublic);
}

export async function listAll(status?: NoteStatus): Promise<WallNote[]> {
  const rows = status
    ? await db().all(`SELECT ${COLS} FROM wall_notes WHERE status = ? ORDER BY created_at DESC LIMIT 500`, [status])
    : await db().all(`SELECT ${COLS} FROM wall_notes ORDER BY created_at DESC LIMIT 500`);
  return rows.map(fromRow);
}

export async function insertPending(n: Omit<WallNote, "id" | "createdAt" | "status">, ipHash: string): Promise<WallNote> {
  const note: WallNote = { ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "pending", reports: 0 };
  await db().run(`INSERT INTO wall_notes (${COLS}, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    note.id, note.message, note.name, note.sticker, note.x, note.y, note.rotation, "pending", 0, note.createdAt, ipHash,
  ]);
  return note;
}

/** Posts from one visitor (hashed IP) in the last `sinceMs` — rate limits shared by every server instance. */
export async function countRecentByVisitor(ipHash: string, sinceMs: number): Promise<number> {
  const since = new Date(Date.now() - sinceMs).toISOString();
  const rows = await db().all(`SELECT id FROM wall_notes WHERE ip_hash = ? AND created_at >= ? LIMIT 20`, [ipHash, since]);
  return rows.length;
}

/** Notes with the same text in the last `sinceMs` (duplicate check), any status. */
export async function recentSameMessage(message: string, sinceMs: number): Promise<number> {
  const since = new Date(Date.now() - sinceMs).toISOString();
  const rows = await db().all(`SELECT id FROM wall_notes WHERE lower(message) = lower(?) AND created_at >= ? LIMIT 5`, [message, since]);
  return rows.length;
}

export async function setStatus(id: string, status: NoteStatus): Promise<boolean> {
  return (await db().run(`UPDATE wall_notes SET status = ? WHERE id = ?`, [status, id])) > 0;
}

export async function removeNote(id: string): Promise<boolean> {
  return (await db().run(`DELETE FROM wall_notes WHERE id = ?`, [id])) > 0;
}

/** A visitor report: after 3, an approved note goes back to pending for review. */
export async function report(id: string): Promise<void> {
  await db().run(
    `UPDATE wall_notes SET reports = reports + 1, status = CASE WHEN reports + 1 >= 3 AND status = 'approved' THEN 'pending' ELSE status END WHERE id = ?`,
    [id],
  );
}
