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

// Función para crear un quiz con los datos exactos del frontend
async function createQuizWithRealData() {
  try {
    // Datos exactos que envía el frontend
    const quizData = {
      title: "irirtjrfjfjf",
      description: "24234234234242",
      timeLimit: 30,
      passingScore: 70,
      isActive: true,
      lessonId: "cmej1za2v0001pasdqgruh7gw",
      showCorrectAnswers: true
    };

    console.log('📤 Enviando datos:', JSON.stringify(quizData, null, 2));

    const response = await axios.post(`${BASE_URL}/quiz`, quizData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Quiz creado exitosamente:');
    console.log('📋 Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creando quiz:');
    console.error('📋 Status:', error.response?.status);
    console.error('📋 Data:', error.response?.data);
    console.error('📋 Message:', error.message);
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
    
    console.log('\n📋 Quizzes existentes:');
    if (response.data.length === 0) {
      console.log('   No hay quizzes creados aún');
    } else {
      response.data.forEach((quiz, index) => {
        console.log(`${index + 1}. ${quiz.title} (ID: ${quiz.id})`);
        console.log(`   - Descripción: ${quiz.description || 'Sin descripción'}`);
        console.log(`   - Puntaje mínimo: ${quiz.passingScore}%`);
        console.log(`   - Límite de tiempo: ${quiz.timeLimit || 'Sin límite'} minutos`);
        console.log(`   - Activo: ${quiz.isActive ? 'Sí' : 'No'}`);
        console.log(`   - Lesson ID: ${quiz.lessonId || 'N/A'}`);
        console.log('');
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error listando quizzes:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Probando creación de quiz con datos reales del frontend...\n');
    
    // Obtener token
    await getToken();
    
    // Crear quiz con datos reales
    console.log('📝 Creando quiz con datos del frontend...\n');
    await createQuizWithRealData();
    
    // Listar quizzes para verificar
    console.log('\n📋 Verificando quizzes creados...\n');
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

module.exports = { getToken, createQuizWithRealData, listQuizzes };
