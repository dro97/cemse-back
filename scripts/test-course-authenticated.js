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

async function testCourseAuthenticated() {
  try {
    console.log('🔍 Probando curso con autenticación...\n');

    const courseId = 'cme8tvypp0000acygt8d4kc80';
    
    // Probar diferentes usuarios
    const users = [
      { username: 'admin', password: 'password123' },
      { username: 'joven_test', password: 'password123' },
      { username: 'adolescente_test', password: 'password123' }
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}️⃣ Probando con usuario: ${user.username}`);
      
      try {
        // 1. Intentar login
        const loginUrl = 'http://localhost:3001/api/auth/login';
        const loginResponse = await makeRequest(loginUrl, 'POST', {
          'Content-Type': 'application/json'
        }, JSON.stringify(user));

        if (loginResponse.statusCode === 200) {
          const loginResult = JSON.parse(loginResponse.data);
          const token = loginResult.token;
          console.log('   ✅ Login exitoso');

          // 2. Probar curso con token
          const courseUrl = `http://localhost:3001/api/course/${courseId}`;
          const courseResponse = await makeRequest(courseUrl, 'GET', {
            'Authorization': `Bearer ${token}`
          });

          console.log(`   Status del curso: ${courseResponse.statusCode}`);

          if (courseResponse.statusCode === 200) {
            const course = JSON.parse(courseResponse.data);
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
                console.log(`         Lecciones: ${module.lessons ? module.lessons.length : 0}`);
              });
            } else {
              console.log('   ❌ No se encontraron módulos');
            }
            
            // Verificar si incluye quizzes
            if (course.quizzes && course.quizzes.length > 0) {
              console.log(`   🧪 Quizzes encontrados: ${course.quizzes.length}`);
              course.quizzes.forEach((quiz, index) => {
                console.log(`      ${index + 1}. ${quiz.title}`);
                console.log(`         Preguntas: ${quiz.questions ? quiz.questions.length : 0}`);
              });
            } else {
              console.log('   ❌ No se encontraron quizzes');
            }
            
            console.log('   🎉 ¡Curso completo con todos los datos!');
            break; // Si encontramos el curso, no necesitamos probar más usuarios
            
          } else {
            console.log(`   ❌ Error obteniendo curso: ${courseResponse.statusCode}`);
            console.log(`   Respuesta: ${courseResponse.data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ❌ Error en login: ${loginResponse.statusCode}`);
          console.log(`   Respuesta: ${loginResponse.data}`);
        }
      } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('📝 Resumen:');
    console.log('   - El curso requiere autenticación');
    console.log('   - URL correcta: http://localhost:3001/api/course/cme8tvypp0000acygt8d4kc80');
    console.log('   - Necesitas incluir el header: Authorization: Bearer YOUR_TOKEN');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testCourseAuthenticated();
