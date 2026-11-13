/**
 * Coming back from a folder page (Beyond the Interface, Photography) puts the
 * visitor where they left the homepage, with that folder still open.
 * Session-scoped; safe when storage is unavailable.
 */
const KEY = "nishanth.home.return";
const MAX_AGE = 30 * 60 * 1000;

export type FolderId = "beyond" | "photography";

export function rememberHome(folder: FolderId) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ y: Math.round(scrollY), folder, at: Date.now() }));
  } catch {}
}

/** The saved spot, if any (not consumed). */
export function peekHome(): { y: number; folder: FolderId } | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { y: number; folder: FolderId; at: number };
    if (Date.now() - v.at > MAX_AGE) return null;
    return v;
  } catch {
    return null;
  }
}

export function forgetHome() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
