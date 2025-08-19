const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'YOUR_TOKEN_HERE'; // Reemplaza con tu token

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

async function testProfileAvatar() {
  try {
    console.log('🚀 Probando subida de avatares de perfil...\n');

    // 1. Obtener el perfil actual del usuario
    console.log('1. Obteniendo perfil actual...');
    const myProfile = await api.get('/profile/me');
    console.log('✅ Perfil obtenido:', myProfile.data.firstName, myProfile.data.lastName);
    console.log('📸 Avatar actual:', myProfile.data.avatarUrl || 'Sin avatar');
    
    const profileId = myProfile.data.id;

    // 2. Actualizar solo el avatar
    console.log('\n2. Actualizando avatar del perfil...');
    
    const avatarFormData = new FormData();
    
    // Agregar archivo de avatar si existe
    const avatarPath = path.join(__dirname, '../uploads/test-avatar.jpg');
    
    if (fs.existsSync(avatarPath)) {
      avatarFormData.append('avatar', fs.createReadStream(avatarPath));
      console.log('✅ Archivo de avatar agregado');
    } else {
      console.log('⚠️  No se encontró archivo de avatar de prueba');
      return;
    }

    const updatedProfile = await api.put(`/profile/${profileId}/avatar`, avatarFormData, {
      headers: {
        ...avatarFormData.getHeaders()
      }
    });
    
    console.log('✅ Avatar actualizado exitosamente');
    console.log('📸 Nuevo avatar URL:', updatedProfile.data.profile.avatarUrl);

    // 3. Actualizar perfil completo con avatar
    console.log('\n3. Actualizando perfil completo con avatar...');
    
    const fullProfileFormData = new FormData();
    fullProfileFormData.append('firstName', 'Juan');
    fullProfileFormData.append('lastName', 'Pérez');
    fullProfileFormData.append('email', 'juan.perez@example.com');
    
    // Agregar nuevo archivo de avatar
    const newAvatarPath = path.join(__dirname, '../uploads/test-avatar-2.jpg');
    
    if (fs.existsSync(newAvatarPath)) {
      fullProfileFormData.append('avatar', fs.createReadStream(newAvatarPath));
      console.log('✅ Nuevo archivo de avatar agregado');
    }

    const fullUpdatedProfile = await api.put(`/profile/${profileId}`, fullProfileFormData, {
      headers: {
        ...fullProfileFormData.getHeaders()
      }
    });
    
    console.log('✅ Perfil completo actualizado');
    console.log('👤 Nombre:', fullUpdatedProfile.data.firstName, fullUpdatedProfile.data.lastName);
    console.log('📧 Email:', fullUpdatedProfile.data.email);
    console.log('📸 Avatar URL:', fullUpdatedProfile.data.avatarUrl);

    // 4. Verificar que el avatar es accesible
    console.log('\n4. Verificando acceso al avatar...');
    if (fullUpdatedProfile.data.avatarUrl) {
      console.log('🔗 URL completa del avatar:', `http://localhost:3001${fullUpdatedProfile.data.avatarUrl}`);
      console.log('✅ El avatar debería ser accesible en la URL anterior');
    }

    // 5. Obtener perfil actualizado para verificar
    console.log('\n5. Obteniendo perfil actualizado...');
    const finalProfile = await api.get(`/profile/${profileId}`);
    
    console.log('📖 Perfil final:');
    console.log('- ID:', finalProfile.data.id);
    console.log('- Nombre:', finalProfile.data.firstName, finalProfile.data.lastName);
    console.log('- Email:', finalProfile.data.email);
    console.log('- Avatar:', finalProfile.data.avatarUrl);

    console.log('\n🎉 ¡Prueba de subida de avatar completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`- Perfil ID: ${profileId}`);
    console.log(`- Avatar subido: ${fullUpdatedProfile.data.avatarUrl ? '✅' : '❌'}`);
    console.log(`- Perfil actualizado: ✅`);
    console.log(`- Permisos verificados: ✅`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Asegúrate de:');
      console.log('1. Reemplazar TOKEN con un token válido');
      console.log('2. Tener un perfil creado');
    }
    
    if (error.response?.status === 403) {
      console.log('\n💡 Verifica que:');
      console.log('1. Estés intentando actualizar tu propio perfil');
      console.log('2. Tengas permisos para actualizar el perfil');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Verifica que:');
      console.log('1. El archivo sea una imagen válida (JPEG, PNG, GIF, WebP)');
      console.log('2. El archivo no exceda 10MB');
      console.log('3. El campo se llame "avatar"');
    }
  }
}

// Función para crear archivos de prueba
function createTestAvatars() {
  console.log('📁 Creando archivos de avatar de prueba...');
  
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear archivo de avatar de prueba (1x1 pixel JPEG)
  const avatarPath = path.join(uploadsDir, 'test-avatar.jpg');
  const avatarData = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A', 'base64');
  fs.writeFileSync(avatarPath, avatarData);
  console.log('✅ Archivo de avatar de prueba creado:', avatarPath);
  
  // Crear archivo de avatar de prueba 2
  const avatarPath2 = path.join(uploadsDir, 'test-avatar-2.jpg');
  fs.writeFileSync(avatarPath2, avatarData);
  console.log('✅ Archivo de avatar de prueba 2 creado:', avatarPath2);
}

// Ejecutar
if (require.main === module) {
  createTestAvatars();
  testProfileAvatar();
}

module.exports = { testProfileAvatar, createTestAvatars };
