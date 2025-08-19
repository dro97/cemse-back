const https = require('https');
const http = require('http');

// Configuración
const API_BASE_URL = 'http:///api';
const SWAGGER_URL = 'http://localhost:3001/api/docs';

// Función para hacer requests HTTP
function makeRequest(url, method = 'GET', headers = {}) {
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
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testSwagger() {
  try {
    console.log('🔍 Probando Swagger UI...');
    console.log(`URL: ${SWAGGER_URL}`);
    
    const response = await makeRequest(SWAGGER_URL);
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Swagger UI está funcionando correctamente');
      console.log('📋 Headers de respuesta:');
      console.log(JSON.stringify(response.headers, null, 2));
      
      // Verificar si contiene el HTML de Swagger
      if (response.data.includes('swagger-ui')) {
        console.log('✅ Swagger UI HTML detectado');
      } else {
        console.log('⚠️ No se detectó el HTML de Swagger UI');
      }
      
    } else {
      console.log('❌ Error en Swagger UI:');
      console.log(response.data);
    }
    
  } catch (error) {
    console.error('❌ Error accediendo a Swagger UI:', error.message);
  }
}

async function testApiEndpoint() {
  try {
    console.log('\n🔍 Probando endpoint de API...');
    console.log(`URL: ${API_BASE_URL}/course`);
    
    const response = await makeRequest(`${API_BASE_URL}/course`);
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 401) {
      console.log('✅ Endpoint protegido correctamente (requiere autenticación)');
    } else if (response.statusCode === 200) {
      console.log('✅ Endpoint accesible');
      console.log('📋 Respuesta:', response.data.substring(0, 200) + '...');
    } else {
      console.log('❌ Error inesperado:', response.statusCode);
      console.log(response.data);
    }
    
  } catch (error) {
    console.error('❌ Error accediendo al endpoint:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de Swagger...\n');
  
  await testSwagger();
  await testApiEndpoint();
  
  console.log('\n📝 Resumen:');
  console.log(`- Swagger UI: http://localhost:3001/api/docs`);
  console.log(`- API Base: ${API_BASE_URL}`);
  console.log('- Todas las rutas en Swagger ahora incluyen el prefijo /api');
}

main();
