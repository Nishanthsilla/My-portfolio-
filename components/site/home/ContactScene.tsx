import { contact, footer, socials } from "@/lib/site/content";
import CopyEmail from "../CopyEmail";
import SocialLinks from "../SocialLinks";
import CurtainCat from "./CurtainCat";
import s from "../site.module.css";
import c from "./contact.module.css";

/**
 * Scene 5 of the homepage journey: how to reach Nishanth, on one screen.
 * (No case-study list here — the visitor has just come through the work.)
 * A cat in the corner pulls the curtain (CurtainCat).
 */
export default function ContactScene() {
  return (
    <section id="contact" className={c.contact} aria-labelledby="contact-title">
      <div className={c.screen} data-cat-screen="">
        <div className={c.inner}>
          <span className={s.eyebrow}>{contact.label}</span>
          <h2 id="contact-title" className={c.title}>{contact.title}</h2>
          <div className={c.grid}>
            <div className={c.col}>
              <span className={s.eyebrow}>{contact.emailLabel}</span>
              <div className={s.emailRow}>
                <a className={`${s.emailLink} ${c.email}`} href={`mailto:${contact.email}`}>{contact.email}</a>
                <CopyEmail email={contact.email} />
              </div>
              <span className={`${s.eyebrow} ${c.gapTop}`}>{contact.phoneLabel}</span>
              <a className={s.arrowLink} href={contact.phoneHref}>{contact.phone}</a>
            </div>
            <div className={`${c.col} ${c.elsewhere}`}>
              <span className={s.eyebrow}>Elsewhere</span>
              <SocialLinks links={socials} vertical />
            </div>
          </div>
          <div className={c.base}>
            <span>
              {footer.copyright} · {footer.note}
            </span>
          </div>
          {/* the curtain cat, in the bottom-right corner */}
          <CurtainCat />
        </div>
      </div>
    </section>
  );
}
