const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http://localhost:3001/api';

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

// 1. Obtener token de admin
async function getAdminToken() {
  try {
    console.log('🔑 Obteniendo token de admin...');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, 'POST', {}, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Token de admin obtenido exitosamente');
      return response.data.token;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo token de admin:', error.message);
    throw error;
  }
}

// 2. Probar endpoint joboffer (sin guión)
async function testJobOfferEndpoint(token) {
  try {
    console.log('\n🔍 Probando endpoint /api/joboffer (sin guión)...');
    
    const response = await makeRequest(`${API_BASE_URL}/joboffer`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`📋 Response:`, response.data);
    
    return response;
  } catch (error) {
    console.error('❌ Error probando endpoint joboffer:', error.message);
    throw error;
  }
}

// 3. Probar endpoint job-offer (con guión)
async function testJobOfferWithDashEndpoint(token) {
  try {
    console.log('\n🔍 Probando endpoint /api/job-offer (con guión)...');
    
    const response = await makeRequest(`${API_BASE_URL}/job-offer`, 'GET', {
      'Authorization': `Bearer ${token}`
    });
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`📋 Response:`, response.data);
    
    return response;
  } catch (error) {
    console.error('❌ Error probando endpoint job-offer:', error.message);
    throw error;
  }
}

// 4. Probar endpoint de health
async function testHealthEndpoint() {
  try {
    console.log('\n🔍 Probando endpoint /health...');
    
    const response = await makeRequest(`http://localhost:3001/health`, 'GET');
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`📋 Response:`, response.data);
    
    return response;
  } catch (error) {
    console.error('❌ Error probando endpoint health:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  console.log('🚀 Diagnosticando problema con endpoint job-offer...\n');
  
  try {
    // Probar health primero
    await testHealthEndpoint();
    
    // Obtener token de admin
    const adminToken = await getAdminToken();
    
    // Probar ambos endpoints
    await testJobOfferEndpoint(adminToken);
    await testJobOfferWithDashEndpoint(adminToken);
    
    console.log('\n📝 Resumen del diagnóstico:');
    console.log('✅ Si /health funciona: El servidor está corriendo');
    console.log('✅ Si /api/joboffer funciona: La ruta está registrada correctamente');
    console.log('❌ Si /api/job-offer no funciona: El problema es el nombre de la ruta');
    
  } catch (error) {
    console.error('\n❌ Error en el diagnóstico:', error.message);
  }
}

main();
