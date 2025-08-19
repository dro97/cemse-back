const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET'
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testEndpoints() {
  const endpoints = [
    'http://localhost:3001/health',
    'http://localhost:3001/api/docs',
    'http://localhost:3001/api-docs',
    'http://localhost:3001/api/course'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Probando: ${endpoint}`);
      const response = await makeRequest(endpoint);
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
}

testEndpoints();
