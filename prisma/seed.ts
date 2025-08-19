import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      isActive: true,
    },
  });

  console.log('✅ Super admin created:', superAdmin.username);

  // Create some sample users for different roles
  const sampleUsers = [
    { username: 'jovenes1', password: 'password123', role: UserRole.YOUTH },
    { username: 'adolescentes1', password: 'password123', role: UserRole.ADOLESCENTS },
    { username: 'empresa1', password: 'password123', role: UserRole.COMPANIES },
    { username: 'gobierno1', password: 'password123', role: UserRole.MUNICIPAL_GOVERNMENTS },
    { username: 'centro1', password: 'password123', role: UserRole.TRAINING_CENTERS },
    { username: 'ong1', password: 'password123', role: UserRole.NGOS_AND_FOUNDATIONS },
  ];

  for (const userData of sampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
      },
    });
  }

  console.log('✅ Sample users created');

  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('Super Admin: admin / admin123');
  console.log('Sample Users:');
  sampleUsers.forEach(user => {
    console.log(`  ${user.role}: ${user.username} / ${user.password}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 