const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createYouthUsers() {
  try {
    // Datos de usuarios jóvenes de ejemplo
    const youthUsers = [
      {
        username: 'maria_garcia',
        password: 'password123',
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@email.com',
        skills: ['JavaScript', 'React', 'Diseño UX'],
        interests: ['Desarrollo web', 'Tecnología', 'Música'],
        educationLevel: 'UNIVERSITY',
        currentInstitution: 'Universidad Católica Boliviana',
        department: 'Cochabamba',
        municipality: 'Cochabamba'
      },
      {
        username: 'carlos_rodriguez',
        password: 'password123',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@email.com',
        skills: ['Python', 'Machine Learning', 'Análisis de datos'],
        interests: ['Inteligencia Artificial', 'Ciencia', 'Deportes'],
        educationLevel: 'UNIVERSITY',
        currentInstitution: 'Universidad Mayor de San Simón',
        department: 'Cochabamba',
        municipality: 'Cochabamba'
      },
      {
        username: 'ana_martinez',
        password: 'password123',
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana.martinez@email.com',
        skills: ['Marketing Digital', 'Redes Sociales', 'Comunicación'],
        interests: ['Marketing', 'Fotografía', 'Viajes'],
        educationLevel: 'UNIVERSITY',
        currentInstitution: 'Universidad Privada Boliviana',
        department: 'Cochabamba',
        municipality: 'Cochabamba'
      },
      {
        username: 'luis_fernandez',
        password: 'password123',
        firstName: 'Luis',
        lastName: 'Fernández',
        email: 'luis.fernandez@email.com',
        skills: ['Java', 'Spring Boot', 'Bases de datos'],
        interests: ['Desarrollo de software', 'Videojuegos', 'Cine'],
        educationLevel: 'UNIVERSITY',
        currentInstitution: 'Universidad Mayor de San Simón',
        department: 'Cochabamba',
        municipality: 'Cochabamba'
      },
      {
        username: 'sofia_lopez',
        password: 'password123',
        firstName: 'Sofía',
        lastName: 'López',
        email: 'sofia.lopez@email.com',
        skills: ['Diseño Gráfico', 'Illustrator', 'Photoshop'],
        interests: ['Arte', 'Diseño', 'Literatura'],
        educationLevel: 'UNIVERSITY',
        currentInstitution: 'Universidad Católica Boliviana',
        department: 'Cochabamba',
        municipality: 'Cochabamba'
      }
    ];

    console.log('🚀 Creando usuarios jóvenes de ejemplo...');

    for (const userData of youthUsers) {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        console.log(`⚠️  Usuario ${userData.username} ya existe, saltando...`);
        continue;
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          password: hashedPassword,
          role: 'YOUTH'
        }
      });

      // Crear el perfil
      await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          skills: userData.skills,
          interests: userData.interests,
          educationLevel: userData.educationLevel,
          currentInstitution: userData.currentInstitution,
          department: userData.department,
          municipality: userData.municipality,
          country: 'Bolivia'
        }
      });

      console.log(`✅ Usuario ${userData.username} creado exitosamente`);
    }

    console.log('\n🎉 Usuarios jóvenes creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    youthUsers.forEach(user => {
      console.log(`   Usuario: ${user.username} | Contraseña: password123`);
    });

  } catch (error) {
    console.error('❌ Error creando usuarios jóvenes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYouthUsers();
