const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugLoginIssue() {
  try {
    console.log('🔍 Debugging login issue after company creation...\n');

    // 1. Get the municipality that was used
    const municipality = await prisma.municipality.findFirst({
      where: { username: 'diegorocha_ys5m' }
    });

    if (!municipality) {
      console.log('❌ Municipality not found');
      return;
    }

    console.log('📋 Municipality details:');
    console.log('  ID:', municipality.id);
    console.log('  Username:', municipality.username);
    console.log('  Email:', municipality.email);
    console.log('  Password hash:', municipality.password.substring(0, 20) + '...');
    console.log('');

    // 2. Check if there's a user with the same username
    const userWithSameUsername = await prisma.user.findFirst({
      where: { username: 'diegorocha_ys5m' }
    });

    if (userWithSameUsername) {
      console.log('⚠️  Found user with same username as municipality:');
      console.log('  User ID:', userWithSameUsername.id);
      console.log('  User Username:', userWithSameUsername.username);
      console.log('  User Role:', userWithSameUsername.role);
      console.log('  User Password hash:', userWithSameUsername.password.substring(0, 20) + '...');
      console.log('  User IsActive:', userWithSameUsername.isActive);
      console.log('');
    } else {
      console.log('✅ No user found with same username as municipality');
      console.log('');
    }

    // 3. Simulate the login process
    console.log('🔐 Simulating login process...');
    
    const testPassword = 'tu_contraseña_aqui'; // Reemplaza con la contraseña real
    
    // Step 1: Check regular users table first
    console.log('  Step 1: Checking regular users table...');
    const user = await prisma.user.findUnique({
      where: { username: 'diegorocha_ys5m' }
    });
    
    if (user && user.isActive) {
      console.log('  ✓ Found user in users table');
      const isValidPassword = await bcrypt.compare(testPassword, user.password);
      console.log('  Password valid for user:', isValidPassword);
      
      if (isValidPassword) {
        console.log('  ❌ PROBLEM: Login would succeed with user instead of municipality!');
        console.log('  This means the municipality login is being bypassed.');
      }
    } else {
      console.log('  ✓ No user found in users table');
    }
    
    // Step 2: Check municipality table
    console.log('  Step 2: Checking municipality table...');
    const municipalityCheck = await prisma.municipality.findUnique({
      where: { username: 'diegorocha_ys5m' }
    });
    
    if (municipalityCheck && municipalityCheck.isActive) {
      console.log('  ✓ Found municipality');
      const isValidPassword = await bcrypt.compare(testPassword, municipalityCheck.password);
      console.log('  Password valid for municipality:', isValidPassword);
    } else {
      console.log('  ❌ Municipality not found or inactive');
    }

    // 4. Check all entities with this username
    console.log('\n📊 All entities with username "diegorocha_ys5m":');
    
    const allUsers = await prisma.user.findMany({
      where: { username: 'diegorocha_ys5m' }
    });
    
    const allMunicipalities = await prisma.municipality.findMany({
      where: { username: 'diegorocha_ys5m' }
    });
    
    const allCompanies = await prisma.company.findMany({
      where: { username: 'diegorocha_ys5m' }
    });
    
    console.log('  Users:', allUsers.length);
    console.log('  Municipalities:', allMunicipalities.length);
    console.log('  Companies:', allCompanies.length);
    
    if (allUsers.length > 0) {
      console.log('  ⚠️  WARNING: Multiple users with same username found!');
      allUsers.forEach((user, index) => {
        console.log(`    User ${index + 1}:`, user.id, user.username, user.role);
      });
    }

    console.log('\n📝 DIAGNOSIS:');
    if (userWithSameUsername) {
      console.log('  ❌ PROBLEM IDENTIFIED:');
      console.log('  - There is a user with the same username as the municipality');
      console.log('  - The login system checks users table first');
      console.log('  - This user has different credentials than the municipality');
      console.log('  - The municipality login is being bypassed');
      console.log('');
      console.log('  🔧 SOLUTION:');
      console.log('  - Remove the duplicate user from the users table');
      console.log('  - Or modify the login logic to prioritize municipalities');
    } else {
      console.log('  ✅ No duplicate users found');
      console.log('  - The issue might be elsewhere');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLoginIssue();
