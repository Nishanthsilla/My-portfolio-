"use client";

import { useRef, useState } from "react";

/** "Copy email" with the original's success state and selection fallback. */
export default function CopyEmailButton({ targetId }: { targetId: string }) {
  const [label, setLabel] = useState("Copy email");
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const onClick = () => {
    const em = document.getElementById(targetId);
    if (!em) return;
    const txt = (em.textContent ?? "").trim();
    const ok = () => {
      setLabel("Copied ✓");
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setLabel("Copy email");
        setDone(false);
      }, 1800);
    };
    const fallback = () => {
      const r = document.createRange();
      r.selectNodeContents(em);
      const s = getSelection();
      s?.removeAllRanges();
      s?.addRange(r);
      setLabel("Selected — copy it");
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(ok, fallback);
    else fallback();
  };

  return (
    <button className={`copy magnetic${done ? " done" : ""}`} id="copyBtn" type="button" onClick={onClick}>
      {label}
    </button>
  );
}
