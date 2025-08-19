const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTIwMzAsImV4cCI6MTc1NTA5MjkzMH0.TOJcPo7qEU84YMHd_nNBhweleZoMtXTK5QzAS6DsfKE';
const COURSE_ID = 'cme8tvypp0000acygt8d4kc80';

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

async function testCourseEnrollment() {
  try {
    console.log('🎓 Probando enrollment en curso...');
    console.log(`URL: ${API_BASE_URL}/course-enrollment`);
    console.log(`Course ID: ${COURSE_ID}`);
    
    const enrollmentData = {
      courseId: COURSE_ID
    };
    
    console.log('📤 Datos enviados:', JSON.stringify(enrollmentData, null, 2));
    
    const response = await makeRequest(`${API_BASE_URL}/course-enrollment`, 'POST', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }, enrollmentData);
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 201) {
      console.log('✅ Enrollment creado exitosamente');
      console.log('📋 Respuesta:');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Error en enrollment:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
  }
}

async function testListEnrollments() {
  try {
    console.log('\n📚 Probando listado de enrollments...');
    
    const response = await makeRequest(`${API_BASE_URL}/course-enrollment`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Enrollments obtenidos exitosamente');
      console.log(`📋 Total de enrollments: ${response.data.length}`);
      
      if (response.data.length > 0) {
        console.log('📋 Primer enrollment:');
        console.log(JSON.stringify(response.data[0], null, 2));
      }
    } else {
      console.log('❌ Error obteniendo enrollments:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de course enrollment...\n');
  
  await testCourseEnrollment();
  await testListEnrollments();
  
  console.log('\n📝 Resumen:');
  console.log(`- API Base: ${API_BASE_URL}`);
  console.log(`- Course ID: ${COURSE_ID}`);
  console.log('- El enrollment ahora usa el studentId del usuario autenticado');
}

main();
