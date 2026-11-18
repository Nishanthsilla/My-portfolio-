import { contact } from "@/lib/site/content";
import s from "./site.module.css";

const WA = "M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z";

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
          {/* WhatsApp icon: Font Awesome Free v7.3.1 by @fontawesome (https://fontawesome.com/license/free, CC BY 4.0) */}
          <svg viewBox="96 96 448 448" aria-hidden="true"><path fill="currentColor" d={WA} /></svg>
          <span className={s.popTip} aria-hidden="true">WhatsApp</span>
        </a>
      </span>
    </span>
  );
}
