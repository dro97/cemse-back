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

async function testQuizCompletion() {
  try {
    console.log('🧪 Probando completar un quiz...\n');

    // Usar un token válido (reemplaza con uno real)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjcm5wZTAwMDB5NGp6eTU5ZG9yZjAiLCJ0eXBlIjoidXNlciIsInJvbGUiOiJZT1VUSCIsImlhdCI6MTc1NTcxODA4MywiZXhwIjoxNzU1ODA0NDgzfQ.4kleuB7Vq6zaeKR0AmQ7ROQoKpxm5JSsUTwe86XlqEU';

    // Datos del quiz a completar (basado en los datos que vimos)
    const quizData = {
      quizId: 'cmek4h1od00019eivp8c2e1za', // ID del quiz que vimos en la base de datos
      enrollmentId: 'cmek7am6v0001xhe28xft591p', // ID de la inscripción
      answers: [
        {
          questionId: 'cmek4qooo00039eiv0dlwzwqf', // Primera pregunta
          answer: 'Option 1', // Respuesta del usuario
          timeSpent: 30 // Tiempo en segundos
        },
        {
          questionId: 'cmek50m6q00079eivoqyxphkh', // Segunda pregunta
          answer: 'true', // Respuesta del usuario
          timeSpent: 45
        },
        {
          questionId: 'cmek50wlb00099eiv1zfyjihg', // Tercera pregunta
          answer: 'respuesta del usuario', // Respuesta del usuario
          timeSpent: 60
        }
      ]
    };

    console.log('📝 Enviando respuestas del quiz...');
    console.log(`   Quiz ID: ${quizData.quizId}`);
    console.log(`   Enrollment ID: ${quizData.enrollmentId}`);
    console.log(`   Respuestas: ${quizData.answers.length}`);

    const response = await makeRequest({
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/quizattempt/complete',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, quizData);

    console.log(`\nStatus: ${response.status}`);
    
    if (response.status === 200) {
      const result = response.data;
      console.log('✅ Quiz completado exitosamente!');
      console.log(`📊 Resultados:`);
      console.log(`   Score: ${result.score}%`);
      console.log(`   Pasó: ${result.passed ? 'SÍ' : 'NO'}`);
      console.log(`   Respuestas correctas: ${result.correctAnswers}/${result.totalQuestions}`);
      console.log(`   Puntaje mínimo para pasar: ${result.passingScore}%`);
      
      console.log(`\n📋 Detalles del intento:`);
      console.log(`   ID del intento: ${result.attempt.id}`);
      console.log(`   Fecha de completado: ${result.attempt.completedAt}`);
      
      if (result.attempt.answers) {
        console.log(`\n📝 Respuestas detalladas:`);
        result.attempt.answers.forEach((answer, index) => {
          console.log(`   ${index + 1}. Pregunta: ${answer.question.question}`);
          console.log(`      Respuesta del usuario: ${answer.answer}`);
          console.log(`      Respuesta correcta: ${answer.question.correctAnswer}`);
          console.log(`      Correcta: ${answer.isCorrect ? 'SÍ' : 'NO'}`);
          console.log(`      Tiempo: ${answer.timeSpent}s`);
        });
      }
    } else {
      console.log('❌ Error:', response.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuizCompletion();
