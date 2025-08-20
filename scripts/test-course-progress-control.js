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

async function testCourseProgressControl() {
  try {
    console.log('🎯 Probando sistema de control de progreso de módulos y lecciones...\n');

    // Usar un token válido (reemplaza con uno real)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ0eXBlIjoidXNlciIsInJvbGUiOiJZT1VUSCIsImlhdCI6MTc1NTcxODA4MywiZXhwIjoxNzU1ODA0NDgzfQ.4kleuB7Vq6zaeKR0AmQ7ROQoKpxm5JSsUTwe86XlqEU';

    const enrollmentId = 'cmek7am6v0001xhe28xft591p';

    // 1. Primero obtener el progreso actual
    console.log('📊 1. Obteniendo progreso actual...');
    
    const progressResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: `/api/course-progress/enrollment/${enrollmentId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (progressResponse.status === 200) {
      const progress = progressResponse.data;
      console.log('✅ Progreso obtenido:');
      console.log(`   Curso: ${progress.course.title}`);
      console.log(`   Progreso general: ${progress.course.progress.toFixed(1)}%`);
      console.log(`   Lecciones completadas: ${progress.course.completedLessons}/${progress.course.totalLessons}`);
      console.log(`   Estado: ${progress.enrollment.status}`);
      
      if (progress.nextLesson) {
        console.log(`   Siguiente lección: ${progress.nextLesson.title} (Módulo: ${progress.nextLesson.moduleTitle})`);
      }

      console.log('\n📦 Progreso por módulos:');
      progress.modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title}: ${module.progress.toFixed(1)}% (${module.completedLessons}/${module.totalLessons})`);
        if (module.isCompleted) {
          console.log(`      ✅ Módulo completado`);
        }
      });
    } else {
      console.log('❌ Error obteniendo progreso:', progressResponse.data);
      return;
    }

    // 2. Completar una lección específica
    console.log('\n📝 2. Completando una lección...');
    
    // Obtener la primera lección no completada
    const firstIncompleteLesson = progressResponse.data.modules
      .flatMap(module => module.lessons)
      .find(lesson => !lesson.isCompleted);

    if (firstIncompleteLesson) {
      const lessonData = {
        enrollmentId,
        lessonId: firstIncompleteLesson.id,
        timeSpent: 300, // 5 minutos
        videoProgress: 1.0 // 100%
      };

      console.log(`   Completando: ${firstIncompleteLesson.title}`);

      const completeLessonResponse = await makeRequest({
        hostname: '127.0.0.1',
        port: 3001,
        path: '/api/course-progress/complete-lesson',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, lessonData);

      if (completeLessonResponse.status === 200) {
        const result = completeLessonResponse.data;
        console.log('✅ Lección completada exitosamente!');
        console.log(`   Progreso del módulo: ${result.moduleProgress.progress.toFixed(1)}%`);
        console.log(`   Progreso del curso: ${result.courseProgress.progress.toFixed(1)}%`);
        
        if (result.nextLesson) {
          console.log(`   Siguiente lección: ${result.nextLesson.title}`);
        }
        
        if (result.moduleProgress.isCompleted) {
          console.log(`   🎉 ¡Módulo completado!`);
        }
      } else {
        console.log('❌ Error completando lección:', completeLessonResponse.data);
      }
    } else {
      console.log('   ✅ Todas las lecciones ya están completadas');
    }

    // 3. Completar un módulo completo
    console.log('\n🏗️ 3. Completando un módulo completo...');
    
    // Buscar un módulo no completado
    const incompleteModule = progressResponse.data.modules.find(module => !module.isCompleted);

    if (incompleteModule) {
      console.log(`   Completando módulo: ${incompleteModule.title}`);
      
      const moduleData = {
        enrollmentId,
        moduleId: incompleteModule.id
      };

      const completeModuleResponse = await makeRequest({
        hostname: '127.0.0.1',
        port: 3001,
        path: '/api/course-progress/complete-module',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, moduleData);

      if (completeModuleResponse.status === 200) {
        const result = completeModuleResponse.data;
        console.log('✅ Módulo completado exitosamente!');
        console.log(`   Lecciones completadas: ${result.module.completedLessons}/${result.module.totalLessons}`);
        console.log(`   Progreso del curso: ${result.courseProgress.progress.toFixed(1)}%`);
        
        if (result.nextModule) {
          console.log(`   Siguiente módulo: ${result.nextModule.title}`);
          if (result.nextModule.firstLesson) {
            console.log(`   Primera lección: ${result.nextModule.firstLesson.title}`);
          }
        }
        
        if (result.courseProgress.isCompleted) {
          console.log(`   🎉 ¡Curso completado!`);
        }
      } else {
        console.log('❌ Error completando módulo:', completeModuleResponse.data);
      }
    } else {
      console.log('   ✅ Todos los módulos ya están completados');
    }

    // 4. Verificar el progreso final
    console.log('\n📊 4. Verificando progreso final...');
    
    const finalProgressResponse = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: `/api/course-progress/enrollment/${enrollmentId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (finalProgressResponse.status === 200) {
      const finalProgress = finalProgressResponse.data;
      console.log('✅ Progreso final:');
      console.log(`   Progreso general: ${finalProgress.course.progress.toFixed(1)}%`);
      console.log(`   Estado: ${finalProgress.enrollment.status}`);
      console.log(`   Tiempo total: ${finalProgress.enrollment.timeSpent}s`);
      
      if (finalProgress.course.isCompleted) {
        console.log(`   🎉 ¡Curso completado exitosamente!`);
        console.log(`   Fecha de completado: ${finalProgress.enrollment.completedAt}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCourseProgressControl();
