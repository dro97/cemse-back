const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const YOUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtdjFhYmMxMjNkZWY0NTYiLCJ0eXBlIjoidXNlciIsImlhdCI6MTczNDI5NzYwMCwiZXhwIjoxNzM0Mzg0MDAwfQ.example'; // Reemplaza con token real

async function testFormDataUpload() {
  try {
    console.log('🧪 Probando upload con FormData...');
    
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('title', '12312321');
    formData.append('description', '312312312312');
    formData.append('youthProfileId', 'cme7crnpe0000y4jzy59dorf0');
    formData.append('isPublic', 'true');
    
    // Crear archivos de prueba
    const cvContent = 'Contenido de prueba para CV';
    const coverContent = 'Contenido de prueba para carta de presentación';
    
    // Crear archivos temporales
    fs.writeFileSync('temp_cv.pdf', cvContent);
    fs.writeFileSync('temp_cover.pdf', coverContent);
    
    // Agregar archivos
    formData.append('cvFile', fs.createReadStream('temp_cv.pdf'));
    formData.append('coverLetterFile', fs.createReadStream('temp_cover.pdf'));
    
    const response = await axios.post(`${API_BASE_URL}/youthapplication`, formData, {
      headers: {
        'Authorization': `Bearer ${YOUTH_TOKEN}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Postulación creada exitosamente:', response.data);
    
    // Limpiar archivos temporales
    fs.unlinkSync('temp_cv.pdf');
    fs.unlinkSync('temp_cover.pdf');
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('Detalles del error 400:', error.response.data);
    }
    throw error;
  }
}

// Ejecutar prueba
testFormDataUpload();
