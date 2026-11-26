/**
 * Page views for the admin's Analytics tab (server only). Privacy-friendly: no cookies and no IP
 * addresses are kept. A visitor is a one-way hash of (IP + browser + the day), so the same person
 * counts once per day and can't be recognised across days or identified. Same database as the Wall:
 * Postgres when DATABASE_URL (or Vercel's POSTGRES_URL / STORAGE_URL) is set, otherwise SQLite.
 */
import { mkdirSync } from "fs";
import path from "path";
import { Pool } from "pg";

const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.STORAGE_URL || "";
const serverless = () => !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
export const analyticsReady = () => !!databaseUrl() || !serverless();

type Row = Record<string, string | number | null>;
interface Db {
  all(sql: string, p?: unknown[]): Promise<Row[]>;
  run(sql: string, p?: unknown[]): Promise<void>;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS page_views (
    day     TEXT NOT NULL,
    at      TEXT NOT NULL,
    path    TEXT NOT NULL,
    ref     TEXT NOT NULL DEFAULT '',
    device  TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    visitor TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS page_views_day ON page_views (day);
`;

function openPostgres(): Db {
  const pool = new Pool({ connectionString: databaseUrl(), max: 3 });
  const ready = pool.query(SCHEMA);
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
      await pool.query(pg(sql), p);
    },
  };
}

type SqliteDb = { exec(s: string): void; prepare(s: string): { all(...p: unknown[]): unknown[]; run(...p: unknown[]): unknown } };
function openSqlite(): Db {
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as { DatabaseSync: new (f: string) => SqliteDb };
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "wall.db"));
  db.exec(SCHEMA);
  return {
    all: async (sql, p = []) => db.prepare(sql).all(...p) as Row[],
    run: async (sql, p = []) => {
      db.prepare(sql).run(...p);
    },
  };
}

const g = globalThis as unknown as { __statsDb?: Db };
const db = () => (g.__statsDb ??= databaseUrl() ? openPostgres() : openSqlite());

export async function recordView(v: { path: string; ref: string; device: string; country: string; visitor: string }) {
  const at = new Date().toISOString();
  await db().run(`INSERT INTO page_views (day, at, path, ref, device, country, visitor) VALUES (?, ?, ?, ?, ?, ?, ?)`, [at.slice(0, 10), at, v.path, v.ref, v.device, v.country, v.visitor]);
}

export type Stats = {
  days: number;
  views: number;
  visitors: number;
  perDay: { day: string; views: number; visitors: number }[];
  pages: { k: string; n: number }[];
  refs: { k: string; n: number }[];
  devices: { k: string; n: number }[];
  countries: { k: string; n: number }[];
};

export async function stats(days: number): Promise<Stats> {
  const since = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const d = db();
  const num = (r: Row | undefined, k: string) => Number(r?.[k] ?? 0);
  const [tot] = await d.all(`SELECT COUNT(*) AS v, COUNT(DISTINCT visitor) AS u FROM page_views WHERE day >= ?`, [since]);
  const byDay = await d.all(`SELECT day, COUNT(*) AS v, COUNT(DISTINCT visitor) AS u FROM page_views WHERE day >= ? GROUP BY day`, [since]);
  const top = async (col: string, where = "") =>
    (await d.all(`SELECT ${col} AS k, COUNT(DISTINCT visitor) AS n FROM page_views WHERE day >= ? ${where} GROUP BY ${col} ORDER BY n DESC LIMIT 8`, [since])).map((r) => ({ k: String(r.k ?? ""), n: num(r, "n") }));
  const map = new Map(byDay.map((r) => [String(r.day), r]));
  const perDay = Array.from({ length: days }, (_, k) => {
    const day = new Date(Date.now() - (days - 1 - k) * 86_400_000).toISOString().slice(0, 10);
    const r = map.get(day);
    return { day, views: num(r, "v"), visitors: num(r, "u") };
  });
  return {
    days,
    views: num(tot, "v"),
    visitors: num(tot, "u"),
    perDay,
    pages: await top("path"),
    refs: await top("ref", "AND ref <> ''"),
    devices: await top("device"),
    countries: await top("country", "AND country <> ''"),
  };
}
