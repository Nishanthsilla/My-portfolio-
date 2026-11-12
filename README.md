# Portfolio — Product / UX Designer

Next.js (App Router) + TypeScript + CSS Modules. React Bits is the animated component library.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
```

## Structure

```
app/                      routes (/, /work/[slug]), root layout, globals
components/
  backgrounds/Grainient/  React Bits <Grainient /> (TS + CSS variant)
  loader/                 cinematic intro
    IntroLoader.tsx       layers + single shared timeline (rAF)
    timeline.ts           phase timings and easing curves
    measureCounter.ts     finds the "p" counter used as zoom focal point + aperture
    GradientMesh.tsx      Grainient configuration + CSS fallback mesh
  navigation/ layout/     homepage shell (header, sections, footer)
lib/                      introState (replay rules), placeholder project data
styles/tokens.css         design tokens
```

## Intro behaviour

- Plays on a full load of `/` (first visit or refresh). Not on client-side navigation
  and not when entering directly on another route.
- Escape (or the focusable "Skip intro" button) ends it immediately.
- Failsafes: JS timer at 9s; CSS fallback if JS never takes control; `<noscript>` hides it.
- `prefers-reduced-motion`: short fade, no zoom, static mesh.
- No WebGL2: animated CSS gradient mesh fallback.

## React Bits local changes

`components/backgrounds/Grainient/Grainient.tsx` differs from upstream in two commented places:
settings are synced in an effect (lint: no ref writes during render), and the cleanup
no longer calls `loseContext()` (it blanked the canvas under React StrictMode).

## QA hook

In dev, or in a build made with `NEXT_PUBLIC_INTRO_QA=1`, `window.__intro.seek(ms)` renders
the exact timeline state at any time (used for frame-by-frame review).
