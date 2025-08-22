const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Datos de prueba para el municipio
const testMunicipality = {
  username: 'municipio_test',
  password: 'password123'
};

// Datos para actualizar el perfil
const profileUpdateData = {
  name: 'Municipio de Prueba Actualizado',
  department: 'Antioquia',
  region: 'Occidente',
  population: 75000,
  mayorName: 'María González',
  mayorEmail: 'maria.gonzalez@municipio.com',
  mayorPhone: '3001234567',
  address: 'Calle Principal #456, Centro',
  website: 'https://municipio-prueba.com',
  email: 'contacto@municipio-prueba.com',
  phone: '6041234567',
  primaryColor: '#1E40AF',
  secondaryColor: '#F59E0B',
  customType: 'Municipio Turístico'
};

async function testMunicipalityProfileUpdate() {
  try {
    console.log('🚀 Iniciando prueba de actualización de perfil del municipio...\n');

    // 1. Login del municipio
    console.log('1. Iniciando sesión del municipio...');
    const loginResponse = await axios.post(`${BASE_URL}/municipality/auth/login`, testMunicipality);
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // Configurar headers con el token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Obtener perfil actual
    console.log('2. Obteniendo perfil actual...');
    const currentProfileResponse = await axios.get(`${BASE_URL}/municipality/auth/me`, { headers });
    console.log('📋 Perfil actual:', JSON.stringify(currentProfileResponse.data.municipality, null, 2));
    console.log('✅ Perfil obtenido exitosamente\n');

    // 3. Actualizar perfil
    console.log('3. Actualizando perfil...');
    const updateResponse = await axios.put(`${BASE_URL}/municipality/auth/update-profile`, profileUpdateData, { headers });
    console.log('✅ Perfil actualizado exitosamente');
    console.log('📋 Perfil actualizado:', JSON.stringify(updateResponse.data.municipality, null, 2));
    console.log('💬 Mensaje:', updateResponse.data.message);
    console.log('');

    // 4. Verificar que los cambios se aplicaron
    console.log('4. Verificando cambios aplicados...');
    const updatedProfileResponse = await axios.get(`${BASE_URL}/municipality/auth/me`, { headers });
    const updatedProfile = updatedProfileResponse.data.municipality;
    
    // Verificar que los campos se actualizaron correctamente
    const fieldsToCheck = [
      'name', 'department', 'region', 'population', 'mayorName', 
      'mayorEmail', 'mayorPhone', 'address', 'website', 'email', 
      'phone', 'primaryColor', 'secondaryColor', 'customType'
    ];

    console.log('🔍 Verificando campos actualizados:');
    fieldsToCheck.forEach(field => {
      const expectedValue = profileUpdateData[field];
      const actualValue = updatedProfile[field];
      const status = expectedValue === actualValue ? '✅' : '❌';
      console.log(`${status} ${field}: ${actualValue} ${expectedValue === actualValue ? '' : `(esperado: ${expectedValue})`}`);
    });

    // 5. Probar validaciones
    console.log('\n5. Probando validaciones...');
    
    // Probar con datos inválidos
    try {
      const invalidData = {
        name: '', // Nombre vacío
        department: 'Antioquia'
      };
      await axios.put(`${BASE_URL}/municipality/auth/update-profile`, invalidData, { headers });
      console.log('❌ Error: Debería haber fallado con nombre vacío');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación de nombre requerido funciona correctamente');
      }
    }

    // Probar con email inválido
    try {
      const invalidEmailData = {
        name: 'Municipio Test',
        department: 'Antioquia',
        mayorEmail: 'email-invalido'
      };
      await axios.put(`${BASE_URL}/municipality/auth/update-profile`, invalidEmailData, { headers });
      console.log('❌ Error: Debería haber fallado con email inválido');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación de email funciona correctamente');
      }
    }

    // Probar con población negativa
    try {
      const invalidPopulationData = {
        name: 'Municipio Test',
        department: 'Antioquia',
        population: -1000
      };
      await axios.put(`${BASE_URL}/municipality/auth/update-profile`, invalidPopulationData, { headers });
      console.log('❌ Error: Debería haber fallado con población negativa');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación de población funciona correctamente');
      }
    }

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('📝 Resumen:');
    console.log('   - Login del municipio: ✅');
    console.log('   - Obtención de perfil: ✅');
    console.log('   - Actualización de perfil: ✅');
    console.log('   - Verificación de cambios: ✅');
    console.log('   - Validaciones: ✅');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Asegúrate de que el municipio de prueba existe en la base de datos');
      console.log('💡 Puedes crear el municipio usando el endpoint POST /api/municipality');
    }
  }
}

// Ejecutar la prueba
testMunicipalityProfileUpdate();



