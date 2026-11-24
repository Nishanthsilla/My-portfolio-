/**
 * The face sticker's two sounds (swag on hover; a swipe when the chat opens and closes). These play even
 * though the site-wide sound is off. Browsers allow audio only after the
 * visitor has clicked, tapped or pressed a key once, so until then hovering
 * is silent; a click or tap always counts.
 */
type Name = "swag" | "chat-open" | "chat-close" | "logo" | "dexter" | "huh";
const GAIN: Record<Name, number> = { swag: 0.4, "chat-open": 0.5, "chat-close": 0.45, logo: 0.6, dexter: 0.6, huh: 0.6 };
/*
 * logo, dexter and huh are meme sounds supplied by Nishanth (public/audio/sfx/<name>.mp3).
 * List a name here once its file has been added; until then it stays silent (and is never requested).
 */
const MEMES_READY: Name[] = ["logo", "dexter", "huh"];
const MEME = new Set<Name>(["logo", "dexter", "huh"]);
const usable = (n: Name) => !MEME.has(n) || MEMES_READY.includes(n);

let ctx: AudioContext | null = null;
const buffers = new Map<Name, Promise<AudioBuffer | null>>();
const last = new Map<Name, number>();

function context() {
  if (ctx || typeof window === "undefined") return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const resume = () => void ctx?.resume();
  addEventListener("pointerdown", resume, { capture: true });
  addEventListener("keydown", resume, { capture: true });
  return ctx;
}

function load(n: Name) {
  const c = context();
  if (!c || buffers.has(n) || !usable(n)) return;
  const ext = document.createElement("audio").canPlayType('audio/ogg; codecs="opus"') ? "ogg" : "mp3";
  buffers.set(n, fetch(`/audio/sfx/${n}.${MEME.has(n) ? "mp3" : ext}`).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b)).catch(() => null));
}

let memesQueued = false;
/**
 * Decode early, so the very first click is never late. The small chat sounds load
 * at once; the bigger meme sounds (logo, dexter, huh) wait until the visitor first
 * moves, taps or types, then load in a quiet moment, so a page that's only being
 * read never downloads them.
 */
export function preloadUiSounds() {
  (["swag", "chat-open", "chat-close"] as Name[]).forEach(load);
  if (memesQueued || typeof window === "undefined") return;
  memesQueued = true;
  const go = () => {
    ["pointermove", "pointerdown", "keydown", "touchstart"].forEach((e) => removeEventListener(e, go, true));
    const ric = (window as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const run = () => (["logo", "dexter", "huh"] as Name[]).forEach(load);
    if (ric) ric(run, { timeout: 2500 });
    else window.setTimeout(run, 600);
  };
  ["pointermove", "pointerdown", "keydown", "touchstart"].forEach((e) => addEventListener(e, go, { capture: true, passive: true }));
}

export function uiSound(name: Name, again = false) {
  if (!usable(name)) return;
  const c = context();
  if (!c || document.hidden) return;
  const now = performance.now();
  if (!again && now - (last.get(name) ?? 0) < 350) return;
  last.set(name, now);
  preloadUiSounds();
  load(name);
  // the first sound of a visit waits for the browser to wake audio up
  void Promise.all([c.state === "running" ? null : c.resume(), buffers.get(name)]).then(([, buf]) => {
    if (!buf || c.state !== "running") return;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = GAIN[name];
    src.connect(g).connect(c.destination);
    src.start();
  });
}
