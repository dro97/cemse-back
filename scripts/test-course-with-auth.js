const http = require('http');

// Función para hacer una petición HTTP
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function testCourseWithAuth() {
  try {
    console.log('🔐 Obteniendo token de autenticación...\n');

    // 1. Obtener token de autenticación
    const loginUrl = 'http://localhost:3001/api/auth/login';
    const loginData = {
      username: 'admin',
      password: 'password123'
    };

    const loginResponse = await makeRequest(loginUrl, 'POST', {
      'Content-Type': 'application/json'
    }, JSON.stringify(loginData));

    if (loginResponse.statusCode !== 200) {
      console.log('❌ Error en login:', loginResponse.statusCode);
      console.log('Respuesta:', loginResponse.data);
      return;
    }

    const loginResult = JSON.parse(loginResponse.data);
    const token = loginResult.token;

    console.log('✅ Token obtenido exitosamente\n');

    // 2. Probar el endpoint del curso con el token
    const courseId = 'cme8sp5iu0000kn51lnawd6km';
    const courseUrl = `http://localhost:3001/api/course/${courseId}`;

    console.log(`🔍 Probando curso: ${courseUrl}`);

    const courseResponse = await makeRequest(courseUrl, 'GET', {
      'Authorization': `Bearer ${token}`
    });

    console.log(`📊 Status: ${courseResponse.statusCode}`);

    if (courseResponse.statusCode === 200) {
      const course = JSON.parse(courseResponse.data);
      console.log('\n✅ Curso encontrado:');
      console.log(`   ID: ${course.id}`);
      console.log(`   Título: ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Descripción: ${course.description.substring(0, 100)}...`);
      console.log(`   Duración: ${course.duration} horas`);
      console.log(`   Nivel: ${course.level}`);
      console.log(`   Categoría: ${course.category}`);
      console.log(`   Lecciones: ${course.totalLessons}`);
      console.log(`   Quizzes: ${course.totalQuizzes}`);
      console.log(`   Activo: ${course.isActive ? 'Sí' : 'No'}`);
      console.log(`   Certificación: ${course.certification ? 'Sí' : 'No'}`);
      
      if (course.objectives && course.objectives.length > 0) {
        console.log('\n🎯 Objetivos:');
        course.objectives.forEach((objective, index) => {
          console.log(`   ${index + 1}. ${objective}`);
        });
      }

      if (course.prerequisites && course.prerequisites.length > 0) {
        console.log('\n📋 Prerrequisitos:');
        course.prerequisites.forEach((prereq, index) => {
          console.log(`   ${index + 1}. ${prereq}`);
        });
      }

      if (course.tags && course.tags.length > 0) {
        console.log('\n🏷️ Tags:', course.tags.join(', '));
      }

    } else {
      console.log('❌ Error obteniendo curso:', courseResponse.statusCode);
      console.log('Respuesta:', courseResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCourseWithAuth();
