import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

const defaultUsers = [
  {
    name: 'System Administrator',
    email: 'admin@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'ADMIN',
  },
  {
    name: 'Responsable Logistique (RL)',
    email: 'rl@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'FINANCE',
  },
  {
    name: 'Responsable Comptable (RC)',
    email: 'rc@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'SUPERVISOR',
  },
  {
    name: 'Coordinateur Qualité (CQ)',
    email: 'cq@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'ADMIN',
  },
  {
    name: 'Commission Finance et Execution (CFEF)',
    email: 'cfef@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'ADMIN',
  },
  {
    name: 'Construction Manager',
    email: 'construction@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'CONSTRUCTION',
  },
  {
    name: 'Regular User',
    email: 'user@pdl145t.com',
    password: DEFAULT_PASSWORD,
    role: 'USER',
  },
];

async function seedUsers() {
  console.log('🌱 Starting database seeding...\n');

  for (const userData of defaultUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash,
          role: userData.role as any,
        },
      });

      console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log('\n🎉 Database seeding completed!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('Default Login Credentials:');
  console.log('═══════════════════════════════════════════════════');
  console.log('Email:    admin@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     ADMIN');
  console.log('───────────────────────────────────────────────────');
  console.log('Email:    rl@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     FINANCE (Responsable Logistique)');
  console.log('───────────────────────────────────────────────────');
  console.log('Email:    rc@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     SUPERVISOR (Responsable Comptable)');
  console.log('───────────────────────────────────────────────────');
  console.log('Email:    cq@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     ADMIN (Coordinateur Qualité)');
  console.log('───────────────────────────────────────────────────');
  console.log('Email:    cfef@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     ADMIN (Commission Finance et Execution)');
  console.log('───────────────────────────────────────────────────');
  console.log('Email:    construction@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     CONSTRUCTION');
  console.log('───────────────────────────────────────────────────');
  console.log('Email:    user@pdl145t.com');
  console.log('Password: Password123!');
  console.log('Role:     USER');
  console.log('═══════════════════════════════════════════════════');
}

seedUsers()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
