/**
 * Film audio. While the score is playing it is the MASTER CLOCK: the film reads
 * its time from the audio (smoothed between the element's currentTime updates),
 * so picture and sound cannot drift. When sound is off or blocked, the film
 * runs on the frame clock and the audio joins at the current time when enabled.
 */
export type SoundState = "loading" | "on" | "off" | "blocked";

export class FilmAudio {
  readonly el: HTMLAudioElement;
  private fadeRaf = 0;
  private lastCt = -1;
  private anchor = { at: 0, t: 0 };

  constructor(src: { mp3: string; ogg: string }) {
    const a = document.createElement("audio");
    a.preload = "auto";
    const canOgg = a.canPlayType('audio/ogg; codecs="vorbis"') !== "";
    a.src = canOgg ? src.ogg : src.mp3;
    a.volume = 1;
    this.el = a;
  }

  /** Try to play from film time t (s) with sound. Resolves to the resulting state. */
  async play(t: number): Promise<SoundState> {
    try {
      this.el.currentTime = Math.max(0, t);
      this.el.muted = false;
      this.el.volume = 1;
      cancelAnimationFrame(this.fadeRaf);
      await this.el.play();
      this.lastCt = -1;
      return "on";
    } catch {
      return "blocked";
    }
  }

  mute() {
    this.el.pause();
  }

  get playing() {
    return !this.el.paused && !this.el.ended;
  }

  /** Current audio time (s), smoothed between currentTime updates; null when not playing. */
  time(now: number): number | null {
    if (!this.playing) return null;
    const ct = this.el.currentTime;
    if (ct !== this.lastCt) {
      this.lastCt = ct;
      this.anchor = { at: now, t: ct };
    }
    // interpolate between coarse updates, but never run far ahead of the audio
    return Math.min(this.anchor.t + (now - this.anchor.at) / 1000, ct + 0.12);
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
