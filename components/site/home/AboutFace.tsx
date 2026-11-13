"use client";

import Link from "next/link";
import { useState } from "react";
import h from "./home.module.css";

/** Where the face photo lives. Drop the file here (a square crop works best). */
const FACE = "/images/about/face.webp";

/**
 * The intro's About button. On hover (or keyboard focus) a round crop of
 * Nishanth's face pops up above it. If the photo isn't there yet, the button
 * simply works without it.
 */
export default function AboutFace() {
  const [ok, setOk] = useState(true);
  return (
    <Link className={`${h.btnSecondary} ${h.aboutBtn}`} href="/about">
      About
      {ok && (
        <span className={h.face} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACE} alt="" width={132} height={132} onError={() => setOk(false)} />
        </span>
      )}
    </Link>
  );
}
