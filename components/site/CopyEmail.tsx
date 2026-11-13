"use client";

import { useState } from "react";
import s from "./site.module.css";

/**
 * The email address itself: clicking it copies it and says "Mail copied".
 * (If the browser won't allow copying, it opens the mail app instead.)
 */
export default function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      await navigator.clipboard.writeText(email);
      e.preventDefault();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // fall through to the mailto: link
    }
  };
  return (
    <span className={s.copyMail}>
      <a className={`${s.emailLink} ${className}`} href={`mailto:${email}`} onClick={copy} title="Click to copy">
        {email}
      </a>
      <span className={`${s.copied} ${copied ? s.copiedOn : ""}`} role="status" aria-live="polite">
        {copied ? "Mail copied ✓" : ""}
      </span>
    </span>
  );
}
