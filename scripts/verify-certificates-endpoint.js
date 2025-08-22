const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZThjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJlbWFpbCI6Imp1YW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiWU9VVEgiLCJ0eXBlIjoidXNlciIsImlhdCI6MTc1NTU0MzQzNSwiZXhwIjoxNzU1NjI5ODM1fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Función para verificar certificados desde la base de datos
async function checkCertificatesInDatabase() {
  try {
    console.log('🔍 Verificando certificados en la base de datos...');
    
    const certificates = await prisma.moduleCertificate.findMany({
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
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    console.log(`📊 Total de certificados en BD: ${certificates.length}`);
    
    if (certificates.length > 0) {
      console.log('\n📜 Certificados encontrados en BD:');
      certificates.forEach((cert, index) => {
        console.log(`\n${index + 1}. 📚 Módulo: ${cert.module.title}`);
        console.log(`   🎓 Curso: ${cert.module.course.title}`);
        console.log(`   👤 Estudiante: ${cert.student.firstName} ${cert.student.lastName}`);
        console.log(`   📊 Calificación: ${cert.grade}%`);
        console.log(`   📅 Completado: ${new Date(cert.completedAt).toLocaleDateString()}`);
        console.log(`   🔗 URL: ${cert.certificateUrl}`);
      });
    } else {
      console.log('📭 No hay certificados en la base de datos');
    }

    return certificates;
  } catch (error) {
    console.error('❌ Error verificando certificados en BD:', error);
    return [];
  }
}

// Función para verificar certificados desde el endpoint
async function checkCertificatesFromEndpoint() {
  try {
    console.log('\n🌐 Verificando certificados desde el endpoint...');
    
    const response = await axios.get(`${API_BASE_URL}/modulecertificate`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (response.status === 200) {
      const certificates = response.data;
      console.log(`📊 Total de certificados desde endpoint: ${certificates.length}`);
      
      if (certificates.length > 0) {
        console.log('\n📜 Certificados desde endpoint:');
        certificates.forEach((cert, index) => {
          console.log(`\n${index + 1}. 📚 Módulo: ${cert.module?.title || 'N/A'}`);
          console.log(`   🎓 Curso: ${cert.module?.course?.title || 'N/A'}`);
          console.log(`   👤 Estudiante: ${cert.student?.firstName || 'N/A'} ${cert.student?.lastName || 'N/A'}`);
          console.log(`   📊 Calificación: ${cert.grade || 'N/A'}%`);
          console.log(`   📅 Completado: ${cert.completedAt ? new Date(cert.completedAt).toLocaleDateString() : 'N/A'}`);
          console.log(`   🔗 URL: ${cert.certificateUrl || 'N/A'}`);
        });
      } else {
        console.log('📭 No hay certificados desde el endpoint');
      }

      return certificates;
    } else {
      console.log(`❌ Error en endpoint: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error verificando endpoint:', error.response?.data || error.message);
    return [];
  }
}

// Función para verificar certificados de cursos desde el endpoint
async function checkCourseCertificatesFromEndpoint() {
  try {
    console.log('\n🌐 Verificando certificados de cursos desde el endpoint...');
    
    const response = await axios.get(`${API_BASE_URL}/certificate`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (response.status === 200) {
      const certificates = response.data;
      console.log(`📊 Total de certificados de cursos desde endpoint: ${certificates.length}`);
      
      if (certificates.length > 0) {
        console.log('\n📜 Certificados de cursos desde endpoint:');
        certificates.forEach((cert, index) => {
          console.log(`\n${index + 1}. 📚 Curso: ${cert.course?.title || 'N/A'}`);
          console.log(`   👤 Estudiante: ${cert.user?.firstName || 'N/A'} ${cert.user?.lastName || 'N/A'}`);
          console.log(`   📅 Emitido: ${cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'N/A'}`);
          console.log(`   🔐 Código: ${cert.verificationCode || 'N/A'}`);
          console.log(`   🔗 URL: ${cert.url || 'N/A'}`);
        });
      } else {
        console.log('📭 No hay certificados de cursos desde el endpoint');
      }

      return certificates;
    } else {
      console.log(`❌ Error en endpoint de cursos: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error verificando endpoint de cursos:', error.response?.data || error.message);
    return [];
  }
}

// Función para comparar certificados
async function compareCertificates(dbCertificates, endpointCertificates) {
  console.log('\n🔍 Comparando certificados...');
  
  if (dbCertificates.length !== endpointCertificates.length) {
    console.log(`⚠️  Diferencia en cantidad:`);
    console.log(`   📊 BD: ${dbCertificates.length} certificados`);
    console.log(`   🌐 Endpoint: ${endpointCertificates.length} certificados`);
  } else {
    console.log(`✅ Cantidad de certificados coincide: ${dbCertificates.length}`);
  }

  // Verificar si los certificados del endpoint corresponden a los de BD
  const dbIds = dbCertificates.map(cert => cert.id).sort();
  const endpointIds = endpointCertificates.map(cert => cert.id).sort();
  
  const missingInEndpoint = dbIds.filter(id => !endpointIds.includes(id));
  const extraInEndpoint = endpointIds.filter(id => !dbIds.includes(id));

  if (missingInEndpoint.length > 0) {
    console.log(`❌ Certificados en BD pero no en endpoint: ${missingInEndpoint.length}`);
  }

  if (extraInEndpoint.length > 0) {
    console.log(`❌ Certificados en endpoint pero no en BD: ${extraInEndpoint.length}`);
  }

  if (missingInEndpoint.length === 0 && extraInEndpoint.length === 0) {
    console.log('✅ Todos los certificados coinciden entre BD y endpoint');
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 === VERIFICACIÓN DE CERTIFICADOS EN ENDPOINTS ===\n');
    
    // 1. Verificar certificados en base de datos
    const dbCertificates = await checkCertificatesInDatabase();
    
    // 2. Verificar certificados desde endpoint de módulos
    const endpointCertificates = await checkCertificatesFromEndpoint();
    
    // 3. Verificar certificados de cursos desde endpoint
    const courseCertificates = await checkCourseCertificatesFromEndpoint();
    
    // 4. Comparar certificados de módulos
    await compareCertificates(dbCertificates, endpointCertificates);
    
    console.log('\n🎉 === VERIFICACIÓN COMPLETADA ===');
    console.log(`📋 Resumen:`);
    console.log(`   📊 Certificados en BD: ${dbCertificates.length}`);
    console.log(`   🌐 Certificados en endpoint módulos: ${endpointCertificates.length}`);
    console.log(`   🎓 Certificados en endpoint cursos: ${courseCertificates.length}`);
    
    if (endpointCertificates.length > 0) {
      console.log('\n✅ ¡Los certificados se reflejan correctamente en el endpoint!');
      console.log('🌐 URL verificada: http://localhost:3001/api/modulecertificate');
    } else {
      console.log('\n❌ No se encontraron certificados en el endpoint');
      console.log('💡 Asegúrate de que:');
      console.log('   1. El usuario tenga certificados generados');
      console.log('   2. El token de autenticación sea válido');
      console.log('   3. El servidor esté funcionando');
    }
    
  } catch (error) {
    console.error('\n💥 === ERROR EN LA VERIFICACIÓN ===');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}
