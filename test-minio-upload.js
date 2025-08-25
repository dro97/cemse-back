const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// URL de tu API en Railway
const API_URL = 'https://tu-api.railway.app'; // Cambia esto por tu URL real
const MINIO_BASE_URL = 'https://bucket-production-1a58.up.railway.app:443';

async function testMinIOUpload() {
  console.log('🧪 === PRUEBA DE SUBIDA A MINIO ===');
  console.log('🔗 URL de MinIO:', MINIO_BASE_URL);
  
  try {
    // Crear FormData con una imagen de prueba
    const formData = new FormData();
    
    // Agregar una imagen de prueba (si existe)
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      formData.append('image', fs.createReadStream(testImagePath));
      console.log('✅ Imagen de prueba encontrada');
    } else {
      console.log('⚠️ No se encontró test-image.jpg, creando archivo de prueba...');
      // Crear un archivo de prueba simple
      const testContent = 'Test image content';
      fs.writeFileSync(testImagePath, testContent);
      formData.append('image', fs.createReadStream(testImagePath));
    }
    
    // Agregar datos del evento
    formData.append('title', 'Evento de prueba MinIO');
    formData.append('description', 'Este es un evento de prueba para verificar MinIO');
    formData.append('location', 'Ubicación de prueba');
    formData.append('date', '2024-12-25T10:00:00Z');
    formData.append('maxCapacity', '100');
    formData.append('price', '0');
    formData.append('featured', 'false');
    formData.append('tags', JSON.stringify(['prueba', 'minio']));
    formData.append('requirements', JSON.stringify(['Ninguno']));
    
    console.log('📤 Enviando solicitud a la API...');
    
    // Hacer la solicitud POST
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer TU_TOKEN_AQUI', // Cambia esto por un token válido
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Subida exitosa!');
      console.log('📋 Respuesta:', JSON.stringify(result, null, 2));
      
      // Verificar que la imagen se subió a MinIO
      if (result.image) {
        console.log('🖼️ URL de la imagen en MinIO:', result.image);
        
        // Verificar que la URL usa el formato correcto
        if (result.image.startsWith(MINIO_BASE_URL)) {
          console.log('✅ URL de MinIO correcta');
        } else {
          console.log('⚠️ URL no usa el formato esperado de MinIO');
        }
        
        // Intentar acceder a la imagen
        const imageResponse = await fetch(result.image);
        if (imageResponse.ok) {
          console.log('✅ La imagen es accesible desde MinIO');
        } else {
          console.log('❌ Error accediendo a la imagen:', imageResponse.status);
        }
      }
    } else {
      console.log('❌ Error en la subida:', response.status);
      const errorText = await response.text();
      console.log('📋 Detalles del error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
  
  console.log('🧪 === FIN DE PRUEBA ===');
}

// Ejecutar la prueba
testMinIOUpload();
