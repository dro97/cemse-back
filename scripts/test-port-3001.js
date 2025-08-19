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

async function testPort3001() {
  try {
    console.log('🔍 Probando específicamente el puerto 3001...\n');

    // 1. Probar endpoints básicos
    console.log('1️⃣ Probando endpoints básicos en puerto 3001:');
    
    const basicEndpoints = [
      '/',
      '/health',
      '/api',
      '/api-docs'
    ];

    for (const endpoint of basicEndpoints) {
      try {
        const response = await makeRequest(`http://localhost:3001${endpoint}`);
        console.log(`   ${endpoint} -> Status: ${response.statusCode}`);
        if (response.statusCode === 200) {
          console.log(`   ✅ Funcionando: ${endpoint}`);
        }
      } catch (error) {
        console.log(`   ${endpoint} -> Error: ${error.message}`);
      }
    }

    console.log('');

    // 2. Probar endpoints que requieren autenticación
    console.log('2️⃣ Probando endpoints que requieren autenticación:');
    
    const authEndpoints = [
      '/api/contacts',
      '/api/company/search?page=1&limit=20',
      '/api/course',
      '/api/profile'
    ];

    for (const endpoint of authEndpoints) {
      try {
        const response = await makeRequest(`http://localhost:3001${endpoint}`);
        console.log(`   ${endpoint} -> Status: ${response.statusCode}`);
        if (response.statusCode === 401) {
          console.log(`   🔒 Requiere autenticación: ${endpoint}`);
        } else if (response.statusCode === 200) {
          console.log(`   ✅ Funcionando: ${endpoint}`);
        } else if (response.statusCode === 404) {
          console.log(`   ❌ No encontrado: ${endpoint}`);
        }
      } catch (error) {
        console.log(`   ${endpoint} -> Error: ${error.message}`);
      }
    }

    console.log('');

    // 3. Probar login (no requiere autenticación)
    console.log('3️⃣ Probando login (debería funcionar sin auth):');
    
    try {
      const loginData = {
        username: 'joven_test',
        password: 'password123'
      };
      
      const response = await makeRequest('http://localhost:3001/api/auth/login', 'POST', {
        'Content-Type': 'application/json'
      }, JSON.stringify(loginData));
      
      console.log(`   /api/auth/login -> Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ Login funcionando correctamente');
        const result = JSON.parse(response.data);
        console.log(`   Token obtenido: ${result.token ? 'Sí' : 'No'}`);
        
        // 4. Probar con el token obtenido
        if (result.token) {
          console.log('\n4️⃣ Probando endpoints con token:');
          
          const tokenEndpoints = [
            '/api/contacts',
            '/api/company/search?page=1&limit=20',
            '/api/course'
          ];
          
          for (const endpoint of tokenEndpoints) {
            try {
              const authResponse = await makeRequest(`http://localhost:3001${endpoint}`, 'GET', {
                'Authorization': `Bearer ${result.token}`
              });
              
              console.log(`   ${endpoint} -> Status: ${authResponse.statusCode}`);
              if (authResponse.statusCode === 200) {
                console.log(`   ✅ Funcionando con token: ${endpoint}`);
              } else if (authResponse.statusCode === 404) {
                console.log(`   ❌ 404 con token: ${endpoint}`);
              }
            } catch (error) {
              console.log(`   ${endpoint} -> Error: ${error.message}`);
            }
          }
        }
      } else if (response.statusCode === 401) {
        console.log('   ❌ Credenciales incorrectas');
      } else if (response.statusCode === 404) {
        console.log('   ❌ Endpoint de login no encontrado');
      }
    } catch (error) {
      console.log(`   /api/auth/login -> Error: ${error.message}`);
    }

    console.log('\n📋 Resumen:');
    console.log('   - Puerto 3001: Servidor corriendo');
    console.log('   - Si los endpoints devuelven 401: Requieren autenticación (normal)');
    console.log('   - Si los endpoints devuelven 404: Problema con las rutas');
    console.log('   - Si el login devuelve 404: Problema con el servidor');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testPort3001();
