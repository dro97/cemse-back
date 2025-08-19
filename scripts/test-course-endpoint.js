const https = require('https');
const http = require('http');

async function testCourseEndpoint() {
  const courseId = 'cme8sp5iu0000kn51lnawd6km';
  const url = `http://localhost:3001/api/course/${courseId}`;

  console.log(`🔍 Probando endpoint: ${url}\n`);

  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          try {
            const course = JSON.parse(data);
            console.log('\n✅ Curso encontrado:');
            console.log(`   ID: ${course.id}`);
            console.log(`   Título: ${course.title}`);
            console.log(`   Slug: ${course.slug}`);
            console.log(`   Módulos: ${course.modules?.length || 0}`);
            console.log(`   Lecciones: ${course.totalLessons}`);
            console.log(`   Quizzes: ${course.totalQuizzes}`);
            
            if (course.modules && course.modules.length > 0) {
              console.log('\n📚 Módulos:');
              course.modules.forEach((module, index) => {
                console.log(`   ${index + 1}. ${module.title} (${module.lessons?.length || 0} lecciones)`);
              });
            }
            
            if (course.quizzes && course.quizzes.length > 0) {
              console.log('\n🧪 Quizzes:');
              course.quizzes.forEach((quiz, index) => {
                console.log(`   ${index + 1}. ${quiz.title} (${quiz.questions?.length || 0} preguntas)`);
              });
            }
          } catch (error) {
            console.log('❌ Error parseando JSON:', error.message);
            console.log('📄 Respuesta raw:', data);
          }
        } else {
          console.log('❌ Error:', res.statusCode);
          console.log('📄 Respuesta:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Timeout de conexión');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

testCourseEndpoint().catch(console.error);
