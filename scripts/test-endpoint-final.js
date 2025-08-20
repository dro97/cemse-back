const http = require('http');

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
    console.log('🔍 Prueba final del endpoint...\n');

    // Usar un token válido (reemplaza con uno real)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ0eXBlIjoidXNlciIsInJvbGUiOiJZT1VUSCIsImlhdCI6MTc1NTcxODA4MywiZXhwIjoxNzU1ODA0NDgzfQ.4kleuB7Vq6zaeKR0AmQ7ROQoKpxm5JSsUTwe86XlqEU';

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
        console.log(`\n📚 Curso: ${enrollment.course.title}`);
        console.log(`📦 Módulos: ${enrollment.course.modules.length}`);

        if (enrollment.course.modules.length > 0) {
          const firstModule = enrollment.course.modules[0];
          console.log(`📖 Lecciones en primer módulo: ${firstModule.lessons.length}`);

          if (firstModule.lessons.length > 0) {
            const firstLesson = firstModule.lessons[0];
            console.log(`\n🔍 PRIMERA LECCIÓN:`);
            console.log(`   Título: ${firstLesson.title}`);
            console.log(`   ID: ${firstLesson.id}`);
            console.log(`   Tiene resources: ${firstLesson.hasOwnProperty('resources') ? 'SÍ' : 'NO'}`);
            console.log(`   Tiene quizzes: ${firstLesson.hasOwnProperty('quizzes') ? 'SÍ' : 'NO'}`);
            
            if (firstLesson.resources) {
              console.log(`   📎 Recursos: ${firstLesson.resources.length}`);
              firstLesson.resources.forEach((resource, index) => {
                console.log(`      ${index + 1}. ${resource.title} (${resource.type})`);
              });
            }
            
            if (firstLesson.quizzes) {
              console.log(`   📝 Quizzes: ${firstLesson.quizzes.length}`);
              firstLesson.quizzes.forEach((quiz, index) => {
                console.log(`      ${index + 1}. ${quiz.title} (${quiz.questions ? quiz.questions.length : 0} preguntas)`);
              });
            }
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
