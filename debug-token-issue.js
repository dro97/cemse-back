const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = "supersecretkey";

async function debugTokenIssue() {
  try {
    console.log('🔍 Debugging token authentication issue...\n');

    const username = 'diegorocha_ys5m';

    // 1. Check current state of entities
    console.log('📋 Current entity state:');
    
    const municipality = await prisma.municipality.findFirst({
      where: { username }
    });
    
    const user = await prisma.user.findFirst({
      where: { username }
    });

    if (municipality) {
      console.log('✅ Municipality found:');
      console.log('  ID:', municipality.id);
      console.log('  Username:', municipality.username);
      console.log('  IsActive:', municipality.isActive);
    } else {
      console.log('❌ Municipality not found');
    }

    if (user) {
      console.log('✅ User found:');
      console.log('  ID:', user.id);
      console.log('  Username:', user.username);
      console.log('  Role:', user.role);
      console.log('  IsActive:', user.isActive);
    } else {
      console.log('❌ User not found');
    }

    console.log('');

    // 2. Generate test tokens
    console.log('🔐 Generating test tokens...');
    
    let municipalityToken = null;
    let userToken = null;
    
    if (municipality) {
      municipalityToken = jwt.sign(
        { 
          id: municipality.id, 
          username: municipality.username, 
          name: municipality.name,
          department: municipality.department,
          type: 'municipality'
        }, 
        JWT_SECRET, 
        { expiresIn: "24h" }
      );
      console.log('✅ Municipality token generated');
    }
    
    if (user) {
      userToken = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          type: 'user'
        }, 
        JWT_SECRET, 
        { expiresIn: "24h" }
      );
      console.log('✅ User token generated');
    }

    console.log('');

    // 3. Decode and analyze tokens
    console.log('🔍 Token analysis:');
    
    if (municipalityToken) {
      const municipalityPayload = jwt.verify(municipalityToken, JWT_SECRET);
      console.log('Municipality token payload:');
      console.log('  ID:', municipalityPayload.id);
      console.log('  Type:', municipalityPayload.type);
      console.log('  Username:', municipalityPayload.username);
    }
    
    if (userToken) {
      const userPayload = jwt.verify(userToken, JWT_SECRET);
      console.log('User token payload:');
      console.log('  ID:', userPayload.id);
      console.log('  Type:', userPayload.type);
      console.log('  Username:', userPayload.username);
      console.log('  Role:', userPayload.role);
    }

    console.log('');

    // 4. Simulate authentication middleware
    console.log('🔐 Simulating authentication middleware...');
    
    if (municipalityToken) {
      console.log('Testing municipality token:');
      const payload = jwt.verify(municipalityToken, JWT_SECRET);
      
      if (payload.type === 'municipality') {
        const municipalityCheck = await prisma.municipality.findUnique({
          where: { id: payload.id }
        });
        
        if (municipalityCheck && municipalityCheck.isActive) {
          console.log('  ✅ Municipality token is VALID');
          console.log('  ✅ Would pass authenticateToken middleware');
          console.log('  ✅ Would pass requireMunicipality middleware');
        } else {
          console.log('  ❌ Municipality token is INVALID');
          console.log('  ❌ Municipality not found or inactive');
        }
      }
    }
    
    if (userToken) {
      console.log('Testing user token:');
      const payload = jwt.verify(userToken, JWT_SECRET);
      
      if (payload.type === 'user') {
        const userCheck = await prisma.user.findUnique({
          where: { id: payload.id }
        });
        
        if (userCheck && userCheck.isActive) {
          console.log('  ✅ User token is VALID');
          console.log('  ✅ Would pass authenticateToken middleware');
          console.log('  ❌ Would FAIL requireMunicipality middleware (wrong type)');
        } else {
          console.log('  ❌ User token is INVALID');
          console.log('  ❌ User not found or inactive');
        }
      }
    }

    console.log('\n📝 DIAGNOSIS:');
    console.log('  - If you have a municipality token, it should work');
    console.log('  - If you have a user token, it will fail requireMunicipality');
    console.log('  - You need to login again to get a fresh municipality token');

    console.log('\n🔧 SOLUTION:');
    console.log('  1. Try logging in again with municipality credentials');
    console.log('  2. This should generate a new municipality token');
    console.log('  3. The new token should work with /api/municipality/auth/me');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTokenIssue();
