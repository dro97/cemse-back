const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZThjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiU1VQRVJBRE1JTiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNzU1NTQzNDM1LCJleHAiOjE3NTU2Mjk4MzV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Token de admin

// Función para crear un certificado de curso completo
async function createCourseCertificate(userId, courseId) {
  try {
    console.log(`🎓 Creando certificado de curso para usuario ${userId}...`);
    
    const certificate = await prisma.certificate.create({
      data: {
        userId: userId,
        courseId: courseId,
        template: 'default',
        verificationCode: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        digitalSignature: `sha256-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isValid: true,
        url: `https://minio.example.com/certificates/course-cert-${Date.now()}.pdf`
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('✅ Certificado de curso creado exitosamente');
    console.log(`   📚 Curso: ${certificate.course.title}`);
    console.log(`   👤 Estudiante: ${certificate.user.firstName} ${certificate.user.lastName}`);
    console.log(`   🔐 Código: ${certificate.verificationCode}`);
    
    return certificate;
  } catch (error) {
    console.error('❌ Error al crear certificado de curso:', error);
    throw error;
  }
}

// Función para crear un certificado de módulo
async function createModuleCertificate(moduleId, studentId) {
  try {
    console.log(`🎓 Creando certificado de módulo para estudiante ${studentId}...`);
    
    const certificate = await prisma.moduleCertificate.create({
      data: {
        moduleId: moduleId,
        studentId: studentId,
        certificateUrl: `https://minio.example.com/certificates/module-cert-${Date.now()}.pdf`,
        grade: Math.floor(Math.random() * 30) + 70, // Calificación entre 70-100
        completedAt: new Date()
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('✅ Certificado de módulo creado exitosamente');
    console.log(`   📚 Módulo: ${certificate.module.title}`);
    console.log(`   🎓 Curso: ${certificate.module.course.title}`);
    console.log(`   👤 Estudiante: ${certificate.student.firstName} ${certificate.student.lastName}`);
    console.log(`   📊 Calificación: ${certificate.grade}%`);
    
    return certificate;
  } catch (error) {
    console.error('❌ Error al crear certificado de módulo:', error);
    throw error;
  }
}

// Función para obtener usuarios jóvenes
async function getYouthUsers() {
  try {
    const users = await prisma.profile.findMany({
      where: {
        role: 'YOUTH'
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true
      },
      take: 5
    });
    
    console.log(`👥 Encontrados ${users.length} usuarios jóvenes`);
    return users;
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    throw error;
  }
}

// Función para obtener cursos
async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true
      },
      take: 3
    });
    
    console.log(`📚 Encontrados ${courses.length} cursos`);
    return courses;
  } catch (error) {
    console.error('❌ Error al obtener cursos:', error);
    throw error;
  }
}

// Función para obtener módulos
async function getModules() {
  try {
    const modules = await prisma.courseModule.findMany({
      select: {
        id: true,
        title: true,
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      take: 5
    });
    
    console.log(`📚 Encontrados ${modules.length} módulos`);
    return modules;
  } catch (error) {
    console.error('❌ Error al obtener módulos:', error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 === CREANDO CERTIFICADOS DE PRUEBA ===\n');
    
    // 1. Obtener datos necesarios
    const users = await getYouthUsers();
    const courses = await getCourses();
    const modules = await getModules();
    
    if (users.length === 0) {
      console.log('⚠️  No hay usuarios jóvenes para crear certificados');
      return;
    }
    
    if (courses.length === 0) {
      console.log('⚠️  No hay cursos para crear certificados');
      return;
    }
    
    if (modules.length === 0) {
      console.log('⚠️  No hay módulos para crear certificados');
      return;
    }
    
    // 2. Crear certificados de cursos completos
    console.log('\n📚 === CREANDO CERTIFICADOS DE CURSOS ===');
    const courseCertificates = [];
    for (let i = 0; i < Math.min(users.length, courses.length); i++) {
      const certificate = await createCourseCertificate(users[i].userId, courses[i].id);
      courseCertificates.push(certificate);
    }
    
    // 3. Crear certificados de módulos
    console.log('\n📚 === CREANDO CERTIFICADOS DE MÓDULOS ===');
    const moduleCertificates = [];
    for (let i = 0; i < Math.min(users.length, modules.length); i++) {
      const certificate = await createModuleCertificate(modules[i].id, users[i].userId);
      moduleCertificates.push(certificate);
    }
    
    console.log('\n🎉 === CERTIFICADOS CREADOS EXITOSAMENTE ===');
    console.log('📋 Resumen:');
    console.log(`   📚 Certificados de cursos: ${courseCertificates.length}`);
    console.log(`   📜 Certificados de módulos: ${moduleCertificates.length}`);
    console.log(`   👥 Usuarios con certificados: ${users.length}`);
    
    // 4. Mostrar ejemplo de certificados creados
    if (courseCertificates.length > 0) {
      console.log('\n📜 Ejemplo de certificado de curso:');
      const example = courseCertificates[0];
      console.log(`   ID: ${example.id}`);
      console.log(`   Curso: ${example.course.title}`);
      console.log(`   Estudiante: ${example.user.firstName} ${example.user.lastName}`);
      console.log(`   Código: ${example.verificationCode}`);
    }
    
    if (moduleCertificates.length > 0) {
      console.log('\n📜 Ejemplo de certificado de módulo:');
      const example = moduleCertificates[0];
      console.log(`   ID: ${example.id}`);
      console.log(`   Módulo: ${example.module.title}`);
      console.log(`   Curso: ${example.module.course.title}`);
      console.log(`   Estudiante: ${example.student.firstName} ${example.student.lastName}`);
      console.log(`   Calificación: ${example.grade}%`);
    }
    
  } catch (error) {
    console.error('\n💥 === ERROR AL CREAR CERTIFICADOS ===');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}
