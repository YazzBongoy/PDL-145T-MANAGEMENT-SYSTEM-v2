#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.join(__dirname, '..');
const backendEnv = path.join(repoRoot, 'backend', '.env');

console.log('🌱 Seeding database...');

try {
  const env = { ...process.env };

  // The Prisma client does not load .env on its own; load the backend env so
  // DATABASE_URL is available for the seed script in local development.
  if (fs.existsSync(backendEnv)) {
    require('dotenv').config({ path: backendEnv, processEnv: env });
  }

  if (!env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Create backend/.env (see backend/.env.example) or export DATABASE_URL.');
    process.exit(1);
  }

  console.log('🚀 Running demo user seed...');
  execSync(`node ${path.join(__dirname, 'seed-demo-user.js')}`, {
    stdio: 'inherit',
    cwd: repoRoot,
    env,
  });

  console.log('✅ Database seeding completed successfully!');
} catch (error) {
  console.error('❌ Database seeding failed:', error.message);
  process.exit(1);
}
