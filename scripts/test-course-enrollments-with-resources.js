const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCourseEnrollmentsWithResources() {
  try {
    console.log('🔍 Probando endpoint de course-enrollments con recursos y quizzes...\n');

    // Primero obtener un token (asumiendo que tienes un usuario de prueba)
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'juan.perez@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido correctamente');

    // Obtener las inscripciones a cursos
    const enrollmentsResponse = await axios.get(`${API_BASE_URL}/course-enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const enrollments = enrollmentsResponse.data;
    console.log(`✅ Se obtuvieron ${enrollments.length} inscripciones`);

    // Analizar la estructura de datos
    enrollments.forEach((enrollment, index) => {
      console.log(`\n📚 Inscripción ${index + 1}:`);
      console.log(`   Curso: ${enrollment.course.title}`);
      console.log(`   Estado: ${enrollment.status}`);
      console.log(`   Progreso: ${enrollment.progress}%`);
      
      // Verificar quizzes del curso
      if (enrollment.course.quizzes && enrollment.course.quizzes.length > 0) {
        console.log(`   📝 Quizzes del curso: ${enrollment.course.quizzes.length}`);
        enrollment.course.quizzes.forEach((quiz, quizIndex) => {
          console.log(`      Quiz ${quizIndex + 1}: ${quiz.title} (${quiz.questions?.length || 0} preguntas)`);
        });
      } else {
        console.log('   📝 No hay quizzes a nivel de curso');
      }

      // Verificar módulos y lecciones
      if (enrollment.course.modules && enrollment.course.modules.length > 0) {
        console.log(`   📦 Módulos: ${enrollment.course.modules.length}`);
        
        enrollment.course.modules.forEach((module, moduleIndex) => {
          console.log(`      Módulo ${moduleIndex + 1}: ${module.title}`);
          
          if (module.lessons && module.lessons.length > 0) {
            console.log(`         📖 Lecciones: ${module.lessons.length}`);
            
            module.lessons.forEach((lesson, lessonIndex) => {
              console.log(`            Lección ${lessonIndex + 1}: ${lesson.title}`);
              
              // Verificar recursos de la lección
              if (lesson.resources && lesson.resources.length > 0) {
                console.log(`               📎 Recursos: ${lesson.resources.length}`);
                lesson.resources.forEach((resource, resourceIndex) => {
                  console.log(`                  - ${resource.title} (${resource.type})`);
                });
              } else {
                console.log('               📎 No hay recursos');
              }
              
              // Verificar quizzes de la lección
              if (lesson.quizzes && lesson.quizzes.length > 0) {
                console.log(`               📝 Quizzes: ${lesson.quizzes.length}`);
                lesson.quizzes.forEach((quiz, quizIndex) => {
                  console.log(`                  - ${quiz.title} (${quiz.questions?.length || 0} preguntas)`);
                });
              } else {
                console.log('               📝 No hay quizzes');
              }
            });
          } else {
            console.log('         📖 No hay lecciones');
          }
        });
      } else {
        console.log('   📦 No hay módulos');
      }
    });

    console.log('\n✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testCourseEnrollmentsWithResources();
