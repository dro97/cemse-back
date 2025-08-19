const https = require('https');
const http = require('http');

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

async function testLessonGet() {
  try {
    console.log('🧪 Probando endpoint GET de lecciones...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTA5MTgsImV4cCI6MTc1NTA5MTgxOH0.EC9Y4526Tt7WKR_KZImRU3vnjkJIVkIQdEv42OytKAg';
    
    // Probar GET /lessons
    console.log('\n1. Probando GET /api/lessons...');
    const response1 = await makeRequest('http://localhost:3001/api/lessons', 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('Status Code:', response1.statusCode);
    console.log('Response:', response1.data);
    
    // Probar GET /lessons/module/:moduleId
    console.log('\n2. Probando GET /api/lessons/module/cme9zttff000513htivfcanvq...');
    const response2 = await makeRequest('http://localhost:3001/api/lessons/module/cme9zttff000513htivfcanvq', 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('Status Code:', response2.statusCode);
    console.log('Response:', response2.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  testLessonGet();
}

module.exports = { testLessonGet };
