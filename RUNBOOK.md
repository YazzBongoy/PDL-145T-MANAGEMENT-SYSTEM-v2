# Reproducibility Runbook — PDL-145T Management System v2

Focused reference for reproducing the build and test gates from a clean
checkout. This is not a full operations guide; it covers only the commands used
to verify `fix/pdl-reproducible-tests`.

## Prerequisites

- Node.js 20+ and npm 10+ (verified on Node v22.23.5 / npm 11.17.0).
- A reachable PostgreSQL 15 + PostGIS instance (local Docker container is fine).
- `backend/.env` with at least `DATABASE_URL` and `JWT_SECRET`. `DIRECT_URL`
  mirrors `DATABASE_URL` for local development.

Start a database if needed:

```bash
docker compose -f infrastructure/docker-compose.yml up -d db
```

## Backend integration tests use an isolated database

The Jest suites are destructive (`deleteMany` on shared tables), so they never
run against the developer database. `backend/jest.global-setup.cjs` creates and
migrates a dedicated database on the first run; later runs are idempotent.

Resolution order in `backend/test-db.cjs`:

1. `TEST_DATABASE_URL` — full connection string, highest priority.
2. `TEST_DATABASE_NAME` — database name on the `DATABASE_URL` host.
3. Otherwise the default `pdl_test`.

`backend/jest.setup-env.cjs` rewrites `DATABASE_URL`/`DIRECT_URL` in every Jest
worker before Prisma is imported. CI's PostgreSQL service uses database
`pdl145t_test`; if its role cannot create databases, set `TEST_DATABASE_URL`
explicitly on the backend test step.

Suites are serialized (`maxWorkers: 1`) because they truncate shared tables.

## Reproduction commands (run from the repository root)

Use these exact commands. `env -u npm_config_allow_scripts` removes a
machine-wide npm allowlist so the checkout behaves like CI; the browser
download flags keep dependency installation offline-friendly.

```bash
env -u npm_config_allow_scripts CYPRESS_INSTALL_BINARY=0 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
env -u npm_config_allow_scripts npm run build
env -u npm_config_allow_scripts npm run test --prefix backend
env -u npm_config_allow_scripts npm run test:run --prefix frontend
```

Notes:

- `npm ci` now regenerates the Prisma client via `postinstall`; `npm run build`
  runs `prisma generate && tsc` for the backend before Vite builds the frontend.
- The backend test command needs PostgreSQL reachable, but the test database
  does not need to exist beforehand.
- `npm run test:run --prefix frontend` is self-contained (jsdom); it needs no
  database. Playwright browsers are not installed by these commands — run
  `npx playwright install` separately if you need the E2E project.

## Known baseline state on `origin/main`

At the time of this port, both test suites are red on `origin/main` for
pre-existing test/API drift (lowercase request fields and a now-required
`Program` relation in backend fixtures; outdated frontend snapshots). These
failures are unrelated to the test-isolation and typecheck-gate changes in
this branch. The build and install gates are green.
