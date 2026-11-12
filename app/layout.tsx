import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Intro from "@/components/Intro";

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
    <html lang="en" className={`js-motion ${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Same font request as the original portfolio. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300;12..96,75..100,500;12..96,75..100,700;12..96,75..100,800&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body data-tone="paper">
        {/* The real site is always rendered; the intro sits above it. */}
        <div id="site-root">{children}</div>
        <Intro />
        <noscript>
          <style>{`[data-intro-loader],[data-intro-film]{display:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
