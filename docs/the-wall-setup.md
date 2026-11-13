# The Wall — setup and moderation

The Wall (`/wall`) is the portfolio's guestbook: visitors place a sticker,
write a short note and submit it. **Nothing appears publicly until you
approve it** at `/wall/admin`.

## What works with no setup

Running the site with `next start` on one machine:

- Notes are stored in `data/wall-notes.json` on that machine. Every visitor of
  that server sees the same wall, and notes survive restarts.
- **This is not enough for serverless hosting** (Vercel, Netlify and similar).
  Their disks are temporary, so notes would vanish. Use Supabase there.
- The offline single-file preview has no server. Its wall works as a
  prototype only and says "posting isn't connected here".

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `WALL_ADMIN_TOKEN` | **Yes, to moderate** | Your moderator password: a random string of at least 24 characters. Without it, moderation is switched off and nothing can ever be approved. Generate one with `openssl rand -base64 32`. |
| `SUPABASE_URL` | For deployed sites | Your Supabase project URL, e.g. `https://abcd1234.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | For deployed sites | Supabase "service_role" key. It is used only on the server and must **never** be given a `NEXT_PUBLIC_` name. |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile secret. When set, every post must pass the check. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | With the secret above | Turnstile site key, shown in the composer. |
| `WALL_IP_SALT` | Optional | Salt for hashing visitor IPs, used for rate limits. Raw IPs are never stored. |

## Supabase table (run once in the SQL editor)

```sql
create table public.wall_notes (
  id         uuid primary key default gen_random_uuid(),
  message    text not null check (char_length(message) between 2 and 140),
  name       text not null check (char_length(name) between 1 and 32),
  sticker    text not null,
  x          real not null check (x between 0 and 1),
  y          real not null check (y between 0 and 1),
  rotation   real not null check (rotation between -45 and 45),
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reports    int  not null default 0,
  ip_hash    text,
  created_at timestamptz not null default now()
);
create index wall_notes_status on public.wall_notes (status, created_at);

-- Lock the table: with RLS on and no policies, the public (anon) key can do
-- nothing. Only the server, using the service-role key, reads and writes.
alter table public.wall_notes enable row level security;
```

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
