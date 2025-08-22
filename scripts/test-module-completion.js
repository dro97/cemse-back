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
        hasCertificate: true
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
      console.log('❌ No se encontró ningún módulo con certificados habilitados');
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

// Función para obtener un usuario joven
async function getYouthUser() {
  try {
    const user = await prisma.profile.findFirst({
      where: {
        role: 'YOUTH'
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      console.log('❌ No se encontró ningún usuario joven');
      return null;
    }

    console.log(`👤 Usuario encontrado: ${user.firstName} ${user.lastName}`);
    return user;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

// Función para crear enrollment
async function createEnrollment(userId, courseId) {
  try {
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: userId,
        courseId: courseId,
        enrolledAt: new Date(),
        status: 'ACTIVE'
      }
    });

    console.log(`✅ Enrollment creado: ${enrollment.id}`);
    return enrollment;
  } catch (error) {
    console.error('❌ Error creando enrollment:', error);
    return null;
  }
}

// Función para completar lecciones
async function completeLessons(enrollmentId, lessons) {
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
        
        // Esperar un poco entre lecciones para que se procese
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`❌ Error completando lección: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('❌ Error completando lecciones:', error.response?.data || error.message);
  }
}

// Función para verificar certificados generados
async function checkGeneratedCertificates(userId, moduleId) {
  try {
    console.log(`\n🔍 Verificando certificados generados...`);
    
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

    if (certificates.length > 0) {
      console.log(`\n🎉 ¡Certificados generados exitosamente!`);
      certificates.forEach((cert, index) => {
        console.log(`\n📜 Certificado ${index + 1}:`);
        console.log(`   📚 Módulo: ${cert.module.title}`);
        console.log(`   🎓 Curso: ${cert.module.course.title}`);
        console.log(`   👤 Estudiante: ${cert.student.firstName} ${cert.student.lastName}`);
        console.log(`   📊 Calificación: ${cert.grade}%`);
        console.log(`   📅 Completado: ${new Date(cert.completedAt).toLocaleDateString()}`);
        console.log(`   🔗 URL: ${cert.certificateUrl}`);
      });
    } else {
      console.log(`\n❌ No se generaron certificados automáticamente`);
    }

    return certificates;
  } catch (error) {
    console.error('❌ Error verificando certificados:', error);
    return [];
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 === PRUEBA DE GENERACIÓN AUTOMÁTICA DE CERTIFICADOS ===\n');
    
    // 1. Obtener módulo con lecciones
    const module = await getModuleWithLessons();
    if (!module) return;
    
    // 2. Obtener usuario joven
    const user = await getYouthUser();
    if (!user) return;
    
    // 3. Crear enrollment
    const enrollment = await createEnrollment(user.userId, module.course.id);
    if (!enrollment) return;
    
    // 4. Completar todas las lecciones del módulo
    await completeLessons(enrollment.id, module.lessons);
    
    // 5. Esperar un poco para que se procese la generación del certificado
    console.log('\n⏳ Esperando procesamiento...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. Verificar si se generó el certificado
    const certificates = await checkGeneratedCertificates(user.userId, module.id);
    
    console.log('\n🎉 === PRUEBA COMPLETADA ===');
    console.log(`📋 Resumen:`);
    console.log(`   📚 Módulo: ${module.title}`);
    console.log(`   👤 Estudiante: ${user.firstName} ${user.lastName}`);
    console.log(`   📖 Lecciones completadas: ${module.lessons.length}`);
    console.log(`   🏆 Certificados generados: ${certificates.length}`);
    
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
