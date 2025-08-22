const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEventStatistics() {
  try {
    console.log('🔍 Probando sistema de estadísticas de eventos...\n');

    // 1. Primero necesitamos hacer login para obtener un token
    console.log('1. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Cambia por un email válido
      password: 'password123'     // Cambia por una contraseña válida
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Obtener estadísticas generales (esto incluye las estadísticas)
    console.log('2. Obteniendo estadísticas de eventos...');
    const statsResponse = await axios.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Estadísticas obtenidas:');
    console.log(JSON.stringify(statsResponse.data.statistics, null, 2));
    console.log(`📋 Total de eventos: ${statsResponse.data.total}`);
    console.log(`📄 Página actual: ${statsResponse.data.page}`);
    console.log(`📚 Total de páginas: ${statsResponse.data.totalPages}\n`);

    // 3. Si hay eventos, probar obtener uno específico
    if (statsResponse.data.events.length > 0) {
      const firstEvent = statsResponse.data.events[0];
      console.log(`3. Probando obtener evento específico (ID: ${firstEvent.id})...`);
      
      const eventResponse = await axios.get(`${BASE_URL}/events/${firstEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Evento específico obtenido correctamente');
      console.log(`📝 Título: ${eventResponse.data.title}`);
      console.log(`👥 Asistentes: ${eventResponse.data.attendeesCount}`);
      console.log(`👀 Vistas: ${eventResponse.data.viewsCount}\n`);
    } else {
      console.log('⚠️ No hay eventos para probar. Creando un evento de prueba...');
      
      // Crear un evento de prueba
      const newEvent = {
        title: 'Evento de Prueba',
        organizer: 'Organización de Prueba',
        description: 'Descripción del evento de prueba',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días en el futuro
        time: '14:00',
        type: 'IN_PERSON',
        category: 'WORKSHOP',
        location: 'Sala de Conferencias',
        maxCapacity: 50,
        price: 0,
        status: 'PUBLISHED',
        featured: false
      };

      const createResponse = await axios.post(`${BASE_URL}/events`, newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Evento de prueba creado');
      console.log(`📝 ID: ${createResponse.data.id}`);
      console.log(`📝 Título: ${createResponse.data.title}\n`);
    }

    // 4. Probar con un ID inexistente para ver el error
    console.log('4. Probando con ID inexistente para ver el error...');
    try {
      await axios.get(`${BASE_URL}/events/evento-inexistente-123`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Error esperado recibido: "Evento no encontrado"');
        console.log(`📝 Mensaje: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

    console.log('🎉 Pruebas completadas exitosamente!');

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
testEventStatistics();
