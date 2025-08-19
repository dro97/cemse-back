const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👥 Verificando usuarios en la base de datos...\n');

    // 1. Verificar usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`📊 Total de usuarios: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Lista de usuarios:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. Username: ${user.username}, Role: ${user.role}, ID: ${user.id}`);
      });
    } else {
      console.log('   ❌ No hay usuarios en la base de datos');
    }

    // 2. Verificar perfiles
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    console.log(`\n👤 Total de perfiles: ${profiles.length}`);
    
    if (profiles.length > 0) {
      console.log('\n📋 Lista de perfiles:');
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. Name: ${profile.firstName} ${profile.lastName}, Email: ${profile.email}, Role: ${profile.role}, UserID: ${profile.userId}`);
      });
    }

    // 3. Crear usuario de prueba si no existe
    const testUser = users.find(u => u.username === 'joven_test');
    
    if (!testUser) {
      console.log('\n🔧 Creando usuario de prueba...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          username: 'joven_test',
          password: hashedPassword,
          role: 'YOUTH'
        }
      });
      
      console.log(`   ✅ Usuario creado: ${newUser.username} (ID: ${newUser.id})`);
      
      // Crear perfil para el usuario
      const newProfile = await prisma.profile.create({
        data: {
          userId: newUser.id,
          firstName: 'Joven',
          lastName: 'Test',
          email: 'joven@test.com',
          role: 'YOUTH'
        }
      });
      
      console.log(`   ✅ Perfil creado: ${newProfile.firstName} ${newProfile.lastName}`);
      
    } else {
      console.log('\n✅ Usuario joven_test ya existe');
    }

    // 4. Verificar credenciales
    console.log('\n🔐 Verificando credenciales...');
    
    const testUserFinal = await prisma.user.findUnique({
      where: { username: 'joven_test' },
      select: {
        id: true,
        username: true,
        password: true,
        role: true
      }
    });
    
    if (testUserFinal) {
      console.log(`   ✅ Usuario encontrado: ${testUserFinal.username}`);
      console.log(`   Role: ${testUserFinal.role}`);
      console.log(`   Password hash: ${testUserFinal.password.substring(0, 20)}...`);
      
      // Verificar que la contraseña funciona
      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare('password123', testUserFinal.password);
      console.log(`   Password válida: ${isValid ? '✅ Sí' : '❌ No'}`);
    } else {
      console.log('   ❌ Usuario joven_test no encontrado');
    }

    console.log('\n📋 Resumen:');
    console.log('   - Si hay usuarios: Puedes usar cualquiera para login');
    console.log('   - Si no hay usuarios: Se creó joven_test automáticamente');
    console.log('   - Credenciales: username: joven_test, password: password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
