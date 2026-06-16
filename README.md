# Daily Tracker

### 🌙 Live app: **https://daily-tracker-web-kohl.vercel.app**

> Open the link, create an account, and start tracking. (The API is on a free tier that sleeps when idle, so the first request after a while may take ~30–60s to wake.)

**The Self-Dignified Muslim Woman — Daily Tracker.** A multi-user, subscription-aware habit
tracker. Sign in, and track your day across 9 trackers (Salah, Adhkar, Quran, Exercise, Water,
Junk-Free, Food Log, Weekly Weigh-In, Reflection) — everything syncs per user, per day.

**Stack:** pnpm monorepo · NestJS + Prisma + PostgreSQL (API) · Next.js 14 + Tailwind + React Query (web) · shared Zod schemas.

```
apps/api        NestJS REST API        -> http://localhost:4000/api/v1
apps/web        Next.js web app        -> http://localhost:3000
packages/shared Shared tracker codes + Zod schemas
```

---

## Prerequisites

Install these once on the machine:

| Tool | Version | macOS (Homebrew) | Notes |
|------|---------|------------------|-------|
| Node.js | ≥ 20.11 | `brew install node` | `.nvmrc` pins 20.11.0 (use `nvm use` if you have nvm) |
| pnpm | ≥ 9 | `brew install pnpm` | or `corepack enable && corepack prepare pnpm@latest --activate` |
| Docker Desktop | latest | `brew install --cask docker` | needed only for the PostgreSQL database; **launch the app** so the engine runs |

> No Docker? See [Running without Docker](#running-without-docker) to point at any PostgreSQL 16 instance.

---

## Quick start (copy-paste)

From the repo root, after installing the prerequisites above:

```bash
# 1) Install all workspace dependencies
pnpm install

# 2) Create the API environment file with freshly generated JWT secrets
cat > apps/api/.env <<EOF
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL="postgresql://tracker:tracker_dev_password@localhost:5432/daily_tracker?schema=public"
JWT_ACCESS_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=100
EOF

# 3) Create the web environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > apps/web/.env.local

# 4) Start PostgreSQL in Docker (Docker Desktop must be running)
pnpm db:up

# 5) Build the shared package (the API requires its built output at runtime)
pnpm --filter @daily-tracker/shared build

# 6) Create the database schema and seed subscription plans
pnpm db:migrate        # creates tables + generates the Prisma client
pnpm db:seed           # seeds plans and unlocks all trackers

# 7) Run the API and web app together
pnpm dev
```

Then open **http://localhost:3000**, click **Create account**, and start tracking.
(Password rules: at least 8 characters with an uppercase letter, a lowercase letter, a digit, and a symbol.)

To stop: `Ctrl+C` the `pnpm dev` process, then `pnpm db:down` to stop the database.

### Starting up again later

The database data persists in a Docker volume, so subsequent runs are just:

```bash
pnpm db:up      # start the database
pnpm dev        # start API + web
```

---

## Common commands

```bash
pnpm dev                  # run API (:4000) + web (:3000) in watch mode
pnpm build                # production build (shared -> apps)
pnpm lint                 # lint all workspaces
pnpm test                 # run tests

pnpm db:up                # start PostgreSQL (Docker)
pnpm db:down              # stop PostgreSQL
pnpm db:migrate           # apply / create Prisma migrations
pnpm db:seed              # seed subscription plans + tracker mappings
pnpm db:studio            # open Prisma Studio (visual DB browser)

# run only one app
pnpm --filter @daily-tracker/api dev
pnpm --filter @daily-tracker/web dev
```

---

## Running without Docker

If you can't use Docker, install or point at any **PostgreSQL 16** server, then update
`DATABASE_URL` in `apps/api/.env` to match, and skip `pnpm db:up`. Example with Homebrew Postgres:

```bash
brew install postgresql@16
brew services start postgresql@16
createdb daily_tracker
# set DATABASE_URL, e.g.:
#   postgresql://<youruser>@localhost:5432/daily_tracker?schema=public
pnpm --filter @daily-tracker/shared build
pnpm db:migrate && pnpm db:seed
pnpm dev
```

Prisma also supports MySQL/SQLite/SQL Server/MongoDB — change `provider` in
`apps/api/prisma/schema.prisma`, update `DATABASE_URL`, and re-run `pnpm db:migrate`.

---

## Deploy to the cloud (free tier)

Stack: **Vercel** (web) · **Render** (API, `render.yaml` included) · **Neon** (Postgres). All deploy from this GitHub repo.

The web app proxies `/api/*` to the API (see `rewrites()` in `apps/web/next.config.mjs`) so the
browser stays same-origin and the auth cookie works without any CORS/cookie changes.

1. **Neon** — create a free project + `daily_tracker` DB; copy the connection string (append
   `?sslmode=require`). This is `DATABASE_URL`.
2. **Render** — New → Blueprint → pick this repo (uses `render.yaml`). Set the dashboard secrets:
   `DATABASE_URL` (Neon), `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET` (`openssl rand -base64 48` each),
   `CORS_ORIGIN` (your Vercel URL). The build runs `prisma migrate deploy`; then seed once from
   Render's Shell: `pnpm --filter @daily-tracker/api prisma:seed`. Check `/api/v1/health`.
3. **Vercel** — New Project → this repo, **Root Directory `apps/web`**. Env:
   `API_ORIGIN=<your Render API URL>` and `NEXT_PUBLIC_API_URL=` (empty). Deploy.

> Render's free API sleeps when idle (first request after ~15 min takes 30–60s to wake). Optional:
> keep it warm with a free cron ping to `/api/v1/health`.

---

## Troubleshooting

- **`pnpm: command not found`** — install pnpm (`brew install pnpm`) or run `corepack enable`.
- **`Cannot connect to the Docker daemon` / db won't start** — open the Docker Desktop app and
  wait for the whale icon to settle, then re-run `pnpm db:up`.
- **API exits with a module/`@daily-tracker/shared` error** — you skipped step 5; run
  `pnpm --filter @daily-tracker/shared build` (the API loads the package's built `dist/`).
- **`Invalid environment configuration` on API start** — `apps/api/.env` is missing or a JWT
  secret is shorter than 32 chars. Re-run step 2 (the `openssl` commands generate valid secrets).
- **Web loads but can't log in / CORS errors** — make sure the API is running on `:4000` and that
  `CORS_ORIGIN` in `apps/api/.env` matches the web origin (`http://localhost:3000`).
- **Port already in use** — stop whatever holds `4000`/`3000`, or change `PORT` (API) and
  `NEXT_PUBLIC_API_URL` accordingly.
