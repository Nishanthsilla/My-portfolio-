# Nishanth in Motion — React

The "Nishanth in Motion" portfolio, migrated from a single HTML file into Next.js (App Router)
+ TypeScript, introduced by a 14 s motion film (with an original soundtrack) that hands off
into the homepage. The earlier gradient-mesh loader is kept, inactive.

## Choosing the intro

`lib/introConfig.ts`:

```ts
export const ACTIVE_INTRO = "motion-film";   // "motion-film" | "gradient-mesh" | "none"
export const FILM_REPLAY = "every-load";     // or "once-per-session"
export const FILM_AUDIO_SRC = { mp3: "/audio/intro-film.mp3", ogg: "/audio/intro-film.ogg" };
```

Only one intro is ever mounted (`components/Intro.tsx`).

The original file is kept unmodified at `reference/Nishanth_in_Motion-original.html`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

## Structure

```
app/                        layout (fonts, intro), page, globals
styles/portfolio.css        the original stylesheet, verbatim minus the old loader rules
public/images/hero-sprite.webp   hero character sprite (extracted from the original's base64)
components/
  portfolio/
    Portfolio.tsx           sections in the original DOM order
    sections/               Header, Hero, Marquee, Manifesto, Work(+WorkCard), Approach, Experience, Contact
    visuals/Visuals.tsx     the six animated mini-UIs on the work cards
    chrome/                 progress + cursor, Clock, ScrambleLink, CopyEmailButton
    motion/                 the original script, ported:
      pushScene.ts          hero character / push scene
      initMotion.ts         GSAP + ScrollTrigger (tones, pins, horizontal work, loop, count-ups…)
      pointer.ts            custom cursor, magnetic, card tilt
  intro-film/               ACTIVE intro: the motion film
    IntroFilm.tsx           markup, clock, controls (sound, skip), handoff
    engine.ts               render(t): every scene as a pure function of time (S1–S17)
    particles.ts            burst + tile grid (canvas)
    layout.ts               responsive layout (landscape frame / portrait recomposition)
    timeline.ts, content.ts timings, easing, palette; all film copy
    audio.ts                audio synced to the film clock (autoplay-safe)
  legacy-loader/            INACTIVE: the gradient-mesh "Ideas into experiences." loader
  backgrounds/Grainient/    React Bits <Grainient /> (gradient mesh)
lib/
  portfolio/content.ts      portfolio copy
  introState.ts             intro → portfolio signals ("reveal", "done")
```

## Intro ↔ portfolio contract

The loader knows nothing about the portfolio. It announces:
- `reveal` when its aperture starts opening → the portfolio plays the hero entrance that
  originally followed the old loader (hero fade-up, character walk-in, header drop-in);
- `done` when it has removed itself → ScrollTrigger re-measures.

## What changed from the original

- Old loader removed (markup, `.loader*` CSS, counter/bar/slide-up timeline steps).
- GSAP 3.12.5 is bundled from npm instead of loaded from cdnjs, so the original's
  "no GSAP available" fallback branch no longer applies.
- Nav scramble, clock and copy-email are React components with the same timings.

## Film soundtrack

`public/audio/intro-film.{mp3,ogg}` is an original score synthesised by
`scripts/audio/compose_intro_film.py` (NumPy, 120 BPM, cue points matched to the film).
To use a licensed track instead, put the file in `public/audio/` and point `FILM_AUDIO_SRC` at it.

## Legacy loader behaviour

- Plays on every full load of `/`. Escape (or the focusable "Skip intro" button) ends it.
- Failsafes: JS timer at 9s; CSS fallback if JS never takes control; `<noscript>` hides it.
- `prefers-reduced-motion`: short fade, no zoom; the portfolio keeps the original's reduced mode.
- No WebGL2: animated CSS gradient mesh fallback.

## React Bits local changes

`components/backgrounds/Grainient/Grainient.tsx` (used by the legacy loader) differs from upstream in two commented places:
settings are synced in an effect (lint), and cleanup no longer calls `loseContext()`
(it blanked the canvas under React StrictMode).

## QA hook

In dev, or in a build made with `NEXT_PUBLIC_INTRO_QA=1`, `window.__film.seek(seconds)` renders
the exact film frame at any (reference) time; `window.__intro.seek(ms)` does the same for the legacy loader.

## Single-file preview

```bash
npm run preview:file
```

Writes `preview/nishanth-in-motion-preview.html`: one self-contained file (scripts, CSS,
fonts and the sprite inlined) that opens directly in a browser from disk. Google Fonts are
still loaded online, as in the original.
