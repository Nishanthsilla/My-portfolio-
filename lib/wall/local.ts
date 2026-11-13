/**
 * The Wall — what this visitor's browser remembers (localStorage, per device):
 *  · the unsent draft (sticker, position, message, name, step), so a refresh
 *    never throws away what they were writing;
 *  · their own notes after posting, shown to them (only) as "waiting for
 *    approval" until the note is approved and appears for everyone — or, in the
 *    offline copy with no server, as "saved on this device".
 * Every access is guarded: storage can be unavailable (private mode, blocked).
 */
import type { PublicNote } from "./types";

const DRAFT = "nishanth.wall.draft";
const MINE = "nishanth.wall.mine";
const LAYOUT = "nishanth.wall.layout";
const KEEP_MS = 30 * 24 * 3600_000;

export type SavedDraft = {
  draft: { sticker: string; font?: string; x: number; y: number; rotation: number } | null;
  message: string;
  name: string;
  step: "place" | "compose"; // "place" from older saves is read as "compose"
};
export type MyNote = PublicNote & { local?: boolean };

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, v: unknown) {
  try {
    if (v === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export const loadDraft = () => read<SavedDraft>(DRAFT);
export const saveDraft = (d: SavedDraft | null) => write(DRAFT, d);

export function loadMine(): MyNote[] {
  const list = read<MyNote[]>(MINE) ?? [];
  return list.filter((n) => Date.now() - new Date(n.createdAt).getTime() < KEEP_MS);
}
export function addMine(n: MyNote) {
  write(MINE, [...loadMine().filter((x) => x.id !== n.id), n]);
}
/** Forget notes that are now public (approved) — they show on the wall like everyone else's. */
export function pruneMine(publicIds: Set<string>) {
  const kept = loadMine().filter((n) => !publicIds.has(n.id));
  write(MINE, kept.length ? kept : null);
  return kept;
}

/** This visitor's own arrangement: note/sticker id → where they put it (wall-relative) and its stacking order. */
export type Spot = { x: number; y: number; z: number };
export const loadLayout = () => read<Record<string, Spot>>(LAYOUT) ?? {};
export const saveLayout = (l: Record<string, Spot> | null) => write(LAYOUT, l && Object.keys(l).length ? l : null);
