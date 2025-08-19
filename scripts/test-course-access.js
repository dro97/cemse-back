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

async function testCourseAccess() {
  try {
    console.log('🔍 Probando acceso a cursos...\n');

    // 1. Probar sin autenticación (debería fallar)
    console.log('1️⃣ Probando sin autenticación:');
    const courseId = 'cme8snhk80000aycwbame0glx';
    
    // URL incorrecta (plural)
    const wrongUrl = `http://localhost:3001/api/courses/${courseId}`;
    console.log(`   URL incorrecta: ${wrongUrl}`);
    
    try {
      const wrongResponse = await makeRequest(wrongUrl);
      console.log(`   Status: ${wrongResponse.statusCode}`);
      console.log(`   Respuesta: ${wrongResponse.data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    console.log('');

    // URL correcta (singular) sin autenticación
    const correctUrl = `http://localhost:3001/api/course/${courseId}`;
    console.log(`2️⃣ Probando URL correcta sin autenticación:`);
    console.log(`   URL correcta: ${correctUrl}`);
    
    try {
      const noAuthResponse = await makeRequest(correctUrl);
      console.log(`   Status: ${noAuthResponse.statusCode}`);
      console.log(`   Respuesta: ${noAuthResponse.data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    console.log('');

    // 3. Obtener token de autenticación
    console.log('3️⃣ Obteniendo token de autenticación...');
    const loginUrl = 'http://localhost:3001/api/auth/login';
    const loginData = {
      username: 'admin',
      password: 'password123'
    };

    try {
      const loginResponse = await makeRequest(loginUrl, 'POST', {
        'Content-Type': 'application/json'
      }, JSON.stringify(loginData));

      if (loginResponse.statusCode === 200) {
        const loginResult = JSON.parse(loginResponse.data);
        const token = loginResult.token;
        console.log('   ✅ Token obtenido exitosamente');

        // 4. Probar con autenticación
        console.log('\n4️⃣ Probando con autenticación:');
        const authResponse = await makeRequest(correctUrl, 'GET', {
          'Authorization': `Bearer ${token}`
        });

        console.log(`   Status: ${authResponse.statusCode}`);

        if (authResponse.statusCode === 200) {
          const course = JSON.parse(authResponse.data);
          console.log('   ✅ Curso encontrado:');
          console.log(`      ID: ${course.id}`);
          console.log(`      Título: ${course.title}`);
          console.log(`      Slug: ${course.slug}`);
          console.log(`      Activo: ${course.isActive ? 'Sí' : 'No'}`);
          console.log(`      Duración: ${course.duration} horas`);
          console.log(`      Nivel: ${course.level}`);
          console.log(`      Categoría: ${course.category}`);
          
          if (course.modules && course.modules.length > 0) {
            console.log(`      Módulos: ${course.modules.length}`);
          }
          
          if (course.totalLessons) {
            console.log(`      Lecciones: ${course.totalLessons}`);
          }
          
          if (course.totalQuizzes) {
            console.log(`      Quizzes: ${course.totalQuizzes}`);
          }
        } else {
          console.log(`   ❌ Error: ${authResponse.data}`);
        }
      } else {
        console.log(`   ❌ Error en login: ${loginResponse.statusCode}`);
        console.log(`   Respuesta: ${loginResponse.data}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testCourseAccess();
