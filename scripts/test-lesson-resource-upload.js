const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Reemplaza con tu token JWT

// Función para obtener token (si no tienes uno)
async function getToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com', // Reemplaza con credenciales válidas
        password: 'password123'
      })
    });

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Función para crear un recurso de lección
async function createLessonResource(token, lessonId) {
  try {
    // Crear FormData
    const formData = new FormData();
    
    // Agregar campos del formulario
    formData.append('lessonId', lessonId);
    formData.append('title', 'Documento de prueba');
    formData.append('description', 'Este es un documento de prueba para verificar la subida a MinIO');
    formData.append('type', 'PDF');
    formData.append('orderIndex', '1');
    formData.append('isDownloadable', 'true');
    
    // Agregar archivo (crear un archivo de prueba si no existe)
    const testFilePath = path.join(__dirname, 'test-document.pdf');
    if (!fs.existsSync(testFilePath)) {
      // Crear un archivo PDF de prueba simple
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
      fs.writeFileSync(testFilePath, pdfContent);
    }
    
    formData.append('file', fs.createReadStream(testFilePath));
    
    console.log('📤 Enviando recurso de lección...');
    
    const response = await fetch(`${API_BASE_URL}/lessonresource`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Recurso creado exitosamente:');
    console.log('   ID:', result.id);
    console.log('   Título:', result.title);
    console.log('   URL:', result.url);
    console.log('   Archivo subido:', result.uploadedFile);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error creando recurso:', error.message);
    throw error;
  }
}

// Función para listar recursos de una lección
async function listLessonResources(token, lessonId) {
  try {
    console.log('📋 Listando recursos de la lección...');
    
    const response = await fetch(`${API_BASE_URL}/lessonresource?lessonId=${lessonId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const resources = await response.json();
    console.log('✅ Recursos encontrados:', resources.length);
    
    resources.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.title} - ${resource.url}`);
    });
    
    return resources;
    
  } catch (error) {
    console.error('❌ Error listando recursos:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando prueba de recursos de lecciones con MinIO...\n');
    
    // Obtener token
    let token = TOKEN;
    if (token === 'YOUR_JWT_TOKEN_HERE') {
      console.log('🔑 Obteniendo token...');
      token = await getToken();
      if (!token) {
        console.error('❌ No se pudo obtener el token');
        return;
      }
    }
    
    // ID de una lección existente (reemplaza con uno válido)
    const lessonId = 'cmej1za2v0001pasdqgruh7gw'; // Reemplaza con un ID válido
    
    // Crear recurso
    const createdResource = await createLessonResource(token, lessonId);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Listar recursos
    await listLessonResources(token, lessonId);
    
    console.log('\n✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  createLessonResource,
  listLessonResources
};
