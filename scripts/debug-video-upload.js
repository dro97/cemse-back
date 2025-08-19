const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Reemplazar con tu token

// Función para crear un archivo de video de prueba pequeño
function createSmallTestVideo() {
  const testVideoPath = path.join(__dirname, '../uploads/small-test-video.mp4');
  
  // Crear directorio si no existe
  const uploadsDir = path.dirname(testVideoPath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear un archivo de video de prueba pequeño (100KB de datos)
  const videoData = Buffer.alloc(100 * 1024); // 100KB
  for (let i = 0; i < videoData.length; i++) {
    videoData[i] = Math.floor(Math.random() * 256);
  }
  
  fs.writeFileSync(testVideoPath, videoData);
  console.log(`✅ Archivo de video de prueba creado: ${testVideoPath} (${videoData.length} bytes)`);
  return testVideoPath;
}

// Función para hacer peticiones HTTP con debug
async function makeRequestWithDebug(url, method, headers, data = null) {
  try {
    console.log(`\n🔍 Haciendo petición ${method} a ${url}`);
    console.log('📋 Headers:', JSON.stringify(headers, null, 2));
    
    if (data instanceof FormData) {
      console.log('📁 FormData detectado');
      // Mostrar campos del FormData
      data._streams.forEach((stream, index) => {
        if (typeof stream === 'string') {
          console.log(`   Campo ${index}: ${stream}`);
        } else if (stream && stream.fieldname) {
          console.log(`   Archivo ${index}: ${stream.fieldname} - ${stream.originalname}`);
        }
      });
    } else if (data) {
      console.log('📄 Data:', JSON.stringify(data, null, 2));
    }
    
    const config = {
      method,
      url,
      headers,
      data,
      timeout: 60000 // 60 segundos
    };
    
    const response = await axios(config);
    console.log(`✅ Respuesta exitosa: ${response.status}`);
    console.log('📋 Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
    return response;
  } catch (error) {
    console.error(`❌ Error en petición ${method} ${url}:`);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
    throw error;
  }
}

// Función para probar la ruta con video
async function testVideoUpload() {
  try {
    console.log('🎬 Probando subida de video...');
    
    // Crear archivo de video de prueba
    const videoPath = createSmallTestVideo();
    
    // Crear FormData
    const formData = new FormData();
    
    // Agregar campos de texto (exactamente como los envías)
    formData.append('title', '123123');
    formData.append('description', '123123123');
    formData.append('content', '131231231');
    formData.append('moduleId', '1755633073239');
    formData.append('contentType', 'VIDEO');
    formData.append('duration', '15');
    formData.append('orderIndex', '1');
    formData.append('isRequired', 'true');
    formData.append('isPreview', 'false');
    
    // Agregar archivo de video
    formData.append('video', fs.createReadStream(videoPath), {
      filename: 'small-test-video.mp4',
      contentType: 'video/mp4'
    });
    
    // Hacer petición
    const response = await makeRequestWithDebug(
      `${API_BASE_URL}/lesson/with-video`,
      'POST',
      {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...formData.getHeaders()
      },
      formData
    );
    
    if (response.status === 201) {
      console.log('\n✅ Lección creada exitosamente!');
      
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
      } else {
        console.log('⚠️ No se encontró información del video subido');
      }
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error en prueba de video:', error.message);
    throw error;
  }
}

// Función para verificar el estado del servidor
async function checkServerStatus() {
  try {
    console.log('🔍 Verificando estado del servidor...');
    
    // Verificar health endpoint
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000
    });
    console.log('✅ Servidor está ejecutándose');
    console.log('📋 Health response:', healthResponse.data);
    
    // Verificar si las rutas están disponibles
    try {
      const routesResponse = await axios.get(`${API_BASE_URL}/lesson`, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });
      console.log('✅ Ruta /lesson está disponible');
    } catch (routesError) {
      console.log('⚠️ Ruta /lesson no está disponible o requiere autenticación');
    }
    
  } catch (error) {
    console.error('❌ Error verificando servidor:', error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando diagnóstico de subida de videos...\n');
    
    // Verificar que el token esté configurado
    if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
      console.error('❌ Error: Debes configurar AUTH_TOKEN en el script');
      console.log('💡 Para obtener un token:');
      console.log('   1. Inicia sesión en la API');
      console.log('   2. Copia el token JWT de la respuesta');
      console.log('   3. Reemplaza AUTH_TOKEN en este script');
      return;
    }
    
    // Verificar estado del servidor
    await checkServerStatus();
    console.log('');
    
    // Probar subida de video
    await testVideoUpload();
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  testVideoUpload,
  checkServerStatus
};
