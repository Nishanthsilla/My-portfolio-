"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { projects, type Project } from "@/lib/site/content";
import { caseStudyHref, categoryLabel, overviewHref } from "@/lib/site/routes";
import siteCss from "../site.module.css";
import d from "./drawer.module.css";

export type DrawerMode = "simple" | "deep";

/**
 * A project, opened in a panel that slides in from the right. Visitors pick
 * how much to read: Simplified (the short overview) or Deep dive (the full
 * case study). The pages themselves load inside the panel, so the homepage
 * stays exactly where it was underneath.
 */
export default function ProjectDrawer({ project: p, mode, onMode, onProject, onClose }: { project: Project; mode: DrawerMode; onMode: (m: DrawerMode) => void; onProject: (p: Project, m: DrawerMode) => void; onClose: () => void }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const href = mode === "simple" ? overviewHref(p) : caseStudyHref(p);
  const close = () => {
    setClosing(true);
    window.setTimeout(onClose, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 280);
  };

  useEffect(() => setLoaded(false), [href]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("[data-first]")?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    // links inside the page: the other view switches the tab, anything else opens for real
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== "embed:navigate") return;
      const to: string = e.data.href;
      const path = to.split("#")[0].split("?")[0];
      // another project: show it in the same panel (no page load)
      const other = projects.find((x) => !x.external && (path === overviewHref(x) || path === caseStudyHref(x)));
      if (other) return onProject(other, path === caseStudyHref(other) ? "deep" : "simple");
      // a homepage section ("All work"): close the panel and move the journey there
      if (path === "/" || path === "") {
        onClose();
        const hash = to.includes("#") ? to.slice(to.indexOf("#")) : "";
        if (hash) window.setTimeout(() => document.querySelector<HTMLAnchorElement>(`header a[href="/${hash}"]`)?.click(), 50);
        return;
      }
      // anywhere else in the site: a client-side navigation, never a full reload
      router.push(to);
    };
    addEventListener("keydown", onKey);
    addEventListener("message", onMsg);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("message", onMsg);
      html.style.overflow = prev;
      opener?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.slug, mode]);

  const meta = [categoryLabel(p.category), p.org, p.year].filter(Boolean).join(" · ");

  return createPortal(
    // display: contents: the site's colour and type tokens, no extra box
    <div className={siteCss.site} style={{ display: "contents" }}>
    <div className={`${d.layer} ${closing ? d.closing : ""}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={panel} className={d.panel} role="dialog" aria-modal="true" aria-label={p.title}>
        <div className={d.bar}>
          <div className={d.titles}>
            <span className={d.meta}>{meta}</span>
            <b className={d.title}>{p.title}</b>
          </div>
          <div className={d.switch} role="tablist" aria-label="How much to read">
            <button type="button" role="tab" aria-selected={mode === "simple"} onClick={() => onMode("simple")} data-first>
              Simplified
            </button>
            <button type="button" role="tab" aria-selected={mode === "deep"} onClick={() => onMode("deep")}>
              Deep dive
            </button>
          </div>
          <a className={d.open} href={href} title="Open as a full page">
            <span className={d.openLabel}>Full page</span>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 4 12" /></svg>
          </a>
          <button type="button" className={d.close} onClick={close} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
          </button>
        </div>
        <p className={d.hint}>
          {mode === "simple" ? "The short version: what it is, my role and the goal. About a minute." : "The whole story: problem, process, decisions and outcome."}
        </p>
        <div className={d.body}>
          {!loaded && <div className={d.loading} aria-hidden="true"><i /><i /><i /></div>}
          <iframe key={href} src={href} title={`${p.title} — ${mode === "simple" ? "simplified" : "deep dive"}`} className={`${d.frame} ${loaded ? d.frameOn : ""}`} onLoad={() => setLoaded(true)} />
        </div>
      </div>
    </div>
    </div>,
    document.body,
  );
}
