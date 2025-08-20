const http = require('http');

// Función para hacer peticiones HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoint() {
  try {
    console.log('🔍 Probando endpoint con autenticación...\n');

    // 1. Obtener token de login
    console.log('1. Obteniendo token...');
    const loginResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      username: 'juan.perez@example.com',
      password: 'password123'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido correctamente');

    // 2. Probar endpoint de course-enrollments
    console.log('\n2. Probando endpoint de course-enrollments...');
    const enrollmentsResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/course-enrollments',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (enrollmentsResponse.status !== 200) {
      console.log('❌ Error en course-enrollments:', enrollmentsResponse.data);
      return;
    }

    const enrollments = enrollmentsResponse.data;
    console.log(`✅ Se obtuvieron ${enrollments.length} inscripciones`);

    // 3. Analizar la respuesta
    if (enrollments.length > 0) {
      const enrollment = enrollments[0];
      console.log('\n📚 Análisis de la primera inscripción:');
      console.log(`   Curso: ${enrollment.course.title}`);
      console.log(`   Quizzes del curso: ${enrollment.course.quizzes ? enrollment.course.quizzes.length : 'NO DEFINIDO'}`);
      console.log(`   Módulos: ${enrollment.course.modules.length}`);

      if (enrollment.course.modules.length > 0) {
        const firstModule = enrollment.course.modules[0];
        console.log(`   Lecciones en primer módulo: ${firstModule.lessons.length}`);

        if (firstModule.lessons.length > 0) {
          const firstLesson = firstModule.lessons[0];
          console.log(`   Primera lección: ${firstLesson.title}`);
          console.log(`   Recursos en primera lección: ${firstLesson.resources ? firstLesson.resources.length : 'NO DEFINIDO'}`);
          console.log(`   Quizzes en primera lección: ${firstLesson.quizzes ? firstLesson.quizzes.length : 'NO DEFINIDO'}`);

          // Mostrar detalles si hay quizzes
          if (firstLesson.quizzes && firstLesson.quizzes.length > 0) {
            console.log('\n   📝 Quizzes encontrados:');
            firstLesson.quizzes.forEach((quiz, index) => {
              console.log(`      Quiz ${index + 1}: ${quiz.title} (${quiz.questions ? quiz.questions.length : 0} preguntas)`);
            });
          }

          // Mostrar detalles si hay recursos
          if (firstLesson.resources && firstLesson.resources.length > 0) {
            console.log('\n   📎 Recursos encontrados:');
            firstLesson.resources.forEach((resource, index) => {
              console.log(`      Recurso ${index + 1}: ${resource.title} (${resource.type})`);
            });
          }
        }
      }
    }

    console.log('\n✅ Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoint();
