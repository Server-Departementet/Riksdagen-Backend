# Riksdagen-Bot

Discord bots for the Regeringen server: **quotes** (citat), **quiz**, and **discgolf**.
Split out of the [Riksdagen](https://github.com/Server-Departementet/Riksdagen) web app.

This repo owns the **canonical quotes**: `src/quotes/quotes.ts` crawls the quote
channel and upserts each quote into the bot's own MariaDB (`Quote` table). The web
app reads that table read-only over LAN.

## Setup

1. `yarn install`
2. Create a `.env` in the repo root (see [`.env.example`](.env.example)). Required:
   - `DATABASE_URL` — the bot's **own** MariaDB (hosts `User` + `Quote`)
   - `DISCORD_BOT_TOKEN`, `DISCORD_BOT_CLIENT_ID`
   - `REGERINGEN_GUILD_ID`, `QUOTE_CHANNEL_ID`, `QUIZ_CHANNEL_ID`, `CANONICAL_URL`
   - `DISCGOLF_GUILD_ID`, `DISCGOLF_READ_CHANNEL_ID`, `DISCGOLF_WRITE_CHANNEL_ID`
3. Provide `user-aliases.json` in the repo root — a `{ "<discordId>": ["Name", ...] }`
   map used to resolve quotees to user IDs. Not committed (operator-provided).
4. `yarn prisma migrate deploy` (or `yarn prisma migrate dev` locally) to create the tables.
5. Populate the `User` table (Discord-ID → name): `yarn tsx src/make-users.ts`

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn tsx src/make-users.ts` | Upsert Discord members (ministers) into the `User` table |
| `yarn tsx src/quotes/quotes.ts --fetch` | Crawl the quote channel and upsert quotes into the DB |
| `yarn tsx src/quiz/quiz.ts` | Post the daily citat quiz (reads quotes from the DB) |
| `yarn tsx src/discgolf/discgolf.ts` | Run the discgolf bot |
| `yarn lint` | Type-check + ESLint |

Deployment uses `systemd/` (a `discgolf` service + `cron` for quotes/quiz).
