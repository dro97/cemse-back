const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZThjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiWU9VVEgiLCJ0eXBlIjoidXNlciIsImlhdCI6MTc1NTU0MzQzNSwiZXhwIjoxNzU1NjI5ODM1fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Función para obtener un módulo con lecciones
async function getModuleWithLessons() {
  try {
    const module = await prisma.courseModule.findFirst({
      where: {
        hasCertificate: true,
        lessons: {
          some: {}
        }
      },
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
      }
    });

    if (!module) {
      console.log('❌ No se encontró ningún módulo con lecciones y certificados habilitados');
      return null;
    }

    console.log(`📚 Módulo encontrado: ${module.title}`);
    console.log(`🎓 Curso: ${module.course.title}`);
    console.log(`📋 Lecciones: ${module.lessons.length}`);
    
    return module;
  } catch (error) {
    console.error('❌ Error obteniendo módulo:', error);
    return null;
  }
}

// Función para obtener o crear un usuario joven
async function getOrCreateYouthUser() {
  try {
    let user = await prisma.profile.findFirst({
      where: { role: 'YOUTH' }
    });

    if (!user) {
      console.log('👤 Creando usuario joven...');
      user = await prisma.profile.create({
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
    } else {
      console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName}`);
    }

    return user;
  } catch (error) {
    console.error('❌ Error con usuario:', error);
    return null;
  }
}

// Función para crear enrollment
async function createEnrollment(userId, courseId) {
  try {
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

// Función para completar lecciones una por una
async function completeLessonsOneByOne(enrollmentId, lessons) {
  try {
    console.log(`\n📚 Completando lecciones del módulo...`);
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      
      console.log(`\n📖 Completando lección ${i + 1}/${lessons.length}: ${lesson.title}`);
      
      const response = await axios.post(`${API_BASE_URL}/lessonprogress`, {
        enrollmentId: enrollmentId,
        lessonId: lesson.id,
        isCompleted: true,
        timeSpent: Math.floor(Math.random() * 300) + 120, // 2-7 minutos
        videoProgress: 1.0
      }, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        console.log(`✅ Lección completada: ${lesson.title}`);
        
        // Verificar si se generó certificado después de la última lección
        if (i === lessons.length - 1) {
          console.log(`\n🎉 ¡Última lección completada! Verificando certificado...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
          
          const certificates = await checkCertificates(user.userId, courseModule.id);
          if (certificates.length > 0) {
            console.log(`\n🏆 ¡Certificado generado automáticamente!`);
            certificates.forEach(cert => {
              console.log(`   📜 Módulo: ${cert.module.title}`);
              console.log(`   📊 Calificación: ${cert.grade}%`);
              console.log(`   🔗 URL: ${cert.certificateUrl}`);
            });
          } else {
            console.log(`\n❌ No se generó certificado automáticamente`);
          }
        }
        
        // Esperar un poco entre lecciones
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`❌ Error completando lección: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('❌ Error completando lecciones:', error.response?.data || error.message);
  }
}

// Función para verificar certificados
async function checkCertificates(userId, moduleId) {
  try {
    const certificates = await prisma.moduleCertificate.findMany({
      where: {
        studentId: userId,
        moduleId: moduleId
      },
      include: {
        module: {
          select: {
            title: true,
            course: {
              select: {
                title: true
              }
            }
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return certificates;
  } catch (error) {
    console.error('❌ Error verificando certificados:', error);
    return [];
  }
}

// Variables globales para el script
let user, courseModule, enrollment;

// Función principal
async function main() {
  try {
    console.log('🚀 === PRUEBA DE GENERACIÓN AUTOMÁTICA DE CERTIFICADOS ===\n');
    
    // 1. Obtener módulo con lecciones
    courseModule = await getModuleWithLessons();
    if (!courseModule) return;
    
    // 2. Obtener o crear usuario joven
    user = await getOrCreateYouthUser();
    if (!user) return;
    
    // 3. Crear enrollment
    enrollment = await createEnrollment(user.userId, courseModule.course.id);
    if (!enrollment) return;
    
    // 4. Verificar certificados antes de empezar
    console.log('\n🔍 Verificando certificados existentes...');
    const existingCertificates = await checkCertificates(user.userId, courseModule.id);
    if (existingCertificates.length > 0) {
      console.log(`⚠️  Ya existen ${existingCertificates.length} certificados para este módulo`);
      console.log('   Eliminando certificados existentes para la prueba...');
      
      for (const cert of existingCertificates) {
        await prisma.moduleCertificate.delete({
          where: { id: cert.id }
        });
      }
      console.log('✅ Certificados existentes eliminados');
    } else {
      console.log('✅ No hay certificados existentes');
    }
    
    // 5. Completar lecciones una por una
    await completeLessonsOneByOne(enrollment.id, courseModule.lessons);
    
    // 6. Verificación final
    console.log('\n🔍 Verificación final de certificados...');
    const finalCertificates = await checkCertificates(user.userId, courseModule.id);
    
    console.log('\n🎉 === PRUEBA COMPLETADA ===');
    console.log(`📋 Resumen:`);
    console.log(`   📚 Módulo: ${courseModule.title}`);
    console.log(`   👤 Estudiante: ${user.firstName} ${user.lastName}`);
    console.log(`   📖 Lecciones completadas: ${courseModule.lessons.length}`);
    console.log(`   🏆 Certificados generados: ${finalCertificates.length}`);
    
    if (finalCertificates.length > 0) {
      console.log('\n✅ ¡La generación automática funciona correctamente!');
      console.log('🌐 Puedes verificar en: http://localhost:3001/api/modulecertificate');
    } else {
      console.log('\n❌ La generación automática no funcionó');
    }
    
  } catch (error) {
    console.error('\n💥 === ERROR EN LA PRUEBA ===');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}
