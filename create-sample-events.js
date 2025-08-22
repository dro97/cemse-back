const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function createSampleEvents() {
  try {
    console.log('🎯 Creando eventos de muestra para probar las estadísticas...\n');

    // 1. Primero necesitamos hacer login como admin
    console.log('1. Iniciando sesión como admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Cambia por un email válido de admin
      password: 'password123'     // Cambia por una contraseña válida
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Crear varios eventos de muestra
    const sampleEvents = [
      {
        title: 'Taller de Programación Web',
        organizer: 'Tech Academy',
        description: 'Aprende HTML, CSS y JavaScript desde cero',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días en el futuro
        time: '14:00',
        type: 'IN_PERSON',
        category: 'WORKSHOP',
        location: 'Sala de Conferencias A',
        maxCapacity: 30,
        price: 0,
        status: 'PUBLISHED',
        featured: true,
        tags: ['programación', 'web', 'principiantes'],
        requirements: ['Laptop', 'Conocimientos básicos de computación'],
        agenda: ['Introducción a HTML', 'CSS básico', 'JavaScript intro'],
        speakers: ['Juan Pérez', 'María García']
      },
      {
        title: 'Conferencia de Emprendimiento Juvenil',
        organizer: 'Municipio de la Ciudad',
        description: 'Conoce las mejores prácticas para emprender siendo joven',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días en el futuro
        time: '16:00',
        type: 'HYBRID',
        category: 'CONFERENCE',
        location: 'Auditorio Municipal',
        maxCapacity: 100,
        price: 0,
        status: 'PUBLISHED',
        featured: true,
        tags: ['emprendimiento', 'juventud', 'negocios'],
        requirements: ['Interés en emprender'],
        agenda: ['Panel de emprendedores', 'Workshop práctico', 'Networking'],
        speakers: ['Carlos Rodríguez', 'Ana López', 'Luis Martínez']
      },
      {
        title: 'Hackathon de Innovación Social',
        organizer: 'ONG Innovación Social',
        description: 'Desarrolla soluciones tecnológicas para problemas sociales',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 días en el futuro
        time: '09:00',
        type: 'IN_PERSON',
        category: 'HACKATHON',
        location: 'Centro de Innovación',
        maxCapacity: 50,
        price: 0,
        status: 'PUBLISHED',
        featured: false,
        tags: ['hackathon', 'innovación', 'social'],
        requirements: ['Conocimientos de programación', 'Laptop'],
        agenda: ['Presentación de desafíos', 'Desarrollo de soluciones', 'Presentación de proyectos'],
        speakers: ['Equipo de Innovación Social']
      },
      {
        title: 'Seminario de Liderazgo Juvenil',
        organizer: 'Centro de Liderazgo',
        description: 'Desarrolla tus habilidades de liderazgo y trabajo en equipo',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días en el futuro
        time: '10:00',
        type: 'VIRTUAL',
        category: 'SEMINAR',
        location: 'Zoom Meeting',
        maxCapacity: 200,
        price: 0,
        status: 'PUBLISHED',
        featured: false,
        tags: ['liderazgo', 'juventud', 'desarrollo personal'],
        requirements: ['Conexión a internet', 'Micrófono'],
        agenda: ['Fundamentos del liderazgo', 'Comunicación efectiva', 'Trabajo en equipo'],
        speakers: ['Dr. Elena Fernández', 'Prof. Roberto Silva']
      },
      {
        title: 'Feria de Empleo Juvenil',
        organizer: 'Ministerio de Trabajo',
        description: 'Conecta con empresas y encuentra tu próximo empleo',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días en el futuro
        time: '11:00',
        type: 'IN_PERSON',
        category: 'FAIR',
        location: 'Centro de Convenciones',
        maxCapacity: 500,
        price: 0,
        status: 'PUBLISHED',
        featured: true,
        tags: ['empleo', 'feria', 'oportunidades'],
        requirements: ['CV actualizado', 'Ropa formal'],
        agenda: ['Presentación de empresas', 'Entrevistas', 'Networking'],
        speakers: ['Representantes de 20+ empresas']
      }
    ];

    console.log('2. Creando eventos de muestra...');
    const createdEvents = [];

    for (let i = 0; i < sampleEvents.length; i++) {
      const event = sampleEvents[i];
      console.log(`   Creando evento ${i + 1}: ${event.title}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/events`, event, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        createdEvents.push(response.data);
        console.log(`   ✅ Evento creado con ID: ${response.data.id}`);
      } catch (error) {
        console.log(`   ❌ Error creando evento: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log(`\n✅ Se crearon ${createdEvents.length} eventos exitosamente!\n`);

    // 3. Simular algunos registros de asistencia
    console.log('3. Simulando registros de asistencia...');
    
    // Crear algunos usuarios de prueba para asistir
    const testUsers = [
      { email: 'joven1@test.com', password: 'password123', role: 'YOUTH' },
      { email: 'joven2@test.com', password: 'password123', role: 'YOUTH' },
      { email: 'adolescente1@test.com', password: 'password123', role: 'ADOLESCENTS' }
    ];

    for (const userData of testUsers) {
      try {
        // Intentar registrar al usuario (puede fallar si ya existe)
        await axios.post(`${BASE_URL}/auth/register`, userData);
        console.log(`   ✅ Usuario ${userData.email} registrado`);
      } catch (error) {
        console.log(`   ⚠️ Usuario ${userData.email} ya existe o error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Hacer login con algunos usuarios y registrarlos a eventos
    for (let i = 0; i < Math.min(testUsers.length, createdEvents.length); i++) {
      try {
        const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUsers[i].email,
          password: testUsers[i].password
        });

        const userToken = userLogin.data.token;
        
        // Registrar asistencia a algunos eventos
        for (let j = 0; j < Math.min(3, createdEvents.length); j++) {
          try {
            await axios.post(`${BASE_URL}/events/${createdEvents[j].id}/attend`, {}, {
              headers: { Authorization: `Bearer ${userToken}` }
            });
            console.log(`   ✅ ${testUsers[i].email} registrado en: ${createdEvents[j].title}`);
          } catch (error) {
            console.log(`   ⚠️ Error registrando asistencia: ${error.response?.data?.message || error.message}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error con usuario ${testUsers[i].email}: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 ¡Eventos de muestra creados exitosamente!');
    console.log('\n📋 Ahora puedes probar:');
    console.log('   1. GET /api/events - Para ver todos los eventos y estadísticas globales');
    console.log('   2. GET /api/events/{id} - Para ver un evento específico con sus estadísticas');
    console.log('   3. POST /api/events/{id}/attend - Para registrarte a un evento');
    console.log('   4. GET /api/events/my-events - Para ver tus eventos creados');
    console.log('   5. GET /api/events/my-attendances - Para ver tus asistencias');

  } catch (error) {
    console.error('❌ Error durante la creación de eventos:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Verifica que las credenciales de admin sean correctas');
    } else if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verifica que el servidor esté corriendo en localhost:3001');
    }
  }
}

// Ejecutar la creación de eventos
createSampleEvents();
