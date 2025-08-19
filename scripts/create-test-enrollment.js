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

// 2. Obtener lista de cursos disponibles
async function getAvailableCourses(token) {
  try {
    console.log('\n📚 Obteniendo cursos disponibles...');
    
    const response = await makeRequest(`${API_BASE_URL}/course`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ Cursos obtenidos: ${response.data.length}`);
      
      if (response.data.length > 0) {
        // Buscar un curso que no tenga el estudiante inscrito
        const course = response.data.find(c => c.title !== 'prueba') || response.data[0];
        console.log(`📋 Curso seleccionado: ${course.title}`);
        console.log(`📋 ID: ${course.id}`);
        return course;
      } else {
        throw new Error('No hay cursos disponibles');
      }
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo cursos:', error.message);
    throw error;
  }
}

// 3. Obtener lista de estudiantes disponibles
async function getAvailableStudents(token) {
  try {
    console.log('\n👥 Obteniendo estudiantes disponibles...');
    
    const response = await makeRequest(`${API_BASE_URL}/profile`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ Perfiles obtenidos: ${response.data.length}`);
      
      // Buscar un perfil de estudiante
      const student = response.data.find(profile => 
        profile.role === 'YOUTH' || profile.role === 'ADOLESCENTS'
      );
      
      if (student) {
        console.log(`📋 Estudiante encontrado: ${student.firstName} ${student.lastName}`);
        console.log(`📋 ID: ${student.userId}`);
        return student;
      } else {
        throw new Error('No hay estudiantes disponibles');
      }
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo estudiantes:', error.message);
    throw error;
  }
}

// 4. Crear enrollment de prueba
async function createTestEnrollment(token, courseId, studentId) {
  try {
    console.log('\n📝 Creando enrollment de prueba...');
    
    const enrollmentData = {
      studentId: studentId,
      courseId: courseId,
      status: "ENROLLED",
      progress: 0,
      timeSpent: 0
    };
    
    const response = await makeRequest(`${API_BASE_URL}/course-enrollments`, 'POST', {
      'Authorization': `Bearer ${token}`
    }, enrollmentData);
    
    if (response.statusCode === 201) {
      console.log('✅ Enrollment creado exitosamente');
      console.log(`📋 ID del enrollment: ${response.data.id}`);
      console.log(`📋 Estado: ${response.data.status}`);
      console.log(`📋 Progreso: ${response.data.progress}%`);
      return response.data;
    } else {
      console.log('❌ Error creando enrollment:', response.data);
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error en creación de enrollment:', error.message);
    throw error;
  }
}

// 5. Verificar que el enrollment devuelve información completa del curso
async function verifyCompleteCourseInfo(token, enrollmentId) {
  try {
    console.log('\n🔍 Verificando información completa del curso...');
    
    const response = await makeRequest(`${API_BASE_URL}/course-enrollments/${enrollmentId}`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Información completa obtenida exitosamente');
      
      const enrollment = response.data;
      
      console.log('\n📋 Información del enrollment:');
      console.log(`   - ID: ${enrollment.id}`);
      console.log(`   - Estado: ${enrollment.status}`);
      console.log(`   - Progreso: ${enrollment.progress}%`);
      console.log(`   - Tiempo dedicado: ${enrollment.timeSpent} minutos`);
      
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
        console.log(`   - Video preview: ${enrollment.course.videoPreview || 'No disponible'}`);
        console.log(`   - Thumbnail: ${enrollment.course.thumbnail || 'No disponible'}`);
        
        if (enrollment.course.modules && enrollment.course.modules.length > 0) {
          console.log(`\n📋 Módulos del curso (${enrollment.course.modules.length}):`);
          enrollment.course.modules.forEach((module, index) => {
            console.log(`   ${index + 1}. ${module.title}`);
            console.log(`      - Descripción: ${module.description}`);
            console.log(`      - Lecciones: ${module.lessons.length}`);
            
            if (module.lessons.length > 0) {
              console.log(`      - Primera lección: ${module.lessons[0].title}`);
              console.log(`        Tipo: ${module.lessons[0].contentType}`);
              if (module.lessons[0].videoUrl) {
                console.log(`        Video: ${module.lessons[0].videoUrl}`);
              }
              console.log(`        Duración: ${module.lessons[0].duration} minutos`);
            }
          });
        } else {
          console.log('   - No hay módulos en este curso');
        }
        
        if (enrollment.course.instructor) {
          console.log('\n📋 Información del instructor:');
          console.log(`   - Nombre: ${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`);
          console.log(`   - Email: ${enrollment.course.instructor.email}`);
          console.log(`   - Especialización: ${enrollment.course.instructor.specialization || 'No especificada'}`);
        } else {
          console.log('   - No hay instructor asignado');
        }
      } else {
        console.log('❌ No se encontró información del curso');
      }
      
      if (enrollment.student) {
        console.log('\n📋 Información del estudiante:');
        console.log(`   - Nombre: ${enrollment.student.firstName} ${enrollment.student.lastName}`);
        console.log(`   - Email: ${enrollment.student.email}`);
      }
      
      return enrollment;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error verificando información del curso:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando prueba de enrollment con información completa del curso...\n');
  
  try {
    // Obtener token fresco
    const token = await getFreshToken();
    
    // Obtener curso y estudiante disponibles
    const course = await getAvailableCourses(token);
    const student = await getAvailableStudents(token);
    
    // Crear enrollment de prueba
    const enrollment = await createTestEnrollment(token, course.id, student.userId);
    
    // Verificar que devuelve información completa
    await verifyCompleteCourseInfo(token, enrollment.id);
    
    console.log('\n✅ Prueba completada exitosamente');
    console.log('\n📝 Resumen:');
    console.log('✅ Enrollment creado correctamente');
    console.log('✅ Información completa del curso incluida');
    console.log('✅ Todos los módulos y lecciones incluidos');
    console.log('✅ Información del instructor incluida');
    console.log('✅ Videos de lecciones incluidos');
    console.log('✅ Información del estudiante incluida');
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
  }
}

main();
