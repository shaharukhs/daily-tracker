# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Daily Tracker — a multi-user, subscription-aware habit tracker ("Self-Dignified Muslim Woman"). pnpm monorepo with three workspaces: a NestJS + Prisma REST API, a Next.js web app, and a shared package of Zod schemas / constants used by both.

- `apps/api` — NestJS 10 REST API (`@daily-tracker/api`), Prisma + PostgreSQL.
- `apps/web` — Next.js 14 app router frontend (`@daily-tracker/web`), Tailwind + React Query. Auth (`src/lib/auth.tsx`) keeps the access token in memory and restores sessions on load via the refresh cookie; `authFetch` auto-refreshes once on 401. The daily tracker page (`src/app/tracker`) currently wires up the Salah + Water trackers; the other 7 are pending backend modules. `src/lib/*` holds the API/auth/date helpers, `src/components/*` the tracker cards.
- `packages/shared` — `@daily-tracker/shared`, the **single source of truth** for tracker codes and request/response Zod schemas, imported by both apps via `workspace:*`. Builds to CommonJS in `dist/` (`pnpm --filter @daily-tracker/shared build`); the Node API requires the built `dist` at runtime, while the web app and TS type-checking resolve the `src` via the path alias. Rebuild `dist` after changing shared code that the API imports.

Node `20.11.0` (`.nvmrc`), pnpm `9.x`. Run all commands from the repo root unless noted.

## Commands

```bash
pnpm install              # install all workspaces

# Local dev (run the DB first)
pnpm db:up                # start Postgres 16 in Docker (port 5432)
pnpm db:migrate           # apply Prisma migrations (prisma migrate dev)
pnpm db:seed              # seed subscription plans + plan→tracker mappings
pnpm dev                  # run api + web in parallel (api :4000, web :3000)

# Build / quality
pnpm build                # builds packages first, then apps
pnpm lint                 # eslint across all workspaces (--max-warnings 0)
pnpm test                 # run all workspace tests
pnpm test:cov             # with coverage (api enforces 80% global threshold)
pnpm format               # prettier --write across the repo

# DB tooling
pnpm db:studio            # Prisma Studio
pnpm db:down              # stop Docker DB

# API-only (cd apps/api, or use pnpm --filter @daily-tracker/api <script>)
pnpm --filter @daily-tracker/api test:e2e        # e2e suite (test/jest-e2e.json)
```

Run a single API unit test (Jest, `rootDir` is `src`, test files are `*.spec.ts`):

```bash
cd apps/api && pnpm jest src/auth/auth.service.spec.ts
cd apps/api && pnpm jest -t "rejects invalid credentials"   # by test name
```

## Architecture

### The tracker plugin model (most important concept)
Each habit is a "tracker" identified by a code in `packages/shared/src/tracker-codes.ts` (`TRACKER_CODES`). The system is **open/closed**: adding a tracker means adding new files, never editing existing trackers.

Each tracker owns its **own Prisma table** (e.g. `SalahEntry`, `WaterEntry`), each with a `@@unique([userId, date])` constraint — entries are one-row-per-user-per-calendar-day, upserted by `isoDate` (YYYY-MM-DD). On the backend, each tracker is a self-contained NestJS module under `apps/api/src/trackers/<name>/` (controller + service + module), wired into `app.module.ts`.

**To add a tracker:**
1. Add its code to `TRACKER_CODES` (+ `TRACKER_METADATA`) in `packages/shared`.
2. Add request schemas to `packages/shared/src/schemas/trackers.ts`.
3. Add a Prisma model with `@@unique([userId, date])` and run `pnpm db:migrate`.
4. Create `apps/api/src/trackers/<name>/` module and register it in `app.module.ts`.
5. Map the code to subscription plans via `PlanTracker` (see `prisma/seed.ts`).

### Authorization: two-layer access control on tracker endpoints
Tracker controllers stack two guards plus a metadata decorator:

```ts
@Controller('trackers/water')
@UseGuards(JwtAuthGuard, RequiresTrackerGuard)
@RequiresTracker(TRACKER_CODES.WATER)
```

- `JwtAuthGuard` — authenticates via the access-token JWT (Passport `jwt.strategy.ts`), populates `request.user`.
- `RequiresTrackerGuard` (`common/guards/`) — reads the `@RequiresTracker(code)` metadata and allows the request only if (1) the user has an **ACTIVE** subscription, (2) the user's plan includes the tracker (`PlanTracker` join), and (3) the user hasn't disabled it in `UserTrackerPreference`. Endpoints without the decorator are unrestricted by this guard.

Get the authenticated user in handlers via `@CurrentUser() user: AuthUser` (`common/decorators/current-user.decorator.ts`).

### Auth flow (`apps/api/src/auth/`)
Access/refresh token split. Access tokens are short-lived JWTs returned in the response body (client holds in memory). Refresh tokens are random, **hashed** (argon2) and stored in the `RefreshToken` table with rotation + revocation; the raw token is sent only as an httpOnly cookie `dt_refresh` scoped to `/api/v1/auth`. Passwords hashed with argon2. `/auth/register` and `/auth/login` have stricter per-route `@Throttle` limits.

### Validation: Zod everywhere, schemas live in `shared`
Request validation uses `ZodValidationPipe` (`common/pipes/`) with schemas from `@daily-tracker/shared` — applied per-route via `@UsePipes(new ZodValidationPipe(schema))` or per-param (`@Param('date', new ZodValidationPipe(isoDate))`). Define new request shapes in `packages/shared/src/schemas/` and import the inferred type alongside the schema. A separate class-validator `ValidationPipe` (whitelist + forbidNonWhitelisted) is also registered globally in `main.ts` as defense in depth.

### Cross-cutting setup
- `main.ts` — global prefix `api/v1`, helmet CSP, cookie-parser, CORS allowlist (`CORS_ORIGIN`, credentials enabled), `AllExceptionsFilter`.
- Env is validated at boot by a Zod schema in `config/env.ts` (`validateEnv`) — the app **fails fast** on invalid/missing config. Access typed config via `ConfigService<Env, true>` with `{ infer: true }`. See `apps/api/.env.example`.
- Global `ThrottlerGuard` rate-limits all routes (`THROTTLE_*` env).
- Prisma is exposed app-wide via `common/prisma/PrismaModule`/`PrismaService`.

### Database portability
`prisma/schema.prisma` is written to be provider-portable. To switch off Postgres, change `provider`, update `DATABASE_URL`, and re-run `pnpm db:migrate`. IDs are `cuid()`.

## Git

When committing or pushing in this repository, **always** author commits with this identity (not the login email):

- **Name:** Shahrukh Shikalgar
- **Email:** shaharukhs@gmail.com

Apply it per-repo (do not change global git config), e.g.:

```bash
git -c user.name="Shahrukh Shikalgar" -c user.email="shaharukhs@gmail.com" commit -m "..."
```

Do **not** add a `Co-Authored-By` trailer to commit messages in this repo.

**Push auth:** `origin` is `github.com/shaharukhs/daily-tracker` and this repo pushes as the GitHub account **shaharukhs**, independent of whichever `gh` account is globally active. This is isolated via a repo-local credential helper (`git config --local credential.https://github.com.helper` → `gh auth token --user shaharukhs`) — never change global git/gh config for this. So `git push` just works.

The `/commit-and-push` skill (`.claude/skills/commit-and-push/`) automates all of this — prefer it for commits/pushes.

## Conventions
- TypeScript is `strict` repo-wide; the API additionally enables `noUncheckedIndexedAccess` (the web app disables it).
- API path alias `@/*` → `apps/api/src/*`; `@daily-tracker/shared` resolves to the shared `src` in both Jest and tsconfig.
- API lint and web lint both run with `--max-warnings 0` — zero warnings tolerated.
- Web tests are not in Jest; the `test` script is a no-op placeholder (Playwright planned under `playwright/`).
- The web app needs `NEXT_PUBLIC_API_URL` (see `apps/web/.env.local`, defaults to `http://localhost:4000`). Run the API and web separately during dev (`pnpm --filter @daily-tracker/api dev`, `pnpm --filter @daily-tracker/web dev`) — `pnpm dev` starts both. The API's `CORS_ORIGIN` must match the web origin for cookie auth to work.
