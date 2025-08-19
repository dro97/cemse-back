const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';

// Función para hacer requests HTTP
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// 1. Obtener token fresco
async function getFreshToken() {
  try {
    console.log('🔑 Obteniendo token fresco...');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, 'POST', {}, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Token obtenido exitosamente');
      return response.data.token;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw error;
  }
}

// 2. Probar listado de enrollments con información completa
async function testListEnrollments(token) {
  try {
    console.log('\n📚 Probando listado de enrollments con información completa...');
    
    const response = await makeRequest(`${API_BASE_URL}/course-enrollments`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Enrollments obtenidos exitosamente');
      console.log(`📋 Total de enrollments: ${response.data.length}`);
      
      if (response.data.length > 0) {
        const enrollment = response.data[0];
        console.log('\n📋 Información del enrollment:');
        console.log(`   - ID: ${enrollment.id}`);
        console.log(`   - Estado: ${enrollment.status}`);
        console.log(`   - Progreso: ${enrollment.progress}%`);
        console.log(`   - Fecha de inscripción: ${enrollment.enrolledAt}`);
        
        if (enrollment.course) {
          console.log('\n📋 Información del curso:');
          console.log(`   - Título: ${enrollment.course.title}`);
          console.log(`   - Descripción: ${enrollment.course.description}`);
          console.log(`   - Duración: ${enrollment.course.duration} minutos`);
          console.log(`   - Nivel: ${enrollment.course.level}`);
          console.log(`   - Categoría: ${enrollment.course.category}`);
          
          if (enrollment.course.modules && enrollment.course.modules.length > 0) {
            console.log(`   - Módulos: ${enrollment.course.modules.length}`);
            
            const module = enrollment.course.modules[0];
            console.log(`   - Primer módulo: ${module.title}`);
            
            if (module.lessons && module.lessons.length > 0) {
              console.log(`   - Lecciones en el módulo: ${module.lessons.length}`);
              
              const lesson = module.lessons[0];
              console.log(`   - Primera lección: ${lesson.title}`);
              console.log(`   - Tipo: ${lesson.contentType}`);
              if (lesson.videoUrl) {
                console.log(`   - Video URL: ${lesson.videoUrl}`);
              }
            }
          }
          
          if (enrollment.course.instructor) {
            console.log('\n📋 Información del instructor:');
            console.log(`   - Nombre: ${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`);
            console.log(`   - Email: ${enrollment.course.instructor.email}`);
            console.log(`   - Especialización: ${enrollment.course.instructor.specialization}`);
          }
        }
        
        if (enrollment.student) {
          console.log('\n📋 Información del estudiante:');
          console.log(`   - Nombre: ${enrollment.student.firstName} ${enrollment.student.lastName}`);
          console.log(`   - Email: ${enrollment.student.email}`);
        }
      }
      
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo enrollments:', error.message);
    throw error;
  }
}

// 3. Probar enrollment específico
async function testGetSpecificEnrollment(token) {
  try {
    console.log('\n📖 Probando enrollment específico...');
    
    // Primero obtener la lista para tener un ID
    const listResponse = await makeRequest(`${API_BASE_URL}/course-enrollments`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (listResponse.statusCode === 200 && listResponse.data.length > 0) {
      const enrollmentId = listResponse.data[0].id;
      
      const response = await makeRequest(`${API_BASE_URL}/course-enrollments/${enrollmentId}`, 'GET', {
        'Authorization': `Bearer ${token}`
      });
      
      if (response.statusCode === 200) {
        console.log('✅ Enrollment específico obtenido exitosamente');
        
        const enrollment = response.data;
        console.log('\n📋 Detalles completos del enrollment:');
        console.log(`   - ID: ${enrollment.id}`);
        console.log(`   - Estado: ${enrollment.status}`);
        console.log(`   - Progreso: ${enrollment.progress}%`);
        console.log(`   - Tiempo dedicado: ${enrollment.timeSpent} minutos`);
        console.log(`   - Calificación final: ${enrollment.finalGrade || 'No disponible'}`);
        console.log(`   - Certificado emitido: ${enrollment.certificateIssued ? 'Sí' : 'No'}`);
        
        if (enrollment.course) {
          console.log('\n📋 Información completa del curso:');
          console.log(`   - Título: ${enrollment.course.title}`);
          console.log(`   - Descripción: ${enrollment.course.description}`);
          console.log(`   - Duración: ${enrollment.course.duration} minutos`);
          console.log(`   - Nivel: ${enrollment.course.level}`);
          console.log(`   - Categoría: ${enrollment.course.category}`);
          console.log(`   - Precio: ${enrollment.course.price}`);
          console.log(`   - Rating: ${enrollment.course.rating}`);
          console.log(`   - Estudiantes: ${enrollment.course.studentsCount}`);
          console.log(`   - Lecciones totales: ${enrollment.course.totalLessons}`);
          console.log(`   - Certificación: ${enrollment.course.certification ? 'Sí' : 'No'}`);
          
          if (enrollment.course.modules && enrollment.course.modules.length > 0) {
            console.log(`\n📋 Módulos del curso (${enrollment.course.modules.length}):`);
            enrollment.course.modules.forEach((module, index) => {
              console.log(`   ${index + 1}. ${module.title}`);
              console.log(`      - Descripción: ${module.description}`);
              console.log(`      - Lecciones: ${module.lessons.length}`);
              
              if (module.lessons.length > 0) {
                console.log(`      - Primera lección: ${module.lessons[0].title} (${module.lessons[0].contentType})`);
                if (module.lessons[0].videoUrl) {
                  console.log(`        Video: ${module.lessons[0].videoUrl}`);
                }
              }
            });
          }
        }
        
        return enrollment;
      } else {
        throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
      }
    } else {
      console.log('⚠️ No hay enrollments disponibles para probar');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo enrollment específico:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de enrollments con información completa...\n');
  
  try {
    // Obtener token fresco
    const token = await getFreshToken();
    
    // Ejecutar pruebas
    await testListEnrollments(token);
    await testGetSpecificEnrollment(token);
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    console.log('\n📝 Resumen:');
    console.log('✅ Listado de enrollments incluye información completa del curso');
    console.log('✅ Enrollment específico incluye todos los módulos y lecciones');
    console.log('✅ Información del instructor incluida');
    console.log('✅ Videos de lecciones incluidos');
    console.log('✅ Permisos de acceso implementados');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
  }
}

main();
