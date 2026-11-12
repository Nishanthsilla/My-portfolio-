import Link from "next/link";
import { caseStudies, contact, footer, socials } from "@/lib/site/content";
import CopyEmail from "./CopyEmail";
import HoverPreview from "./HoverPreview";
import ProjectMedia from "./ProjectMedia";
import SocialLinks from "./SocialLinks";
import s from "./site.module.css";

/** Contact + footer, on every page. */
export default function Footer() {
  return (
    <footer id="contact" className={s.footer}>
      <div className={s.container}>
        <span className={s.eyebrow}>{contact.label}</span>
        <h2 className={s.h2} style={{ marginTop: 16, maxWidth: "14em" }}>{contact.title}</h2>
        <div className={s.footerGrid}>
          <div className={s.footerCol}>
            <span className={s.eyebrow}>{contact.emailLabel}</span>
            <div className={s.emailRow}>
              <a className={s.emailLink} href={`mailto:${contact.email}`}>{contact.email}</a>
              <CopyEmail email={contact.email} />
            </div>
            <span className={s.eyebrow} style={{ marginTop: 24 }}>{contact.phoneLabel}</span>
            <a className={s.arrowLink} href={contact.phoneHref}>{contact.phone}</a>
          </div>
          <div className={s.footerCol}>
            <span className={s.eyebrow}>Elsewhere</span>
            <SocialLinks links={socials} vertical />
          </div>
          <div className={s.footerCol}>
            <span className={s.eyebrow}>Case studies</span>
            <ul className={s.footerList}>
              {caseStudies.map((p) => (
                <li key={p.slug}>
                  <HoverPreview preview={{ title: p.title, meta: p.eyebrow, render: <ProjectMedia project={p} fill={0.86} /> }}>
                    <Link className={s.arrowLink} href={`/work/${p.slug}`}>
                      {p.title} <span className={s.arrow} aria-hidden="true">→</span>
                    </Link>
                  </HoverPreview>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={s.footerBase}>
          <span>{footer.copyright}</span>
          <span>{footer.note}</span>
        </div>
      </div>
    </footer>
  );
}
