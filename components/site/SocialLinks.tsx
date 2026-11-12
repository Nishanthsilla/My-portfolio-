import type { SocialLink } from "@/lib/site/content";
import HoverPreview from "./HoverPreview";
import s from "./site.module.css";

/** Social links; those with a real preview asset (e.g. the resume) show it on hover or focus. */
export default function SocialLinks({ links, vertical = false }: { links: SocialLink[]; vertical?: boolean }) {
  return (
    <ul className={vertical ? s.footerList : s.socials}>
      {links.map((l) => {
        const internal = l.href.startsWith("/");
        const a = (
          <a
            className={s.arrowLink}
            href={l.href}
            {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {l.label} <span className={s.arrow} aria-hidden="true">↗</span>
          </a>
        );
        return <li key={l.id}>{l.preview ? <HoverPreview preview={{ title: l.preview.title, src: l.preview.src, alt: `${l.label} preview` }}>{a}</HoverPreview> : a}</li>;
      })}
    </ul>
  );
}
