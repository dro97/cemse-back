const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const YOUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtdjFhYmMxMjNkZWY0NTYiLCJ0eXBlIjoidXNlciIsImlhdCI6MTczNDI5NzYwMCwiZXhwIjoxNzM0Mzg0MDAwfQ.example'; // Reemplaza con token real

async function testMultipartFixed() {
  try {
    console.log('🧪 Probando multipart/form-data corregido...');
    
    const formData = new FormData();
    
    // Agregar campos de texto exactamente como los envías
    formData.append('title', '7867768');
    formData.append('description', '345345');
    formData.append('youthProfileId', 'cme7crnpe0000y4jzy59dorf0');
    formData.append('isPublic', 'true');
    
    // Crear archivos de prueba
    const cvContent = 'Contenido de prueba para CV';
    const coverContent = 'Contenido de prueba para carta de presentación';
    
    // Crear archivos temporales
    fs.writeFileSync('temp_cv.pdf', cvContent);
    fs.writeFileSync('temp_cover.pdf', coverContent);
    
    // Agregar archivos
    formData.append('cvFile', fs.createReadStream('temp_cv.pdf'), {
      filename: 'Patient_67f038a02491924cbf7b9102.pdf',
      contentType: 'application/pdf'
    });
    formData.append('coverLetterFile', fs.createReadStream('temp_cover.pdf'), {
      filename: 'Backend_SpringBoot_Challenge_Reports.pdf',
      contentType: 'application/pdf'
    });
    
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
testMultipartFixed();
