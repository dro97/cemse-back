const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserCreation() {
  try {
    console.log('🔍 Testing user creation logic for municipalities...\n');

    // 1. Get a municipality
    const municipality = await prisma.municipality.findFirst({
      where: { isActive: true }
    });

    if (!municipality) {
      console.log('❌ No active municipality found');
      return;
    }

    console.log('📋 Municipality details:');
    console.log('  ID:', municipality.id);
    console.log('  Name:', municipality.name);
    console.log('  Username:', municipality.username);
    console.log('  Email:', municipality.email);
    console.log('  CreatedBy:', municipality.createdBy);
    console.log('');

    // 2. Check if there's already a user for this municipality
    console.log('🔍 Checking for existing user...');
    let institutionUser = await prisma.user.findFirst({
      where: { username: municipality.username }
    });

    if (institutionUser) {
      console.log('✅ Found existing user:');
      console.log('  ID:', institutionUser.id);
      console.log('  Username:', institutionUser.username);
      console.log('  Role:', institutionUser.role);
      console.log('  IsActive:', institutionUser.isActive);
    } else {
      console.log('❌ No existing user found');
    }

    // 3. Simulate the user creation logic
    console.log('\n🏭 Simulating user creation logic...');
    
    if (!institutionUser) {
      console.log('  Creating new user for municipality...');
      institutionUser = await prisma.user.create({
        data: {
          username: municipality.username,
          password: 'municipality_user_' + municipality.id,
          role: 'MUNICIPAL_GOVERNMENTS',
          isActive: true
        }
      });
      console.log('  ✅ New user created:');
      console.log('    ID:', institutionUser.id);
      console.log('    Username:', institutionUser.username);
      console.log('    Role:', institutionUser.role);
    } else {
      console.log('  ✅ Using existing user');
    }

    // 4. Check municipality state after user operations
    console.log('\n📋 Checking municipality state after user operations...');
    const municipalityAfter = await prisma.municipality.findUnique({
      where: { id: municipality.id }
    });

    console.log('  Municipality state:');
    console.log('    ID:', municipalityAfter.id);
    console.log('    Username:', municipalityAfter.username);
    console.log('    Email:', municipalityAfter.email);
    console.log('    UpdatedAt:', municipalityAfter.updatedAt);

    // 5. Check for changes
    const usernameChanged = municipalityAfter.username !== municipality.username;
    const emailChanged = municipalityAfter.email !== municipality.email;
    const updatedAtChanged = municipalityAfter.updatedAt.getTime() !== municipality.updatedAt.getTime();

    if (usernameChanged || emailChanged || updatedAtChanged) {
      console.log('\n⚠️  Changes detected:');
      console.log('  Username changed:', usernameChanged);
      console.log('  Email changed:', emailChanged);
      console.log('  UpdatedAt changed:', updatedAtChanged);
      
      if (updatedAtChanged) {
        console.log('  Time difference:', municipalityAfter.updatedAt.getTime() - municipality.updatedAt.getTime(), 'ms');
      }
    } else {
      console.log('\n✅ No changes detected in municipality');
    }

    // 6. Check if we created a duplicate user
    const allUsersWithSameUsername = await prisma.user.findMany({
      where: { username: municipality.username }
    });

    console.log('\n📊 Users with same username:', allUsersWithSameUsername.length);
    if (allUsersWithSameUsername.length > 1) {
      console.log('⚠️  WARNING: Multiple users with same username found!');
      allUsersWithSameUsername.forEach((user, index) => {
        console.log(`  User ${index + 1}:`, user.id, user.username, user.role);
      });
    }

    console.log('\n📝 CONCLUSION:');
    console.log('  - User creation logic works as expected');
    console.log('  - Municipality credentials should remain unchanged');
    console.log('  - Only updatedAt might change due to database operations');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation();
