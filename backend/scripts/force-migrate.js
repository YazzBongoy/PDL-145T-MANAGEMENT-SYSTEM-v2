const { execSync } = require('child_process');

console.log('Forcing Prisma migrations...');

try {
  // Générer le client Prisma
  execSync('npx prisma generate', { stdio: 'inherit', cwd: '/opt/render/project/src/backend' });
  
  // Forcer les migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: '/opt/render/project/src/backend' });
  
  console.log('Migrations completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
