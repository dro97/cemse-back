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

// Función para crear una lección con video subido a MinIO
async function createLessonWithVideo() {
  try {
    console.log('🎬 Creando lección con video subido a MinIO...');
    
    // Crear archivo de video de prueba
    const videoPath = createTestVideo();
    
    // Crear FormData
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('title', 'Lección de Prueba con Video MinIO');
    formData.append('description', 'Esta es una lección de prueba con video subido a MinIO');
    formData.append('content', 'Contenido de la lección de prueba');
    formData.append('moduleId', 'test-module-id'); // Reemplazar con un ID real de módulo
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
      console.log('✅ Lección creada exitosamente con video en MinIO:');
      console.log('📋 Datos de la lección:', JSON.stringify(response.data, null, 2));
      
      if (response.data.uploadedFiles?.video) {
        console.log('🎥 Video subido a MinIO:');
        console.log('   URL:', response.data.uploadedFiles.video.url);
        console.log('   Tamaño:', response.data.uploadedFiles.video.size, 'bytes');
        console.log('   Tipo:', response.data.uploadedFiles.video.mimetype);
      }
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando lección con video:', error.message);
    throw error;
  }
}

// Función para crear una lección con múltiples archivos
async function createLessonWithMultipleFiles() {
  try {
    console.log('📁 Creando lección con múltiples archivos...');
    
    // Crear archivos de prueba
    const videoPath = createTestVideo();
    const thumbnailPath = path.join(__dirname, '../uploads/test-thumbnail.jpg');
    const attachmentPath = path.join(__dirname, '../uploads/test-document.pdf');
    
    // Crear thumbnail de prueba (1KB de datos)
    const thumbnailData = Buffer.alloc(1024);
    for (let i = 0; i < thumbnailData.length; i++) {
      thumbnailData[i] = Math.floor(Math.random() * 256);
    }
    fs.writeFileSync(thumbnailPath, thumbnailData);
    
    // Crear documento de prueba (1KB de datos)
    const documentData = Buffer.alloc(1024);
    for (let i = 0; i < documentData.length; i++) {
      documentData[i] = Math.floor(Math.random() * 256);
    }
    fs.writeFileSync(attachmentPath, documentData);
    
    // Crear FormData
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('title', 'Lección Completa con Múltiples Archivos');
    formData.append('description', 'Esta lección incluye video, thumbnail y attachments');
    formData.append('content', 'Contenido completo de la lección');
    formData.append('moduleId', 'test-module-id'); // Reemplazar con un ID real
    formData.append('contentType', 'VIDEO');
    formData.append('duration', '180'); // 3 minutos
    formData.append('orderIndex', '2');
    formData.append('isRequired', 'true');
    formData.append('isPreview', 'false');
    
    // Agregar archivos
    formData.append('video', fs.createReadStream(videoPath), {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    
    formData.append('thumbnail', fs.createReadStream(thumbnailPath), {
      filename: 'test-thumbnail.jpg',
      contentType: 'image/jpeg'
    });
    
    formData.append('attachments', fs.createReadStream(attachmentPath), {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    });
    
    // Hacer petición
    const response = await makeRequest(
      `${API_BASE_URL}/lesson/with-files`,
      'POST',
      {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...formData.getHeaders()
      },
      formData
    );
    
    if (response.status === 201) {
      console.log('✅ Lección creada exitosamente con múltiples archivos:');
      console.log('📋 Datos de la lección:', JSON.stringify(response.data, null, 2));
      
      if (response.data.uploadedFiles) {
        console.log('📁 Archivos subidos a MinIO:');
        
        if (response.data.uploadedFiles.video) {
          console.log('   🎥 Video:', response.data.uploadedFiles.video.url);
        }
        
        if (response.data.uploadedFiles.thumbnail) {
          console.log('   🖼️ Thumbnail:', response.data.uploadedFiles.thumbnail.url);
        }
        
        if (response.data.uploadedFiles.attachments) {
          console.log('   📎 Attachments:');
          response.data.uploadedFiles.attachments.forEach((attachment, index) => {
            console.log(`      ${index + 1}. ${attachment.originalName}: ${attachment.url}`);
          });
        }
      }
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando lección con múltiples archivos:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de subida de videos a MinIO...\n');
    
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
    
    // Prueba 2: Crear lección con múltiples archivos
    console.log('📝 Prueba 2: Crear lección con múltiples archivos');
    await createLessonWithMultipleFiles();
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
  createLessonWithMultipleFiles
};
