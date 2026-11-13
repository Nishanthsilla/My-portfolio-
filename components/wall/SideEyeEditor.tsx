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
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const mirror = useRef<HTMLDivElement>(null);
  const flags = useMemo(() => findFlags(value), [value]);

  // the mirror's content: plain text with <s> around each flagged range
  const parts: React.ReactNode[] = [];
  let at = 0;
  flags.forEach((f, i) => {
    if (f.start > at) parts.push(value.slice(at, f.start));
    parts.push(
      <s key={i} className={w.flag}>
        {value.slice(f.start, f.end)}
      </s>,
    );
    at = f.end;
  });
  parts.push(value.slice(at));
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
    <div className={`${w.editor} ${multiline ? w.editorMulti : w.editorSingle} ${flags.length ? w.editorFlagged : ""}`}>
      <label htmlFor={id} className={w.editorLabel}>
        {label}
        <span id={`${id}-count`} className={w.editorCount} aria-live="off">
          {value.length}/{max}
        </span>
      </label>
      <div className={w.editorBox}>
        <div ref={mirror} className={w.editorMirror} aria-hidden="true">
          {parts}
        </div>
        {multiline ? <textarea {...common} rows={4} /> : <input {...common} type="text" autoComplete="nickname" />}
      </div>
    </div>
  );
}
