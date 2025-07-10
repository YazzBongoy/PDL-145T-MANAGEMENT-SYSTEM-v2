#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', 'backend');

console.log('🌱 Seeding database...');

try {
  // Change to backend directory and run Prisma seeding
  process.chdir(backendDir);
  
  // Check if seed script exists in backend package.json
  const packageJson = require(path.join(backendDir, 'package.json'));
  
  if (packageJson.scripts && packageJson.scripts.seed) {
    console.log('🚀 Running seed script...');
    execSync('npm run seed', { stdio: 'inherit' });
  } else {
    console.log('🌱 Running Prisma db seed...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
  }
  
  console.log('✅ Database seeding completed successfully!');
} catch (error) {
  console.error('❌ Database seeding failed:', error.message);
  console.log('💡 Make sure you have a seed script configured in your backend package.json or a seed file in your Prisma schema.');
  process.exit(1);
}
