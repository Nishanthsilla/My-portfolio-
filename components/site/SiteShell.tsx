import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import AskPanel from "./ask/AskPanel";
import s from "./site.module.css";

/** your face for the chat sticker: shown once the file exists, initials until then */
const FACE = "/images/about/face.webp";
const FACE_FILE = fs.existsSync(path.join(process.cwd(), "public", FACE));

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
      <AskPanel face={FACE_FILE ? FACE : null} />
    </div>
  );
}
