/**
 * Film audio. The film clock is the master; the <audio> element follows it
 * (re-synced if it drifts by more than 80 ms). Autoplay with sound is often
 * blocked, so start() reports whether sound is actually playing and the UI
 * offers a "sound on" control when it is not.
 */
export type SoundState = "loading" | "on" | "off" | "blocked";

export class FilmAudio {
  readonly el: HTMLAudioElement;
  private fadeRaf = 0;
  private wanted = true;

  constructor(src: { mp3: string; ogg: string }) {
    const a = document.createElement("audio");
    a.preload = "auto";
    const canOgg = a.canPlayType('audio/ogg; codecs="vorbis"') !== "";
    a.src = canOgg ? src.ogg : src.mp3;
    a.volume = 1;
    this.el = a;
  }

  /** Try to play from film time t (s). Resolves to the resulting state. */
  async play(t: number): Promise<SoundState> {
    this.wanted = true;
    try {
      if (Math.abs(this.el.currentTime - t) > 0.05) this.el.currentTime = Math.max(0, t);
      this.el.muted = false;
      this.el.volume = 1;
      await this.el.play();
      return "on";
    } catch {
      return "blocked";
    }
  }

  mute() {
    this.wanted = false;
    this.el.pause();
  }

  /** Keep the audio locked to the film clock. */
  sync(t: number) {
    if (!this.wanted || this.el.paused || this.el.seeking) return;
    if (Math.abs(this.el.currentTime - t) > 0.08) this.el.currentTime = t;
  }

  /** Fade out over ms, then pause (used on skip and when the film ends). */
  fadeOut(ms = 400) {
    cancelAnimationFrame(this.fadeRaf);
    const from = this.el.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms));
      this.el.volume = Math.min(1, Math.max(0, from * (1 - p) * (1 - p)));
      if (p < 1) this.fadeRaf = requestAnimationFrame(step);
      else this.el.pause();
    };
    this.fadeRaf = requestAnimationFrame(step);
  }

  destroy() {
    cancelAnimationFrame(this.fadeRaf);
    this.el.pause();
    this.el.removeAttribute("src");
    this.el.load();
  }
}
