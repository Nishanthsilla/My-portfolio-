/**
 * Confidential screenshots — storage (server only).
 *
 * The real client screenshots never go in the repository (it is public): they
 * are uploaded through /admin (the Images tab) and kept in the database, next to the
 * access requests. Same database as the Wall: Postgres when DATABASE_URL (or
 * Vercel's POSTGRES_URL / STORAGE_URL) is set, otherwise a local SQLite file.
 */
import { mkdirSync } from "fs";
import path from "path";
import { Pool } from "pg";

export type AccessStatus = "pending" | "approved" | "declined";
export type AccessRequest = { id: string; visitor: string; name: string; email: string; company: string; reason: string; status: AccessStatus; createdAt: string; decidedAt: string | null };

const serverless = () => !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || "";
export const accessStoreReady = () => !!databaseUrl() || !serverless();

interface Db {
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<number>;
}

function openPostgres(): Db {
  const pool = new Pool({ connectionString: databaseUrl(), max: 3 });
  const ready = pool.query(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id text PRIMARY KEY, visitor text NOT NULL, name text NOT NULL, email text NOT NULL, company text NOT NULL DEFAULT '',
      reason text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'pending', ip_hash text, created_at timestamptz NOT NULL DEFAULT now(), decided_at timestamptz
    );
    CREATE INDEX IF NOT EXISTS access_requests_visitor ON access_requests (visitor, created_at);
    CREATE TABLE IF NOT EXISTS private_images (id text PRIMARY KEY, mime text NOT NULL, data bytea NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
  `);
  let i = 0;
  const pg = (sql: string) => ((i = 0), sql.replace(/\?/g, () => `$${++i}`));
  return {
    all: async (sql, p = []) => { await ready; return (await pool.query(pg(sql), p)).rows; },
    run: async (sql, p = []) => { await ready; return (await pool.query(pg(sql), p)).rowCount ?? 0; },
  };
}

type SqliteDb = { exec(sql: string): void; prepare(sql: string): { all(...p: unknown[]): unknown[]; run(...p: unknown[]): { changes: number | bigint } } };
function openSqlite(): Db {
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as { DatabaseSync: new (file: string) => SqliteDb };
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "access.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS access_requests (
      id TEXT PRIMARY KEY, visitor TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL DEFAULT '',
      reason TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending', ip_hash TEXT, created_at TEXT NOT NULL, decided_at TEXT
    );
    CREATE TABLE IF NOT EXISTS private_images (id TEXT PRIMARY KEY, mime TEXT NOT NULL, data BLOB NOT NULL, updated_at TEXT NOT NULL);
  `);
  return {
    all: async <T,>(sql: string, p: unknown[] = []) => db.prepare(sql).all(...p) as T[],
    run: async (sql, p = []) => Number(db.prepare(sql).run(...p).changes),
  };
}

const g = globalThis as unknown as { __accessDb?: Db };
const db = () => (g.__accessDb ??= databaseUrl() ? openPostgres() : openSqlite());

type Row = { id: string; visitor: string; name: string; email: string; company: string; reason: string; status: AccessStatus; created_at: string | Date; decided_at: string | Date | null };
const iso = (v: string | Date | null) => (v == null ? null : v instanceof Date ? v.toISOString() : String(v));
const fromRow = (r: Row): AccessRequest => ({ id: r.id, visitor: r.visitor, name: r.name, email: r.email, company: r.company, reason: r.reason, status: r.status, createdAt: iso(r.created_at)!, decidedAt: iso(r.decided_at) });
const COLS = "id, visitor, name, email, company, reason, status, created_at, decided_at";

export async function createRequest(r: { visitor: string; name: string; email: string; company: string; reason: string }, ipHash: string) {
  const req: AccessRequest = { ...r, id: crypto.randomUUID(), status: "pending", createdAt: new Date().toISOString(), decidedAt: null };
  await db().run(`INSERT INTO access_requests (${COLS}, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.id, req.visitor, req.name, req.email, req.company, req.reason, req.status, req.createdAt, null, ipHash]);
  return req;
}

/** the visitor's most recent request (approved wins over anything later) */
export async function statusFor(visitor: string): Promise<AccessStatus | "none"> {
  const rows = await db().all<{ status: AccessStatus }>(`SELECT status FROM access_requests WHERE visitor = ? ORDER BY created_at DESC LIMIT 20`, [visitor]);
  if (rows.some((r) => r.status === "approved")) return "approved";
  return rows[0]?.status ?? "none";
}

export async function countRecent(ipHash: string, sinceMs: number) {
  const rows = await db().all<{ id: string }>(`SELECT id FROM access_requests WHERE ip_hash = ? AND created_at >= ? LIMIT 20`, [ipHash, new Date(Date.now() - sinceMs).toISOString()]);
  return rows.length;
}

export async function getRequest(id: string) {
  const rows = await db().all<Row>(`SELECT ${COLS} FROM access_requests WHERE id = ?`, [id]);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function listRequests() {
  return (await db().all<Row>(`SELECT ${COLS} FROM access_requests ORDER BY created_at DESC LIMIT 200`)).map(fromRow);
}

export async function decide(id: string, status: AccessStatus) {
  return (await db().run(`UPDATE access_requests SET status = ?, decided_at = ? WHERE id = ?`, [status, new Date().toISOString(), id])) > 0;
}

export async function putImage(id: string, mime: string, data: Buffer) {
  const now = new Date().toISOString();
  const n = await db().run(`UPDATE private_images SET mime = ?, data = ?, updated_at = ? WHERE id = ?`, [mime, data, now, id]);
  if (!n) await db().run(`INSERT INTO private_images (id, mime, data, updated_at) VALUES (?, ?, ?, ?)`, [id, mime, data, now]);
}

export async function getImage(id: string) {
  const rows = await db().all<{ mime: string; data: Buffer | Uint8Array }>(`SELECT mime, data FROM private_images WHERE id = ?`, [id]);
  return rows[0] ? { mime: rows[0].mime, data: Buffer.from(rows[0].data) } : null;
}

export async function listImages() {
  return db().all<{ id: string; updated_at: string | Date }>(`SELECT id, updated_at FROM private_images ORDER BY id`);
}
