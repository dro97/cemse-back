const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createYouthUser() {
  try {
    console.log('🌱 Creating youth user with profile...');

    // Create user
    const hashedPassword = await bcrypt.hash('joven123', 10);
    
    const user = await prisma.user.upsert({
      where: { username: 'joven_test' },
      update: {},
      create: {
        username: 'joven_test',
        password: hashedPassword,
        role: UserRole.YOUTH,
        isActive: true,
      },
    });

    console.log('✅ User created:', user.username);

    // Create profile for the user
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        phone: '+591 70012345',
        address: 'Calle Principal 123',
        municipality: 'Cochabamba',
        department: 'Cochabamba',
        country: 'Bolivia',
        birthDate: new Date('2005-06-15'),
        gender: 'Masculino',
        documentType: 'CI',
        documentNumber: '12345678',
        educationLevel: 'SECONDARY',
        currentInstitution: 'Colegio San José',
        graduationYear: 2023,
        isStudying: true,
        skills: ['JavaScript', 'React', 'HTML', 'CSS'],
        interests: ['Programación', 'Tecnología', 'Diseño Web'],
        role: UserRole.YOUTH,
        status: 'ACTIVE',
        profileCompletion: 85,
        parentalConsent: true,
        parentEmail: 'padres.perez@example.com',
        consentDate: new Date(),
      },
    });

    console.log('✅ Profile created for:', profile.firstName, profile.lastName);

    // Create another youth user
    const hashedPassword2 = await bcrypt.hash('adolescente123', 10);
    
    const user2 = await prisma.user.upsert({
      where: { username: 'adolescente_test' },
      update: {},
      create: {
        username: 'adolescente_test',
        password: hashedPassword2,
        role: UserRole.ADOLESCENTS,
        isActive: true,
      },
    });

    console.log('✅ User created:', user2.username);

    // Create profile for the second user
    const profile2 = await prisma.profile.upsert({
      where: { userId: user2.id },
      update: {},
      create: {
        userId: user2.id,
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@example.com',
        phone: '+591 70054321',
        address: 'Avenida Libertad 456',
        municipality: 'La Paz',
        department: 'La Paz',
        country: 'Bolivia',
        birthDate: new Date('2007-03-20'),
        gender: 'Femenino',
        documentType: 'CI',
        documentNumber: '87654321',
        educationLevel: 'SECONDARY',
        currentInstitution: 'Colegio María Auxiliadora',
        graduationYear: 2025,
        isStudying: true,
        skills: ['Python', 'Matemáticas', 'Inglés'],
        interests: ['Ciencia', 'Matemáticas', 'Idiomas'],
        role: UserRole.ADOLESCENTS,
        status: 'ACTIVE',
        profileCompletion: 90,
        parentalConsent: true,
        parentEmail: 'padres.garcia@example.com',
        consentDate: new Date(),
      },
    });

    console.log('✅ Profile created for:', profile2.firstName, profile2.lastName);

    console.log('');
    console.log('🎉 Youth users created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('Joven: joven_test / joven123');
    console.log('Adolescente: adolescente_test / adolescente123');
    console.log('');
    console.log('🔑 To get JWT token, use:');
    console.log('POST http://localhost:3001/api/auth/login');
    console.log('Body: { "username": "joven_test", "password": "joven123" }');

  } catch (error) {
    console.error('❌ Error creating youth users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYouthUser(); 