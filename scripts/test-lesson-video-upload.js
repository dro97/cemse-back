const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Reemplazar con tu token

// Función para crear un archivo de video de prueba
function createTestVideo() {
  const testVideoPath = path.join(__dirname, '../uploads/test-video.mp4');
  
  // Crear directorio si no existe
  const uploadsDir = path.dirname(testVideoPath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear un archivo de video de prueba (1MB de datos aleatorios)
  const videoData = Buffer.alloc(1024 * 1024); // 1MB
  for (let i = 0; i < videoData.length; i++) {
    videoData[i] = Math.floor(Math.random() * 256);
  }
  
  fs.writeFileSync(testVideoPath, videoData);
  console.log(`✅ Archivo de video de prueba creado: ${testVideoPath}`);
  return testVideoPath;
}

// Función para hacer peticiones HTTP
async function makeRequest(url, method, headers, data = null) {
  try {
    const config = {
      method,
      url,
      headers,
      data,
      timeout: 30000 // 30 segundos
    };
    
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(`❌ Error en petición ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
}

// Función para crear una lección con video
async function createLessonWithVideo() {
  try {
    console.log('🎬 Creando lección con video...');
    
    // Crear archivo de video de prueba
    const videoPath = createTestVideo();
    
    // Crear FormData
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('title', 'Lección de Prueba con Video');
    formData.append('description', 'Esta es una lección de prueba con video');
    formData.append('content', 'Contenido de la lección de prueba');
    formData.append('moduleId', 'test-module-id'); // Reemplazar con un ID real
    formData.append('contentType', 'VIDEO');
    formData.append('duration', '120'); // 2 minutos
    formData.append('orderIndex', '1');
    formData.append('isRequired', 'true');
    formData.append('isPreview', 'false');
    
    // Agregar archivo de video
    formData.append('video', fs.createReadStream(videoPath), {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    
    // Hacer petición
    const response = await makeRequest(
      `${API_BASE_URL}/lesson/with-video`,
      'POST',
      {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...formData.getHeaders()
      },
      formData
    );
    
    if (response.status === 201) {
      console.log('✅ Lección creada exitosamente:');
      console.log('📋 Datos de la lección:', JSON.stringify(response.data, null, 2));
      
      if (response.data.uploadedFiles?.video) {
        console.log('🎥 Video subido a MinIO:');
        console.log('   URL:', response.data.uploadedFiles.video.url);
        console.log('   Tamaño:', response.data.uploadedFiles.video.size, 'bytes');
        console.log('   Tipo:', response.data.uploadedFiles.video.mimetype);
        
        // Probar acceso a la URL
        console.log('\n🔗 Probando acceso a la URL del video...');
        try {
          const videoResponse = await axios.get(response.data.uploadedFiles.video.url, {
            timeout: 10000,
            responseType: 'stream'
          });
          console.log('✅ URL del video es accesible!');
          console.log('   Status:', videoResponse.status);
          console.log('   Content-Type:', videoResponse.headers['content-type']);
        } catch (videoError) {
          console.log('❌ Error accediendo al video:', videoError.message);
        }
      }
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando lección con video:', error.message);
    throw error;
  }
}

// Función para probar la ruta JSON normal (sin archivos)
async function testJsonLesson() {
  try {
    console.log('\n📝 Probando creación de lección sin archivos...');
    
    const lessonData = {
      title: "Lección de Prueba JSON",
      description: "Esta es una lección de prueba sin archivos",
      content: "Contenido de la lección de prueba",
      moduleId: "test-module-id", // Reemplazar con un ID real
      contentType: "TEXT",
      duration: 60,
      orderIndex: 2,
      isRequired: true,
      isPreview: false
    };
    
    const response = await makeRequest(
      `${API_BASE_URL}/lesson`,
      'POST',
      {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      lessonData
    );
    
    if (response.status === 201) {
      console.log('✅ Lección JSON creada exitosamente:');
      console.log('📋 Datos:', JSON.stringify(response.data, null, 2));
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando lección JSON:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de subida de videos de lecciones...\n');
    
    // Verificar que el token esté configurado
    if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
      console.error('❌ Error: Debes configurar AUTH_TOKEN en el script');
      console.log('💡 Para obtener un token:');
      console.log('   1. Inicia sesión en la API');
      console.log('   2. Copia el token JWT de la respuesta');
      console.log('   3. Reemplaza AUTH_TOKEN en este script');
      return;
    }
    
    // Prueba 1: Crear lección con video
    console.log('📝 Prueba 1: Crear lección con video');
    await createLessonWithVideo();
    console.log('');
    
    // Prueba 2: Crear lección JSON (sin archivos)
    console.log('📝 Prueba 2: Crear lección JSON');
    await testJsonLesson();
    console.log('');
    
    console.log('✅ Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  createLessonWithVideo,
  testJsonLesson
};
