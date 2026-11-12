"use client";

import { useState } from "react";
import s from "./site.module.css";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${email}`;
    }
  };
  return (
    <button type="button" className={`${s.btn} ${s.btnSecondary} ${s.btnSmall}`} onClick={copy} aria-live="polite">
      {copied ? "Copied ✓" : "Copy email"}
    </button>
  );
}
