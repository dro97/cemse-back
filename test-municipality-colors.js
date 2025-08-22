const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMunicipalityColors() {
  try {
    console.log('🎨 Probando colores de municipios...\n');

    // 1. Primero necesitamos hacer login como admin
    console.log('1. Iniciando sesión como admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Cambia por un email válido de admin
      password: 'password123'     // Cambia por una contraseña válida
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Obtener lista de municipios
    console.log('2. Obteniendo lista de municipios...');
    try {
      const municipalitiesResponse = await axios.get(`${BASE_URL}/municipality`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', municipalitiesResponse.status);
      console.log('📋 Total de municipios:', municipalitiesResponse.data.length);
      
      if (municipalitiesResponse.data.length > 0) {
        const firstMunicipality = municipalitiesResponse.data[0];
        console.log('🏛️ Primer municipio:');
        console.log('   - Nombre:', firstMunicipality.name);
        console.log('   - Departamento:', firstMunicipality.department);
        console.log('   - Color primario:', firstMunicipality.primaryColor || 'No definido');
        console.log('   - Color secundario:', firstMunicipality.secondaryColor || 'No definido');
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 3. Obtener municipio específico por ID
    console.log('\n3. Obteniendo municipio específico...');
    try {
      // Primero obtener la lista para tener un ID válido
      const municipalitiesResponse = await axios.get(`${BASE_URL}/municipality`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (municipalitiesResponse.data.length > 0) {
        const municipalityId = municipalitiesResponse.data[0].id;
        const municipalityResponse = await axios.get(`${BASE_URL}/municipality/${municipalityId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', municipalityResponse.status);
        console.log('🏛️ Municipio específico:');
        console.log('   - Nombre:', municipalityResponse.data.name);
        console.log('   - Departamento:', municipalityResponse.data.department);
        console.log('   - Color primario:', municipalityResponse.data.primaryColor || 'No definido');
        console.log('   - Color secundario:', municipalityResponse.data.secondaryColor || 'No definido');
        console.log('   - Tipo de institución:', municipalityResponse.data.institutionType);
        console.log('   - Tipo personalizado:', municipalityResponse.data.customType || 'No definido');
      } else {
        console.log('⚠️ No hay municipios para probar');
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar actualización de colores
    console.log('\n4. Probando actualización de colores...');
    try {
      const municipalitiesResponse = await axios.get(`${BASE_URL}/municipality`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (municipalitiesResponse.data.length > 0) {
        const municipalityId = municipalitiesResponse.data[0].id;
        const updateData = {
          name: municipalitiesResponse.data[0].name,
          department: municipalitiesResponse.data[0].department,
          primaryColor: '#FF6B35',    // Naranja
          secondaryColor: '#004E89'   // Azul
        };
        
        const updateResponse = await axios.put(`${BASE_URL}/municipality/${municipalityId}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Status:', updateResponse.status);
        console.log('🎨 Colores actualizados:');
        console.log('   - Color primario:', updateResponse.data.primaryColor);
        console.log('   - Color secundario:', updateResponse.data.secondaryColor);
      } else {
        console.log('⚠️ No hay municipios para actualizar');
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 5. Probar login como municipio y obtener perfil
    console.log('\n5. Probando login como municipio...');
    try {
      const municipalitiesResponse = await axios.get(`${BASE_URL}/municipality`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (municipalitiesResponse.data.length > 0) {
        const municipality = municipalitiesResponse.data[0];
        
        // Intentar login con el municipio
        const municipalityLoginResponse = await axios.post(`${BASE_URL}/municipality/auth/login`, {
          username: municipality.username,
          password: 'password123' // Asumiendo que es la contraseña por defecto
        });
        
        if (municipalityLoginResponse.data.token) {
          const municipalityToken = municipalityLoginResponse.data.token;
          
          // Obtener perfil del municipio
          const profileResponse = await axios.get(`${BASE_URL}/municipality/auth/profile`, {
            headers: { Authorization: `Bearer ${municipalityToken}` }
          });
          
          console.log('✅ Status:', profileResponse.status);
          console.log('🏛️ Perfil del municipio:');
          console.log('   - Nombre:', profileResponse.data.municipality.name);
          console.log('   - Color primario:', profileResponse.data.municipality.primaryColor || 'No definido');
          console.log('   - Color secundario:', profileResponse.data.municipality.secondaryColor || 'No definido');
        } else {
          console.log('⚠️ No se pudo hacer login como municipio');
        }
      } else {
        console.log('⚠️ No hay municipios para probar login');
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 ¡Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   - Los endpoints de municipios ahora incluyen primaryColor y secondaryColor');
    console.log('   - Se pueden actualizar los colores via PUT /municipality/{id}');
    console.log('   - El perfil del municipio incluye los colores');
    console.log('   - Los colores se devuelven como strings (códigos hexadecimales)');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Verifica que las credenciales de admin sean correctas');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verifica que el servidor esté corriendo en localhost:3001');
    }
  }
}

// Ejecutar las pruebas
testMunicipalityColors();
