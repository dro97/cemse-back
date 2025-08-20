const http = require('http');

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

async function testLessonCompletion() {
  try {
    console.log('📚 Probando completar lecciones y módulos...\n');

    // Usar un token válido (reemplaza con uno real)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ0eXBlIjoidXNlciIsInJvbGUiOiJZT1VUSCIsImlhdCI6MTc1NTcxODA4MywiZXhwIjoxNzU1ODA0NDgzfQ.4kleuB7Vq6zaeKR0AmQ7ROQoKpxm5JSsUTwe86XlqEU';

    // Datos de la lección a completar (basado en los datos que vimos)
    const lessonData = {
      enrollmentId: 'cmek7am6v0001xhe28xft591p', // ID de la inscripción
      lessonId: 'cmek4h1od00019eivp8c2e1za', // ID de la lección
      isCompleted: true, // Marcar como completada
      timeSpent: 300, // Tiempo en segundos (5 minutos)
      videoProgress: 1.0 // Progreso del video (100%)
    };

    console.log('📝 Completando lección...');
    console.log(`   Enrollment ID: ${lessonData.enrollmentId}`);
    console.log(`   Lesson ID: ${lessonData.lessonId}`);
    console.log(`   Completada: ${lessonData.isCompleted}`);
    console.log(`   Tiempo: ${lessonData.timeSpent}s`);
    console.log(`   Progreso video: ${lessonData.videoProgress * 100}%`);

    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/lessonprogress',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, lessonData);

    console.log(`\nStatus: ${response.status}`);
    
    if (response.status === 200 || response.status === 201) {
      const result = response.data;
      console.log('✅ Lección completada exitosamente!');
      console.log(`📊 Detalles:`);
      console.log(`   ID del progreso: ${result.id}`);
      console.log(`   Lección: ${result.lesson.title}`);
      console.log(`   Completada: ${result.isCompleted ? 'SÍ' : 'NO'}`);
      console.log(`   Tiempo total: ${result.timeSpent}s`);
      console.log(`   Progreso video: ${result.videoProgress * 100}%`);
      console.log(`   Última vez vista: ${result.lastWatchedAt}`);
      if (result.completedAt) {
        console.log(`   Fecha completada: ${result.completedAt}`);
      }
    } else {
      console.log('❌ Error:', response.data);
    }

    // Ahora vamos a ver el progreso del curso completo
    console.log('\n📊 Verificando progreso del curso...');
    
    const courseProgressResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/lessonprogress/course/cmek4h1od00019eivp8c2e1za', // Course ID
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (courseProgressResponse.status === 200) {
      const progress = courseProgressResponse.data;
      console.log('✅ Progreso del curso obtenido!');
      console.log(`📈 Progreso general: ${progress.overallProgress.toFixed(1)}%`);
      console.log(`📚 Lecciones completadas: ${progress.completedLessons}/${progress.totalLessons}`);
      
      if (progress.progress && progress.progress.length > 0) {
        console.log('\n📝 Progreso por lección:');
        progress.progress.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.lesson.title}`);
          console.log(`      Módulo: ${item.lesson.module.title}`);
          console.log(`      Completada: ${item.isCompleted ? '✅' : '⏳'}`);
          console.log(`      Tiempo: ${item.timeSpent}s`);
          console.log(`      Progreso video: ${(item.videoProgress * 100).toFixed(1)}%`);
        });
      }
    } else {
      console.log('❌ Error obteniendo progreso:', courseProgressResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testModuleCompletion() {
  try {
    console.log('\n🏗️  Probando completar un módulo completo...\n');

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ0eXBlIjoidXNlciIsInJvbGUiOiJZT1VUSCIsImlhdCI6MTc1NTcxODA4MywiZXhwIjoxNzU1ODA0NDgzfQ.4kleuB7Vq6zaeKR0AmQ7ROQoKpxm5JSsUTwe86XlqEU';

    // Primero necesitamos obtener las lecciones del módulo
    console.log('🔍 Obteniendo lecciones del módulo...');
    
    const moduleResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/course-enrollments/cmek7am6v0001xhe28xft591p',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (moduleResponse.status === 200) {
      const enrollment = moduleResponse.data;
      const firstModule = enrollment.course.modules[0];
      
      if (firstModule && firstModule.lessons.length > 0) {
        console.log(`📦 Completando módulo: ${firstModule.title}`);
        console.log(`   Lecciones en el módulo: ${firstModule.lessons.length}`);

        // Completar todas las lecciones del módulo
        for (const lesson of firstModule.lessons) {
          console.log(`\n📝 Completando lección: ${lesson.title}`);
          
          const lessonData = {
            enrollmentId: 'cmek7am6v0001xhe28xft591p',
            lessonId: lesson.id,
            isCompleted: true,
            timeSpent: Math.floor(Math.random() * 300) + 120, // 2-7 minutos
            videoProgress: 1.0
          };

          const lessonResponse = await makeRequest({
            hostname: '127.0.0.1',
            port: 3001,
            path: '/api/lessonprogress',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }, lessonData);

          if (lessonResponse.status === 200 || lessonResponse.status === 201) {
            console.log(`   ✅ ${lesson.title} completada`);
          } else {
            console.log(`   ❌ Error completando ${lesson.title}:`, lessonResponse.data);
          }
        }

        console.log('\n🎉 ¡Módulo completado!');
      } else {
        console.log('❌ No se encontraron lecciones en el módulo');
      }
    } else {
      console.log('❌ Error obteniendo datos del curso:', moduleResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar ambas pruebas
async function runTests() {
  await testLessonCompletion();
  await testModuleCompletion();
}

runTests();
