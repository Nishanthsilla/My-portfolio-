"use client";

import { useState } from "react";
import w from "./wall.module.css";

/**
 * To use a licensed side-eye monkey GIF instead of the drawn monkey: save it as
 * public/images/wall/side-eye-monkey.gif and set this to "/images/wall/side-eye-monkey.gif".
 */
export const SIDE_EYE_GIF: string | null = null;

/**
 * The Side-Eye Filter's reaction. Uses SIDE_EYE_GIF when it is set (and loads);
 * otherwise an original drawn monkey whose eyes slide sideways, slowly, under
 * heavy lids. Pops in with a small entrance; reduced motion keeps it still.
 */
export default function SideEyeMonkey() {
  const [gif, setGif] = useState(!!SIDE_EYE_GIF);
  return (
    <div className={w.monkey} role="status">
      {gif ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={w.monkeyArt} src={SIDE_EYE_GIF!} alt="A monkey giving you the side-eye" onError={() => setGif(false)} />
      ) : (
        <svg className={w.monkeyArt} viewBox="0 0 120 120" role="img" aria-label="A monkey giving you the side-eye">
          <circle cx="22" cy="56" r="15" fill="#8A5A3B" />
          <circle cx="22" cy="56" r="8" fill="#E9B98F" />
          <circle cx="98" cy="56" r="15" fill="#8A5A3B" />
          <circle cx="98" cy="56" r="8" fill="#E9B98F" />
          <ellipse cx="60" cy="60" rx="38" ry="40" fill="#8A5A3B" />
          <path d="M60 40c-16 0-28 8-28 22 0 18 12 34 28 34s28-16 28-34c0-14-12-22-28-22z" fill="#E9B98F" />
          {/* eyes: whites, pupils that slide sideways, heavy lids */}
          <g>
            <ellipse cx="47" cy="55" rx="9.5" ry="8" fill="#fff" />
            <ellipse cx="73" cy="55" rx="9.5" ry="8" fill="#fff" />
            <g className={w.monkeyPupils}>
              <circle cx="47" cy="56" r="4.6" fill="#1d1b19" />
              <circle cx="73" cy="56" r="4.6" fill="#1d1b19" />
            </g>
            <path d="M36.5 55c1-6 5.5-9 10.5-9s9.5 3 10.5 9z" fill="#C89670" />
            <path d="M62.5 55c1-6 5.5-9 10.5-9s9.5 3 10.5 9z" fill="#C89670" />
            <path d="M37 51.5h21M63 51.5h21" stroke="#6E4630" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <ellipse cx="55" cy="76" rx="2" ry="1.6" fill="#6E4630" />
          <ellipse cx="65" cy="76" rx="2" ry="1.6" fill="#6E4630" />
          <path d="M50 86c6 2 14 2 20-1" fill="none" stroke="#6E4630" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )}
      <p className={w.monkeyLine}>Hmm... let&apos;s keep it friendly 🙄</p>
    </div>
  );
}
