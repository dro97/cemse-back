const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTA5MTgsImV4cCI6MTc1NTA5MTgxOH0.EC9Y4526Tt7WKR_KZImRU3vnjkJIVkIQdEv42OytKAg';

// IDs del curso y módulo creados
const COURSE_ID = 'cme9ztt1y000313ht4yg5i10y';
const MODULE_ID = 'cme9zttff000513htivfcanvq';

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

// Función para probar el endpoint de preview del curso
async function testCoursePreview() {
  try {
    console.log('🔍 Probando endpoint de preview del curso...');
    
    const response = await makeRequest(`${API_BASE_URL}/course/${COURSE_ID}/preview`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Preview del curso obtenido exitosamente');
      console.log('📋 Información del preview:');
      console.log(`   - Título: ${response.data.title}`);
      console.log(`   - Video Preview: ${response.data.videoPreview}`);
      console.log(`   - Duración: ${response.data.duration} minutos`);
      console.log(`   - Nivel: ${response.data.level}`);
      console.log(`   - Categoría: ${response.data.category}`);
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo preview:', error.message);
    throw error;
  }
}

// Función para probar el endpoint de curso completo
async function testFullCourse() {
  try {
    console.log('\n📚 Probando endpoint de curso completo...');
    
    const response = await makeRequest(`${API_BASE_URL}/course/${COURSE_ID}`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Curso completo obtenido exitosamente');
      console.log('📋 Información del curso:');
      console.log(`   - Título: ${response.data.title}`);
      console.log(`   - Módulos: ${response.data.modules?.length || 0}`);
      
      if (response.data.modules && response.data.modules.length > 0) {
        const module = response.data.modules[0];
        console.log(`   - Primer módulo: ${module.title}`);
        console.log(`   - Lecciones en el módulo: ${module.lessons?.length || 0}`);
        
        if (module.lessons && module.lessons.length > 0) {
          console.log('   - Lecciones:');
          module.lessons.forEach((lesson, index) => {
            console.log(`     ${index + 1}. ${lesson.title} (${lesson.contentType})`);
            if (lesson.videoUrl) {
              console.log(`        Video: ${lesson.videoUrl}`);
            }
          });
        }
      }
      
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo curso completo:', error.message);
    throw error;
  }
}

// Función para probar el endpoint de lecciones por módulo
async function testModuleLessons() {
  try {
    console.log('\n📖 Probando endpoint de lecciones por módulo...');
    
    const response = await makeRequest(`${API_BASE_URL}/lesson/module/${MODULE_ID}`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Lecciones del módulo obtenidas exitosamente');
      console.log(`📋 Total de lecciones: ${response.data.length}`);
      
      response.data.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title}`);
        console.log(`      - Tipo: ${lesson.contentType}`);
        console.log(`      - Duración: ${lesson.duration} minutos`);
        console.log(`      - Orden: ${lesson.orderIndex}`);
        if (lesson.videoUrl) {
          console.log(`      - Video: ${lesson.videoUrl}`);
        }
        if (lesson.description) {
          console.log(`      - Descripción: ${lesson.description}`);
        }
      });
      
      return response.data;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo lecciones del módulo:', error.message);
    throw error;
  }
}

// Función para generar información de videos para el frontend
function generateFrontendVideoInfo(lessons) {
  console.log('\n🎬 Generando información de videos para el frontend...');
  
  const videoInfo = {
    coursePreview: {
      videoId: 'yEIKwtVRKuQ',
      embedUrl: 'https://www.youtube.com/embed/yEIKwtVRKuQ',
      thumbnailUrl: 'https://img.youtube.com/vi/yEIKwtVRKuQ/maxresdefault.jpg',
      watchUrl: 'https://www.youtube.com/watch?v=yEIKwtVRKuQ&list=RDyEIKwtVRKuQ&start_radio=1'
    },
    lessons: []
  };
  
  lessons.forEach((lesson, index) => {
    if (lesson.videoUrl && lesson.contentType === 'VIDEO') {
      const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = lesson.videoUrl.match(regex);
      const videoId = match ? match[1] : null;
      
      if (videoId) {
        videoInfo.lessons.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoId: videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          watchUrl: lesson.videoUrl,
          duration: lesson.duration,
          orderIndex: lesson.orderIndex
        });
      }
    }
  });
  
  console.log('✅ Información de videos generada:');
  console.log('   - Video de preview:', videoInfo.coursePreview);
  console.log(`   - Videos de lecciones: ${videoInfo.lessons.length}`);
  
  return videoInfo;
}

// Función para generar documentación para el frontend
function generateFrontendDocs(course, lessons, videoInfo) {
  console.log('\n📝 Generando documentación para el frontend...');
  
  const docs = {
    courseInfo: {
      id: course.id,
      title: course.title,
      description: course.description,
      videoPreview: course.videoPreview,
      duration: course.duration,
      level: course.level,
      category: course.category
    },
    apiEndpoints: {
      coursePreview: `GET ${API_BASE_URL}/course/${course.id}/preview`,
      fullCourse: `GET ${API_BASE_URL}/course/${course.id}`,
      moduleLessons: `GET ${API_BASE_URL}/lesson/module/${MODULE_ID}`
    },
    videoInfo: videoInfo,
    frontendImplementation: {
      coursePreview: {
        endpoint: `GET ${API_BASE_URL}/course/${course.id}/preview`,
        description: 'Obtiene solo la información básica del curso con el video de preview',
        useCase: 'Mostrar información del curso cuando el estudiante está buscando cursos'
      },
      fullCourse: {
        endpoint: `GET ${API_BASE_URL}/course/${course.id}`,
        description: 'Obtiene el curso completo con todos los módulos y lecciones',
        useCase: 'Mostrar el contenido completo cuando el estudiante entra al curso'
      },
      moduleLessons: {
        endpoint: `GET ${API_BASE_URL}/lesson/module/${MODULE_ID}`,
        description: 'Obtiene todas las lecciones de un módulo específico',
        useCase: 'Mostrar las lecciones de un módulo específico'
      }
    }
  };
  
  console.log('✅ Documentación generada exitosamente');
  return docs;
}

// Función principal
async function main() {
  try {
    console.log('🎬 Iniciando prueba completa del curso con YouTube...\n');
    
    // 1. Probar endpoint de preview
    const coursePreview = await testCoursePreview();
    
    // 2. Probar endpoint de curso completo
    const fullCourse = await testFullCourse();
    
    // 3. Probar endpoint de lecciones por módulo
    const moduleLessons = await testModuleLessons();
    
    // 4. Generar información de videos para el frontend
    const videoInfo = generateFrontendVideoInfo(moduleLessons);
    
    // 5. Generar documentación para el frontend
    const frontendDocs = generateFrontendDocs(fullCourse, moduleLessons, videoInfo);
    
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('📊 Resumen final:');
    console.log(`- Curso: ${fullCourse.title}`);
    console.log(`- Video de preview: ${coursePreview.videoPreview}`);
    console.log(`- Módulos: ${fullCourse.modules?.length || 0}`);
    console.log(`- Lecciones totales: ${moduleLessons.length}`);
    console.log(`- Videos de lecciones: ${videoInfo.lessons.length}`);
    
    console.log('\n🔗 Endpoints disponibles:');
    console.log(`- Preview: ${frontendDocs.apiEndpoints.coursePreview}`);
    console.log(`- Curso completo: ${frontendDocs.apiEndpoints.fullCourse}`);
    console.log(`- Lecciones del módulo: ${frontendDocs.apiEndpoints.moduleLessons}`);
    
    console.log('\n📹 Videos integrados:');
    console.log('1. Preview del curso:', videoInfo.coursePreview.watchUrl);
    videoInfo.lessons.forEach((lesson, index) => {
      console.log(`${index + 2}. Lección ${index + 1}: ${lesson.watchUrl}`);
    });
    
    return {
      coursePreview,
      fullCourse,
      moduleLessons,
      videoInfo,
      frontendDocs
    };
    
  } catch (error) {
    console.error('\n💥 Error en la prueba:', error.message);
    throw error;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  testCoursePreview,
  testFullCourse,
  testModuleLessons,
  generateFrontendVideoInfo,
  generateFrontendDocs
};
