import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import s from "./site.module.css";

/** The website frame (header, page, contact footer). The intro film is mounted separately in app/layout.tsx. */
export default function SiteShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className={s.site} data-site>
      {/* if JavaScript is off, reveal animations must not hide content */}
      <noscript>
        <style>{`[data-reveal]{visibility:visible!important}`}</style>
      </noscript>
      <Header />
      <main className={s.page}>{children}</main>
      {footer && <Footer />}
    </div>
  );
}
