const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001/api';
let authToken = '';

// Función para obtener token de autenticación
async function getToken() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    console.log('✅ Token obtenido exitosamente');
    return authToken;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un quiz
async function createQuiz(quizData) {
  try {
    const response = await axios.post(`${BASE_URL}/quiz`, quizData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Quiz creado exitosamente:');
    console.log('📋 ID:', response.data.id);
    console.log('📋 Título:', response.data.title);
    console.log('📋 Descripción:', response.data.description);
    console.log('📋 Puntaje mínimo:', response.data.passingScore);
    console.log('📋 Límite de tiempo:', response.data.timeLimit);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creando quiz:', error.response?.data || error.message);
    throw error;
  }
}

// Función para listar quizzes
async function listQuizzes() {
  try {
    const response = await axios.get(`${BASE_URL}/quiz`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('📋 Quizzes existentes:');
    response.data.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title} (ID: ${quiz.id})`);
      console.log(`   - Descripción: ${quiz.description || 'Sin descripción'}`);
      console.log(`   - Puntaje mínimo: ${quiz.passingScore}%`);
      console.log(`   - Límite de tiempo: ${quiz.timeLimit || 'Sin límite'} minutos`);
      console.log(`   - Activo: ${quiz.isActive ? 'Sí' : 'No'}`);
      console.log('');
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error listando quizzes:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando prueba de creación de quizzes...\n');
    
    // Obtener token
    await getToken();
    
    // Crear un quiz de ejemplo
    console.log('📝 Creando quiz de ejemplo...\n');
    
    const quizData = {
      lessonId: 'clx1234567890', // Reemplaza con un lessonId real
      title: 'Quiz de Prueba - Variables en JavaScript',
      description: 'Este es un quiz de prueba para evaluar conocimientos sobre variables en JavaScript',
      timeLimit: 15, // 15 minutos
      passingScore: 80, // 80% para aprobar
      showCorrectAnswers: true,
      isActive: true
    };
    
    const newQuiz = await createQuiz(quizData);
    
    console.log('\n📋 Listando todos los quizzes...\n');
    await listQuizzes();
    
    console.log('✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { getToken, createQuiz, listQuizzes };
