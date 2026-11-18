import { contact } from "@/lib/site/content";
import s from "./site.module.css";

/**
 * Nishanth's number. On a laptop, hovering it (or tabbing to it) pops out two
 * round buttons, Call and WhatsApp, the way Pinterest's long-press menu does.
 * On a phone the number is a tap-to-call link with a WhatsApp button beside it.
 * WhatsApp opens with a friendly first message already typed.
 */
export default function PhoneLink({ className }: { className?: string }) {
  return (
    <span className={s.phone}>
      <a className={`${s.phoneNum} ${className ?? ""}`} href={contact.phoneHref}>{contact.phone}</a>
      <span className={s.phonePop}>
        <a className={`${s.popBtn} ${s.popCall}`} href={contact.phoneHref} aria-label="Call Nishanth">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M6.6 3.5h-2a1.6 1.6 0 0 0-1.6 1.8 17 17 0 0 0 15.7 15.7 1.6 1.6 0 0 0 1.8-1.6v-2a1.6 1.6 0 0 0-1.3-1.6l-3-.6a1.6 1.6 0 0 0-1.5.5l-1 1.1a13 13 0 0 1-5.4-5.4l1.1-1a1.6 1.6 0 0 0 .5-1.5l-.6-3a1.6 1.6 0 0 0-1.6-1.4Z" /></svg>
          <span className={s.popTip} aria-hidden="true">Call</span>
        </a>
        <a className={`${s.popBtn} ${s.popWa}`} href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Message Nishanth on WhatsApp">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {/* the speech bubble with its little tail, and the phone inside */}
            <path d="M3.6 20.4l1.2-4.3A8.6 8.6 0 1 1 8 19.3l-4.4 1.1Z" />
            <path d="M9.1 8.1c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5a6 6 0 0 0 2.8 2.5c.2.1.4 0 .5-.1l.6-.7c.1-.2.4-.2.6-.1l1.4.7c.2.1.3.3.3.5 0 .5-.2 1.1-.6 1.4-.5.4-1.2.6-1.9.4a9 9 0 0 1-5.5-5.1c-.3-.8-.2-1.6.4-2.7Z" />
          </svg>
          <span className={s.popTip} aria-hidden="true">WhatsApp</span>
        </a>
      </span>
    </span>
  );
}
