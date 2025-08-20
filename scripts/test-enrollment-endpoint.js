const API_BASE_URL = 'http://localhost:3001/api';

async function testEnrollmentEndpoint() {
  try {
    console.log('🔍 Probando endpoint de course-enrollments...\n');

    // Simular una petición GET al endpoint
    const response = await fetch(`${API_BASE_URL}/course-enrollments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Esto fallará pero nos dará info del error
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:');
      console.log(`   Total de inscripciones: ${data.length}`);
      
      if (data.length > 0) {
        const firstEnrollment = data[0];
        console.log(`   Primer curso: ${firstEnrollment.course.title}`);
        console.log(`   Módulos: ${firstEnrollment.course.modules.length}`);
        
        if (firstEnrollment.course.modules.length > 0) {
          const firstModule = firstEnrollment.course.modules[0];
          console.log(`   Lecciones en primer módulo: ${firstModule.lessons.length}`);
          
          if (firstModule.lessons.length > 0) {
            const firstLesson = firstModule.lessons[0];
            console.log(`   Recursos en primera lección: ${firstLesson.resources ? firstLesson.resources.length : 'NO DEFINIDO'}`);
            console.log(`   Quizzes en primera lección: ${firstLesson.quizzes ? firstLesson.quizzes.length : 'NO DEFINIDO'}`);
          }
        }
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Error en la respuesta:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Mensaje: ${errorData}`);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testEnrollmentEndpoint();
