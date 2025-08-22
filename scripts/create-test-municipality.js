const axios = require('axios');
const bcrypt = require('bcrypt');

const BASE_URL = 'http://localhost:3001/api';

// Datos del municipio de prueba
const testMunicipalityData = {
  name: 'Municipio de Prueba',
  department: 'Antioquia',
  region: 'Occidente',
  population: 50000,
  mayorName: 'Juan Pérez',
  mayorEmail: 'juan.perez@municipio.com',
  mayorPhone: '3001234567',
  address: 'Calle Principal #123, Centro',
  website: 'https://municipio-prueba.com',
  username: 'municipio_test',
  password: 'password123',
  email: 'contacto@municipio-prueba.com',
  phone: '6041234567',
  primaryColor: '#3B82F6',
  secondaryColor: '#F59E0B',
  customType: 'Municipio de Desarrollo',
  isActive: true
};

async function createTestMunicipality() {
  try {
    console.log('🚀 Creando municipio de prueba...\n');

    // Primero, necesitamos hacer login como SuperAdmin para crear el municipio
    console.log('1. Iniciando sesión como SuperAdmin...');
    
    // Intentar login con credenciales comunes de SuperAdmin
    const superAdminCredentials = {
      username: 'admin',
      password: 'admin123'
    };

    let adminToken;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, superAdminCredentials);
      adminToken = loginResponse.data.token;
      console.log('✅ Login como SuperAdmin exitoso');
    } catch (error) {
      console.log('❌ No se pudo hacer login como SuperAdmin');
      console.log('💡 Asegúrate de que existe un usuario SuperAdmin con username: admin y password: admin123');
      console.log('💡 O modifica las credenciales en este script');
      return;
    }

    const adminHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // 2. Verificar si el municipio ya existe
    console.log('\n2. Verificando si el municipio ya existe...');
    try {
      const existingMunicipalities = await axios.get(`${BASE_URL}/municipality`, { headers: adminHeaders });
      const existingMunicipality = existingMunicipalities.data.municipalities.find(
        m => m.username === testMunicipalityData.username
      );

      if (existingMunicipality) {
        console.log('✅ El municipio de prueba ya existe');
        console.log('📋 ID del municipio:', existingMunicipality.id);
        console.log('📋 Nombre:', existingMunicipality.name);
        console.log('📋 Username:', existingMunicipality.username);
        console.log('\n💡 Puedes usar estas credenciales para probar:');
        console.log('   Username: municipio_test');
        console.log('   Password: password123');
        return;
      }
    } catch (error) {
      console.log('⚠️ No se pudo verificar municipios existentes, continuando...');
    }

    // 3. Crear el municipio
    console.log('\n3. Creando municipio de prueba...');
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(testMunicipalityData.password, 10);
    
    const municipalityData = {
      ...testMunicipalityData,
      password: hashedPassword
    };

    const createResponse = await axios.post(`${BASE_URL}/municipality`, municipalityData, { headers: adminHeaders });
    
    console.log('✅ Municipio creado exitosamente');
    console.log('📋 ID del municipio:', createResponse.data.municipality.id);
    console.log('📋 Nombre:', createResponse.data.municipality.name);
    console.log('📋 Username:', createResponse.data.municipality.username);

    // 4. Probar login del municipio creado
    console.log('\n4. Probando login del municipio creado...');
    const municipalityLoginData = {
      username: testMunicipalityData.username,
      password: testMunicipalityData.password
    };

    const municipalityLoginResponse = await axios.post(`${BASE_URL}/municipality/auth/login`, municipalityLoginData);
    console.log('✅ Login del municipio exitoso');
    console.log('📋 Token obtenido:', municipalityLoginResponse.data.token.substring(0, 20) + '...');

    console.log('\n🎉 ¡Municipio de prueba creado exitosamente!');
    console.log('📝 Credenciales para usar en las pruebas:');
    console.log('   Username: municipio_test');
    console.log('   Password: password123');
    console.log('\n💡 Ahora puedes ejecutar el script de prueba:');
    console.log('   node scripts/test-municipality-profile-update.js');

  } catch (error) {
    console.error('❌ Error creando municipio de prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 Verifica que todos los campos requeridos estén presentes');
    } else if (error.response?.status === 401) {
      console.log('💡 Verifica que tengas permisos de SuperAdmin');
    } else if (error.response?.status === 409) {
      console.log('💡 El municipio ya existe con ese nombre o username');
    }
  }
}

// Ejecutar el script
createTestMunicipality();

