const http = require('http');
const { exec } = require('child_process');

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

async function fix404Issue() {
  try {
    console.log('🔧 Solucionando problema de 404...\n');

    // 1. Verificar estado actual
    console.log('1️⃣ Verificando estado actual del servidor...');
    
    const criticalEndpoints = [
      '/api/auth/login',
      '/api/contacts',
      '/api/company/search'
    ];

    let has404Issues = false;
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await makeRequest(`http://localhost:3001${endpoint}`);
        console.log(`   ${endpoint} -> Status: ${response.statusCode}`);
        if (response.statusCode === 404) {
          has404Issues = true;
          console.log(`   ❌ 404 en endpoint crítico: ${endpoint}`);
        }
      } catch (error) {
        console.log(`   ${endpoint} -> Error: ${error.message}`);
        has404Issues = true;
      }
    }

    if (!has404Issues) {
      console.log('   ✅ No se detectaron problemas de 404');
      return;
    }

    console.log('\n2️⃣ Problemas detectados. Verificando archivos de rutas...');
    
    // 2. Verificar que los archivos de rutas existen
    const fs = require('fs');
    const routeFiles = [
      'routes/auth.ts',
      'routes/contacts.ts',
      'routes/index.ts'
    ];

    for (const file of routeFiles) {
      if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} existe`);
      } else {
        console.log(`   ❌ ${file} NO existe`);
      }
    }

    console.log('\n3️⃣ Verificando importaciones en routes/index.ts...');
    
    // 3. Verificar importaciones
    const indexContent = fs.readFileSync('routes/index.ts', 'utf8');
    const requiredImports = [
      'import authRouter from "./auth"',
      'import ContactRouter from "./contacts"'
    ];

    for (const importLine of requiredImports) {
      if (indexContent.includes(importLine)) {
        console.log(`   ✅ ${importLine}`);
      } else {
        console.log(`   ❌ Falta: ${importLine}`);
      }
    }

    const requiredRoutes = [
      'router.use("/auth", authRouter)',
      'router.use("/contacts", ContactRouter)'
    ];

    for (const routeLine of requiredRoutes) {
      if (indexContent.includes(routeLine)) {
        console.log(`   ✅ ${routeLine}`);
      } else {
        console.log(`   ❌ Falta: ${routeLine}`);
      }
    }

    console.log('\n4️⃣ Soluciones recomendadas:');
    console.log('   🔄 Reiniciar el servidor:');
    console.log('      1. Detener el servidor actual (Ctrl+C)');
    console.log('      2. Ejecutar: npm run dev');
    console.log('      3. Verificar que no hay errores en la consola');
    
    console.log('\n   🔍 Verificar errores de compilación:');
    console.log('      1. Ejecutar: npx tsc --noEmit');
    console.log('      2. Verificar que no hay errores de TypeScript');
    
    console.log('\n   📦 Verificar dependencias:');
    console.log('      1. Ejecutar: npm install');
    console.log('      2. Verificar que todas las dependencias están instaladas');

    console.log('\n5️⃣ Verificando si hay errores de compilación...');
    
    // 4. Verificar errores de TypeScript
    exec('npx tsc --noEmit', (error, stdout, stderr) => {
      if (error) {
        console.log('   ❌ Errores de TypeScript detectados:');
        console.log(`   ${stderr}`);
      } else {
        console.log('   ✅ No hay errores de TypeScript');
      }
    });

    console.log('\n6️⃣ Verificando dependencias...');
    
    // 5. Verificar package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'jsonwebtoken', 'bcrypt', 'uuid'];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`   ✅ ${dep} está instalado`);
      } else {
        console.log(`   ❌ ${dep} NO está instalado`);
      }
    }

    console.log('\n📋 Resumen del problema:');
    console.log('   - Las rutas /api/auth/login y /api/contacts devuelven 404');
    console.log('   - Esto indica que las rutas no están registradas correctamente');
    console.log('   - El servidor está corriendo pero no carga todas las rutas');
    
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Detener el servidor actual');
    console.log('   2. Ejecutar: npm run dev');
    console.log('   3. Verificar que no hay errores en la consola');
    console.log('   4. Probar los endpoints nuevamente');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

fix404Issue();
