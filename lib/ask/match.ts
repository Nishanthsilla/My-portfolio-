/**
 * "Ask Nishanth" without AI: match a question to a topic in lib/ask/faq.ts.
 *   · phrases ("design system") score more than single words; small typos are forgiven
 *   · "hi", "thanks" and "tell me more" (continues the last topic) are understood
 *   · a question about Nishanth with no matching topic → an honest "I don't know that one"
 *   · anything else → off-topic (the panel answers with a "nope" GIF)
 */
import { contact } from "@/lib/site/content";
import { GREETING, MORE, SUGGESTED, THANKS, TOPICS, topicById, type Topic } from "./faq";

export type Reply =
  | { kind: "answer"; text: string; links?: Topic["links"]; next: string[]; topic?: string }
  | { kind: "off"; next: string[] };

const WEAK = new Set(["nishanth", "work", "now", "job", "projects", "portfolio", "ideas", "fun", "likes", "code", "help", "live"]);
const SLANG: Record<string, string> = { u: "you", ur: "your", r: "are", pls: "please", plz: "please", abt: "about", wat: "what", wht: "what", hes: "he's", whats: "what is", wheres: "where is" };
const norm = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'\-/ ]+/g, " ").replace(/\s+/g, " ").trim()
    .split(" ").map((w) => SLANG[w] ?? w).join(" ")
    .replace(/\bnishanth's\b/g, "his");
/** "Nishanth" and "he" mean the same person: match both readings, keep the better one */
const asHe = (q: string) => q.replace(/\bnishanth\b/g, "he");
const stem = (w: string) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, "") : w);

function close(a: string, b: string) {
  // edit distance ≤ 1 (one typo), for words of 5+ letters
  if (Math.abs(a.length - b.length) > 1 || a.length < 5) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function score(q: string, words: string[], t: Topic) {
  let s = 0;
  const padded = ` ${q} `;
  for (const key of t.keys) {
    if (key.includes(" ") || key.includes("-")) {
      if (padded.includes(` ${key} `) || padded.includes(` ${key}`)) s += 3 + key.length / 25;
      else {
        // every word of the phrase is there (in any order, typos forgiven)
        const parts = key.split(/[ -]/).filter((x) => x.length > 2 && !["does", "the", "his", "what", "how", "has", "can"].includes(x));
        if (parts.length > 1 && parts.every((p) => words.some((x) => stem(x) === stem(p) || close(stem(x), stem(p))))) s += 2.5;
      }
    } else {
      const k = stem(key);
      const w = WEAK.has(key) ? 1 : 2;
      if (words.some((x) => stem(x) === k)) s += w;
      else if (words.some((x) => close(stem(x), k))) s += w / 2;
    }
  }
  return s;
}

export function respond(question: string, lastTopic?: string): Reply {
  const q = norm(question);
  if (!q) return { kind: "off", next: SUGGESTED };
  if (GREETING.test(q)) return { kind: "answer", text: "Hi! I answer questions about Nishanth — his work, projects, experience and how to reach him. What would you like to know?", next: SUGGESTED };
  if (THANKS.test(q)) return { kind: "answer", text: "Happy to help! Anything else about Nishanth?", next: lastTopic ? (topicById(lastTopic)?.next ?? SUGGESTED) : SUGGESTED };

  const variants = [q, asHe(q)].map((v) => ({ v, w: v.split(" ") }));
  const ranked = TOPICS.map((t) => ({ t, s: Math.max(...variants.map(({ v, w }) => score(v, w, t))) })).sort((a, b) => b.s - a.s);
  const best = ranked[0];

  // "tell me more" right after an answer continues that topic
  const last = lastTopic ? topicById(lastTopic) : undefined;
  if (!last && MORE.test(q) && best.s < 2) return { kind: "answer", text: "Sure — what would you like to know about Nishanth?", next: SUGGESTED };
  if (last && MORE.test(q) && best.s < 3) {
    if (last.more) return { kind: "answer", text: last.more, links: last.links, next: last.next, topic: last.id };
    return { kind: "answer", text: "That's the short version — these go deeper:", next: last.next, topic: last.id };
  }

  if (best.s >= 2) return { kind: "answer", text: best.t.answer, links: best.t.links, next: best.t.next, topic: best.t.id };

  // about him, but not something the site covers
  if (/\b(nishanth|he|his|him|he's)\b/.test(q)) {
    return {
      kind: "answer",
      text: `I don't know that one about Nishanth — it's best to ask him directly at ${contact.email}.`,
      links: [{ label: "Email Nishanth", href: `mailto:${contact.email}` }],
      next: SUGGESTED,
    };
  }
  return { kind: "off", next: SUGGESTED };
}
