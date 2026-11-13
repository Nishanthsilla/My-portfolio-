# Putting the portfolio online

**Chosen setup:**
- **Vercel** hosts the site. It's built by the team behind Next.js and has a free
  tier, a global CDN, automatic HTTPS and custom domains.
- **Neon**, which is open-source PostgreSQL, stores The Wall's notes. Vercel
  creates it and connects it for you.

Locally, and on any normal server, the site uses SQLite with no setup (see
`docs/the-wall-setup.md`).

## One-time setup (about 10 minutes)

1. **Put the code on GitHub.** Create an empty repository, private is fine,
   then push this project to it. If you give me the repository name, I can
   push it for you.
2. **Import it into Vercel.** Go to vercel.com, then Add New → Project, pick
   the repository and click Deploy. Vercel detects Next.js; no settings are
   needed.
3. **Add the database.**
   1. In the Vercel project, open **Storage → Create Database → Neon (Postgres)**.
   2. Pick the free plan and connect it to the project.
   3. Vercel adds `DATABASE_URL` for you automatically.
   4. The Wall creates its table the first time someone posts.
4. **Set your moderator password.**
   1. Go to **Settings → Environment Variables** and add `WALL_ADMIN_TOKEN`.
   2. Use a random value of 24 or more characters, e.g. from
      `openssl rand -base64 32` or a password manager.
   3. Keep it private: it's what lets you approve notes.
5. **Redeploy:** Deployments → ⋯ → Redeploy, so the new variables apply.
6. **Optional: your domain.** Settings → Domains → add it, then follow the DNS
   instructions shown.

## After it's live

- **Moderate:** open `https://your-site/wall/admin` and enter the token.
  New notes wait there as Pending until you approve them.
- **Spam protection:** this is already on, with no setup:
  - a honeypot field and a human-speed check;
  - rate limits held in the database, so they hold across Vercel's servers;
  - duplicate checks.
- **Optional CAPTCHA:** add Cloudflare Turnstile keys (`TURNSTILE_SECRET_KEY` and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
- **Backups:** Neon keeps point-in-time history. You can also export with
  `pg_dump "$DATABASE_URL" > wall-backup.sql`.

## Safety net

If the site runs on Vercel or Netlify **without** `DATABASE_URL`, The Wall won't
store anything, because those servers' disks are temporary and notes would
silently disappear. It shows "Posting isn't connected here yet" until the
database is connected. Nothing is lost and nothing unmoderated is published.

## Other hosts

Any host that runs `npm run build && npm start` works:
- **On a server with a persistent disk** (VPS, Railway or Render with a volume,
  Fly with a volume): SQLite works with no database setup. Back up
  `data/wall.db`.
- **Anywhere else:** set `DATABASE_URL` to a Postgres database.
- Node.js 22.13 or newer is needed for SQLite.
