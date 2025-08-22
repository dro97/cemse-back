const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMunicipalityUpdate() {
  try {
    console.log('🔍 Testing municipality update behavior during company creation simulation...\n');

    // 1. Get a municipality
    const municipality = await prisma.municipality.findFirst({
      where: { isActive: true }
    });

    if (!municipality) {
      console.log('❌ No active municipality found');
      return;
    }

    console.log('📋 Municipality BEFORE company creation simulation:');
    console.log('  ID:', municipality.id);
    console.log('  Name:', municipality.name);
    console.log('  Username:', municipality.username);
    console.log('  Email:', municipality.email);
    console.log('  UpdatedAt:', municipality.updatedAt);
    console.log('');

    // 2. Simulate the company creation process
    console.log('🏭 Simulating company creation process...');
    
    // Step 1: Verify municipality exists and is active (like in createCompany)
    const municipalityCheck = await prisma.municipality.findUnique({
      where: { id: municipality.id }
    });
    
    console.log('  ✓ Municipality verification completed');
    
    // Step 2: Create a test company (if possible)
    try {
      const testCompany = await prisma.company.create({
        data: {
          name: 'Test Company for Update Check',
          username: 'test_company_' + Date.now(),
          password: 'hashed_password',
          loginEmail: 'test@company.com',
          municipalityId: municipality.id,
          createdBy: municipality.createdBy,
          isActive: true
        }
      });
      
      console.log('  ✓ Test company created:', testCompany.id);
      
      // Step 3: Check municipality after company creation
      const municipalityAfter = await prisma.municipality.findUnique({
        where: { id: municipality.id }
      });
      
      console.log('\n📋 Municipality AFTER company creation:');
      console.log('  ID:', municipalityAfter.id);
      console.log('  Name:', municipalityAfter.name);
      console.log('  Username:', municipalityAfter.username);
      console.log('  Email:', municipalityAfter.email);
      console.log('  UpdatedAt:', municipalityAfter.updatedAt);
      console.log('');
      
      // Check for changes
      const usernameChanged = municipalityAfter.username !== municipality.username;
      const emailChanged = municipalityAfter.email !== municipality.email;
      const isActiveChanged = municipalityAfter.isActive !== municipality.isActive;
      const updatedAtChanged = municipalityAfter.updatedAt.getTime() !== municipality.updatedAt.getTime();
      
      if (usernameChanged || emailChanged || isActiveChanged || updatedAtChanged) {
        console.log('⚠️  Changes detected:');
        console.log('  Username changed:', usernameChanged);
        console.log('  Email changed:', emailChanged);
        console.log('  IsActive changed:', isActiveChanged);
        console.log('  UpdatedAt changed:', updatedAtChanged);
        
        if (updatedAtChanged) {
          console.log('  Time difference:', municipalityAfter.updatedAt.getTime() - municipality.updatedAt.getTime(), 'ms');
        }
      } else {
        console.log('✅ No changes detected');
      }
      
      // Clean up: Delete the test company
      await prisma.company.delete({
        where: { id: testCompany.id }
      });
      console.log('  ✓ Test company deleted');
      
    } catch (error) {
      console.log('  ⚠️  Could not create test company:', error.message);
      console.log('  This might be due to unique constraints or other restrictions');
    }

    console.log('\n📝 CONCLUSION:');
    console.log('  - The municipality verification process may trigger updates');
    console.log('  - This is normal behavior for database operations');
    console.log('  - Credentials should remain unchanged');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMunicipalityUpdate();
