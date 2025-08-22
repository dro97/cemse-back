const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001/api';

async function testEventCreationWithFormData() {
  try {
    console.log('🚀 Probando creación de evento con Form Data...\n');

    // Datos del evento
    const eventData = {
      title: 'Evento de Prueba Form Data',
      organizer: 'Organización Test',
      description: 'Descripción del evento de prueba usando form data',
      date: '2025-01-15',
      time: '14:00',
      type: 'IN_PERSON',
      category: 'WORKSHOP',
      location: 'Cochabamba, Bolivia',
      maxCapacity: '50',
      price: '0',
      status: 'DRAFT',
      featured: 'false',
      tags: '["tecnología", "programación", "jóvenes"]',
      requirements: '["Conocimientos básicos de programación"]',
      agenda: '["Introducción", "Taller práctico", "Cierre"]',
      speakers: '["Juan Pérez", "María García"]'
    };

    // Crear FormData
    const formData = new FormData();
    
    // Agregar todos los campos del evento
    Object.keys(eventData).forEach(key => {
      formData.append(key, eventData[key]);
    });

    // Agregar una imagen de prueba si existe
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      formData.append('image', fs.createReadStream(testImagePath));
    }

    console.log('📝 Datos del evento:');
    console.log(JSON.stringify(eventData, null, 2));
    console.log('\n');

    // 1. Crear evento
    console.log('1️⃣ Creando evento con Form Data...');
    const createResponse = await axios.post(`${API_BASE_URL}/events`, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-token-here'}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Evento creado exitosamente!');
    console.log('ID del evento:', createResponse.data.id);
    console.log('Título:', createResponse.data.title);
    console.log('Featured:', createResponse.data.featured);
    console.log('Tags:', createResponse.data.tags);
    console.log('Requirements:', createResponse.data.requirements);
    console.log('Agenda:', createResponse.data.agenda);
    console.log('Speakers:', createResponse.data.speakers);
    console.log('\n');

    const eventId = createResponse.data.id;

    // 2. Obtener el evento creado
    console.log('2️⃣ Obteniendo evento creado...');
    const getResponse = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-token-here'}`
      }
    });
    
    console.log('✅ Evento obtenido exitosamente!');
    console.log('Datos del evento:', JSON.stringify(getResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Función para probar con diferentes formatos de arrays
async function testDifferentArrayFormats() {
  try {
    console.log('\n🔄 Probando diferentes formatos de arrays...\n');

    const testCases = [
      {
        name: 'JSON Array',
        tags: '["tag1", "tag2", "tag3"]',
        requirements: '["req1", "req2"]',
        agenda: '["item1", "item2", "item3"]',
        speakers: '["speaker1", "speaker2"]'
      },
      {
        name: 'Comma Separated',
        tags: 'tag1,tag2,tag3',
        requirements: 'req1,req2',
        agenda: 'item1,item2,item3',
        speakers: 'speaker1,speaker2'
      },
      {
        name: 'Mixed Format',
        tags: '["tag1", "tag2"]',
        requirements: 'req1,req2',
        agenda: '["item1", "item2"]',
        speakers: 'speaker1,speaker2'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📋 Probando: ${testCase.name}`);
      
      const formData = new FormData();
      formData.append('title', `Evento Test - ${testCase.name}`);
      formData.append('organizer', 'Test Organizer');
      formData.append('description', 'Descripción de prueba');
      formData.append('date', '2025-01-20');
      formData.append('time', '15:00');
      formData.append('type', 'VIRTUAL');
      formData.append('category', 'CONFERENCE');
      formData.append('location', 'Online');
      formData.append('status', 'DRAFT');
      formData.append('featured', 'false');
      formData.append('tags', testCase.tags);
      formData.append('requirements', testCase.requirements);
      formData.append('agenda', testCase.agenda);
      formData.append('speakers', testCase.speakers);

      try {
        const response = await axios.post(`${API_BASE_URL}/events`, formData, {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-token-here'}`,
            ...formData.getHeaders()
          }
        });
        
        console.log(`✅ ${testCase.name} - Exitoso`);
        console.log(`   Tags: ${JSON.stringify(response.data.tags)}`);
        console.log(`   Requirements: ${JSON.stringify(response.data.requirements)}`);
        console.log(`   Agenda: ${JSON.stringify(response.data.agenda)}`);
        console.log(`   Speakers: ${JSON.stringify(response.data.speakers)}`);
        console.log('');
        
        // Limpiar el evento de prueba
        await axios.delete(`${API_BASE_URL}/events/${response.data.id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-token-here'}`
          }
        });
        
      } catch (error) {
        console.error(`❌ ${testCase.name} - Error:`, error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error en pruebas de arrays:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🎯 INICIANDO PRUEBAS DE EVENTOS CON FORM DATA\n');
  
  await testEventCreationWithFormData();
  await testDifferentArrayFormats();
  
  console.log('🏁 Pruebas completadas!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEventCreationWithFormData, testDifferentArrayFormats };
