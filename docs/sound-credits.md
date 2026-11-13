# Sound credits

Every sound on the website is either public domain (CC0) or original to this site.
Regenerate them with `python3 scripts/audio/compose_site_sounds.py <path to the Kenney packs>`.

## Kenney audio packs — CC0 1.0 (public domain), www.kenney.nl

Free for personal and commercial use; credit is not required (but given here with thanks).
Taken from the "RPG Audio" pack (via github.com/Boyquotes/kenney-rpg-audio-for-godot, CC0 licence file included in that repository).

| On the site | File | Kenney source |
|---|---|---|
| A folder opens | `public/audio/sfx/folder-1` | `book_flip_2` |
| The Wall: picking up a note | `sfx/pick` | `book_flip_3` |
| The Wall: a note lands | `sfx/drop` | `handle_small_leather` |
| A case study opens | `sfx/open` | `book_flip_2` |
| The cat pulls the cord | `sfx/tink` | `metal_click` |
| The blind rolls down | `sfx/blind` | `cloth_belt` |

All trimmed, loudness-normalised and re-encoded (Ogg Opus + MP3).

## Original (composed for this site, no samples)

Synthesised from scratch in `scripts/audio/compose_site_sounds.py`:

- `sfx/post` — a note is posted: a soft pop, then a gentle two-note "done"
- `sfx/mrrp` — the cat's curious trill
- `sfx/meow` — the cat's indignant meow
- `sfx/squeak` — the rubber duck
- `sfx/splash` — the bath splash
- `ambient/photography` — the calm ambient piece for the Photography gallery (64 s seamless loop)

The intro film's score and end chime are separate (`public/audio/intro-film.*`, `level-clear.mp3`) and are also original.
