/**
 * The website's sound (everything except the intro film, which keeps its own score).
 *
 *  · OFF by default. Nothing is downloaded or played until the visitor turns
 *    sound on with the speaker in the navbar. The choice (and the volume) is
 *    remembered; even then, nothing plays until their first click or tap on
 *    the visit (browsers require it), so there is never surprise audio.
 *  · One Web Audio graph: master volume → an ambient bus (one track at a time,
 *    always faded) and an effects bus (short sounds, decoded once).
 *  · Effects never interrupt the ambient track; each has a cooldown, at most
 *    three play at once, and repeats vary slightly in pitch.
 *  · Ambient pauses when the tab is hidden, and fades out when its section closes.
 *  · Reduced motion: only the sounds that confirm an action are kept.
 *
 * Usage anywhere:  sfx("drop")   ·   ambient("photography") / ambient(null)
 */

export type SfxName =
  | "folder" | "pick" | "drop" | "post" | "open"
  | "mrrp" | "meow" | "squeak" | "splash" | "tink" | "blind";
export type AmbientName = "photography";

const KEY = "nishanth.sound";
const FILES: Record<string, string> = {
  "folder-1": "sfx/folder-1", "folder-2": "sfx/folder-2", "folder-3": "sfx/folder-3",
  pick: "sfx/pick", drop: "sfx/drop", post: "sfx/post", open: "sfx/open",
  mrrp: "sfx/mrrp", meow: "sfx/meow", squeak: "sfx/squeak", splash: "sfx/splash", tink: "sfx/tink", blind: "sfx/blind",
  photography: "ambient/photography",
};
/** per-sound level (balanced by ear-equivalent loudness) and minimum gap between repeats (ms) */
const SFX: Record<SfxName, { gain: number; gap: number; variants?: string[] }> = {
  folder: { gain: 0.9, gap: 1500, variants: ["folder-1", "folder-2", "folder-3"] },
  pick: { gain: 0.75, gap: 300 },
  drop: { gain: 0.55, gap: 300 },
  post: { gain: 0.7, gap: 800 },
  open: { gain: 0.8, gap: 900 },
  mrrp: { gain: 0.32, gap: 1200 },
  meow: { gain: 0.3, gap: 1200 },
  squeak: { gain: 0.3, gap: 600 },
  splash: { gain: 0.6, gap: 1200 },
  tink: { gain: 0.8, gap: 800 },
  blind: { gain: 0.8, gap: 800 },
};
const ESSENTIAL = new Set<SfxName>(["post", "mrrp", "meow", "squeak", "splash", "tink", "blind"]);
const AMBIENT_GAIN = 0.55;

type Prefs = { on: boolean; volume: number };
const read = (): Prefs => {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null") as Prefs | null;
    if (p && typeof p.on === "boolean" && typeof p.volume === "number") return { on: p.on, volume: Math.min(1, Math.max(0, p.volume)) };
  } catch {}
  return { on: false, volume: 0.6 };
};

class SoundEngine {
  prefs: Prefs = { on: false, volume: 0.6 };
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private ambBus!: GainNode;
  private sfxBus!: GainNode;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private last = new Map<string, number>();
  private variant = 0;
  private live = 0;
  private wanted: AmbientName | null = null; // the section asking for ambient right now
  private amb: { name: AmbientName; src: AudioBufferSourceNode; gain: GainNode } | null = null;
  private listeners = new Set<() => void>();
  private armed = false;

  init() {
    if (typeof window === "undefined" || this.armed) return;
    this.armed = true;
    this.prefs = read();
    // remembered "on": wait for the first gesture of this visit before any audio
    const unlock = () => {
      removeEventListener("pointerdown", unlock, true);
      removeEventListener("keydown", unlock, true);
      if (this.prefs.on) this.start();
    };
    addEventListener("pointerdown", unlock, true);
    addEventListener("keydown", unlock, true);
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (this.prefs.on) void this.ctx.resume();
    });
    this.emit();
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  private emit() {
    this.listeners.forEach((f) => f());
  }
  private save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.prefs));
    } catch {}
  }

  /** Create the audio graph (call from a user gesture). */
  private start() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.prefs.volume;
      this.master.connect(this.ctx.destination);
      this.ambBus = this.ctx.createGain();
      this.ambBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
    }
    void this.ctx.resume();
    if (this.wanted) this.playAmbient(this.wanted);
  }

  setOn(on: boolean) {
    this.prefs = { ...this.prefs, on };
    this.save();
    if (on) this.start();
    else {
      this.stopAmbient(0.4);
      if (this.ctx) {
        const ctx = this.ctx;
        window.setTimeout(() => !this.prefs.on && void ctx.suspend(), 450);
      }
    }
    this.emit();
  }

  setVolume(v: number) {
    this.prefs = { ...this.prefs, volume: Math.min(1, Math.max(0, v)) };
    this.save();
    if (this.ctx) this.master.gain.setTargetAtTime(this.prefs.volume, this.ctx.currentTime, 0.05);
    this.emit();
  }

  private ready() {
    return !!this.ctx && this.prefs.on && this.ctx.state === "running" && !document.hidden;
  }

  private load(key: string) {
    let p = this.buffers.get(key);
    if (!p && this.ctx) {
      const ctx = this.ctx;
      const probe = document.createElement("audio");
      const ext = probe.canPlayType('audio/ogg; codecs="opus"') ? "ogg" : "mp3";
      p = fetch(`/audio/${FILES[key]}.${ext}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
        .then((b) => ctx.decodeAudioData(b))
        .catch(() => null);
      this.buffers.set(key, p);
    }
    return p ?? Promise.resolve(null);
  }

  sfx(name: SfxName) {
    if (!this.ready()) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches && !ESSENTIAL.has(name)) return;
    const spec = SFX[name];
    const now = performance.now();
    if (now - (this.last.get(name) ?? -1e9) < spec.gap || this.live >= 3) return;
    this.last.set(name, now);
    const key = spec.variants ? spec.variants[this.variant++ % spec.variants.length] : name;
    void this.load(key).then((buf) => {
      if (!buf || !this.ctx || !this.ready()) return;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.06; // ±3%: repeats never sound identical
      const g = this.ctx.createGain();
      g.gain.value = spec.gain;
      src.connect(g).connect(this.sfxBus);
      this.live++;
      src.onended = () => this.live--;
      src.start();
    });
  }

  /** The section that wants an ambient track (or null when it closes). */
  ambient(name: AmbientName | null) {
    this.wanted = name;
    if (!name) return this.stopAmbient(1.5);
    if (this.ready()) this.playAmbient(name);
  }

  private playAmbient(name: AmbientName) {
    if (this.amb?.name === name) return;
    this.stopAmbient(1.2);
    if (matchMedia("(prefers-reduced-data: reduce)").matches) return;
    void this.load(name).then((buf) => {
      if (!buf || !this.ctx || this.wanted !== name || !this.prefs.on || this.amb?.name === name) return;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.gain.setTargetAtTime(AMBIENT_GAIN, this.ctx.currentTime, 0.7); // ≈2 s fade-in
      src.connect(g).connect(this.ambBus);
      src.start();
      this.amb = { name, src, gain: g };
    });
  }

  private stopAmbient(seconds: number) {
    const a = this.amb;
    if (!a || !this.ctx) return;
    this.amb = null;
    const t = this.ctx.currentTime;
    a.gain.gain.cancelScheduledValues(t);
    a.gain.gain.setValueAtTime(a.gain.gain.value, t);
    a.gain.gain.linearRampToValueAtTime(0, t + seconds);
    a.src.stop(t + seconds + 0.05);
  }
}

export const sound = new SoundEngine();
export const sfx = (name: SfxName) => sound.sfx(name);
export const ambient = (name: AmbientName | null) => sound.ambient(name);
