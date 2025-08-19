const https = require('https');
const http = require('http');

// Función para hacer requests HTTP
function makeRequest(url, method = 'POST', headers = {}, body = null) {
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

async function testLessonEndpoint() {
  try {
    console.log('🧪 Probando endpoint de lecciones...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTA5MTgsImV4cCI6MTc1NTA5MTgxOH0.EC9Y4526Tt7WKR_KZImRU3vnjkJIVkIQdEv42OytKAg';
    
    const lessonData = {
      title: "Test Lesson",
      content: "Test content",
      moduleId: "cme9zttff000513htivfcanvq",
      contentType: "TEXT",
      orderIndex: 1
    };
    
    const response = await makeRequest('http://localhost:3001/api/lessons', 'POST', {
      'Authorization': `Bearer ${token}`
    }, lessonData);
    
    console.log('Status Code:', response.statusCode);
    console.log('Response:', response.data);
    
    if (response.statusCode === 201) {
      console.log('✅ Lección creada exitosamente');
    } else {
      console.log('❌ Error creando lección');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  testLessonEndpoint();
}

module.exports = { testLessonEndpoint };
