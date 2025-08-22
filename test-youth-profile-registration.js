const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testYouthProfileRegistration() {
  try {
    console.log('🚀 Probando registro de perfil de joven...\n');

    // Datos de prueba para el registro
    const youthData = {
      username: 'joven_test_' + Date.now(),
      password: 'password123',
      firstName: 'María',
      lastName: 'González',
      email: `maria.gonzalez.${Date.now()}@test.com`,
      phone: '+591 70012345',
      address: 'Calle Principal 123',
      municipality: 'Cochabamba',
      department: 'Cochabamba',
      country: 'Bolivia',
      birthDate: '2006-03-15',
      gender: 'Femenino',
      documentType: 'CI',
      documentNumber: '12345678',
      educationLevel: 'SECONDARY',
      currentInstitution: 'Colegio María Auxiliadora',
      graduationYear: 2024,
      isStudying: true,
      currentDegree: 'Bachiller en Ciencias',
      universityName: 'Universidad de Cochabamba',
      skills: ['Python', 'Matemáticas', 'Inglés', 'Dibujo'],
      interests: ['Ciencia', 'Matemáticas', 'Arte', 'Tecnología'],
      parentalConsent: true,
      parentEmail: 'padres.gonzalez@test.com'
    };

    console.log('📝 Datos de registro:');
    console.log(JSON.stringify(youthData, null, 2));
    console.log('\n');

    // 1. Registrar perfil de joven
    console.log('1️⃣ Registrando perfil de joven...');
    const registrationResponse = await axios.post(`${API_BASE_URL}/youth-profile/register`, youthData);
    
    console.log('✅ Registro exitoso!');
    console.log('Usuario creado:', registrationResponse.data.user);
    console.log('Perfil creado:', registrationResponse.data.profile);
    console.log('Token recibido:', registrationResponse.data.token.substring(0, 50) + '...');
    console.log('\n');

    const { user, profile, token } = registrationResponse.data;

    // 2. Obtener perfil usando el token
    console.log('2️⃣ Obteniendo perfil con autenticación...');
    const profileResponse = await axios.get(`${API_BASE_URL}/youth-profile/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Perfil obtenido exitosamente!');
    console.log('Datos completos del perfil:', JSON.stringify(profileResponse.data, null, 2));
    console.log('\n');

    // 3. Actualizar perfil
    console.log('3️⃣ Actualizando perfil...');
    const updateData = {
      firstName: 'María Elena',
      lastName: 'González Rodríguez',
      phone: '+591 70054321',
      address: 'Avenida Libertad 456',
      skills: ['Python', 'Matemáticas', 'Inglés', 'Dibujo', 'Programación'],
      interests: ['Ciencia', 'Matemáticas', 'Arte', 'Tecnología', 'Robótica'],
      currentDegree: 'Bachiller en Ciencias con especialización en Matemáticas'
    };

    const updateResponse = await axios.put(`${API_BASE_URL}/youth-profile/${user.id}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Perfil actualizado exitosamente!');
    console.log('Datos actualizados:', JSON.stringify(updateResponse.data, null, 2));
    console.log('\n');

    // 4. Crear una postulación usando el perfil
    console.log('4️⃣ Creando postulación usando el perfil...');
    const applicationData = {
      title: 'Desarrolladora Frontend Junior',
      description: 'Soy una desarrolladora frontend con experiencia en Python y matemáticas. Me apasiona la tecnología y el arte.',
      youthProfileId: user.id,
      isPublic: true
    };

    const applicationResponse = await axios.post(`${API_BASE_URL}/youthapplication`, applicationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Postulación creada exitosamente!');
    console.log('Postulación:', JSON.stringify(applicationResponse.data, null, 2));
    console.log('\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`- Usuario creado: ${user.username}`);
    console.log(`- Perfil ID: ${profile.id}`);
    console.log(`- Postulación ID: ${applicationResponse.data.id}`);
    console.log(`- Token válido: ${token.substring(0, 20)}...`);

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testYouthProfileRegistration();
