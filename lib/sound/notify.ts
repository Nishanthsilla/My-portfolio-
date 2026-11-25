/**
 * Little notification sounds for the footer cartoon, made in Web Audio (no files to load).
 * Browsers only allow sound after the visitor has clicked, tapped or pressed a key on the page;
 * before that these stay silent.
 */
export type Notify = "ding" | "alarm" | "pop" | "fine" | "call";

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
  if (kind === "ding" || kind === "pop") {
    // a soft work-chat "ba-dum": two warm rising notes with a little shimmer
    const lo = kind === "pop" ? 0.84 : 1; // sticky notes sit a touch lower
    for (const [k, f, len, v] of [[0, 622.25, 0.5, 0.13], [0.11, 830.6, 0.7, 0.12]] as const) {
      note(c, t + k, f * lo, len, v, "sine");
      note(c, t + k, f * lo * 2, len * 0.5, v * 0.18, "triangle");
    }
    return;
  } else if (kind === "alarm") {
    // a tiny alarm-clock double beep for the EOD deadline
    for (const k of [0, 0.13, 0.32, 0.45]) note(c, t + k, 1568, 0.09, 0.1, "square");
  } else if (kind === "call") {
    // the client calls: the ringtone clip Nishanth supplied (public/audio/sfx/client-call.mp3)
    if (callBuf) {
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = callBuf;
      g.gain.value = 0.75;
      src.connect(g).connect(c.destination);
      src.start(t);
      return;
    }
    // (if the clip couldn't load: a soft marimba-like ring, twice)
    const tune = [659.25, 830.6, 987.77, 830.6, 1108.7, 987.77];
    for (let r = 0; r < 2; r++)
      tune.forEach((f, i) => {
        const at = t + r * 1.25 + i * 0.13;
        note(c, at, f, 0.32, 0.1, "sine");
        note(c, at, f * 4, 0.08, 0.025, "sine");
      });
  } else {
    // "I AM FINE.": a calm three-note chime
    note(c, t, 784, 0.5, 0.13);
    note(c, t + 0.14, 988, 0.5, 0.12);
    note(c, t + 0.28, 1175, 0.7, 0.12);
  }
}

let callBuf: AudioBuffer | null = null;
let bgmBuf: AudioBuffer | null = null;
let callLoading = false;
/** create the audio context early (so it can wake on the first click) and fetch the call's ringtone */
export function primeNotify() {
  const c = context();
  if (!c || callLoading || (callBuf && bgmBuf)) return;
  callLoading = true;
  const load = (url: string) => fetch(url).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b));
  Promise.all([
    load("/audio/sfx/client-call.mp3").then((b) => (callBuf = b)).catch(() => {}),
    load("/audio/sfx/fine-bgm.mp3").then((b) => (bgmBuf = b)).catch(() => {}),
  ]).finally(() => (callLoading = false));
}

/* ---------------- the fire: a crackle that builds with the flames, then the crumble into ash ---------------- */
let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (noiseBuf) return noiseBuf;
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return (noiseBuf = b);
}
/** a [time, value] curve on an AudioParam, from audio time t0 */
function curveTo(p: AudioParam, t0: number, keys: [number, number][]) {
  p.setValueAtTime(keys[0][1], t0 + keys[0][0]);
  for (const [k, v] of keys.slice(1)) p.linearRampToValueAtTime(v, t0 + k);
}
/**
 * Starts the fire's sound in step with the 12.5 s cartoon (t = 0 is its first frame):
 * a low roar and a crackle that rise as the room catches (02 → 09), the whoosh and
 * crumble as he turns to ash (11.5 s), then embers dying down. Returns stop().
 */
export function fireSound(): { stop: () => void } {
  const c = context();
  if (!c || c.state !== "running" || document.hidden) return { stop() {} };
  const t0 = c.currentTime + 0.02;
  const out = c.createGain();
  out.gain.value = 1;
  out.connect(c.destination);
  const nodes: AudioScheduledSourceNode[] = [];

  // the roar: filtered noise, swelling with the flames
  const roar = c.createBufferSource();
  roar.buffer = noise(c);
  roar.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  curveTo(lp.frequency, t0, [[0, 300], [6, 600], [10.3, 1400], [12, 700], [16, 400]]);
  const rg = c.createGain();
  curveTo(rg.gain, t0, [[0, 0], [1.5, 0], [3, 0.025], [6, 0.05], [9, 0.1], [10.3, 0.17], [11.5, 0.16], [12.2, 0.07], [15, 0.035], [17, 0]]);
  roar.connect(lp).connect(rg).connect(out);
  roar.start(t0);
  roar.stop(t0 + 17.2);
  nodes.push(roar);

  // the crackle: short noise pops, more and louder as it burns
  const rate = (s: number) => (s < 1.5 ? 0 : s < 6 ? 2 + s : s < 9 ? 8 + (s - 6) * 4 : s < 11.5 ? 22 : s < 12.4 ? 40 : Math.max(0, 10 - (s - 12.4) * 2.2));
  const loud = (s: number) => (s < 6 ? 0.05 : s < 9 ? 0.08 : s < 11.5 ? 0.12 : s < 12.4 ? 0.1 : 0.05);
  for (let s = 1.5; s < 16.5; ) {
    const r = rate(s);
    if (r <= 0) {
      s += 0.25;
      continue;
    }
    s += (-Math.log(1 - Math.random()) / r) || 0.05;
    const at = t0 + s;
    const src = c.createBufferSource();
    src.buffer = noise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = (s > 11.6 && s < 12.4 ? 700 : 1800) + Math.random() * 2600;
    bp.Q.value = 4;
    const g = c.createGain();
    const len = 0.006 + Math.random() * 0.025;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(loud(s) * (0.4 + Math.random()), at + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(bp).connect(g).connect(out);
    src.start(at, Math.random() * 1.5, len + 0.02);
    nodes.push(src);
  }

  // 11.5 s: he goes up in smoke — a whoosh, a low thud, and he crumbles
  const ash = t0 + 11.45;
  const wh = c.createBufferSource();
  wh.buffer = noise(c);
  const wf = c.createBiquadFilter();
  wf.type = "lowpass";
  wf.frequency.setValueAtTime(5000, ash);
  wf.frequency.exponentialRampToValueAtTime(250, ash + 1.1);
  const wg = c.createGain();
  wg.gain.setValueAtTime(0.0001, ash);
  wg.gain.exponentialRampToValueAtTime(0.32, ash + 0.12);
  wg.gain.exponentialRampToValueAtTime(0.0001, ash + 1.2);
  wh.connect(wf).connect(wg).connect(out);
  wh.start(ash, 0, 1.3);
  nodes.push(wh);
  const thud = c.createOscillator();
  thud.frequency.setValueAtTime(95, ash + 0.05);
  thud.frequency.exponentialRampToValueAtTime(42, ash + 0.6);
  const tg = c.createGain();
  tg.gain.setValueAtTime(0.0001, ash + 0.05);
  tg.gain.exponentialRampToValueAtTime(0.28, ash + 0.07);
  tg.gain.exponentialRampToValueAtTime(0.0001, ash + 0.7);
  thud.connect(tg).connect(out);
  thud.start(ash + 0.05);
  thud.stop(ash + 0.75);
  nodes.push(thud);

  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      const now = c.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.5);
      setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch {} }), 600);
    },
  };
}

/**
 * The footer cartoon's soundtrack (/audio/sfx/fine-bgm.mp3: music, fire and the voice the dog
 * lip-syncs to), started with the cartoon's first frame, plus the whoosh as he turns to ash.
 * Falls back to the generated fire if the file hasn't loaded. Returns stop().
 */
export function fineSoundtrack(): { stop: () => void } {
  const c = context();
  if (!c || c.state !== "running" || document.hidden) return { stop() {} };
  if (!bgmBuf) return fireSound();
  const t0 = c.currentTime + 0.02;
  const out = c.createGain();
  out.connect(c.destination);
  const src = c.createBufferSource();
  src.buffer = bgmBuf;
  src.connect(out);
  src.start(t0);
  // 11.5 s: the whoosh into ash, on top of the music
  const nodes: AudioScheduledSourceNode[] = [src];
  const ash = t0 + 11.75;
  const wh = c.createBufferSource();
  wh.buffer = noise(c);
  const wf = c.createBiquadFilter();
  wf.type = "lowpass";
  wf.frequency.setValueAtTime(5000, ash);
  wf.frequency.exponentialRampToValueAtTime(250, ash + 1.1);
  const wg = c.createGain();
  wg.gain.setValueAtTime(0.0001, ash);
  wg.gain.exponentialRampToValueAtTime(0.22, ash + 0.12);
  wg.gain.exponentialRampToValueAtTime(0.0001, ash + 1.2);
  wh.connect(wf).connect(wg).connect(out);
  wh.start(ash, 0, 1.3);
  nodes.push(wh);
  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      const now = c.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.5);
      setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch {} }), 600);
    },
  };
}
