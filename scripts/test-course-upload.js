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

async function testCourseUpload() {
  try {
    console.log('🚀 Probando subida de archivos de cursos...\n');

    // 1. Crear un curso con imagen de portada y video de presentación
    console.log('1. Creando curso con archivos...');
    
    const formData = new FormData();
    
    // Datos del curso
    formData.append('title', 'Curso de Desarrollo Web con Archivos');
    formData.append('slug', 'desarrollo-web-archivos');
    formData.append('description', 'Aprende desarrollo web con HTML, CSS y JavaScript');
    formData.append('shortDescription', 'Curso completo de desarrollo web');
    formData.append('level', 'BEGINNER');
    formData.append('category', 'TECHNICAL_SKILLS');
    formData.append('duration', '480');
    formData.append('price', '0');
    formData.append('isActive', 'true');
    formData.append('certification', 'true');
    
    // Arrays como strings (se procesarán en el backend)
    formData.append('objectives', JSON.stringify([
      'Crear páginas web responsivas',
      'Programar en JavaScript',
      'Entender CSS avanzado'
    ]));
    
    formData.append('prerequisites', JSON.stringify([
      'Conocimientos básicos de computación'
    ]));
    
    formData.append('tags', JSON.stringify([
      'programación', 'web', 'frontend', 'javascript'
    ]));
    
    formData.append('includedMaterials', JSON.stringify([
      'PDFs de teoría',
      'Videos explicativos',
      'Ejercicios prácticos'
    ]));

    // Agregar archivos si existen
    const thumbnailPath = path.join(__dirname, '../uploads/test-thumbnail.jpg');
    const videoPath = path.join(__dirname, '../uploads/test-video.mp4');
    
    if (fs.existsSync(thumbnailPath)) {
      formData.append('thumbnail', fs.createReadStream(thumbnailPath));
      console.log('✅ Imagen de portada agregada');
    } else {
      console.log('⚠️  No se encontró imagen de portada de prueba');
    }
    
    if (fs.existsSync(videoPath)) {
      formData.append('videoPreview', fs.createReadStream(videoPath));
      console.log('✅ Video de presentación agregado');
    } else {
      console.log('⚠️  No se encontró video de presentación de prueba');
    }

    const course = await api.post('/course', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Curso creado:', course.data.title);
    console.log('📸 Thumbnail:', course.data.thumbnail);
    console.log('🎥 Video Preview:', course.data.videoPreview);
    const courseId = course.data.id;

    // 2. Actualizar el curso con nuevos archivos
    console.log('\n2. Actualizando curso con nuevos archivos...');
    
    const updateFormData = new FormData();
    updateFormData.append('title', 'Curso de Desarrollo Web Actualizado');
    updateFormData.append('description', 'Descripción actualizada del curso');
    
    // Agregar nuevos archivos si existen
    const newThumbnailPath = path.join(__dirname, '../uploads/test-thumbnail-2.jpg');
    const newVideoPath = path.join(__dirname, '../uploads/test-video-2.mp4');
    
    if (fs.existsSync(newThumbnailPath)) {
      updateFormData.append('thumbnail', fs.createReadStream(newThumbnailPath));
      console.log('✅ Nueva imagen de portada agregada');
    }
    
    if (fs.existsSync(newVideoPath)) {
      updateFormData.append('videoPreview', fs.createReadStream(newVideoPath));
      console.log('✅ Nuevo video de presentación agregado');
    }

    const updatedCourse = await api.put(`/course/${courseId}`, updateFormData, {
      headers: {
        ...updateFormData.getHeaders()
      }
    });
    
    console.log('✅ Curso actualizado:', updatedCourse.data.title);
    console.log('📸 Nuevo Thumbnail:', updatedCourse.data.thumbnail);
    console.log('🎥 Nuevo Video Preview:', updatedCourse.data.videoPreview);

    // 3. Obtener el curso para verificar los archivos
    console.log('\n3. Obteniendo curso para verificar archivos...');
    const retrievedCourse = await api.get(`/course/${courseId}`);
    
    console.log('📖 Detalles del curso:');
    console.log('- Título:', retrievedCourse.data.title);
    console.log('- Thumbnail:', retrievedCourse.data.thumbnail);
    console.log('- Video Preview:', retrievedCourse.data.videoPreview);
    
    if (retrievedCourse.data.thumbnail) {
      console.log('🔗 URL de thumbnail:', `http://localhost:3001${retrievedCourse.data.thumbnail}`);
    }
    
    if (retrievedCourse.data.videoPreview) {
      console.log('🔗 URL de video:', `http://localhost:3001${retrievedCourse.data.videoPreview}`);
    }

    // 4. Obtener preview del curso
    console.log('\n4. Obteniendo preview del curso...');
    const coursePreview = await api.get(`/course/${courseId}/preview`);
    
    console.log('👀 Preview del curso:');
    console.log('- Título:', coursePreview.data.title);
    console.log('- Thumbnail:', coursePreview.data.thumbnail);
    console.log('- Video Preview:', coursePreview.data.videoPreview);

    console.log('\n🎉 ¡Prueba de subida de archivos completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`- Curso creado con ID: ${courseId}`);
    console.log(`- Archivos subidos: ${course.data.thumbnail ? 'Thumbnail ✅' : 'Thumbnail ❌'}, ${course.data.videoPreview ? 'Video ✅' : 'Video ❌'}`);
    console.log(`- Curso actualizado con nuevos archivos`);
    console.log(`- URLs de archivos verificadas`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Asegúrate de:');
      console.log('1. Reemplazar TOKEN con un token válido');
      console.log('2. Tener permisos de SUPERADMIN o institución');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Verifica que:');
      console.log('1. Los archivos sean del tipo correcto');
      console.log('2. Los campos requeridos estén completos');
      console.log('3. Los enums tengan valores válidos');
    }
  }
}

// Función para crear archivos de prueba
function createTestFiles() {
  console.log('📁 Creando archivos de prueba...');
  
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Crear archivo de imagen de prueba (1x1 pixel JPEG)
  const thumbnailPath = path.join(uploadsDir, 'test-thumbnail.jpg');
  const thumbnailData = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A', 'base64');
  fs.writeFileSync(thumbnailPath, thumbnailData);
  console.log('✅ Archivo de imagen de prueba creado:', thumbnailPath);
  
  // Crear archivo de video de prueba (archivo vacío con extensión .mp4)
  const videoPath = path.join(uploadsDir, 'test-video.mp4');
  fs.writeFileSync(videoPath, '');
  console.log('✅ Archivo de video de prueba creado:', videoPath);
  
  // Crear archivos adicionales para actualización
  const thumbnailPath2 = path.join(uploadsDir, 'test-thumbnail-2.jpg');
  fs.writeFileSync(thumbnailPath2, thumbnailData);
  console.log('✅ Archivo de imagen de prueba 2 creado:', thumbnailPath2);
  
  const videoPath2 = path.join(uploadsDir, 'test-video-2.mp4');
  fs.writeFileSync(videoPath2, '');
  console.log('✅ Archivo de video de prueba 2 creado:', videoPath2);
}

// Ejecutar
if (require.main === module) {
  createTestFiles();
  testCourseUpload();
}

module.exports = { testCourseUpload, createTestFiles };
