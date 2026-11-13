# The Wall — setup and moderation

The Wall (`/wall`) is the portfolio's guestbook: visitors place a sticker,
write a short note and submit it. **Nothing appears publicly until you
approve it** at `/wall/admin`.

## The database (open source)

The Wall stores notes in an open-source database. Which one is used depends on
one setting:

| | **SQLite** (default) | **PostgreSQL** |
|---|---|---|
| When | `DATABASE_URL` is not set | `DATABASE_URL` is set |
| Where the data lives | `data/wall.db` on the machine running `next start` | Any Postgres server: self-hosted, or a hosted one such as Neon or Supabase (which is Postgres) |
| Setup | None. It uses the SQLite built into Node.js (`node:sqlite`, Node ≥ 22.13) | Paste the connection string. The table is created automatically on first use |
| Use it for | A server with a real disk: a VPS, your own machine, Railway, Render or Fly with a volume | **Serverless hosting such as Vercel or Netlify**, where the server's disk is temporary |

- Both use the same table and the same checks (lengths, positions, status values).
- Every query uses bound parameters, so visitor text is never inserted into SQL.
- Notes from the earlier JSON-file storage (`data/wall-notes.json`) are
  imported into SQLite automatically, once.
- Back up SQLite by copying `data/wall.db`. Stop the server first, or use
  `sqlite3 data/wall.db ".backup wall-backup.db"`.
- `data/` is git-ignored, so notes are never committed.
- The offline single-file preview has no server. Its wall works as a prototype,
  and visitors' notes are saved on their own device only, clearly labelled.

### Postgres connection strings

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME          # self-hosted
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require   # Neon
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-...pooler.supabase.com:6543/postgres   # Supabase
```

For Supabase, enable row-level security on `wall_notes` once the table exists:

```sql
alter table public.wall_notes enable row level security;
```

This leaves the public API keys no access. The site connects as the database
owner, which bypasses RLS.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `WALL_ADMIN_TOKEN` | **Yes, to moderate** | Your moderator password: a random string of at least 24 characters. Without it, moderation is switched off and nothing can ever be approved. Generate one with `openssl rand -base64 32`. |
| `DATABASE_URL` | On serverless hosting | A Postgres connection string. When it's set, it's used instead of SQLite. Keep it secret, server side only. |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile secret. When set, every post must pass the check. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | With the secret above | Turnstile site key, shown in the composer. |
| `WALL_IP_SALT` | Optional | Salt for hashing visitor IPs, used for rate limits. Raw IPs are never stored. |

## How a note gets onto the wall

1. **In the browser:** the Side-Eye Filter checks the message and name as the
   visitor types or pastes.
   - Offending words are struck through in the editor only.
   - The monkey appears.
   - "Add your sticker" stays disabled until the text is clean.
   - The live preview masks blocked words with `•••`.
2. **On the server**, which has the final say, in `app/api/wall/route.server.ts`:
   - **Spam traps:** a hidden honeypot field, and a minimum of 3 seconds between opening the composer and posting.
   - **Rate limits:**
     - each visitor: 3 notes per 10 minutes and 10 per day;
     - everyone combined: 60 per hour.
   - **Turnstile,** when it's configured.
   - **Validation:**
     - lengths;
     - plain text only, with HTML refused;
     - known sticker ids only;
     - positions within the wall;
     - Unicode normalised, with invisible characters removed.
   - **The same moderation check again:**
     - on the raw text and on the normalised text;
     - on the message and on the name.
   - **A duplicate check** over the last 24 hours.
   - If storage fails, the post is refused. Nothing is ever published without
     these checks.
3. **Stored as `pending`.** The visitor sees: "Your sticker is on its way…
   It'll appear on the wall once it's approved."
4. **You approve or reject it** at `/wall/admin` using the moderator token.
   You can also remove notes there, including ones already approved.
5. **Visitor reports:** each note has a Report button. After 3 reports, an
   approved note goes back to pending for you to review.
6. **The visitor's own browser** remembers:
   - their unsent draft;
   - their posted note, shown only to them as "waiting for approval" until you
     approve it.

Notes are always rendered as text, never as HTML.

## Moderation details (`lib/wall/moderation.ts`)

- **[obscenity](https://github.com/jo3-l/obscenity)** (English dataset):
  - catches profanity, slurs and sexual terms;
  - handles look-alike characters, leetspeak (`sh1t`, `b!tch`) and repeated
    letters;
  - respects word boundaries, so `Scunthorpe`, `assassin`, `class` and
    `cocktail` pass.
- **Extra layers:**
  - spaced-out letters (`f u c k`, `f.u.c.k`) and invisible characters;
  - threats (`hope you die`, `kys`, `I will find you`…);
  - targeted insults (`you're worthless`…), while self-talk like
    `I'm so stupid` is allowed;
  - links, to stop spam.
- **Allowlist:** words that are innocent but contain a flagged sequence, such as
  `shiitake`. Add to `ALLOW` if you find more.

## The side-eye monkey

An original drawn monkey is used by default. To use a licensed GIF instead:

1. Save it as `public/images/wall/side-eye-monkey.gif`.
2. Set `SIDE_EYE_GIF` in `components/wall/SideEyeMonkey.tsx` to
   `"/images/wall/side-eye-monkey.gif"`.

## Adding stickers

Add an entry to `STICKERS` in `lib/wall/stickers.tsx`. It can be an SVG, or an
image file:

```ts
{ id: "my-sticker", label: "My sticker", group: "Shapes", src: "/images/wall/stickers/my-sticker.png" }
```

The toolbar, the wall, the composer and the server's allowed list all pick it
up automatically.

## Notes, stickers and fonts

- Every note is a "HELLO" name-tag sticker. Visitors pick an emoji or an animated sticker (Noto Animated Emoji by Google, CC BY 4.0, stored in `public/images/wall/gifs`) and a handwriting (`lib/wall/fonts.ts`, Google Fonts).
- The database stores the font in a `font` column, which is added automatically to existing tables.
- Anyone can drag any sticker around. That layout is saved only in the visitor's own browser and never sent. A new note is posted where its writer drops it.

## GIFs (optional, GIPHY)

The composer's **GIFs** tab searches GIPHY (G-rated only). It appears automatically once a key is set:

1. Create a free key at developers.giphy.com: **Create an App → API**, and copy the API key.
2. In Vercel: **Project → Settings → Environment Variables**, add `GIPHY_API_KEY` = your key (Production, Preview), and redeploy.

The key stays on the server (`/api/wall/gifs`); visitors never see it. Every note, GIF or not, still waits for your approval.
