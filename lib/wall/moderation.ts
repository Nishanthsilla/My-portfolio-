/**
 * The Side-Eye Filter — content checks for The Wall. Runs in the browser (live
 * feedback, so the offending words can be struck through) and on the server
 * (the authority: nothing is stored without passing it there).
 *
 * Layers:
 *  1. obscenity (maintained library): profanity, slurs and sexual terms, with
 *     its transformers for look-alike characters, leetspeak, repeated letters
 *     and word-boundary rules (so "Scunthorpe", "assassin", "class" pass).
 *  2. Bypass handling: invisible characters removed and spaced-out letters
 *     ("f u c k") rejoined before checking — positions are mapped back so the
 *     strike-through covers exactly what the visitor typed.
 *  3. Threats and targeted harassment: phrase patterns that a word list alone
 *     would miss ("hope you die", "you're worthless").
 *  4. Spam: links are not allowed on the wall.
 *  An allowlist removes known false positives (e.g. "shiitake").
 */
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

export type FlagKind = "language" | "threat" | "harassment" | "link";
export type Flag = { start: number; end: number; kind: FlagKind };

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

/** Words that contain a flagged sequence but are innocent. */
const ALLOW = ["shiitake", "shitake", "cockpit", "cocktail", "peacock", "hancock", "dickens", "scunthorpe", "assassin", "therapist", "sussex", "essex", "middlesex", "analysis", "cumbersome", "cucumber", "document", "pistachio", "spicy", "hello", "mishit", "shuttlecock", "titanic", "title", "titmouse", "bassist"];

const THREATS: RegExp[] = [
  /\bk+y+s+\b/gi,
  /\bkill\s+(yo)?u?r?\s*self\b/gi,
  /\bkill\s+(yourself|urself|ur\s*self)\b/gi,
  /\b(i('?ll| will| am going to|'m going to| gonna)|we('?ll| will| gonna))\s+(kill|hurt|find|stab|shoot|beat|rape|murder)\s+(you|u|ya|your\s+\w+)\b/gi,
  /\b(hope|wish)\s+(you|u)\s+(die|dies|get\s+hurt|get\s+killed)\b/gi,
  /\b(go|should|deserve\s+to)\s+die\b/gi,
  /\bdie\s+in\s+a\s+fire\b/gi,
  /\b(you|u)\s+(will|gonna|are\s+going\s+to)\s+(die|pay)\b/gi,
];
const HARASS: RegExp[] = [
  /\b(you'?re|you\s+are|ur|u\s+r|youre)\s+(a|an|so|such\s+a|such\s+an)?\s*(idiot|stupid|moron|loser|worthless|pathetic|ugly|trash|garbage|dumb|useless|disgusting|failure)\b/gi,
  /\b(nobody|no\s+one)\s+(likes|loves|cares\s+about)\s+(you|u)\b/gi,
  /\b(shut\s+up|get\s+lost)\s+(you|u)\b/gi,
];
const LINKS: RegExp[] = [/\bhttps?:\/\/\S+/gi, /\bwww\.\S+/gi, /\b[a-z0-9-]+\.(com|net|org|io|xyz|ru|ly|me|co|info|biz|top|click|link|site|online|app)\b(\/\S*)?/gi];

/** Invisible / formatting characters often used to slip words past filters. */
const INVISIBLE = /[­͏؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ]/;

/** A view of the text with some characters removed, plus a map back to the original positions. */
type View = { text: string; map: number[] };

function view(src: string, keep: (ch: string, i: number) => boolean): View {
  let text = "";
  const map: number[] = [];
  for (let i = 0; i < src.length; i++) {
    if (!keep(src[i], i)) continue;
    text += src[i];
    map.push(i);
  }
  return { text, map };
}

/** Spaced-out letters ("f u c k", "f.u.c.k") rejoined; runs of 3+ single letters only. */
function spacedView(src: string): View {
  const drop = new Set<number>();
  const re = /(?:^|[^\p{L}\p{N}])((?:[\p{L}\p{N}][\s.\-_*·]+){2,}[\p{L}\p{N}])(?=$|[^\p{L}\p{N}])/gu;
  for (const m of src.matchAll(re)) {
    const run = m[1];
    const at = (m.index ?? 0) + m[0].length - run.length;
    for (let k = 0; k < run.length; k++) if (!/[\p{L}\p{N}]/u.test(run[k])) drop.add(at + k);
  }
  return view(src, (_, i) => !drop.has(i));
}

function allowed(src: string, start: number, end: number) {
  // widen to the whole word and compare with the allowlist
  let a = start, b = end;
  while (a > 0 && /[\p{L}]/u.test(src[a - 1])) a--;
  while (b < src.length - 1 && /[\p{L}]/u.test(src[b + 1])) b++;
  const word = src.slice(a, b + 1).toLowerCase();
  return ALLOW.some((w) => word === w || word.includes(w));
}

function regexFlags(v: View, list: RegExp[], kind: FlagKind): Flag[] {
  const out: Flag[] = [];
  for (const re of list) {
    re.lastIndex = 0;
    for (const m of v.text.matchAll(re)) {
      const s = m.index ?? 0, e = s + m[0].length - 1;
      out.push({ start: v.map[s], end: v.map[e] + 1, kind });
    }
  }
  return out;
}

function wordFlags(src: string, v: View): Flag[] {
  return matcher
    .getAllMatches(v.text, true)
    .map((m) => ({ start: v.map[m.startIndex], end: v.map[m.endIndex] + 1, kind: "language" as const }))
    .filter((f) => !allowed(src, f.start, f.end - 1));
}

/** Expand a flag to cover the whole word it sits in, so the strike-through reads cleanly. */
function toWord(src: string, f: Flag): Flag {
  if (f.kind !== "language") return f;
  let a = f.start, b = f.end;
  while (a > 0 && /[\p{L}\p{N}!@$*#]/u.test(src[a - 1])) a--;
  while (b < src.length && /[\p{L}\p{N}!@$*#]/u.test(src[b])) b++;
  return { ...f, start: a, end: b };
}

/** Every problem in the text, as ranges of the original string (merged, in order). */
export function findFlags(src: string): Flag[] {
  if (!src) return [];
  const clean = view(src, (ch) => !INVISIBLE.test(ch) && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(ch));
  const lower: View = { text: clean.text.toLowerCase(), map: clean.map };
  const spaced = spacedView(clean.text);
  const spacedMapped: View = { text: spaced.text, map: spaced.map.map((i) => clean.map[i]) };
  const flags = [
    ...wordFlags(src, clean),
    ...wordFlags(src, spacedMapped),
    ...regexFlags(lower, THREATS, "threat"),
    ...regexFlags(lower, HARASS, "harassment"),
    ...regexFlags(lower, LINKS, "link"),
  ].map((f) => toWord(src, f));
  flags.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Flag[] = [];
  for (const f of flags) {
    const last = merged[merged.length - 1];
    if (last && f.start <= last.end) last.end = Math.max(last.end, f.end);
    else merged.push({ ...f });
  }
  return merged;
}

/** Plain text, NFKC-normalised, invisible and control characters removed, whitespace tidied. */
export function normalizeText(src: string) {
  return src
    .normalize("NFKC")
    .replace(new RegExp(INVISIBLE.source, "g"), "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Server-side verdict: checks the text as typed and its normalised form. */
export function isClean(src: string) {
  return findFlags(src).length === 0 && findFlags(normalizeText(src)).length === 0;
}
