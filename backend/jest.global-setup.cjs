// Jest globalSetup: provisions the isolated integration-test database.
//
// 1. Creates the test database (e.g. `pdl_test`) if it does not exist.
// 2. Generates the Prisma client (so a clean checkout can run tests without a
//    separate build step; npm may also do this via the `postinstall` script).
// 3. Applies the committed Prisma migrations to the test database.
//
// The test database is resolved by `test-db.cjs` from DATABASE_URL /
// TEST_DATABASE_URL and is wiped by the suites, so it must never point at the
// developer database.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { resolveTestUrl } = require('./test-db.cjs');

function prismaBinary() {
  const candidates = [
    path.join(__dirname, 'node_modules', '.bin', 'prisma'),
    path.join(__dirname, '..', 'node_modules', '.bin', 'prisma'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function runPrisma(args, env) {
  const options = { cwd: __dirname, env: { ...process.env, ...env }, stdio: 'inherit' };
  const bin = prismaBinary();
  if (bin) {
    execFileSync(bin, args, options);
  } else {
    execFileSync('npx', ['prisma', ...args], options);
  }
}

module.exports = async () => {
  const testUrl = resolveTestUrl();
  const parsed = new URL(testUrl);
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!dbName) {
    throw new Error('[test-db] Could not determine the test database name from DATABASE_URL/TEST_DATABASE_URL');
  }

  // Create the database if needed by connecting to the maintenance database.
  const adminUrl = new URL(testUrl);
  adminUrl.pathname = '/postgres';
  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`[test-db] created database "${dbName}"`);
    }
  } finally {
    await client.end();
  }

  const env = { DATABASE_URL: testUrl, DIRECT_URL: testUrl };
  runPrisma(['generate'], env);
  console.log(`[test-db] applying migrations to "${dbName}"`);
  runPrisma(['migrate', 'deploy'], env);
};
