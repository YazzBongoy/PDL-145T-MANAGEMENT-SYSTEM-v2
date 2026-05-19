import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@pdl145t.com';
  const password = 'password123';
  const name = 'Test User';
  const role = 'ADMIN';

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✓ Test user already exists');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ${role}`);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  console.log('✓ Test user created successfully');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role: ${role}`);
  console.log(`  User ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
