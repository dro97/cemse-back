const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const YOUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtdjFhYmMxMjNkZWY0NTYiLCJ0eXBlIjoidXNlciIsImlhdCI6MTczNDI5NzYwMCwiZXhwIjoxNzM0Mzg0MDAwfQ.example'; // Reemplaza con token real

async function testCreateYouthApplication() {
  try {
    console.log('🧪 Probando creación de postulación de joven...');
    
    // Usar JSON en lugar de multipart/form-data para la prueba
    const applicationData = {
      title: 'Desarrollador Frontend Junior',
      description: 'Soy un desarrollador frontend con experiencia en React y JavaScript',
      youthProfileId: 'cmv1abc123def456', // Reemplaza con ID real
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
    throw error;
  }
}

// Ejecutar prueba
testCreateYouthApplication();
