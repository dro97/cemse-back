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

async function testCourseWithModules() {
  try {
    console.log('🔍 Probando curso con módulos y quizzes...\n');

    const courseId = 'cme8tvypp0000acygt8d4kc80';
    
    // URLs a probar
    const urls = [
      `http://localhost:3000/api/course/${courseId}`, // URL incorrecta (puerto 3000)
      `http://localhost:3001/api/course/${courseId}`  // URL correcta (puerto 3001)
    ];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`${i + 1}️⃣ Probando: ${url}`);
      
      try {
        const response = await makeRequest(url);
        console.log(`   Status: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
          const course = JSON.parse(response.data);
          console.log('   ✅ Curso encontrado!');
          console.log(`   📋 Información básica:`);
          console.log(`      ID: ${course.id}`);
          console.log(`      Título: ${course.title}`);
          console.log(`      Duración: ${course.duration} horas`);
          console.log(`      Lecciones: ${course.totalLessons}`);
          console.log(`      Quizzes: ${course.totalQuizzes}`);
          
          // Verificar si incluye módulos
          if (course.modules && course.modules.length > 0) {
            console.log(`   📚 Módulos encontrados: ${course.modules.length}`);
            course.modules.forEach((module, index) => {
              console.log(`      ${index + 1}. ${module.title}`);
              console.log(`         Descripción: ${module.description}`);
              console.log(`         Duración: ${module.estimatedDuration} horas`);
              console.log(`         Lecciones: ${module.lessons ? module.lessons.length : 0}`);
              if (module.lessons && module.lessons.length > 0) {
                console.log(`         Primera lección: ${module.lessons[0].title}`);
              }
            });
          } else {
            console.log('   ❌ No se encontraron módulos');
          }
          
          // Verificar si incluye quizzes
          if (course.quizzes && course.quizzes.length > 0) {
            console.log(`   🧪 Quizzes encontrados: ${course.quizzes.length}`);
            course.quizzes.forEach((quiz, index) => {
              console.log(`      ${index + 1}. ${quiz.title}`);
              console.log(`         Descripción: ${quiz.description}`);
              console.log(`         Tiempo límite: ${Math.floor(quiz.timeLimit / 60)} minutos`);
              console.log(`         Preguntas: ${quiz.questions ? quiz.questions.length : 0}`);
              if (quiz.questions && quiz.questions.length > 0) {
                console.log(`         Primera pregunta: ${quiz.questions[0].question.substring(0, 50)}...`);
              }
            });
          } else {
            console.log('   ❌ No se encontraron quizzes');
          }
          
          // Verificar instructor
          if (course.instructor) {
            console.log(`   👨‍🏫 Instructor: ${course.instructor.firstName} ${course.instructor.lastName}`);
            console.log(`      Email: ${course.instructor.email}`);
            console.log(`      Especialización: ${course.instructor.specialization}`);
          } else {
            console.log('   ℹ️ Sin instructor asignado');
          }
          
        } else if (response.statusCode === 401) {
          console.log('   🔒 Requiere autenticación');
        } else {
          console.log(`   ❌ Error: ${response.statusCode}`);
          console.log(`   Respuesta: ${response.data.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('🎯 Resumen:');
    console.log('   - Puerto 3000: Probablemente no funcione o requiera autenticación');
    console.log('   - Puerto 3001: Debería funcionar correctamente con todos los datos');
    console.log('\n📝 Para usar en el frontend:');
    console.log('   URL correcta: http://localhost:3001/api/course/cme8tvypp0000acygt8d4kc80');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testCourseWithModules();
