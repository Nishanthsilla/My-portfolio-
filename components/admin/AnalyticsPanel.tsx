"use client";

import { useEffect, useState } from "react";
import a from "./analytics.module.css";
import type { AdminTab } from "./AdminPortal";

type Item = { k: string; n: number };
type Data = {
  ok: boolean;
  error?: string;
  days: number;
  views: number;
  visitors: number;
  perDay: { day: string; views: number; visitors: number }[];
  pages: Item[];
  refs: Item[];
  devices: Item[];
  countries: Item[];
  wall: { waiting: number; approved: number };
  access: { waiting: number; total: number };
  ga: boolean;
};

const RANGES = [7, 30, 90] as const;
const PAGE_NAMES: Record<string, string> = { "/": "Home", "/about": "About", "/wall": "The Wall", "/beyond": "Beyond", "/photography": "Photography" };
const pageName = (p: string) => PAGE_NAMES[p] ?? p.replace(/^\/work\//, "Work · ").replace(/\/case-study$/, " (full)").replace(/-/g, " ");
const countryName = (c: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(c) ?? c;
  } catch {
    return c;
  }
};
const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

/** Everything at a glance: visitors, views, the daily trend, top pages, sources, devices, countries, and what's waiting. */
export default function AnalyticsPanel({ token, onOpen }: { token: string; onOpen: (t: AdminTab) => void }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<Data | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/analytics?days=${days}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then((r) => r.json())
      .then((d: Data) => live && setData(d))
      .catch(() => live && setData({ ok: false, error: "Can't reach the server." } as Data));
    return () => {
      live = false;
    };
  }, [token, days]);

  if (!data) return <p className={a.msg}>Loading…</p>;
  if (!data.ok) return <p className={a.msg}>{data.error}</p>;

  const max = Math.max(1, ...data.perDay.map((d) => d.visitors));
  const avg = Math.round((data.visitors / data.days) * 10) / 10;
  const shown = hover !== null ? data.perDay[hover] : null;
  const list = (title: string, items: Item[], name: (k: string) => string, empty: string) => {
    const top = Math.max(1, ...items.map((i) => i.n));
    return (
      <section className={a.card}>
        <h3>{title}</h3>
        {items.length === 0 ? (
          <p className={a.empty}>{empty}</p>
        ) : (
          <ol className={a.rank}>
            {items.map((i) => (
              <li key={i.k} style={{ ["--w" as string]: `${(i.n / top) * 100}%` }}>
                <span className={a.rankName}>{name(i.k) || "(unknown)"}</span>
                <b>{i.n}</b>
              </li>
            ))}
          </ol>
        )}
      </section>
    );
  };

  return (
    <div className={a.wrap}>
      <div className={a.bar}>
        <div className={a.range} role="tablist" aria-label="Period">
          {RANGES.map((r) => (
            <button key={r} role="tab" aria-selected={days === r} onClick={() => setDays(r)}>
              Last {r} days
            </button>
          ))}
        </div>
        <span className={a.ga} data-on={data.ga ? "" : undefined}>{data.ga ? "Google Analytics: on" : "Google Analytics: not connected"}</span>
      </div>

      {/* the headline numbers */}
      <div className={a.tiles}>
        <div className={a.tile}>
          <span>Visitors</span>
          <b>{data.visitors.toLocaleString()}</b>
          <small>about {avg} a day</small>
        </div>
        <div className={a.tile}>
          <span>Page views</span>
          <b>{data.views.toLocaleString()}</b>
          <small>{data.visitors ? `${(data.views / data.visitors).toFixed(1)} pages per visitor` : "–"}</small>
        </div>
        <button type="button" className={`${a.tile} ${a.tileLink}`} onClick={() => onOpen("notes")}>
          <span>Wall notes waiting</span>
          <b>{data.wall.waiting}</b>
          <small>{data.wall.approved} on the wall · review →</small>
        </button>
        <button type="button" className={`${a.tile} ${a.tileLink}`} onClick={() => onOpen("notifications")}>
          <span>Access requests waiting</span>
          <b>{data.access.waiting}</b>
          <small>{data.access.total} in total · review →</small>
        </button>
      </div>

      {/* visitors per day */}
      <section className={a.card}>
        <div className={a.chartHead}>
          <h3>Visitors per day</h3>
          <span className={a.readout} aria-live="polite">
            {shown ? `${fmtDay(shown.day)}: ${shown.visitors} visitor${shown.visitors === 1 ? "" : "s"}, ${shown.views} view${shown.views === 1 ? "" : "s"}` : "Hover a day for its numbers"}
          </span>
        </div>
        <div className={a.chart} role="img" aria-label={`Visitors per day over the last ${data.days} days. Total ${data.visitors}.`} onPointerLeave={() => setHover(null)}>
          <div className={a.grid} aria-hidden="true">
            <span>{max}</span>
            <span>{Math.round(max / 2)}</span>
            <span>0</span>
          </div>
          <div className={a.bars}>
            {data.perDay.map((d, i) => (
              <span key={d.day} className={a.col} data-on={hover === i ? "" : undefined} onPointerEnter={() => setHover(i)}>
                <i style={{ height: `${(d.visitors / max) * 100}%` }} />
              </span>
            ))}
          </div>
        </div>
        <div className={a.axis} aria-hidden="true">
          <span>{fmtDay(data.perDay[0].day)}</span>
          <span>{fmtDay(data.perDay[data.perDay.length - 1].day)}</span>
        </div>
        <details className={a.table}>
          <summary>Show as a table</summary>
          <table>
            <thead><tr><th>Day</th><th>Visitors</th><th>Views</th></tr></thead>
            <tbody>
              {[...data.perDay].reverse().map((d) => (
                <tr key={d.day}><td>{fmtDay(d.day)}</td><td>{d.visitors}</td><td>{d.views}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <div className={a.lists}>
        {list("Top pages", data.pages, pageName, "No visits yet.")}
        {list("Where visitors came from", data.refs, (k) => k, "No referrals yet: visitors so far typed the address or came from an app.")}
        {list("Devices", data.devices, (k) => k, "No visits yet.")}
        {list("Countries", data.countries, countryName, "Country shows once the site runs on Vercel.")}
      </div>
      <p className={a.note}>Counted privately on your own database: no cookies, no IP addresses stored, bots and your admin visits left out. A visitor is counted once per day.</p>
    </div>
  );
}
