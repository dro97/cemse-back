const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTA5MTgsImV4cCI6MTc1NTA5MTgxOH0.EC9Y4526Tt7WKR_KZImRU3vnjkJIVkIQdEv42OytKAg';

// Videos de YouTube proporcionados
const YOUTUBE_VIDEOS = {
  preview: 'https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1',
  lesson1: 'https://www.youtube.com/watch?v=uY5406XeobY',
  lesson2: 'https://www.youtube.com/watch?v=9gWIIIr2Asw&list=RD9gWIIIr2Asw&start_radio=1'
};

// Función para hacer requests HTTP
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Función para obtener el curso existente
async function getExistingCourse() {
  try {
    console.log('🔍 Buscando curso existente...');
    
    const response = await makeRequest(`${API_BASE_URL}/course`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      const courses = response.data;
      const existingCourse = courses.find(course => 
        course.slug === 'curso-musica-desarrollo-personal' || 
        course.title === 'Curso de Música y Desarrollo Personal'
      );
      
      if (existingCourse) {
        console.log('✅ Curso encontrado:', existingCourse.title);
        return existingCourse;
      } else {
        throw new Error('No se encontró el curso existente');
      }
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo curso:', error.message);
    throw error;
  }
}

// Función para obtener el módulo existente
async function getExistingModule(courseId) {
  try {
    console.log('🔍 Buscando módulo existente...');
    
    const response = await makeRequest(`${API_BASE_URL}/coursemodule`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      const modules = response.data;
      const existingModule = modules.find(module => 
        module.courseId === courseId && 
        module.title === 'Fundamentos de Música y Desarrollo Personal'
      );
      
      if (existingModule) {
        console.log('✅ Módulo encontrado:', existingModule.title);
        return existingModule;
      } else {
        throw new Error('No se encontró el módulo existente');
      }
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo módulo:', error.message);
    throw error;
  }
}

// Función para crear una lección con video de YouTube
async function createYouTubeLesson(moduleId, title, description, youtubeUrl, orderIndex) {
  try {
    console.log(`🎬 Creando lección: ${title}...`);
    
    const lessonData = {
      title: title,
      description: description,
      content: `En esta lección aprenderás a través del video de YouTube. Asegúrate de ver el video completo para obtener el máximo beneficio.`,
      moduleId: moduleId,
      contentType: "VIDEO",
      videoUrl: youtubeUrl,
      duration: 15,
      orderIndex: orderIndex,
      isRequired: true,
      isPreview: false
    };
    
    const response = await makeRequest(`${API_BASE_URL}/lesson`, 'POST', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, lessonData);
    
    if (response.statusCode === 201) {
      console.log('✅ Lección creada exitosamente:', response.data);
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error creando lección:', error.message);
    throw error;
  }
}

// Función para obtener información del video de YouTube
function getYouTubeVideoInfo(youtubeUrl) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = youtubeUrl.match(regex);
  const videoId = match ? match[1] : null;
  
  if (!videoId) {
    throw new Error('URL de YouTube inválida');
  }
  
  return {
    videoId: videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    watchUrl: youtubeUrl
  };
}

// Función para obtener lecciones existentes del módulo
async function getModuleLessons(moduleId) {
  try {
    console.log('📋 Obteniendo lecciones existentes del módulo...');
    
    const response = await makeRequest(`${API_BASE_URL}/lesson/module/${moduleId}`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Lecciones obtenidas:', response.data.length);
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo lecciones:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🎵 Agregando lecciones de YouTube al curso existente...\n');
    
    // 1. Obtener el curso existente
    const course = await getExistingCourse();
    
    // 2. Obtener el módulo existente
    const module = await getExistingModule(course.id);
    
    // 3. Obtener lecciones existentes
    const existingLessons = await getModuleLessons(module.id);
    
    if (existingLessons.length > 0) {
      console.log('⚠️  El módulo ya tiene lecciones. Mostrando información:');
      existingLessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title} (${lesson.contentType})`);
        if (lesson.videoUrl) {
          console.log(`      Video: ${lesson.videoUrl}`);
        }
      });
    }
    
    // 4. Crear las nuevas lecciones con videos de YouTube
    const newOrderIndex = existingLessons.length + 1;
    
    const lesson1 = await createYouTubeLesson(
      module.id,
      "Introducción a la Música para el Desarrollo Personal",
      "Aprende cómo la música puede transformar tu vida y mejorar tu bienestar emocional.",
      YOUTUBE_VIDEOS.lesson1,
      newOrderIndex
    );
    
    const lesson2 = await createYouTubeLesson(
      module.id,
      "Técnicas Avanzadas de Música y Mindfulness",
      "Explora técnicas avanzadas para usar la música como herramienta de mindfulness y meditación.",
      YOUTUBE_VIDEOS.lesson2,
      newOrderIndex + 1
    );
    
    // 5. Obtener información de los videos
    const videoInfo = {
      preview: getYouTubeVideoInfo(YOUTUBE_VIDEOS.preview),
      lesson1: getYouTubeVideoInfo(YOUTUBE_VIDEOS.lesson1),
      lesson2: getYouTubeVideoInfo(YOUTUBE_VIDEOS.lesson2)
    };
    
    // 6. Obtener todas las lecciones actualizadas
    const allLessons = await getModuleLessons(module.id);
    
    console.log('\n🎉 Lecciones agregadas exitosamente!');
    console.log('📊 Resumen:');
    console.log(`- Curso: ${course.title}`);
    console.log(`- Módulo: ${module.title}`);
    console.log(`- Lecciones totales: ${allLessons.length}`);
    console.log(`- Nuevas lecciones creadas: 2`);
    
    console.log('\n📹 Información de Videos:');
    console.log('Preview:', videoInfo.preview);
    console.log('Lección 1:', videoInfo.lesson1);
    console.log('Lección 2:', videoInfo.lesson2);
    
    // 7. Mostrar URLs para el frontend
    console.log('\n🔗 URLs para el Frontend:');
    console.log(`- Obtener curso completo: GET ${API_BASE_URL}/course/${course.id}`);
    console.log(`- Obtener solo preview: GET ${API_BASE_URL}/course/${course.id}/preview`);
    console.log(`- Obtener lecciones del módulo: GET ${API_BASE_URL}/lesson/module/${module.id}`);
    
    return {
      course: course,
      module: module,
      lessons: allLessons,
      videoInfo: videoInfo
    };
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    throw error;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  getExistingCourse,
  getExistingModule,
  createYouTubeLesson,
  getYouTubeVideoInfo,
  getModuleLessons,
  YOUTUBE_VIDEOS
};
