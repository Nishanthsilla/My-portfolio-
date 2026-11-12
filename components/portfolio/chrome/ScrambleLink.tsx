"use client";

import { useRef, useState } from "react";

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Nav link with the original's letter-scramble on hover (26ms steps). */
export default function ScrambleLink({ href, label }: { href: string; label: string }) {
  const [text, setText] = useState(label);
  const busy = useRef(false);
  const onEnter = () => {
    if (busy.current) return;
    busy.current = true;
    let f = 0;
    const id = window.setInterval(() => {
      setText(label.split("").map((ch, i) => (i < f / 2 ? label[i] : AZ[(Math.random() * 26) | 0])).join(""));
      f++;
      if (f / 2 >= label.length) {
        window.clearInterval(id);
        setText(label);
        busy.current = false;
      }
    }, 26);
  };
  return (
    <a href={href} onMouseEnter={onEnter}>
      {text}
    </a>
  );
}
