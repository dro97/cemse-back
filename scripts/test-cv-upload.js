const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'tu-token-aqui'; // Reemplaza con tu token real

// Función para crear un archivo PDF de prueba
function createTestPDF() {
  const testDir = path.join(__dirname, '../uploads/documents');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const testFilePath = path.join(testDir, 'test-cv.pdf');
  
  // Crear un PDF simple de prueba
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(CV de Prueba) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

  fs.writeFileSync(testFilePath, pdfContent);
  return testFilePath;
}

// Función para subir CV
async function uploadCV(filePath) {
  try {
    console.log('📤 Subiendo CV...');
    
    const formData = new FormData();
    formData.append('cvFile', fs.createReadStream(filePath));
    
    const response = await axios.post(`${API_BASE_URL}/files/upload/cv`, formData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ CV subido exitosamente:');
    console.log('   📄 URL:', response.data.cvUrl);
    console.log('   📁 Nombre del archivo:', response.data.filename);
    console.log('   📏 Tamaño:', response.data.size, 'bytes');
    console.log('   🏷️  Tipo MIME:', response.data.mimetype);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al subir CV:');
    if (error.response) {
      console.error('   📊 Status:', error.response.status);
      console.error('   📋 Datos:', error.response.data);
    } else {
      console.error('   🌐 Error de red:', error.message);
    }
    throw error;
  }
}

// Función para descargar/ver CV
async function downloadCV(filename) {
  try {
    console.log('📥 Descargando CV...');
    
    const response = await axios.get(`${API_BASE_URL}/files/documents/${filename}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      },
      responseType: 'stream'
    });
    
    console.log('✅ CV descargado exitosamente');
    console.log('   📊 Status:', response.status);
    console.log('   📏 Tamaño:', response.headers['content-length'], 'bytes');
    console.log('   🏷️  Tipo:', response.headers['content-type']);
    
    // Guardar el archivo descargado
    const downloadPath = path.join(__dirname, 'downloaded-cv.pdf');
    const writer = fs.createWriteStream(downloadPath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('💾 CV guardado en:', downloadPath);
        resolve(downloadPath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error al descargar CV:');
    if (error.response) {
      console.error('   📊 Status:', error.response.status);
      console.error('   📋 Datos:', error.response.data);
    } else {
      console.error('   🌐 Error de red:', error.message);
    }
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 === PRUEBA DE SUBIDA DE CV ===\n');
    
    // 1. Crear archivo PDF de prueba
    console.log('📝 Creando archivo PDF de prueba...');
    const testFilePath = createTestPDF();
    console.log('✅ Archivo creado en:', testFilePath);
    
    // 2. Subir CV
    console.log('\n📤 Subiendo CV al servidor...');
    const uploadResult = await uploadCV(testFilePath);
    
    // 3. Descargar CV para verificar
    console.log('\n📥 Descargando CV para verificar...');
    await downloadCV(uploadResult.filename);
    
    console.log('\n🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===');
    console.log('📋 Resumen:');
    console.log(`   📤 Subido: ${uploadResult.filename}`);
    console.log(`   🔗 URL: http://localhost:3001${uploadResult.cvUrl}`);
    console.log(`   📊 Tamaño: ${uploadResult.size} bytes`);
    
  } catch (error) {
    console.error('\n💥 === ERROR EN LA PRUEBA ===');
    console.error(error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { uploadCV, downloadCV, createTestPDF };
