# PDL-145T Management System — Runbook

Reproducible commands to build, run, seed, and test the application.

- **Stack:** Node.js + Express + TypeScript (backend), React 19 + Vite (frontend),
  PostgreSQL 15 + PostGIS, Prisma ORM.
- **Prerequisites:** Node.js 20+, npm 10+, Docker + Docker Compose v2.
- **Ports:** backend `3010`, frontend `3001` (prod container) / `5173` (Vite dev),
  PostgreSQL `5432`.

> Verified on Node v22.23.3, npm 11.17.0, Docker 29.1.3, Docker Compose v2.40.

---

## 1. Install dependencies

The repo is an npm workspace (`backend`, `frontend`). Install once from the root:

```bash
npm install
```

## 2. Configure the backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string.
- `DIRECT_URL` — Prisma direct (unpooled) connection; for local/dev this mirrors
  `DATABASE_URL`. **Required** — `prisma migrate` fails without it.
- `JWT_SECRET` — any long random string in dev.

## 3. Start PostgreSQL

```bash
docker compose -f infrastructure/docker-compose.yml up -d db
```

The `db` service is PostgreSQL 15 + PostGIS and runs `infrastructure/sql/01-init-postgis.sql`
on first boot.

## 4. Apply migrations

```bash
npm run db:migrate      # prisma generate + prisma migrate deploy
```

Optionally create a demo login (`demo@example.com` / `demo12345`):

```bash
npm run db:seed
```

> The seed is skipped when `NODE_ENV=production`.

## 5. Run the app

### Option A — Local dev (fastest for development)

Two terminals:

```bash
npm run dev -w backend                 # Express API on http://localhost:3010
npm run dev -w frontend -- --port 3001 # React (Vite) on http://localhost:3001
```

The Vite dev server proxies `/api` and `/auth` to `http://localhost:3010`, so open
<http://localhost:3001>.

### Option B — Full stack via Docker

```bash
cd infrastructure
cp .env.example .env     # set POSTGRES_PASSWORD, JWT_SECRET
docker compose up -d --build
```

- Frontend: <http://localhost:3001>
- Backend API: <http://localhost:3010/api/health>
- Adminer (DB UI): <http://localhost:8081>
- Neo4j browser: <http://localhost:7475>

The backend container applies Prisma migrations automatically on start
(`backend/docker-entrypoint.sh` → `prisma migrate deploy`).

**Reset a stale/dev database volume** (this deletes local data):

```bash
cd infrastructure
docker compose down -v
docker compose up -d --build
```

## 6. Build

```bash
npm run build           # builds backend (tsc) and frontend (tsc -b && vite build)
```

The backend build runs `prisma generate` first (the compiled services import
generated Prisma types), so a clean checkout builds without a manual generate
step. `npm install` also runs `prisma generate` via the backend `postinstall`
script.

## 7. Test

| Suite | Command | Notes |
|---|---|---|
| Frontend unit (Vitest) | `npm run test:run -w frontend` | Self-contained (jsdom). |
| Backend integration (Jest) | `npm test -w backend` | Needs the PostgreSQL container running (step 3). Provisions its own database — see below. |
| Backend watch | `npm run test:watch -w backend` | Same requirement. |
| Playwright (E2E) | `npm run playwright:test -w frontend` | Requires `npx playwright install` first. Starts Vite on port 3001. |
| Cypress (E2E) | `npm run cypress:run -w frontend` | Requires `npx cypress install` and the app running on http://localhost:3001. |

The backend integration suites are destructive (they `deleteMany({})` on shared
tables), so they must not run against the developer database. Jest's
`globalSetup` (`backend/jest.global-setup.cjs`) creates and migrates a dedicated
**test database** automatically:

- Default name: the `DATABASE_URL` database name with `_test` (e.g.
  `pdl_management` → `pdl_test`).
- Override with `TEST_DATABASE_URL` (full connection string) or
  `TEST_DATABASE_NAME`.

The first run creates and migrates `pdl_test`; later runs are idempotent. You
only need PostgreSQL reachable (step 3) — the test database does not have to be
migrated or seeded by hand.

Playwright browsers — the config defines Chromium, Firefox, WebKit and two
mobile projects. Install the ones you need:

```bash
cd frontend
npx playwright install chromium          # minimal
npx playwright install                   # all configured projects
```

Run a single project:

```bash
npm run playwright:test -w frontend -- --project=chromium
```

## 8. Production

```bash
scripts/start-app.sh    # docker compose -f infrastructure/docker-compose.prod.yml up -d --build
scripts/stop-app.sh
```

Requires `infrastructure/.env` with `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_DB`, and `JWT_SECRET` set (no defaults in the prod compose file).

---

## Troubleshooting

- **`npm run dev` fails building the backend image** — the image installs deps
  with `npm install` (there is no per-package lockfile; the lockfile lives at the
  repo root for the npm workspace).
- **`prisma migrate` errors: `Environment variable not found: DIRECT_URL`** — add
  `DIRECT_URL` to `backend/.env` (step 2).
- **`relation "Document" already exists` / `P1018` during migrate** — the local
  Postgres volume predates the committed migrations. Reset the volume (step 5) or
  point `DATABASE_URL` at a fresh database.
- **Backend tests fail with `process.exit called with "1"`** — the tests need a
  reachable, migrated database; complete steps 3–4 first.
