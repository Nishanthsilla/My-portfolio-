import { Fragment } from "react";

/**
 * Renders text as one span per word, joined by spaces — the same output the
 * original's runtime "split helpers" produced with innerHTML.
 */
export default function SplitWords({ text, className }: { text: string; className: string }) {
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className={className}>{w}</span>
        </Fragment>
      ))}
    </>
  );
}
