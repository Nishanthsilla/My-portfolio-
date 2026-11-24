"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * One shared access state for every locked screenshot on the page: asked once,
 * then — while a request is pending and the page is open — checked every 15 s,
 * so the real screenshots appear as soon as Nishanth approves.
 */
export type Access = "loading" | "none" | "pending" | "approved" | "declined" | "offline";
let state: Access = "loading";
const subs = new Set<() => void>();
const set = (s: Access) => { state = s; subs.forEach((f) => f()); };
let started = false, timer = 0;

async function check() {
  try {
    const r = await fetch("/api/access", { cache: "no-store" });
    if (!r.ok) throw 0;
    set(((await r.json()) as { status: Access }).status);
  } catch {
    set("offline");
  }
  clearTimeout(timer);
  if (state === "pending") timer = window.setTimeout(check, 15000);
}

export function useAccess() {
  const s = useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => state, () => "loading" as Access);
  useEffect(() => {
    if (!started) { started = true; check(); }
  }, []);
  return s;
}

export async function requestAccess(body: { name: string; email: string; company: string; reason: string; website: string }) {
  const r = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!r || !data?.ok) return data?.error ?? "Requests can't be sent right now. Please email me instead.";
  set("pending");
  clearTimeout(timer);
  timer = window.setTimeout(check, 15000);
  return null;
}
