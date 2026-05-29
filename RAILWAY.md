# Railway deployment (Handoff)

Hosting was migrated from Cloudflare Workers to a Node server so the app runs on Railway.
`wrangler.jsonc` is kept but unused.

## How it builds and runs

Railway uses Nixpacks (see `railway.json`):

- Build: `bun run build` — Vite emits a standard SSR bundle:
  - `dist/server/server.js` — web-standard `fetch` handler (auth-route interception + SSR error wrapper)
  - `dist/client/**` — client JS/CSS/static assets
- Start: `bun run start` — runs `server-node.mjs`, a thin Node entry that serves
  `dist/client` static files first, then falls through to the SSR handler. It binds
  `0.0.0.0` and listens on `PORT` (Railway injects this; defaults to 3000 locally).

## Required environment variables

Set these in the Railway service (never commit secret values):

- `GITHUB_CLIENT_ID` — GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET` — GitHub OAuth App client secret
- `SESSION_SECRET` — session signing secret (falls back to `GITHUB_CLIENT_SECRET` if unset)
- `VITE_N8N_WEBHOOK_URL` — n8n webhook URL for the pipeline (build-time `VITE_*`, set before build)
- `DATABASE_URL` — Postgres connection string (required for per-account history,
  #33–#34). Add a Railway Postgres plugin and it injects this automatically. SSL is
  required (the client connects with `ssl: 'require'`). If unset, login / SSR / the
  n8n pipeline / issue publishing all keep working — only the server-backed History
  view degrades (anonymous visitors are unaffected; they use localStorage).

After deploy, set the GitHub OAuth App callback URL to:

    https://<your-railway-domain>/api/auth/github/callback

## Database schema (one-time, after first deploy)

The history tables live in Postgres (`users`, `meetings`, `handoffs`). Apply the
idempotent schema once after the first deploy (and any time `db/schema.sql` changes):

    bun run db:migrate

This reads `DATABASE_URL` from the environment and applies `db/schema.sql`. It is
safe to re-run. Run it from a Railway shell on the deployed service (so it sees the
injected `DATABASE_URL`), or locally with `DATABASE_URL` exported. For a local
Postgres without TLS, set `PGSSL=disable`.

## Local dev / preview

- `bun run dev` — Vite dev server; `vite.config.ts` loads `.env` then `.dev.vars` into
  `process.env` so server-side `GITHUB_*` / `SESSION_SECRET` are readable.
- `bun run build && bun run start` — production Node server locally. The `start` path reads
  only `process.env`, so export secrets first, e.g. `set -a && . ./.dev.vars && set +a`.
