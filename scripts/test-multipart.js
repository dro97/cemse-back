const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const YOUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtdjFhYmMxMjNkZWY0NTYiLCJ0eXBlIjoidXNlciIsImlhdCI6MTczNDI5NzYwMCwiZXhwIjoxNzM0Mzg0MDAwfQ.example'; // Reemplaza con token real

async function testMultipartUpload() {
  try {
    console.log('🧪 Probando upload multipart/form-data...');
    
    // Simular multipart/form-data manualmente
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    
    let body = '';
    
    // Agregar campos de texto
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="title"\r\n\r\n';
    body += '12312321\r\n';
    
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="description"\r\n\r\n';
    body += '312312312312\r\n';
    
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="youthProfileId"\r\n\r\n';
    body += 'cme7crnpe0000y4jzy59dorf0\r\n';
    
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="isPublic"\r\n\r\n';
    body += 'true\r\n';
    
    // Agregar archivos simulados
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="cvFile"; filename="calificacionesPrimerBimestre.pdf"\r\n';
    body += 'Content-Type: application/pdf\r\n\r\n';
    body += 'Contenido de prueba para CV\r\n';
    
    body += `--${boundary}\r\n`;
    body += 'Content-Disposition: form-data; name="coverLetterFile"; filename="Patient_678415ce4d45501c6eacf6bd.pdf"\r\n';
    body += 'Content-Type: application/pdf\r\n\r\n';
    body += 'Contenido de prueba para carta de presentación\r\n';
    
    body += `--${boundary}--\r\n`;
    
    const response = await axios.post(`${API_BASE_URL}/youthapplication`, body, {
      headers: {
        'Authorization': `Bearer ${YOUTH_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      }
    });
    
    console.log('✅ Postulación creada exitosamente:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

// Ejecutar prueba
testMultipartUpload();
