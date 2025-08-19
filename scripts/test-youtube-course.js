const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = 'your-auth-token-here'; // Reemplazar con token válido

// Función para probar el endpoint de preview
async function testCoursePreview(courseId) {
  try {
    console.log('🔍 Probando endpoint de preview del curso...');
    
    const response = await axios.get(`${API_BASE_URL}/course/${courseId}/preview`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Preview del curso obtenido exitosamente');
    console.log('📋 Información del preview:');
    console.log(`   - Título: ${response.data.title}`);
    console.log(`   - Video Preview: ${response.data.videoPreview}`);
    console.log(`   - Duración: ${response.data.duration} minutos`);
    console.log(`   - Lecciones: ${response.data.totalLessons}`);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo preview:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar el endpoint completo del curso
async function testFullCourse(courseId) {
  try {
    console.log('📚 Probando endpoint completo del curso...');
    
    const response = await axios.get(`${API_BASE_URL}/course/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Curso completo obtenido exitosamente');
    console.log('📋 Información del curso completo:');
    console.log(`   - Título: ${response.data.title}`);
    console.log(`   - Módulos: ${response.data.modules?.length || 0}`);
    
    if (response.data.modules && response.data.modules.length > 0) {
      response.data.modules.forEach((module, index) => {
        console.log(`   - Módulo ${index + 1}: ${module.title}`);
        console.log(`     Lecciones: ${module.lessons?.length || 0}`);
        
        if (module.lessons && module.lessons.length > 0) {
          module.lessons.forEach((lesson, lessonIndex) => {
            console.log(`     - Lección ${lessonIndex + 1}: ${lesson.title}`);
            console.log(`       Video URL: ${lesson.videoUrl}`);
            console.log(`       Tipo: ${lesson.contentType}`);
          });
        }
      });
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error obteniendo curso completo:', error.response?.data || error.message);
    throw error;
  }
}

// Función para extraer información de videos de YouTube
function extractYouTubeInfo(videoUrl) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = videoUrl.match(regex);
  
  if (!match) {
    return null;
  }
  
  const videoId = match[1];
  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    watchUrl: videoUrl
  };
}

// Función para validar URLs de YouTube
function validateYouTubeUrls(course) {
  console.log('🔗 Validando URLs de YouTube...');
  
  const videos = [];
  
  // Validar video de preview
  if (course.videoPreview) {
    const previewInfo = extractYouTubeInfo(course.videoPreview);
    if (previewInfo) {
      videos.push({
        type: 'Preview',
        ...previewInfo
      });
      console.log('✅ Video de preview válido:', previewInfo.videoId);
    } else {
      console.log('❌ Video de preview inválido:', course.videoPreview);
    }
  }
  
  // Validar videos de lecciones
  if (course.modules) {
    course.modules.forEach((module, moduleIndex) => {
      if (module.lessons) {
        module.lessons.forEach((lesson, lessonIndex) => {
          if (lesson.videoUrl && lesson.contentType === 'VIDEO') {
            const lessonInfo = extractYouTubeInfo(lesson.videoUrl);
            if (lessonInfo) {
              videos.push({
                type: `Lección ${lessonIndex + 1}`,
                lessonTitle: lesson.title,
                ...lessonInfo
              });
              console.log(`✅ Video de lección ${lessonIndex + 1} válido:`, lessonInfo.videoId);
            } else {
              console.log(`❌ Video de lección ${lessonIndex + 1} inválido:`, lesson.videoUrl);
            }
          }
        });
      }
    });
  }
  
  return videos;
}

// Función para generar URLs de prueba para el frontend
function generateFrontendUrls(courseId) {
  console.log('\n🌐 URLs para el Frontend:');
  console.log(`- Preview del curso: GET ${API_BASE_URL}/course/${courseId}/preview`);
  console.log(`- Curso completo: GET ${API_BASE_URL}/course/${courseId}`);
  console.log(`- Lista de cursos: GET ${API_BASE_URL}/course`);
}

// Función para generar ejemplo de respuesta JSON
function generateJsonExample(course) {
  console.log('\n📄 Ejemplo de respuesta JSON (Preview):');
  console.log(JSON.stringify({
    id: course.id,
    title: course.title,
    description: course.description,
    videoPreview: course.videoPreview,
    thumbnail: course.thumbnail,
    duration: course.duration,
    level: course.level,
    category: course.category,
    totalLessons: course.totalLessons
  }, null, 2));
  
  if (course.modules && course.modules.length > 0) {
    console.log('\n📄 Ejemplo de respuesta JSON (Curso Completo):');
    console.log(JSON.stringify({
      id: course.id,
      title: course.title,
      description: course.description,
      videoPreview: course.videoPreview,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.contentType,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          orderIndex: lesson.orderIndex
        }))
      }))
    }, null, 2));
  }
}

// Función principal
async function main() {
  try {
    console.log('🎬 Iniciando pruebas del curso con YouTube...\n');
    
    // ID del curso creado (reemplazar con ID real)
    const courseId = 'your-course-id-here';
    
    if (courseId === 'your-course-id-here') {
      console.log('⚠️  Por favor, reemplaza "your-course-id-here" con el ID real del curso');
      console.log('   Puedes obtener el ID ejecutando: node scripts/create-youtube-course.js');
      return;
    }
    
    // 1. Probar endpoint de preview
    const previewCourse = await testCoursePreview(courseId);
    
    // 2. Probar endpoint completo
    const fullCourse = await testFullCourse(courseId);
    
    // 3. Validar URLs de YouTube
    const videos = validateYouTubeUrls(fullCourse);
    
    // 4. Generar URLs para el frontend
    generateFrontendUrls(courseId);
    
    // 5. Generar ejemplos de JSON
    generateJsonExample(fullCourse);
    
    // 6. Resumen final
    console.log('\n🎉 Pruebas completadas exitosamente!');
    console.log('📊 Resumen:');
    console.log(`- Videos válidos encontrados: ${videos.length}`);
    console.log(`- Módulos en el curso: ${fullCourse.modules?.length || 0}`);
    console.log(`- Lecciones totales: ${fullCourse.totalLessons}`);
    
    console.log('\n📹 Videos de YouTube:');
    videos.forEach(video => {
      console.log(`- ${video.type}: ${video.videoId}`);
      if (video.lessonTitle) {
        console.log(`  Título: ${video.lessonTitle}`);
      }
    });
    
    console.log('\n✅ El curso está listo para ser usado en el frontend!');
    console.log('📖 Revisa la documentación en: YOUTUBE_COURSE_FRONTEND_DOCS.md');
    
  } catch (error) {
    console.error('\n💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  testCoursePreview,
  testFullCourse,
  extractYouTubeInfo,
  validateYouTubeUrls,
  generateFrontendUrls,
  generateJsonExample
};
