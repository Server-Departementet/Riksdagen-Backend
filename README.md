# Riksdagen-Backend

Everything for the Regeringen server that isn't the web site: the Discord bots
(**quotes**/citat, **quiz**, **discgolf**) and all cron/data jobs, including the
ones that write to the [Riksdagen](https://github.com/Server-Departementet/Riksdagen)
web app's database. The web repo is only the web site.

This repo owns the **canonical quotes**: `src/quotes/quotes.ts` crawls the quote
channel and upserts each quote into the backend's own MariaDB (`Quote` table). The web
app reads that table read-only over LAN.

It also runs against the **web app's database** (`WEB_DATABASE_URL`):
- `src/make-users.ts` syncs guild members with the Minister role into the `User`
  table of **both** databases. The web app's `User` table doubles as its minister
  allowlist (Discord OAuth login grants the `minister` role iff the ID exists there).
- `src/web/post-recent-plays.ts` fetches each connected minister's recently played
  Spotify tracks (refresh tokens live in the web DB's `SpotifyAccount` table,
  written by the web app's connect flow) and upserts tracks/albums/artists/plays.
  The web repo owns that schema; `prisma/web.schema.prisma` is a mirror — keep in sync.

## Setup

1. `yarn install`
2. Create a `.env` in the repo root (see [`.env.example`](.env.example)). Required:
   - `DATABASE_URL` — the backend's **own** MariaDB (hosts `User` + `Quote`)
   - `WEB_DATABASE_URL` — the web app's MariaDB
   - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
   - `DISCORD_BOT_TOKEN`, `DISCORD_BOT_CLIENT_ID`
   - `REGERINGEN_GUILD_ID`, `QUOTE_CHANNEL_ID`, `QUIZ_CHANNEL_ID`, `CANONICAL_URL`
   - `DISCGOLF_GUILD_ID`, `DISCGOLF_READ_CHANNEL_ID`, `DISCGOLF_WRITE_CHANNEL_ID`
3. Provide `user-aliases.json` in the repo root — a `{ "<discordId>": ["Name", ...] }`
   map used to resolve quotees to user IDs. Not committed (operator-provided).
4. `yarn prisma migrate deploy` (or `yarn prisma migrate dev` locally) to create the tables.
5. `yarn generate` to generate both Prisma clients (own DB + web DB mirror).
6. Populate the `User` tables (Discord-ID → name): `yarn make-users`

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn make-users` | Upsert ministers into the `User` table of both DBs (minister allowlist) |
| `yarn post-recent-plays` | Import connected ministers' recent Spotify plays into the web DB |
| `yarn generate` | Generate both Prisma clients |
| `yarn tsx src/quotes/quotes.ts --fetch` | Crawl the quote channel and upsert quotes into the DB |
| `yarn tsx src/quiz/quiz.ts` | Post the daily citat quiz (reads quotes from the DB) |
| `yarn tsx src/discgolf/discgolf.ts` | Run the discgolf bot |
| `yarn lint` | Type-check + ESLint |

The quotes crawler downloads attachment images into `public/quote-attachments/`;
`systemd/assets.service` (src/assets/server.ts, port `ASSETS_PORT`, default 3100) serves
them to the web app, which relays `/quote-attachments/*` misses here via a Next rewrite.

Deployment uses `systemd/` (a `discgolf` + `assets` service + `cron` for quotes/quiz/recent-plays/make-users).
Everything runs as the unprivileged `riks` user with the repo at `/home/riks/Riksdagen-Backend`
(nvm + node installed for that user); only the maintenance reboot (`systemd/cron.root`) is root's.
Cron logs go to `/var/log/riksdagen-backend/` — create that directory owned by `riks`.
To update the server: `bash /home/riks/Riksdagen-Backend/systemd/update.sh` as root (pulls main,
reinstalls deps, regenerates Prisma clients, refreshes crontabs + service, restarts discgolf
if running).
