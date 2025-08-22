const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Función para habilitar certificados en módulos
async function enableCertificatesOnModules() {
  try {
    console.log('🔧 Habilitando certificados en módulos...');
    
    // Obtener todos los módulos
    const modules = await prisma.courseModule.findMany({
      include: {
        lessons: {
          select: {
            id: true,
            title: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`📚 Encontrados ${modules.length} módulos`);

    // Habilitar certificados en módulos que tengan lecciones
    for (const module of modules) {
      if (module.lessons.length > 0) {
        await prisma.courseModule.update({
          where: { id: module.id },
          data: { hasCertificate: true }
        });
        
        console.log(`✅ Certificados habilitados en: ${module.title} (${module.lessons.length} lecciones)`);
      }
    }

    console.log('🎉 Todos los módulos con lecciones ahora tienen certificados habilitados');
  } catch (error) {
    console.error('❌ Error habilitando certificados:', error);
  }
}

// Función para crear un usuario joven de prueba
async function createTestUser() {
  try {
    console.log('👤 Creando usuario de prueba...');
    
    // Verificar si ya existe un usuario joven
    const existingUser = await prisma.profile.findFirst({
      where: { role: 'YOUTH' }
    });

    if (existingUser) {
      console.log(`✅ Usuario joven ya existe: ${existingUser.firstName} ${existingUser.lastName}`);
      return existingUser;
    }

    // Crear nuevo usuario
    const user = await prisma.profile.create({
      data: {
        userId: `test_user_${Date.now()}`,
        firstName: 'Estudiante',
        lastName: 'Prueba',
        email: 'estudiante.prueba@example.com',
        role: 'YOUTH',
        dateOfBirth: new Date('2000-01-01'),
        gender: 'OTHER',
        phoneNumber: '123456789',
        address: 'Dirección de prueba',
        city: 'Ciudad de prueba',
        state: 'Estado de prueba',
        country: 'País de prueba',
        zipCode: '12345',
        bio: 'Estudiante de prueba para certificados',
        isActive: true
      }
    });

    console.log(`✅ Usuario creado: ${user.firstName} ${user.lastName}`);
    return user;
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    return null;
  }
}

// Función para crear enrollment de prueba
async function createTestEnrollment(userId, courseId) {
  try {
    console.log('📝 Verificando enrollment existente...');
    
    // Verificar si ya existe un enrollment
    let enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: userId,
        courseId: courseId
      }
    });

    if (enrollment) {
      console.log(`✅ Enrollment existente encontrado: ${enrollment.id}`);
      return enrollment;
    }

    console.log('📝 Creando nuevo enrollment...');
    
    enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: userId,
        courseId: courseId,
        enrolledAt: new Date(),
        status: 'ENROLLED',
        progress: 0
      }
    });

    console.log(`✅ Enrollment creado: ${enrollment.id}`);
    return enrollment;
  } catch (error) {
    console.error('❌ Error creando enrollment:', error);
    return null;
  }
}

// Función para mostrar información de módulos
async function showModulesInfo() {
  try {
    console.log('\n📊 Información de módulos:');
    
    const modules = await prisma.courseModule.findMany({
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            orderIndex: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    modules.forEach((module, index) => {
      console.log(`\n${index + 1}. 📚 Módulo: ${module.title}`);
      console.log(`   🎓 Curso: ${module.course.title}`);
      console.log(`   📋 Lecciones: ${module.lessons.length}`);
      console.log(`   🏆 Certificados: ${module.hasCertificate ? '✅ Habilitado' : '❌ Deshabilitado'}`);
      
      if (module.lessons.length > 0) {
        console.log(`   📖 Lecciones:`);
        module.lessons.forEach((lesson, lessonIndex) => {
          console.log(`      ${lessonIndex + 1}. ${lesson.title}`);
        });
      }
    });

    return modules;
  } catch (error) {
    console.error('❌ Error obteniendo información de módulos:', error);
    return [];
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 === CONFIGURACIÓN DE CERTIFICADOS DE MÓDULOS ===\n');
    
    // 1. Mostrar información actual de módulos
    const modules = await showModulesInfo();
    
    // 2. Habilitar certificados en módulos
    await enableCertificatesOnModules();
    
    // 3. Crear usuario de prueba
    const user = await createTestUser();
    
    if (user && modules.length > 0) {
      // 4. Crear enrollment para el primer curso
      const firstModule = modules[0];
      const enrollment = await createTestEnrollment(user.userId, firstModule.course.id);
      
      if (enrollment) {
        console.log('\n🎉 === CONFIGURACIÓN COMPLETADA ===');
        console.log('📋 Resumen:');
        console.log(`   📚 Módulos configurados: ${modules.length}`);
        console.log(`   👤 Usuario de prueba: ${user.firstName} ${user.lastName}`);
        console.log(`   📝 Enrollment: ${enrollment.id}`);
        console.log(`   🎓 Curso: ${firstModule.course.title}`);
        console.log(`   📖 Lecciones disponibles: ${firstModule.lessons.length}`);
        
        console.log('\n🚀 Ahora puedes probar la generación automática con:');
        console.log('   node scripts/test-module-completion.js');
      }
    }
    
  } catch (error) {
    console.error('\n💥 === ERROR EN LA CONFIGURACIÓN ===');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}
