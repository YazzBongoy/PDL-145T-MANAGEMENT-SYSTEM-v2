#!/bin/sh
# Backend container entrypoint.
#
# Applies committed Prisma migrations before starting the API so that a fresh
# `docker compose up` produces a working, queryable database. Without this the
# container starts with an empty schema and every API call fails.
#
# `prisma migrate deploy` is idempotent: it only applies migrations that are not
# yet recorded, so restarting the container is safe.
set -e

# Prisma's schema declares directUrl = env("DIRECT_URL"). Many deployments only
# define DATABASE_URL, so fall back to it when DIRECT_URL is absent.
if [ -z "${DIRECT_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi

echo "Applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "Starting API server..."
exec "$@"
