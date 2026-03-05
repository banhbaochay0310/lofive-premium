import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/utils/bcrypt.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await hashPassword('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@subscription.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@subscription.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await hashPassword('Test123!');
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@test.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create subscription plans
  const plans = await prisma.plan.createMany({
    data: [
      {
        name: 'Mini',
        price: 4.99,
        durationDays: 7,
        isActive: true,
      },
      {
        name: 'Individual',
        price: 9.99,
        durationDays: 30,
        isActive: true,
      },
      {
        name: 'Student',
        price: 4.99,
        durationDays: 30,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Subscription plans created:', plans.count);

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@subscription.com / Admin123!');
  console.log('   User:  user@test.com / Test123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
