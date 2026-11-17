/**
 * The face sticker's two sounds (swag on hover; talk when the chat opens and closes). These play even
 * though the site-wide sound is off. Browsers allow audio only after the
 * visitor has clicked, tapped or pressed a key once, so until then hovering
 * is silent; a click or tap always counts.
 */
type Name = "swag" | "talk";
const GAIN: Record<Name, number> = { swag: 0.4, talk: 0.55 };

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

/** decode early, so the very first click is never late */
export function preloadUiSounds() {
  const c = context();
  if (!c) return;
  const ext = document.createElement("audio").canPlayType('audio/ogg; codecs="opus"') ? "ogg" : "mp3";
  (["swag", "talk"] as Name[]).forEach((n) => {
    if (!buffers.has(n))
      buffers.set(n, fetch(`/audio/sfx/${n}.${ext}`).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b)).catch(() => null));
  });
}

export function uiSound(name: Name, again = false) {
  const c = context();
  if (!c || document.hidden) return;
  const now = performance.now();
  if (!again && now - (last.get(name) ?? 0) < 350) return;
  last.set(name, now);
  if (c.state !== "running") void c.resume();
  preloadUiSounds();
  void buffers.get(name)?.then((buf) => {
    if (!buf || c.state !== "running") return;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = GAIN[name];
    src.connect(g).connect(c.destination);
    src.start();
  });
}
