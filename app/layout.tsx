import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import SiteHeader from "@/components/navigation/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import IntroLoader from "@/components/loader/IntroLoader";

export const metadata: Metadata = {
  title: "[Your Name] — Product / UX Designer",
  description: "[Placeholder] Portfolio of a Product and UX Designer.",
};

export const viewport: Viewport = {
  themeColor: "#090d19",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        {/* The real site is always rendered; the intro sits above it. */}
        <div id="site-root">
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
        <IntroLoader />
        <noscript>
          <style>{`[data-intro-loader]{display:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
