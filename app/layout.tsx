import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import fs from "node:fs";
import path from "node:path";
import Intro from "@/components/Intro";
import GlobalWidgets from "@/components/site/GlobalWidgets";

/** the face for the chat sticker: shown once the file exists, initials until then */
const FACE = "/images/about/face-sticker.webp";
const FACE_FILE = fs.existsSync(path.join(process.cwd(), "public", FACE));

export const metadata: Metadata = {
  title: "Nishanth in Motion",
  description: "Nishanth Silla — Lead Product Designer for agentic AI. Hyderabad, India.",
  other: { "claude:viewport-fit-sides": "cover" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // "js-motion" mirrors the original's inline <script> that tagged <html> before paint.
    <html lang="en" suppressHydrationWarning className={`js-motion ${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Same font request as the original portfolio. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300;12..96,75..100,500;12..96,75..100,700;12..96,75..100,800&family=Unbounded:wght@700&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&display=swap"
        />
        {/* theme before paint: the visitor's choice, else light; inside the project panel, the parent page's theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=null;try{if(window.self!==window.top)t=parent.document.documentElement.getAttribute("data-theme")}catch(e){}t=t||localStorage.getItem("nishanth.theme")||"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
        {/* Inside the project panel (an iframe on the homepage): no navbar, footer or intro, and links report back to the panel. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(window.self!==window.top){var d=document.documentElement;d.setAttribute("data-embed","");addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target==="_blank")return;var h=a.getAttribute("href");if(!h||h.charAt(0)==="#"||/^(mailto|tel):/.test(h))return;var u=new URL(h,location.href);if(u.origin!==location.origin){a.target="_blank";return;}e.preventDefault();parent.postMessage({type:"embed:navigate",href:u.pathname+u.search+u.hash},location.origin);},true);}`,
          }}
        />
      </head>
      <body data-tone="paper">
        {/* The real site is always rendered; the intro sits above it. */}
        <div id="site-root">{children}</div>
        <GlobalWidgets face={FACE_FILE ? FACE : null} />
        <Intro />
        <noscript>
          <style>{`[data-intro-loader],[data-intro-film]{display:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
