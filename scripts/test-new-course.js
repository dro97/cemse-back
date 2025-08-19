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

async function testNewCourse() {
  try {
    console.log('🔍 Probando acceso al nuevo curso completo...\n');

    const courseId = 'cme8tvypp0000acygt8d4kc80';
    const courseUrl = `http://localhost:3001/api/course/${courseId}`;

    console.log(`📚 Curso: Desarrollo Web Full Stack`);
    console.log(`🔗 URL: ${courseUrl}`);
    console.log(`🆔 ID: ${courseId}\n`);

    // 1. Probar sin autenticación (debería fallar)
    console.log('1️⃣ Probando sin autenticación:');
    try {
      const noAuthResponse = await makeRequest(courseUrl);
      console.log(`   Status: ${noAuthResponse.statusCode}`);
      console.log(`   Respuesta: ${noAuthResponse.data.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    console.log('');

    // 2. Obtener token de autenticación
    console.log('2️⃣ Obteniendo token de autenticación...');
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

        // 3. Probar con autenticación
        console.log('\n3️⃣ Probando con autenticación:');
        const authResponse = await makeRequest(courseUrl, 'GET', {
          'Authorization': `Bearer ${token}`
        });

        console.log(`   Status: ${authResponse.statusCode}`);

        if (authResponse.statusCode === 200) {
          const course = JSON.parse(authResponse.data);
          console.log('\n   ✅ Curso encontrado exitosamente!');
          console.log(`   📋 Información del curso:`);
          console.log(`      ID: ${course.id}`);
          console.log(`      Título: ${course.title}`);
          console.log(`      Slug: ${course.slug}`);
          console.log(`      Descripción: ${course.description.substring(0, 100)}...`);
          console.log(`      Duración: ${course.duration} horas`);
          console.log(`      Nivel: ${course.level}`);
          console.log(`      Categoría: ${course.category}`);
          console.log(`      Precio: $${course.price}`);
          console.log(`      Rating: ${course.rating}`);
          console.log(`      Estudiantes: ${course.studentsCount}`);
          console.log(`      Tasa de completación: ${course.completionRate}%`);
          console.log(`      Lecciones: ${course.totalLessons}`);
          console.log(`      Quizzes: ${course.totalQuizzes}`);
          console.log(`      Recursos: ${course.totalResources}`);
          console.log(`      Activo: ${course.isActive ? 'Sí' : 'No'}`);
          console.log(`      Certificación: ${course.certification ? 'Sí' : 'No'}`);
          console.log(`      Publicado: ${course.publishedAt ? 'Sí' : 'No'}`);
          
          if (course.objectives && course.objectives.length > 0) {
            console.log(`\n   🎯 Objetivos (${course.objectives.length}):`);
            course.objectives.forEach((objective, index) => {
              console.log(`      ${index + 1}. ${objective}`);
            });
          }

          if (course.prerequisites && course.prerequisites.length > 0) {
            console.log(`\n   📋 Prerrequisitos (${course.prerequisites.length}):`);
            course.prerequisites.forEach((prereq, index) => {
              console.log(`      ${index + 1}. ${prereq}`);
            });
          }

          if (course.tags && course.tags.length > 0) {
            console.log(`\n   🏷️ Tags: ${course.tags.join(', ')}`);
          }

          if (course.includedMaterials && course.includedMaterials.length > 0) {
            console.log(`\n   📦 Materiales incluidos (${course.includedMaterials.length}):`);
            course.includedMaterials.forEach((material, index) => {
              console.log(`      ${index + 1}. ${material}`);
            });
          }

          if (course.modules && course.modules.length > 0) {
            console.log(`\n   📚 Módulos (${course.modules.length}):`);
            course.modules.forEach((module, index) => {
              console.log(`      ${index + 1}. ${module.title}`);
              console.log(`         Descripción: ${module.description}`);
              console.log(`         Duración estimada: ${module.estimatedDuration} horas`);
              console.log(`         Lecciones: ${module.lessons ? module.lessons.length : 0}`);
              console.log(`         Bloqueado: ${module.isLocked ? 'Sí' : 'No'}`);
            });
          }

          if (course.quizzes && course.quizzes.length > 0) {
            console.log(`\n   🧪 Quizzes (${course.quizzes.length}):`);
            course.quizzes.forEach((quiz, index) => {
              console.log(`      ${index + 1}. ${quiz.title}`);
              console.log(`         Descripción: ${quiz.description}`);
              console.log(`         Tiempo límite: ${Math.floor(quiz.timeLimit / 60)} minutos`);
              console.log(`         Puntuación mínima: ${quiz.passingScore}%`);
              console.log(`         Preguntas: ${quiz.questions ? quiz.questions.length : 0}`);
            });
          }

          console.log(`\n   🎉 ¡Curso completo cargado exitosamente!`);
          console.log(`   📊 Total de contenido:`);
          console.log(`      - Módulos: ${course.modules ? course.modules.length : 0}`);
          console.log(`      - Lecciones: ${course.totalLessons}`);
          console.log(`      - Quizzes: ${course.totalQuizzes}`);
          console.log(`      - Recursos: ${course.totalResources}`);

        } else {
          console.log(`   ❌ Error obteniendo curso: ${authResponse.statusCode}`);
          console.log(`   Respuesta: ${authResponse.data}`);
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

testNewCourse();
