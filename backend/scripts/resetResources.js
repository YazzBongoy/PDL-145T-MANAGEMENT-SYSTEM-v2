import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all resources...');
  
  // Delete all resources (cascade will handle related records)
  await prisma.resource.deleteMany({});
  
  console.log('✓ All resources deleted');
  console.log('✅ Resources reset successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
