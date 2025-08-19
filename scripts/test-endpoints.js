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

async function testEndpoints() {
  try {
    console.log('🧪 Probando varios endpoints...');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTA5MTgsImV4cCI6MTc1NTA5MTgxOH0.EC9Y4526Tt7WKR_KZImRU3vnjkJIVkIQdEv42OytKAg';
    
    const endpoints = [
      { name: 'Health', url: 'http://localhost:3001/health', method: 'GET' },
      { name: 'Course', url: 'http://localhost:3001/api/course', method: 'GET' },
      { name: 'Course Module', url: 'http://localhost:3001/api/coursemodule', method: 'GET' },
      { name: 'Lessons', url: 'http://localhost:3001/api/lesson', method: 'GET' },
      { name: 'Users', url: 'http://localhost:3001/api/user', method: 'GET' },
      { name: 'Auth Me', url: 'http://localhost:3001/api/auth/me', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n${endpoint.name}: ${endpoint.method} ${endpoint.url}`);
      try {
        const response = await makeRequest(endpoint.url, endpoint.method, {
          'Authorization': `Bearer ${token}`
        });
        console.log(`Status: ${response.statusCode}`);
        if (response.statusCode === 200) {
          console.log('✅ Funciona');
        } else {
          console.log('❌ No funciona');
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };
