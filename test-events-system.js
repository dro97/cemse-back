const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Función para hacer login y obtener token
async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un evento
async function createEvent(token, eventData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, eventData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creando evento:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener eventos
async function getEvents(token, params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo eventos:', error.response?.data || error.message);
    throw error;
  }
}

// Función para asistir a un evento
async function attendEvent(token, eventId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/events/${eventId}/attend`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error asistiendo al evento:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener mis eventos
async function getMyEvents(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/my-events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mis eventos:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener mis asistencias
async function getMyAttendances(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/my-attendances`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mis asistencias:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function testEventsSystem() {
  console.log('🚀 Iniciando pruebas del sistema de eventos...\n');

  try {
    // 1. Login como super admin
    console.log('1. Login como super admin...');
    const adminToken = await login('admin', 'admin123');
    console.log('✅ Login exitoso como admin\n');

    // 2. Crear un evento
    console.log('2. Creando evento...');
    const eventData = {
      title: 'Startup Pitch Night Cochabamba',
      organizer: 'Startup Hub Bolivia',
      description: 'Una noche increíble para conocer las mejores startups de Cochabamba y conectar con inversores.',
      date: '2024-03-14T19:00:00.000Z',
      time: '19:00 - 22:00',
      type: 'IN_PERSON',
      category: 'NETWORKING',
      location: 'Centro de Convenciones Cochabamba',
      maxCapacity: 100,
      price: 0,
      status: 'PUBLISHED',
      imageUrl: 'https://example.com/event-image.jpg',
      tags: ['startup', 'pitch', 'networking', 'inversión'],
      requirements: ['Interés en emprendimiento', 'Edad mínima 18 años'],
      agenda: [
        '19:00 - Registro y bienvenida',
        '19:30 - Presentaciones de startups',
        '21:00 - Networking y conexiones',
        '22:00 - Cierre'
      ],
      speakers: [
        'Dr. Roberto Silva - Inversionista Ángel',
        'María González - Mentora Startup'
      ],
      featured: true
    };

    const createdEvent = await createEvent(adminToken, eventData);
    console.log('✅ Evento creado:', createdEvent.title);
    console.log('ID del evento:', createdEvent.id, '\n');

    // 3. Crear otro evento
    console.log('3. Creando segundo evento...');
    const eventData2 = {
      title: 'Workshop: Marketing Digital para Emprendedores',
      organizer: 'Digital Entrepreneurs BO',
      description: 'Aprende las mejores estrategias de marketing digital para hacer crecer tu negocio.',
      date: '2024-03-19T14:00:00.000Z',
      time: '14:00 - 17:00',
      type: 'VIRTUAL',
      category: 'WORKSHOP',
      location: 'https://meet.google.com/abc-defg-hij',
      maxCapacity: 200,
      price: 0,
      status: 'PUBLISHED',
      imageUrl: 'https://example.com/workshop-image.jpg',
      tags: ['marketing', 'digital', 'emprendimiento'],
      requirements: ['Conocimientos básicos de internet'],
      agenda: [
        '14:00 - Introducción al marketing digital',
        '14:30 - Estrategias en redes sociales',
        '15:30 - Email marketing',
        '16:30 - SEO y contenido',
        '17:00 - Preguntas y respuestas'
      ],
      speakers: [
        'Ana Martínez - Especialista en Marketing Digital',
        'Carlos López - Consultor de E-commerce'
      ],
      featured: false
    };

    const createdEvent2 = await createEvent(adminToken, eventData2);
    console.log('✅ Segundo evento creado:', createdEvent2.title, '\n');

    // 4. Obtener todos los eventos
    console.log('4. Obteniendo todos los eventos...');
    const allEvents = await getEvents(adminToken);
    console.log('✅ Eventos obtenidos:', allEvents.events.length);
    console.log('📊 Estadísticas:', allEvents.statistics);
    console.log('Eventos:', allEvents.events.map(e => `${e.title} (${e.attendeesCount}/${e.maxCapacity})`), '\n');

    // 5. Login como joven
    console.log('5. Login como joven...');
    const youthToken = await login('joven1', 'password123');
    console.log('✅ Login exitoso como joven\n');

    // 6. Asistir al primer evento
    console.log('6. Asistiendo al primer evento...');
    await attendEvent(youthToken, createdEvent.id);
    console.log('✅ Asistencia registrada exitosamente\n');

    // 7. Obtener mis asistencias
    console.log('7. Obteniendo mis asistencias...');
    const myAttendances = await getMyAttendances(youthToken);
    console.log('✅ Mis asistencias:', myAttendances.length);
    console.log('Eventos a los que asisto:', myAttendances.map(a => a.event.title), '\n');

    // 8. Obtener mis eventos (como admin)
    console.log('8. Obteniendo mis eventos (como admin)...');
    const myEvents = await getMyEvents(adminToken);
    console.log('✅ Mis eventos creados:', myEvents.length);
    console.log('Eventos creados:', myEvents.map(e => `${e.title} - ${e.status}`), '\n');

    // 9. Filtrar eventos
    console.log('9. Filtrando eventos...');
    const featuredEvents = await getEvents(adminToken, { featured: true });
    console.log('✅ Eventos destacados:', featuredEvents.events.length);
    console.log('Eventos destacados:', featuredEvents.events.map(e => e.title), '\n');

    const virtualEvents = await getEvents(adminToken, { type: 'VIRTUAL' });
    console.log('✅ Eventos virtuales:', virtualEvents.events.length);
    console.log('Eventos virtuales:', virtualEvents.events.map(e => e.title), '\n');

    console.log('🎉 ¡Todas las pruebas del sistema de eventos fueron exitosas!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('✅ Creación de eventos');
    console.log('✅ Listado de eventos con estadísticas');
    console.log('✅ Registro de asistencia');
    console.log('✅ Filtros por tipo y destacados');
    console.log('✅ Gestión de mis eventos y asistencias');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testEventsSystem();
