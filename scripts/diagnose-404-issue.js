const http = require('http');

// Función para hacer una petición HTTP
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function diagnose404Issue() {
  try {
    console.log('🔍 Diagnosticando problema de 404...\n');

    // 1. Verificar si el servidor está corriendo
    console.log('1️⃣ Verificando si el servidor está corriendo...');
    
    const testUrls = [
      'http://localhost:3001/api/health',
      'http://localhost:3001/api',
      'http://localhost:3001/',
      'http://localhost:3000/api/health',
      'http://localhost:3000/api',
      'http://localhost:3000/'
    ];

    for (const url of testUrls) {
      try {
        const response = await makeRequest(url);
        console.log(`   ${url} -> Status: ${response.statusCode}`);
        if (response.statusCode !== 404) {
          console.log(`   ✅ Servidor respondiendo en: ${url}`);
        }
      } catch (error) {
        console.log(`   ${url} -> Error: ${error.message}`);
      }
    }

    console.log('');

    // 2. Probar endpoints específicos que deberían funcionar
    console.log('2️⃣ Probando endpoints específicos...');
    
    const endpoints = [
      '/api/contacts',
      '/api/contacts/search',
      '/api/contacts/requests/received',
      '/api/contacts/stats',
      '/api/company/search?page=1&limit=20',
      '/api/course',
      '/api/auth/login'
    ];

    for (const endpoint of endpoints) {
      const url = `http://localhost:3001${endpoint}`;
      try {
        const response = await makeRequest(url);
        console.log(`   ${endpoint} -> Status: ${response.statusCode}`);
        if (response.statusCode === 404) {
          console.log(`   ❌ 404 en: ${endpoint}`);
        } else if (response.statusCode === 401) {
          console.log(`   🔒 401 (Requiere auth) en: ${endpoint}`);
        } else if (response.statusCode === 200) {
          console.log(`   ✅ 200 en: ${endpoint}`);
        }
      } catch (error) {
        console.log(`   ${endpoint} -> Error: ${error.message}`);
      }
    }

    console.log('');

    // 3. Verificar si hay algún proceso corriendo en los puertos
    console.log('3️⃣ Verificando procesos en puertos...');
    
    const ports = [3000, 3001];
    for (const port of ports) {
      try {
        const response = await makeRequest(`http://localhost:${port}`, 'GET', {}, null);
        console.log(`   Puerto ${port}: Respondiendo (Status: ${response.statusCode})`);
      } catch (error) {
        console.log(`   Puerto ${port}: No responde (${error.message})`);
      }
    }

    console.log('');

    // 4. Probar con diferentes métodos HTTP
    console.log('4️⃣ Probando diferentes métodos HTTP...');
    
    const methods = ['GET', 'POST', 'OPTIONS'];
    for (const method of methods) {
      try {
        const response = await makeRequest('http://localhost:3001/api/contacts', method);
        console.log(`   ${method} /api/contacts -> Status: ${response.statusCode}`);
      } catch (error) {
        console.log(`   ${method} /api/contacts -> Error: ${error.message}`);
      }
    }

    console.log('\n📋 Diagnóstico:');
    console.log('   Si todos los endpoints devuelven 404, puede ser:');
    console.log('   1. El servidor no está corriendo');
    console.log('   2. El servidor está corriendo en un puerto diferente');
    console.log('   3. Hay un error en el código que impide que las rutas se registren');
    console.log('   4. El servidor se reinició y perdió las rutas');
    console.log('\n🔧 Soluciones:');
    console.log('   1. Ejecutar: npm run dev');
    console.log('   2. Verificar que no hay errores en la consola del servidor');
    console.log('   3. Reiniciar el servidor');
    console.log('   4. Verificar que todas las rutas están importadas correctamente');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

diagnose404Issue();
