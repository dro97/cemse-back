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

async function checkRegisteredRoutes() {
  try {
    console.log('🔍 Verificando rutas registradas en el servidor...\n');

    // Lista de rutas que deberían estar registradas
    const routesToCheck = [
      // Rutas básicas
      { path: '/', expected: '200 or 404' },
      { path: '/health', expected: '200' },
      { path: '/api-docs', expected: '200 or 301' },
      
      // Rutas de autenticación (no requieren token)
      { path: '/api/auth/login', expected: '401 (credenciales) or 404' },
      
      // Rutas que requieren autenticación
      { path: '/api/contacts', expected: '401 (sin token) or 404' },
      { path: '/api/contacts/search', expected: '401 (sin token) or 404' },
      { path: '/api/contacts/requests/received', expected: '401 (sin token) or 404' },
      { path: '/api/contacts/stats', expected: '401 (sin token) or 404' },
      
      { path: '/api/company', expected: '401 (sin token) or 404' },
      { path: '/api/company/search', expected: '401 (sin token) or 404' },
      
      { path: '/api/course', expected: '401 (sin token) or 404' },
      { path: '/api/profile', expected: '401 (sin token) or 404' },
      
      // Rutas que no deberían existir
      { path: '/api/nonexistent', expected: '404' },
      { path: '/api/contacts/nonexistent', expected: '404' }
    ];

    console.log('📋 Verificando rutas:');
    console.log('   Status | Ruta esperada | Comentario');
    console.log('   -------|---------------|------------');

    for (const route of routesToCheck) {
      try {
        const response = await makeRequest(`http://localhost:3001${route.path}`);
        
        let comment = '';
        if (response.statusCode === 200) {
          comment = '✅ Funcionando';
        } else if (response.statusCode === 401) {
          comment = '🔒 Requiere autenticación (normal)';
        } else if (response.statusCode === 404) {
          if (route.path === '/api/nonexistent' || route.path === '/api/contacts/nonexistent') {
            comment = '✅ Correcto (no debería existir)';
          } else {
            comment = '❌ No encontrado (problema)';
          }
        } else if (response.statusCode === 301) {
          comment = '🔄 Redirección (normal)';
        } else {
          comment = `⚠️ Status inesperado: ${response.statusCode}`;
        }
        
        console.log(`   ${response.statusCode.toString().padStart(3)}   | ${route.path.padEnd(20)} | ${comment}`);
        
      } catch (error) {
        console.log(`   ERR  | ${route.path.padEnd(20)} | ❌ Error de conexión: ${error.message}`);
      }
    }

    console.log('\n🔍 Análisis de resultados:');
    
    // Probar login para obtener token
    console.log('\n🔐 Probando login para verificar rutas con autenticación...');
    
    try {
      const loginResponse = await makeRequest('http://localhost:3001/api/auth/login', 'POST', {
        'Content-Type': 'application/json'
      }, JSON.stringify({
        username: 'joven_test',
        password: 'password123'
      }));
      
      if (loginResponse.statusCode === 200) {
        console.log('   ✅ Login exitoso');
        const result = JSON.parse(loginResponse.data);
        
        if (result.token) {
          console.log('   🔑 Probando rutas con token...');
          
          const authRoutes = [
            '/api/contacts',
            '/api/company/search?page=1&limit=20',
            '/api/course'
          ];
          
          for (const route of authRoutes) {
            try {
              const authResponse = await makeRequest(`http://localhost:3001${route}`, 'GET', {
                'Authorization': `Bearer ${result.token}`
              });
              
              console.log(`   ${route} -> Status: ${authResponse.statusCode}`);
              if (authResponse.statusCode === 200) {
                console.log(`   ✅ Funcionando con token: ${route}`);
              } else if (authResponse.statusCode === 404) {
                console.log(`   ❌ 404 con token: ${route}`);
              }
            } catch (error) {
              console.log(`   ${route} -> Error: ${error.message}`);
            }
          }
        }
      } else if (loginResponse.statusCode === 401) {
        console.log('   ❌ Credenciales incorrectas - probando con admin...');
        
        // Probar con admin
        const adminResponse = await makeRequest('http://localhost:3001/api/auth/login', 'POST', {
          'Content-Type': 'application/json'
        }, JSON.stringify({
          username: 'admin',
          password: 'password123'
        }));
        
        if (adminResponse.statusCode === 200) {
          console.log('   ✅ Login con admin exitoso');
        } else {
          console.log(`   ❌ Login con admin falló: ${adminResponse.statusCode}`);
        }
      } else {
        console.log(`   ❌ Login falló: ${loginResponse.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ Error en login: ${error.message}`);
    }

    console.log('\n📝 Resumen del problema:');
    console.log('   - Si /api/contacts devuelve 404: Las rutas no están registradas');
    console.log('   - Si /api/company/search devuelve 401: Las rutas están registradas pero requieren auth');
    console.log('   - Si el login devuelve 404: Problema con el servidor');
    console.log('   - Si el login devuelve 401: Credenciales incorrectas');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkRegisteredRoutes();
