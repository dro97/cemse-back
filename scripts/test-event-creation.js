const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'YOUR_TOKEN_HERE'; // Reemplaza con tu token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testEventCreation() {
  try {
    console.log('🚀 Probando creación de eventos...\n');

    // 1. Crear evento con featured como string "false"
    console.log('1. Creando evento con featured = "false"...');
    
    const eventData1 = {
      title: "Evento de Prueba 1",
      organizer: "Organizador de Prueba",
      description: "Descripción del evento de prueba",
      date: "2025-07-30T00:00:00.000Z",
      time: "15:46",
      type: "IN_PERSON",
      category: "NETWORKING",
      location: "Ubicación de prueba",
      status: "DRAFT",
      featured: "false", // String "false"
      tags: [],
      requirements: [],
      agenda: [],
      speakers: [],
      registrationDeadline: "2025-07-29T00:00:00.000Z"
    };

    const response1 = await api.post('/events', eventData1);
    console.log('✅ Evento 1 creado exitosamente');
    console.log('📋 ID:', response1.data.id);
    console.log('📋 Featured:', response1.data.featured, '(tipo:', typeof response1.data.featured, ')');

    // 2. Crear evento con featured como string "true"
    console.log('\n2. Creando evento con featured = "true"...');
    
    const eventData2 = {
      title: "Evento de Prueba 2",
      organizer: "Organizador de Prueba",
      description: "Descripción del evento de prueba",
      date: "2025-07-30T00:00:00.000Z",
      time: "15:46",
      type: "IN_PERSON",
      category: "NETWORKING",
      location: "Ubicación de prueba",
      status: "DRAFT",
      featured: "true", // String "true"
      tags: [],
      requirements: [],
      agenda: [],
      speakers: [],
      registrationDeadline: "2025-07-29T00:00:00.000Z"
    };

    const response2 = await api.post('/events', eventData2);
    console.log('✅ Evento 2 creado exitosamente');
    console.log('📋 ID:', response2.data.id);
    console.log('📋 Featured:', response2.data.featured, '(tipo:', typeof response2.data.featured, ')');

    // 3. Crear evento con featured como boolean false
    console.log('\n3. Creando evento con featured = false (boolean)...');
    
    const eventData3 = {
      title: "Evento de Prueba 3",
      organizer: "Organizador de Prueba",
      description: "Descripción del evento de prueba",
      date: "2025-07-30T00:00:00.000Z",
      time: "15:46",
      type: "IN_PERSON",
      category: "NETWORKING",
      location: "Ubicación de prueba",
      status: "DRAFT",
      featured: false, // Boolean false
      tags: [],
      requirements: [],
      agenda: [],
      speakers: [],
      registrationDeadline: "2025-07-29T00:00:00.000Z"
    };

    const response3 = await api.post('/events', eventData3);
    console.log('✅ Evento 3 creado exitosamente');
    console.log('📋 ID:', response3.data.id);
    console.log('📋 Featured:', response3.data.featured, '(tipo:', typeof response3.data.featured, ')');

    // 4. Crear evento con featured como boolean true
    console.log('\n4. Creando evento con featured = true (boolean)...');
    
    const eventData4 = {
      title: "Evento de Prueba 4",
      organizer: "Organizador de Prueba",
      description: "Descripción del evento de prueba",
      date: "2025-07-30T00:00:00.000Z",
      time: "15:46",
      type: "IN_PERSON",
      category: "NETWORKING",
      location: "Ubicación de prueba",
      status: "DRAFT",
      featured: true, // Boolean true
      tags: [],
      requirements: [],
      agenda: [],
      speakers: [],
      registrationDeadline: "2025-07-29T00:00:00.000Z"
    };

    const response4 = await api.post('/events', eventData4);
    console.log('✅ Evento 4 creado exitosamente');
    console.log('📋 ID:', response4.data.id);
    console.log('📋 Featured:', response4.data.featured, '(tipo:', typeof response4.data.featured, ')');

    // 5. Probar actualización de evento
    console.log('\n5. Actualizando evento con featured = "true"...');
    
    const updateData = {
      title: "Evento Actualizado",
      featured: "true" // String "true"
    };

    const updateResponse = await api.put(`/events/${response1.data.id}`, updateData);
    console.log('✅ Evento actualizado exitosamente');
    console.log('📋 Featured después de actualizar:', updateResponse.data.featured, '(tipo:', typeof updateResponse.data.featured, ')');

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('✅ Creación con featured = "false" (string):', response1.data.featured);
    console.log('✅ Creación con featured = "true" (string):', response2.data.featured);
    console.log('✅ Creación con featured = false (boolean):', response3.data.featured);
    console.log('✅ Creación con featured = true (boolean):', response4.data.featured);
    console.log('✅ Actualización con featured = "true" (string):', updateResponse.data.featured);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Asegúrate de:');
      console.log('1. Reemplazar TOKEN con un token válido');
      console.log('2. Tener permisos para crear eventos');
    }
    
    if (error.response?.status === 403) {
      console.log('\n💡 Verifica que:');
      console.log('1. Tengas permisos para crear eventos');
      console.log('2. Seas SuperAdmin, Municipio u Organización');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Verifica que:');
      console.log('1. Todos los campos obligatorios estén completos');
      console.log('2. Los tipos de datos sean correctos');
    }
  }
}

// Ejecutar
if (require.main === module) {
  testEventCreation();
}

module.exports = { testEventCreation };
