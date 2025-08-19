const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Reemplazar con tu token

// Función para crear un archivo de video de prueba muy pequeño
function createTinyTestVideo() {
  const testVideoPath = path.join(__dirname, '../uploads/tiny-test-video.mp4');
  
  // Crear directorio si no existe
  const uploadsDir = path.dirname(testVideoPath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear un archivo de video de prueba muy pequeño (10KB de datos)
  const videoData = Buffer.alloc(10 * 1024); // 10KB
  for (let i = 0; i < videoData.length; i++) {
    videoData[i] = Math.floor(Math.random() * 256);
  }
  
  fs.writeFileSync(testVideoPath, videoData);
  console.log(`✅ Archivo de video de prueba creado: ${testVideoPath} (${videoData.length} bytes)`);
  return testVideoPath;
}

// Función para probar la subida de video
async function testVideoUpload() {
  try {
    console.log('🎬 Probando subida de video...');
    
    // Crear archivo de video de prueba
    const videoPath = createTinyTestVideo();
    
    // Crear FormData
    const formData = new FormData();
    
    // Agregar campos de texto (exactamente como los envías)
    formData.append('title', 'Test Video Lesson');
    formData.append('description', 'Esta es una lección de prueba con video');
    formData.append('content', 'Contenido de la lección de prueba');
    formData.append('moduleId', '1755633073239');
    formData.append('contentType', 'VIDEO');
    formData.append('duration', '15');
    formData.append('orderIndex', '1');
    formData.append('isRequired', 'true');
    formData.append('isPreview', 'false');
    
    // Agregar archivo de video
    formData.append('video', fs.createReadStream(videoPath), {
      filename: 'tiny-test-video.mp4',
      contentType: 'video/mp4'
    });
    
    console.log('📤 Enviando petición...');
    
    // Hacer petición
    const response = await axios.post(
      `${API_BASE_URL}/lesson/with-video`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          ...formData.getHeaders()
        },
        timeout: 60000 // 60 segundos
      }
    );
    
    console.log('✅ Respuesta recibida:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201) {
      console.log('\n🎉 ¡Lección creada exitosamente!');
      
      if (response.data.uploadedFiles?.video) {
        console.log('🎥 Video subido a MinIO:');
        console.log('   URL:', response.data.uploadedFiles.video.url);
        console.log('   Tamaño:', response.data.uploadedFiles.video.size, 'bytes');
      }
      
      if (response.data.videoUrl) {
        console.log('🎥 Video URL en la lección:', response.data.videoUrl);
      }
      
      // Verificar que la lección se guardó en la base de datos
      console.log('\n📋 Datos de la lección guardada:');
      console.log('   ID:', response.data.id);
      console.log('   Título:', response.data.title);
      console.log('   Video URL:', response.data.videoUrl);
      console.log('   Creado:', response.data.createdAt);
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error en la prueba:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Función para probar lección sin video (JSON)
async function testJsonLesson() {
  try {
    console.log('\n📝 Probando lección sin video (JSON)...');
    
    const lessonData = {
      title: "Test JSON Lesson",
      description: "Esta es una lección de prueba sin video",
      content: "Contenido de la lección de prueba",
      moduleId: "1755633073239",
      contentType: "TEXT",
      duration: 60,
      orderIndex: 2,
      isRequired: true,
      isPreview: false
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/lesson`,
      lessonData,
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Lección JSON creada:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error en lección JSON:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de lecciones...\n');
    
    // Verificar que el token esté configurado
    if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
      console.error('❌ Error: Debes configurar AUTH_TOKEN en el script');
      console.log('💡 Para obtener un token:');
      console.log('   1. Inicia sesión en la API');
      console.log('   2. Copia el token JWT de la respuesta');
      console.log('   3. Reemplaza AUTH_TOKEN en este script');
      return;
    }
    
    // Prueba 1: Lección con video
    console.log('📝 Prueba 1: Lección con video');
    await testVideoUpload();
    
    // Prueba 2: Lección sin video
    console.log('\n📝 Prueba 2: Lección sin video');
    await testJsonLesson();
    
    console.log('\n✅ Todas las pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  testVideoUpload,
  testJsonLesson
};
