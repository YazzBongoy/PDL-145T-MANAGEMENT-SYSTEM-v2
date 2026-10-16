// Shared helper for the backend integration test harness.
//
// The integration suites (auth/project/measurement) are destructive: they call
// `deleteMany({})` on shared tables such as Project, Task and Site. Running
// them against the developer database therefore either fails on foreign-key
// constraints (seeded Contracts reference Projects) or wipes local data.
//
// Instead, the suites run against a dedicated test database that this module
// resolves. It defaults to the database named by `DATABASE_URL` with its name
// replaced by `pdl_test`, and can be overridden with `TEST_DATABASE_URL` or
// `TEST_DATABASE_NAME`.

const path = require('path');

// Load backend/.env so the base connection string is available even when jest
// is invoked without the environment already exported. `override: false` keeps
// an explicitly exported DATABASE_URL/TEST_DATABASE_URL from being clobbered.
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DEFAULT_TEST_DB_NAME = 'pdl_test';

function resolveTestUrl() {
  const explicit = process.env.TEST_DATABASE_URL;
  if (explicit) {
    return explicit;
  }

  const base =
    process.env.DATABASE_URL ||
    'postgresql://postgres:password@localhost:5432/pdl_management';
  const url = new URL(base);
  const dbName = process.env.TEST_DATABASE_NAME || DEFAULT_TEST_DB_NAME;
  url.pathname = '/' + dbName;
  return url.toString();
}

module.exports = { resolveTestUrl, DEFAULT_TEST_DB_NAME };
