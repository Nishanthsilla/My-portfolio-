"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** the Google Analytics 4 Measurement ID (public by design; NEXT_PUBLIC_GA_ID overrides it) */
const GA = process.env.NEXT_PUBLIC_GA_ID || "G-1YQK2Z18MY";
type Gtag = (...a: unknown[]) => void;

/**
 * Counts page views: the site's own privacy-friendly counter (the admin's Analytics tab) on every
 * page change, plus Google Analytics (G-1YQK2Z18MY). Admin pages and the in-panel
 * previews (embeds) are never counted.
 */
export default function Analytics() {
  const path = usePathname() ?? "/";
  const first = useRef(true);
  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute("data-embed") || /^\/admin(\/|$)/.test(path)) return;
    const body = JSON.stringify({ path, ref: document.referrer });
    try {
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" })))
        void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    } catch {}
    // the first page is sent by the Google tag itself as it loads; later page changes are sent here
    if (first.current) first.current = false;
    else (window as unknown as { gtag?: Gtag }).gtag?.("event", "page_view", { page_path: path, page_location: location.href });
  }, [path]);

  if (!GA) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
      <Script id="ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}',{send_page_view:false});if(!/^\\/admin(\\/|$)/.test(location.pathname)&&window.self===window.top)gtag('event','page_view',{page_path:location.pathname,page_location:location.href});`}
      </Script>
    </>
  );
}
