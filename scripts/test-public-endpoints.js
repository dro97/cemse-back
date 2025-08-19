const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testPublicEndpoints() {
  console.log('🧪 Probando endpoints públicos de municipios e instituciones...\n');

  try {
    // Test municipios públicos
    console.log('📋 Probando GET /api/municipality/public');
    const municipalitiesResponse = await axios.get(`${BASE_URL}/municipality/public`);
    console.log('✅ Municipios obtenidos exitosamente');
    console.log(`📊 Total de municipios: ${municipalitiesResponse.data.length}`);
    
    if (municipalitiesResponse.data.length > 0) {
      console.log('📝 Primeros 3 municipios:');
      municipalitiesResponse.data.slice(0, 3).forEach((municipality, index) => {
        console.log(`   ${index + 1}. ${municipality.name} - ${municipality.department}`);
      });
    }
    console.log('');

    // Test instituciones públicas
    console.log('🏛️ Probando GET /api/institution/public');
    const institutionsResponse = await axios.get(`${BASE_URL}/institution/public`);
    console.log('✅ Instituciones obtenidas exitosamente');
    console.log(`📊 Total de instituciones: ${institutionsResponse.data.length}`);
    
    if (institutionsResponse.data.length > 0) {
      console.log('📝 Primeras 3 instituciones:');
      institutionsResponse.data.slice(0, 3).forEach((institution, index) => {
        console.log(`   ${index + 1}. ${institution.name} - ${institution.department} (${institution.institutionType})`);
      });
    }
    console.log('');

    // Test que los endpoints protegidos requieren autenticación
    console.log('🔒 Probando que endpoints protegidos requieren autenticación...');
    
    try {
      await axios.get(`${BASE_URL}/municipality`);
      console.log('❌ Error: El endpoint protegido de municipios debería requerir autenticación');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Endpoint protegido de municipios correctamente requiere autenticación');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    try {
      await axios.get(`${BASE_URL}/institution`);
      console.log('❌ Error: El endpoint protegido de instituciones debería requerir autenticación');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Endpoint protegido de instituciones correctamente requiere autenticación');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de endpoints disponibles:');
    console.log('   • GET /api/municipality/public - Lista pública de municipios');
    console.log('   • GET /api/institution/public - Lista pública de instituciones');
    console.log('   • GET /api/municipality - Lista protegida de municipios (requiere auth)');
    console.log('   • GET /api/institution - Lista protegida de instituciones (requiere auth)');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testPublicEndpoints();
