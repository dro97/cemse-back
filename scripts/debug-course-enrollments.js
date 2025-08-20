const API_BASE_URL = 'http://localhost:3001/api';

async function debugCourseEnrollments() {
  try {
    console.log('🔍 Debuggeando endpoint de course-enrollments...\n');

    // Primero obtener un token
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'juan.perez@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Token obtenido correctamente');

    // Obtener las inscripciones a cursos
    const enrollmentsResponse = await fetch(`${API_BASE_URL}/course-enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const enrollments = await enrollmentsResponse.json();
    console.log(`✅ Se obtuvieron ${enrollments.length} inscripciones`);

    // Analizar la primera inscripción en detalle
    if (enrollments.length > 0) {
      const enrollment = enrollments[0];
      console.log('\n📚 Análisis detallado de la primera inscripción:');
      console.log(`   Curso ID: ${enrollment.course.id}`);
      console.log(`   Curso: ${enrollment.course.title}`);
      
      // Verificar si hay quizzes a nivel de curso
      console.log(`   Quizzes del curso: ${enrollment.course.quizzes ? enrollment.course.quizzes.length : 'NO DEFINIDO'}`);
      
      // Verificar módulos
      console.log(`   Módulos: ${enrollment.course.modules ? enrollment.course.modules.length : 'NO DEFINIDO'}`);
      
      if (enrollment.course.modules && enrollment.course.modules.length > 0) {
        const firstModule = enrollment.course.modules[0];
        console.log(`   Primer módulo: ${firstModule.title}`);
        console.log(`   Lecciones en el primer módulo: ${firstModule.lessons ? firstModule.lessons.length : 'NO DEFINIDO'}`);
        
        if (firstModule.lessons && firstModule.lessons.length > 0) {
          const firstLesson = firstModule.lessons[0];
          console.log(`   Primera lección: ${firstLesson.title}`);
          console.log(`   Recursos en la primera lección: ${firstLesson.resources ? firstLesson.resources.length : 'NO DEFINIDO'}`);
          console.log(`   Quizzes en la primera lección: ${firstLesson.quizzes ? firstLesson.quizzes.length : 'NO DEFINIDO'}`);
          
          // Mostrar estructura completa de la primera lección
          console.log('\n   Estructura completa de la primera lección:');
          console.log(JSON.stringify(firstLesson, null, 2));
        }
      }
    }

    // También verificar si hay datos de quizzes y resources en la base de datos
    console.log('\n🔍 Verificando datos en la base de datos...');
    
    // Verificar quizzes del curso
    const courseQuizzesResponse = await fetch(`${API_BASE_URL}/quiz?courseId=${enrollments[0].course.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const courseQuizzes = await courseQuizzesResponse.json();
    console.log(`   Quizzes del curso en DB: ${courseQuizzes.length}`);

    // Verificar resources de las lecciones
    if (enrollments[0].course.modules && enrollments[0].course.modules.length > 0) {
      const firstLesson = enrollments[0].course.modules[0].lessons[0];
      if (firstLesson) {
        const lessonResourcesResponse = await fetch(`${API_BASE_URL}/lessonresource?lessonId=${firstLesson.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const lessonResources = await lessonResourcesResponse.json();
        console.log(`   Resources de la primera lección en DB: ${lessonResources.length}`);
      }
    }

    console.log('\n✅ Debug completado!');
    
  } catch (error) {
    console.error('❌ Error en el debug:', error.message);
  }
}

debugCourseEnrollments();
