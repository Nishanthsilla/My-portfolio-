"use client";

import { useId, useMemo, useRef, type ChangeEvent } from "react";
import { findFlags } from "@/lib/wall/moderation";
import w from "./wall.module.css";

/**
 * A normal <textarea> (or <input>) with a synchronised mirror behind it. The
 * field keeps all native behaviour — caret, selection, paste, undo/redo,
 * mobile keyboards, screen readers — while its own text is transparent; the
 * mirror draws the same text, with only the flagged words struck through.
 * The strike-through is private feedback: flagged text is never submitted.
 */
export default function SideEyeEditor({
  value,
  onChange,
  max,
  label,
  placeholder,
  multiline = true,
  autoFocus,
  bare = false,
  signature = false,
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  /** prompt-bar style: no visible label or counter box (the label stays for screen readers) */
  bare?: boolean;
  /** one line for the note and its signature: "words @name" — the @name part is drawn in grey,
   *  and until there is one, a grey "@your name" waits at the end of what's typed */
  signature?: boolean;
}) {
  const id = useId();
  const mirror = useRef<HTMLDivElement>(null);
  const flags = useMemo(() => findFlags(value), [value]);
  const sig = signature ? value.lastIndexOf("@") : -1;
  const body = sig >= 0 ? value.slice(0, sig) : value;

  // the mirror's content: plain text with <s> around each flagged range (in the words; the name is checked too)
  const parts: React.ReactNode[] = [];
  let at = 0;
  flags.filter((f) => f.end <= body.length).forEach((f, i) => {
    if (f.start > at) parts.push(body.slice(at, f.start));
    parts.push(
      <s key={i} className={w.flag}>
        {body.slice(f.start, f.end)}
      </s>,
    );
    at = f.end;
  });
  parts.push(body.slice(at));
  if (signature && sig >= 0) parts.push(<span key="sig" className={w.sig}>{value.slice(sig)}</span>);
  else if (signature && value.trim()) parts.push(<span key="ghost" className={w.sigGhost}>{/\s$/.test(value) ? "" : " "}@your name</span>);
  parts.push("​"); // keeps a trailing empty line measured

  const sync = (el: HTMLTextAreaElement | HTMLInputElement) => {
    if (!mirror.current) return;
    mirror.current.scrollTop = el.scrollTop;
    mirror.current.scrollLeft = el.scrollLeft;
  };
  const change = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e.target.value.slice(0, max));
    sync(e.target);
  };
  const common = {
    id,
    value,
    onChange: change,
    onScroll: (e: React.UIEvent<HTMLTextAreaElement | HTMLInputElement>) => sync(e.currentTarget),
    onSelect: (e: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => sync(e.currentTarget),
    maxLength: max,
    placeholder,
    spellCheck: true,
    autoFocus,
    "aria-invalid": flags.length > 0,
    "aria-describedby": `${id}-count`,
    className: w.editorField,
  };

  return (
    <div className={`${w.editor} ${multiline ? w.editorMulti : w.editorSingle} ${flags.length ? w.editorFlagged : ""} ${bare ? w.editorBare : ""}`}>
      <label htmlFor={id} className={bare ? w.srOnly : w.editorLabel}>
        {label}
        <span id={`${id}-count`} className={w.editorCount} aria-live="off">
          {value.length}/{max}
        </span>
      </label>
      <div className={w.editorBox}>
        <div ref={mirror} className={w.editorMirror} aria-hidden="true">
          {parts}
        </div>
        {multiline ? <textarea {...common} rows={bare ? 2 : 4} /> : <input {...common} type="text" autoComplete="nickname" />}
      </div>
    </div>
  );
}
