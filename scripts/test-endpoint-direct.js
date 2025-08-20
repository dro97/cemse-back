const http = require('http');

// Función para hacer peticiones HTTP
function makeRequest(options) {
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

    req.end();
  });
}

async function testEndpoint() {
  try {
    console.log('🔍 Probando endpoint directamente...\n');

    // Usar el token generado
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ0eXBlIjoidXNlciIsInJvbGUiOiJZT1VUSCIsImlhdCI6MTc1NTcxODA4MywiZXhwIjoxNzU1ODA0NDgzfQ.4kleuB7Vq6zaeKR0AmQ7ROQoKpxm5JSsUTwe86XlqEU';

    console.log('Probando endpoint de course-enrollments...');
    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/course-enrollments',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      const enrollments = response.data;
      console.log(`✅ Se obtuvieron ${enrollments.length} inscripciones`);

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

            // Mostrar estructura completa de la primera lección
            console.log('\n   Estructura completa de la primera lección:');
            console.log(JSON.stringify(firstLesson, null, 2));
          }
        }
      }
    } else {
      console.log('❌ Error:', response.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoint();
