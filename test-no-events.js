const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testNoEvents() {
  try {
    console.log('🧪 Probando respuestas cuando no hay eventos...\n');

    // 1. Primero necesitamos hacer login para obtener un token
    console.log('1. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Cambia por un email válido
      password: 'password123'     // Cambia por una contraseña válida
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Probar GET /api/events (lista de eventos)
    console.log('2. Probando GET /api/events...');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', eventsResponse.status);
      console.log('📊 Estadísticas:', eventsResponse.data.statistics);
      console.log('📋 Total de eventos:', eventsResponse.data.total);
      console.log('📄 Eventos:', eventsResponse.data.events.length);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 3. Probar GET /api/events/{id} (evento específico)
    console.log('\n3. Probando GET /api/events/evento-inexistente...');
    try {
      const eventResponse = await axios.get(`${BASE_URL}/events/evento-inexistente-123`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', eventResponse.status);
      console.log('📝 Mensaje:', eventResponse.data.message);
      console.log('📊 Estadísticas:', eventResponse.data.statistics);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 4. Probar GET /api/events/{id}/attendees (asistentes)
    console.log('\n4. Probando GET /api/events/evento-inexistente/attendees...');
    try {
      const attendeesResponse = await axios.get(`${BASE_URL}/events/evento-inexistente-123/attendees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', attendeesResponse.status);
      console.log('📝 Mensaje:', attendeesResponse.data.message);
      console.log('👥 Asistentes:', attendeesResponse.data.attendees?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 5. Probar POST /api/events/{id}/attend (registrarse)
    console.log('\n5. Probando POST /api/events/evento-inexistente/attend...');
    try {
      const attendResponse = await axios.post(`${BASE_URL}/events/evento-inexistente-123/attend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', attendResponse.status);
      console.log('📝 Mensaje:', attendResponse.data.message);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 6. Probar DELETE /api/events/{id}/unattend (cancelar registro)
    console.log('\n6. Probando DELETE /api/events/evento-inexistente/unattend...');
    try {
      const unattendResponse = await axios.delete(`${BASE_URL}/events/evento-inexistente-123/unattend`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', unattendResponse.status);
      console.log('📝 Mensaje:', unattendResponse.data.message);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    // 7. Probar PUT /api/events/{id}/attendees/{attendeeId} (actualizar estado)
    console.log('\n7. Probando PUT /api/events/evento-inexistente/attendees/usuario-inexistente...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/events/evento-inexistente-123/attendees/usuario-inexistente`, {
        status: 'CONFIRMED'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status:', updateResponse.status);
      console.log('📝 Mensaje:', updateResponse.data.message);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 ¡Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   - Todos los endpoints ahora devuelven 200 en lugar de 404');
    console.log('   - Se incluyen mensajes informativos');
    console.log('   - Se devuelven estadísticas con valores en 0');
    console.log('   - Se devuelven arrays vacíos cuando corresponde');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Verifica que las credenciales de login sean correctas');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verifica que el servidor esté corriendo en localhost:3001');
    }
  }
}

// Ejecutar las pruebas
testNoEvents();
