const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'your-auth-token-here'; // Reemplazar con token válido

// Función para subir un video
async function uploadVideo(videoFilePath) {
  try {
    console.log('📤 Subiendo video...');
    
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoFilePath));
    
    const response = await axios.post(`${API_BASE_URL}/file-upload/upload/lesson-video`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Video subido exitosamente:', response.data);
    return response.data.videoUrl;
    
  } catch (error) {
    console.error('❌ Error subiendo video:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear una lección con video
async function createVideoLesson(moduleId, videoUrl) {
  try {
    console.log('📝 Creando lección con video...');
    
    const lessonData = {
      title: "Introducción a JavaScript - Video Tutorial",
      description: "Aprende los fundamentos básicos de JavaScript con este video tutorial interactivo",
      content: "En esta lección aprenderás los conceptos básicos de JavaScript incluyendo variables, funciones y control de flujo.",
      moduleId: moduleId,
      contentType: "VIDEO",
      videoUrl: videoUrl,
      duration: 15, // duración en minutos
      orderIndex: 1,
      isRequired: true,
      isPreview: false
    };
    
    const response = await axios.post(`${API_BASE_URL}/lessons`, lessonData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Lección creada exitosamente:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creando lección:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener lecciones de un módulo
async function getModuleLessons(moduleId) {
  try {
    console.log('📚 Obteniendo lecciones del módulo...');
    
    const response = await axios.get(`${API_BASE_URL}/lessons/module/${moduleId}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Lecciones obtenidas:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo lecciones:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🎬 Iniciando prueba de funcionalidad de videos en lecciones...\n');
    
    // Ejemplo de uso:
    // 1. Subir un video (reemplazar con ruta real del video)
    const videoFilePath = './sample-video.mp4'; // Cambiar por ruta real
    const videoUrl = await uploadVideo(videoFilePath);
    
    // 2. Crear una lección con el video
    const moduleId = 'your-module-id-here'; // Reemplazar con ID real del módulo
    const lesson = await createVideoLesson(moduleId, videoUrl);
    
    // 3. Obtener todas las lecciones del módulo
    const lessons = await getModuleLessons(moduleId);
    
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('📊 Resumen:');
    console.log(`- Video subido: ${videoUrl}`);
    console.log(`- Lección creada: ${lesson.id}`);
    console.log(`- Total lecciones en módulo: ${lessons.length}`);
    
  } catch (error) {
    console.error('\n💥 Error en la prueba:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  uploadVideo,
  createVideoLesson,
  getModuleLessons
};
