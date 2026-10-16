// Runs in each jest worker before the test modules are imported, so that the
// PrismaClient constructed by `src/prisma.ts` connects to the isolated test
// database rather than the developer database.
const { resolveTestUrl } = require('./test-db.cjs');

process.env.DATABASE_URL = resolveTestUrl();
process.env.DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
