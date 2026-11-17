"use client";

import { useEffect, useState } from "react";
import w from "./wall.module.css";

/**
 * To use a licensed side-eye monkey GIF instead of the drawn monkey: save it as
 * public/images/wall/side-eye-monkey.gif and set this to "/images/wall/side-eye-monkey.gif".
 */
export const SIDE_EYE_GIF: string | null = null;

/**
 * The Side-Eye Filter's reaction: the side-eye monkey meme (SIDE_EYE_GIF if set,
 * else found through the GIF search) and "Bro, chill."; if no GIF is available, an original drawn monkey whose eyes slide sideways, slowly, under
 * heavy lids. Pops in with a small entrance; reduced motion keeps it still.
 */
/** the side-eye monkey meme, found once through the site's GIF search (GIPHY) and reused */
let found: Promise<string | null> | null = null;
const findMeme = () =>
  (found ??= fetch("/api/wall/gifs?q=side%20eye%20monkey")
    .then((r) => (r.ok ? r.json() : { gifs: [] }))
    .then((d: { gifs?: { src: string }[] }) => d.gifs?.[0]?.src ?? null)
    .catch(() => null));

export default function SideEyeMonkey() {
  const [meme, setMeme] = useState<string | null>(SIDE_EYE_GIF);
  const [gif, setGif] = useState(true);
  useEffect(() => {
    if (SIDE_EYE_GIF) return;
    let alive = true;
    void findMeme().then((src) => alive && src && setMeme(src));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className={w.monkey} role="status">
      {meme && gif ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={w.monkeyArt} src={meme} alt="A monkey giving you the side-eye" onError={() => setGif(false)} />
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
      <p className={w.monkeyLine}>
        <b>Bro, chill.</b> Let&apos;s keep it friendly.
      </p>
    </div>
  );
}
