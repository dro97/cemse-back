const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const MINIO_BASE_URL = 'https://bucket-production-1a58.up.railway.app:443';

// Token de autenticación (reemplaza con un token válido)
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Reemplaza con tu token

async function testMinIONewsUpload() {
  try {
    console.log('🧪 Probando subida de imagen a MinIO para noticias...');
    
    // Crear FormData con imagen
    const form = new FormData();
    
    // Agregar campos de texto
    form.append('title', 'Noticia de prueba con MinIO');
    form.append('content', 'Esta es una noticia de prueba para verificar que MinIO funciona correctamente.');
    form.append('summary', 'Prueba de MinIO con noticias');
    form.append('category', 'Tecnología');
    form.append('priority', 'MEDIUM');
    form.append('status', 'PUBLISHED');
    form.append('featured', 'false');
    form.append('targetAudience', 'YOUTH');
    form.append('region', 'Nacional');
    
    // Agregar imagen de prueba
    const imagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(imagePath)) {
      form.append('image', fs.createReadStream(imagePath));
      console.log('📸 Imagen agregada al formulario');
    } else {
      console.log('⚠️ No se encontró test-image.jpg, creando imagen de prueba...');
      // Crear una imagen de prueba simple
      const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      form.append('image', testImageBuffer, {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg'
      });
    }
    
    console.log('📤 Enviando solicitud POST a /api/newsarticle...');
    
    // Realizar la solicitud
    const response = await fetch(`${API_BASE_URL}/api/newsarticle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    console.log(`📊 Respuesta del servidor: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Noticia creada exitosamente!');
      console.log('📋 Datos de la noticia:');
      console.log(`   ID: ${result.id}`);
      console.log(`   Título: ${result.title}`);
      console.log(`   URL de imagen: ${result.imageUrl}`);
      
      // Verificar si la URL de la imagen es de MinIO
      if (result.imageUrl && result.imageUrl.startsWith(MINIO_BASE_URL)) {
        console.log('✅ La imagen se subió correctamente a MinIO!');
        console.log(`🔗 URL de MinIO: ${result.imageUrl}`);
        
        // Probar acceso a la imagen
        console.log('🔍 Probando acceso a la imagen...');
        const imageResponse = await fetch(result.imageUrl);
        if (imageResponse.ok) {
          console.log('✅ La imagen es accesible públicamente desde MinIO!');
        } else {
          console.log('❌ La imagen no es accesible:', imageResponse.status);
        }
      } else {
        console.log('❌ La imagen no se subió a MinIO');
        console.log(`🔗 URL actual: ${result.imageUrl}`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error al crear la noticia:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar la prueba
testMinIONewsUpload();
