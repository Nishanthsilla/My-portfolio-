"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GA = process.env.NEXT_PUBLIC_GA_ID;
type Gtag = (...a: unknown[]) => void;

/**
 * Counts page views: the site's own privacy-friendly counter (the admin's Analytics tab) on every
 * page change, plus Google Analytics when NEXT_PUBLIC_GA_ID is set. Admin pages and the in-panel
 * previews (embeds) are never counted.
 */
export default function Analytics() {
  const path = usePathname() ?? "/";
  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute("data-embed") || /^\/admin(\/|$)/.test(path)) return;
    const body = JSON.stringify({ path, ref: document.referrer });
    try {
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" })))
        void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    } catch {}
    (window as unknown as { gtag?: Gtag }).gtag?.("event", "page_view", { page_path: path, page_location: location.href });
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
