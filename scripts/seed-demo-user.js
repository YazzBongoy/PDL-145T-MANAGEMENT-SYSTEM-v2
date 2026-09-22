const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

if (process.env.NODE_ENV === "production") {
  console.log("Skipping seed in production environment.");
  process.exit(0);
}

const prisma = new PrismaClient();

async function seedDemoUser() {
  try {
    console.log("Starting demo user seed...");

    // Hash the demo password
    const demoPassword = "demo12345";
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(demoPassword, salt);

    // Create or update demo user
    const user = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {
        passwordHash: passwordHash,
      },
      create: {
        name: "Demo User",
        email: "demo@example.com",
        passwordHash: passwordHash,
        role: "USER",
      },
    });

    console.log("✅ Demo user created/updated successfully:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log("\nDemo Credentials:");
    console.log(`   Email: demo@example.com`);
    console.log(`   Password: demo12345`);
  } catch (error) {
    console.error("❌ Error seeding demo user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoUser();
