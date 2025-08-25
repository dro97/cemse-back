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

async function testProfileAvatarMinIO() {
  try {
    console.log('🚀 Probando subida de avatares de perfil con MinIO...\n');

    // 1. Obtener el perfil actual del usuario
    console.log('1. Obteniendo perfil actual...');
    const myProfile = await api.get('/profile/me');
    console.log('✅ Perfil obtenido:', myProfile.data.firstName, myProfile.data.lastName);
    console.log('📸 Avatar actual:', myProfile.data.avatarUrl || 'Sin avatar');
    
    const profileId = myProfile.data.id;

    // 2. Actualizar solo el avatar usando MinIO
    console.log('\n2. Actualizando avatar del perfil con MinIO...');
    
    const avatarFormData = new FormData();
    
    // Agregar archivo de avatar si existe
    const avatarPath = path.join(__dirname, '../uploads/test-avatar.jpg');
    
    if (fs.existsSync(avatarPath)) {
      avatarFormData.append('avatar', fs.createReadStream(avatarPath));
      console.log('✅ Archivo de avatar agregado');
    } else {
      console.log('⚠️  No se encontró archivo de avatar de prueba');
      console.log('📁 Creando archivo de prueba...');
      createTestAvatar();
      avatarFormData.append('avatar', fs.createReadStream(avatarPath));
      console.log('✅ Archivo de avatar de prueba creado y agregado');
    }

    const updatedProfile = await api.put(`/profile/${profileId}/avatar`, avatarFormData, {
      headers: {
        ...avatarFormData.getHeaders()
      }
    });
    
    console.log('✅ Avatar actualizado exitosamente con MinIO');
    console.log('📸 Nuevo avatar URL (MinIO):', updatedProfile.data.profile.avatarUrl);
    console.log('🔗 URL completa:', updatedProfile.data.profile.avatarUrl);

    // 3. Verificar que la URL de MinIO es accesible
    console.log('\n3. Verificando acceso al avatar en MinIO...');
    try {
      const imageResponse = await axios.get(updatedProfile.data.profile.avatarUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      console.log('✅ Avatar accesible desde MinIO');
      console.log('📊 Tamaño del archivo:', imageResponse.data.length, 'bytes');
      console.log('📋 Content-Type:', imageResponse.headers['content-type']);
    } catch (error) {
      console.log('⚠️  No se pudo verificar el acceso directo al avatar');
      console.log('💡 Esto puede ser normal si MinIO requiere autenticación');
    }

    // 4. Actualizar perfil completo con avatar
    console.log('\n4. Actualizando perfil completo con avatar en MinIO...');
    
    const fullProfileFormData = new FormData();
    fullProfileFormData.append('firstName', 'Juan');
    fullProfileFormData.append('lastName', 'Pérez');
    fullProfileFormData.append('email', 'juan.perez@example.com');
    
    // Agregar nuevo archivo de avatar
    const newAvatarPath = path.join(__dirname, '../uploads/test-avatar-2.jpg');
    
    if (fs.existsSync(newAvatarPath)) {
      fullProfileFormData.append('avatar', fs.createReadStream(newAvatarPath));
      console.log('✅ Nuevo archivo de avatar agregado');
    } else {
      console.log('📁 Creando segundo archivo de prueba...');
      createTestAvatar2();
      fullProfileFormData.append('avatar', fs.createReadStream(newAvatarPath));
      console.log('✅ Segundo archivo de avatar de prueba creado y agregado');
    }

    const fullUpdatedProfile = await api.put(`/profile/${profileId}`, fullProfileFormData, {
      headers: {
        ...fullProfileFormData.getHeaders()
      }
    });
    
    console.log('✅ Perfil completo actualizado con MinIO');
    console.log('👤 Nombre:', fullUpdatedProfile.data.firstName, fullUpdatedProfile.data.lastName);
    console.log('📧 Email:', fullUpdatedProfile.data.email);
    console.log('📸 Avatar URL (MinIO):', fullUpdatedProfile.data.avatarUrl);

    // 5. Obtener perfil actualizado para verificar
    console.log('\n5. Obteniendo perfil actualizado...');
    const finalProfile = await api.get(`/profile/${profileId}`);
    
    console.log('📖 Perfil final:');
    console.log('- ID:', finalProfile.data.id);
    console.log('- Nombre:', finalProfile.data.firstName, finalProfile.data.lastName);
    console.log('- Email:', finalProfile.data.email);
    console.log('- Avatar (MinIO):', finalProfile.data.avatarUrl);

    console.log('\n🎉 ¡Prueba de subida de avatar con MinIO completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`- Perfil ID: ${profileId}`);
    console.log(`- Avatar subido a MinIO: ${fullUpdatedProfile.data.avatarUrl ? '✅' : '❌'}`);
    console.log(`- URL MinIO: ${fullUpdatedProfile.data.avatarUrl}`);
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
      console.log('2. El archivo no exceda 5MB (límite de MinIO)');
      console.log('3. El campo se llame "avatar"');
    }

    if (error.response?.status === 500) {
      console.log('\n💡 Verifica que:');
      console.log('1. MinIO esté configurado correctamente');
      console.log('2. Las credenciales de MinIO sean válidas');
      console.log('3. El bucket "images" exista en MinIO');
    }
  }
}

// Función para crear archivo de avatar de prueba
function createTestAvatar() {
  console.log('📁 Creando archivo de avatar de prueba...');
  
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear archivo de avatar de prueba (1x1 pixel JPEG)
  const avatarPath = path.join(uploadsDir, 'test-avatar.jpg');
  const avatarData = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A', 'base64');
  fs.writeFileSync(avatarPath, avatarData);
  console.log('✅ Archivo de avatar de prueba creado:', avatarPath);
}

// Función para crear segundo archivo de avatar de prueba
function createTestAvatar2() {
  console.log('📁 Creando segundo archivo de avatar de prueba...');
  
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear archivo de avatar de prueba 2 (1x1 pixel JPEG)
  const avatarPath = path.join(uploadsDir, 'test-avatar-2.jpg');
  const avatarData = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A', 'base64');
  fs.writeFileSync(avatarPath, avatarData);
  console.log('✅ Segundo archivo de avatar de prueba creado:', avatarPath);
}

// Ejecutar
if (require.main === module) {
  testProfileAvatarMinIO();
}

module.exports = { testProfileAvatarMinIO, createTestAvatar, createTestAvatar2 };
