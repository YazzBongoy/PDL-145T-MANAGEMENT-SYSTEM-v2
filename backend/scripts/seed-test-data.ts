import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Create test devices/resources
    const devices = [
      {
        Name: 'Excavator CAT 320',
        Type: 'Heavy Machinery',
        Description: 'Hydraulic excavator for construction',
        Quantity: 1,
        Status: 'active',
        Location: 'Site A - Zone 1',
        SerialNumber: 'CAT320-2024-001',
        PurchaseDate: new Date('2023-01-15'),
        LastMaintenance: new Date('2024-01-10'),
        NextMaintenance: new Date('2024-04-10'),
        Cost: 185000.00,
      },
      {
        Name: 'Generator Honda 6500W',
        Type: 'Power Equipment',
        Description: 'Portable power generator',
        Quantity: 3,
        Status: 'active',
        Location: 'Site B - Storage',
        SerialNumber: 'HON6500-2024-002',
        PurchaseDate: new Date('2023-06-20'),
        LastMaintenance: new Date('2024-02-15'),
        NextMaintenance: new Date('2024-05-15'),
        Cost: 3500.00,
      },
      {
        Name: 'Crane Tower XL',
        Type: 'Heavy Machinery',
        Description: 'Tower crane for high-rise construction',
        Quantity: 1,
        Status: 'maintenance',
        Location: 'Site C - Maintenance Bay',
        SerialNumber: 'TOWER-2023-003',
        PurchaseDate: new Date('2022-08-10'),
        LastMaintenance: new Date('2024-03-01'),
        NextMaintenance: new Date('2024-03-15'),
        Cost: 450000.00,
      },
      {
        Name: 'Welding Station Miller',
        Type: 'Workshop Equipment',
        Description: 'MIG welding station',
        Quantity: 2,
        Status: 'inactive',
        Location: 'Workshop - Bay 3',
        SerialNumber: 'MILLER-2024-004',
        PurchaseDate: new Date('2024-01-05'),
        LastMaintenance: null,
        NextMaintenance: null,
        Cost: 8500.00,
      },
      {
        Name: 'Bulldozer Komatsu D61',
        Type: 'Heavy Machinery',
        Description: 'Crawler bulldozer',
        Quantity: 1,
        Status: 'active',
        Location: 'Site D - Earthworks',
        SerialNumber: 'KOMD61-2023-005',
        PurchaseDate: new Date('2023-03-12'),
        LastMaintenance: new Date('2024-02-20'),
        NextMaintenance: new Date('2024-05-20'),
        Cost: 275000.00,
      },
    ];

    for (const device of devices) {
      await prisma.resource.upsert({
        where: { SerialNumber: device.SerialNumber },
        update: {},
        create: device,
      });
    }
    console.log(`✅ Created ${devices.length} test devices`);

    // Create or update test users with settings
    const testUsers: { email: string; name: string; passwordHash: string; role: UserRole }[] = [
      {
        email: 'admin@test.com',
        name: 'Admin Test User',
        passwordHash: '$2b$10$YourHashHere',
        role: UserRole.ADMIN,
      },
      {
        email: 'construction@test.com',
        name: 'Construction Test User',
        passwordHash: '$2b$10$YourHashHere',
        role: UserRole.SUPERVISOR,
      },
      {
        email: 'finance@test.com',
        name: 'Finance Test User',
        passwordHash: '$2b$10$YourHashHere',
        role: UserRole.USER,
      },
    ];

    for (const user of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: user,
        });

        // Create default settings for user
        await prisma.userSettings.create({
          data: {
            userId: newUser.id,
            theme: 'system',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            notifications: {},
            emailNotifications: {
              taskUpdates: true,
              approvals: true,
              dailySummary: false,
              maintenanceAlerts: true,
            },
            pushNotifications: {
              taskUpdates: true,
              approvals: true,
            },
          },
        });
      }
    }
    console.log(`✅ Created ${testUsers.length} test users with settings`);

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\nTest Users:');
    testUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
seedTestData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
