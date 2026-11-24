/**
 * Little notification sounds for the footer cartoon, made in Web Audio (no files to load).
 * Browsers only allow sound after the visitor has clicked, tapped or pressed a key on the page;
 * before that these stay silent.
 */
export type Notify = "ding" | "alarm" | "pop" | "fine";

let ctx: AudioContext | null = null;
function context() {
  if (ctx || typeof window === "undefined") return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const wake = () => void ctx?.resume();
  addEventListener("pointerdown", wake, { capture: true });
  addEventListener("keydown", wake, { capture: true });
  return ctx;
}

/** one soft bell-like note */
function note(c: AudioContext, at: number, freq: number, len: number, vol: number, type: OscillatorType = "sine") {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(c.destination);
  o.start(at);
  o.stop(at + len + 0.02);
}

export function notifySound(kind: Notify) {
  const c = context();
  if (!c || c.state !== "running" || document.hidden) return;
  const t = c.currentTime + 0.01;
  if (kind === "ding") {
    // a chat-app "ding-ding"
    note(c, t, 1318.5, 0.32, 0.16);
    note(c, t + 0.09, 1760, 0.42, 0.13);
  } else if (kind === "alarm") {
    // a tiny alarm-clock double beep for the EOD deadline
    for (const k of [0, 0.13, 0.32, 0.45]) note(c, t + k, 1568, 0.09, 0.1, "square");
  } else if (kind === "pop") {
    // a sticky note slapped on: a short, low pop
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(420, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.2);
  } else {
    // "THIS IS FINE.": a calm three-note chime
    note(c, t, 784, 0.5, 0.13);
    note(c, t + 0.14, 988, 0.5, 0.12);
    note(c, t + 0.28, 1175, 0.7, 0.12);
  }
}

/** create the audio context early, so it can wake on the visitor's first click */
export function primeNotify() {
  context();
}
