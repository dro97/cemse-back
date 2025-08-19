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

async function getToken() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const response = await makeRequest('http://localhost:3001/api/auth/login', 'POST', {}, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Token obtenido exitosamente');
      console.log('Token:', response.data.token);
      return response.data.token;
    } else {
      throw new Error(`Error ${response.statusCode}: ${JSON.stringify(response.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw error;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  getToken();
}

module.exports = { getToken };
