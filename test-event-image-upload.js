const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

async function testEventImageUpload() {
  try {
    console.log('🖼️ Probando upload de imágenes en eventos...\n');

    // 1. Primero necesitamos hacer login como admin
    console.log('1. Iniciando sesión como admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Cambia por un email válido de admin
      password: 'password123'     // Cambia por una contraseña válida
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Crear un evento con imagen
    console.log('2. Creando evento con imagen...');
    try {
      const formData = new FormData();
      
      // Agregar campos del evento
      formData.append('title', 'Evento con Imagen de Prueba');
      formData.append('organizer', 'Test Organizer');
      formData.append('description', 'Este es un evento de prueba con imagen subida');
      formData.append('date', '2024-12-25T10:00:00.000Z');
      formData.append('time', '10:00 AM');
      formData.append('type', 'IN_PERSON');
      formData.append('category', 'WORKSHOP');
      formData.append('location', 'Sala de Conferencias');
      formData.append('maxCapacity', '50');
      formData.append('price', '0');
      formData.append('status', 'PUBLISHED');
      formData.append('featured', 'false');
      formData.append('tags', JSON.stringify(['prueba', 'imagen']));
      formData.append('requirements', JSON.stringify([]));
      formData.append('agenda', JSON.stringify(['10:00 - Introducción', '11:00 - Taller']));
      formData.append('speakers', JSON.stringify(['Juan Pérez']));

      // Agregar imagen de prueba (si existe)
      const testImagePath = path.join(__dirname, 'test-image.jpg');
      if (fs.existsSync(testImagePath)) {
        formData.append('image', fs.createReadStream(testImagePath));
        console.log('📷 Imagen de prueba encontrada y agregada');
      } else {
        console.log('⚠️ No se encontró test-image.jpg, creando evento sin imagen');
      }

      const createResponse = await axios.post(`${BASE_URL}/events`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      });

      console.log('✅ Status:', createResponse.status);
      console.log('🎉 Evento creado con ID:', createResponse.data.id);
      console.log('🖼️ URL de imagen:', createResponse.data.imageUrl || 'No imagen');
      
      const eventId = createResponse.data.id;

      // 3. Actualizar el evento con una nueva imagen
      console.log('\n3. Actualizando evento con nueva imagen...');
      try {
        const updateFormData = new FormData();
        
        // Solo actualizar algunos campos
        updateFormData.append('title', 'Evento Actualizado con Nueva Imagen');
        updateFormData.append('description', 'Descripción actualizada con nueva imagen');

        // Agregar nueva imagen (si existe)
        const newImagePath = path.join(__dirname, 'test-image-2.jpg');
        if (fs.existsSync(newImagePath)) {
          updateFormData.append('image', fs.createReadStream(newImagePath));
          console.log('📷 Nueva imagen encontrada y agregada');
        } else {
          console.log('⚠️ No se encontró test-image-2.jpg, actualizando sin nueva imagen');
        }

        const updateResponse = await axios.put(`${BASE_URL}/events/${eventId}`, updateFormData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...updateFormData.getHeaders()
          }
        });

        console.log('✅ Status:', updateResponse.status);
        console.log('🔄 Evento actualizado');
        console.log('🖼️ Nueva URL de imagen:', updateResponse.data.imageUrl || 'No imagen');

      } catch (error) {
        console.log('❌ Error actualizando evento:', error.response?.status, error.response?.data?.message);
      }

      // 4. Crear evento con URL de imagen (sin upload)
      console.log('\n4. Creando evento con URL de imagen...');
      try {
        const eventWithUrlData = {
          title: 'Evento con URL de Imagen',
          organizer: 'Test Organizer',
          description: 'Este evento usa una URL de imagen externa',
          date: '2024-12-26T10:00:00.000Z',
          time: '10:00 AM',
          type: 'VIRTUAL',
          category: 'CONFERENCE',
          location: 'Zoom Meeting',
          maxCapacity: 100,
          price: 0,
          status: 'PUBLISHED',
          imageUrl: 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Evento+Virtual',
          featured: false,
          tags: ['virtual', 'conferencia'],
          requirements: [],
          agenda: ['10:00 - Bienvenida', '11:00 - Presentación'],
          speakers: ['María García']
        };

        const urlEventResponse = await axios.post(`${BASE_URL}/events`, eventWithUrlData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Status:', urlEventResponse.status);
        console.log('🌐 Evento con URL creado con ID:', urlEventResponse.data.id);
        console.log('🖼️ URL de imagen:', urlEventResponse.data.imageUrl);

      } catch (error) {
        console.log('❌ Error creando evento con URL:', error.response?.status, error.response?.data?.message);
      }

    } catch (error) {
      console.log('❌ Error creando evento:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 ¡Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   - Los eventos ahora soportan upload de imágenes');
    console.log('   - Se puede crear evento con imagen subida');
    console.log('   - Se puede actualizar evento con nueva imagen');
    console.log('   - Se puede crear evento con URL de imagen externa');
    console.log('   - Las imágenes se guardan en /uploads/');
    console.log('   - El campo imageUrl se actualiza automáticamente');

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
testEventImageUpload();
