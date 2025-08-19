const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZTdjaGJrbDAwMDAyZjRnc3BzYTNpOXoiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IlNVUEVSQURNSU4iLCJpYXQiOjE3NTUwOTIwMzAsImV4cCI6MTc1NTA5MjkzMH0.TOJcPo7qEU84YMHd_nNBhweleZoMtXTK5QzAS6DsfKE';
const COURSE_ID = 'cme9ztt1y000313ht4yg5i10y';

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

async function testPreviewEndpoint() {
  try {
    console.log('🔍 Probando endpoint de preview del curso...');
    console.log(`URL: ${API_BASE_URL}/course/${COURSE_ID}/preview`);
    
    const response = await makeRequest(`${API_BASE_URL}/course/${COURSE_ID}/preview`, 'GET', {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    });
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Preview del curso obtenido exitosamente');
      console.log('📋 Respuesta completa:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.videoPreview) {
        console.log('\n🎬 URL del video preview:');
        console.log(response.data.videoPreview);
      }
      
      if (response.data.thumbnail) {
        console.log('\n🖼️ URL del thumbnail:');
        console.log(response.data.thumbnail);
      }
      
    } else {
      console.log('❌ Error en la respuesta:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
  }
}

testPreviewEndpoint();
