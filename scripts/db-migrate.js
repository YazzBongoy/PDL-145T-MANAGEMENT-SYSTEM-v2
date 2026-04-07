#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');

console.log('🔄 Running database migrations...');

try {
  // Change to backend directory and run Prisma migrations
  process.chdir(backendDir);
  
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run migrations
  console.log('🚀 Running Prisma migrations...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  
  console.log('✅ Database migrations completed successfully!');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
}
