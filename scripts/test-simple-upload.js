const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const YOUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtdjFhYmMxMjNkZWY0NTYiLCJ0eXBlIjoidXNlciIsImlhdCI6MTczNDI5NzYwMCwiZXhwIjoxNzM0Mzg0MDAwfQ.example'; // Reemplaza con token real

async function testSimpleUpload() {
  try {
    console.log('🧪 Probando creación simple sin archivos...');
    
    const applicationData = {
      title: '12312321',
      description: '312312312312',
      youthProfileId: 'cme7crnpe0000y4jzy59dorf0',
      isPublic: 'true'
    };
    
    const response = await axios.post(`${API_BASE_URL}/youthapplication/json`, applicationData, {
      headers: {
        'Authorization': `Bearer ${YOUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Postulación creada exitosamente:', response.data);
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
testSimpleUpload();
