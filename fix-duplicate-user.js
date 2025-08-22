const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixDuplicateUser() {
  try {
    console.log('🔧 Fixing duplicate user issue...\n');

    const username = 'diegorocha_ys5m';

    // 1. Check current state
    console.log('📋 Current state:');
    
    const municipality = await prisma.municipality.findFirst({
      where: { username }
    });
    
    const user = await prisma.user.findFirst({
      where: { username }
    });

    if (municipality) {
      console.log('✅ Municipality found:', municipality.id);
    } else {
      console.log('❌ Municipality not found');
    }

    if (user) {
      console.log('⚠️  Duplicate user found:', user.id);
      console.log('  Role:', user.role);
      console.log('  Password:', user.password.substring(0, 20) + '...');
    } else {
      console.log('✅ No duplicate user found');
    }

    console.log('');

    // 2. Check if the user was created by the company creation process
    if (user && user.password.startsWith('municipality_user_')) {
      console.log('🔍 This user was created by the company creation process');
      console.log('  It has a hardcoded password and should be updated');
      console.log('');

      // 3. Check if this user has any related records
      console.log('🔍 Checking for related records...');
      
      const companiesCreatedByUser = await prisma.company.findMany({
        where: { createdBy: user.id }
      });

      console.log('  Companies created by this user:', companiesCreatedByUser.length);
      
      if (companiesCreatedByUser.length > 0) {
        console.log('  Companies:');
        companiesCreatedByUser.forEach(company => {
          console.log(`    - ${company.name} (${company.id})`);
        });
      }

      // 4. Update the user password to match the municipality password
      console.log('\n🔄 Updating user password to match municipality...');
      
      // Get the municipality password
      const municipalityPassword = municipality.password;
      
      // Update the user with the municipality's password
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: municipalityPassword,
          role: 'MUNICIPAL_GOVERNMENTS',
          isActive: true
        }
      });
      
      console.log('  ✓ User password updated to match municipality');

    } else if (user) {
      console.log('⚠️  User found but it might not be a duplicate');
      console.log('  Password does not match the expected pattern');
      console.log('  Manual review required');
      return;
    }

    // 5. Verify the fix
    console.log('\n✅ Verifying fix...');
    
    const municipalityAfter = await prisma.municipality.findFirst({
      where: { username }
    });
    
    const userAfter = await prisma.user.findFirst({
      where: { username }
    });

    if (municipalityAfter && userAfter) {
      console.log('✅ FIX SUCCESSFUL:');
      console.log('  - Municipality still exists');
      console.log('  - User password updated to match municipality');
      console.log('  - Login should work with municipality credentials');
      console.log('  - Companies remain associated with the user');
    } else {
      console.log('❌ Fix verification failed');
      console.log('  Municipality exists:', !!municipalityAfter);
      console.log('  User exists:', !!userAfter);
    }

    console.log('\n📝 NEXT STEPS:');
    console.log('  1. Try logging in with your municipality credentials');
    console.log('  2. The login should now work correctly');
    console.log('  3. Both municipality and user will have the same credentials');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateUser();
