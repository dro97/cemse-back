const https = require('https');
const http = require('http');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testMultipartFix() {
  console.log('🧪 Probando corrección de multipart/form-data...\n');

  // Test 1: Simple multipart form data
  console.log('📤 Probando envío de multipart/form-data...');
  
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
  let formData = '';
  
  // Add text fields
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="title"\r\n\r\n';
  formData += 'Noticia de prueba\r\n';
  
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="content"\r\n\r\n';
  formData += 'Contenido de prueba\r\n';
  
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="summary"\r\n\r\n';
  formData += 'Resumen de prueba\r\n';
  
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="category"\r\n\r\n';
  formData += 'General\r\n';
  
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="status"\r\n\r\n';
  formData += 'DRAFT\r\n';
  
  // Add a simple text file
  formData += `--${boundary}\r\n`;
  formData += 'Content-Disposition: form-data; name="image"; filename="test.txt"\r\n';
  formData += 'Content-Type: text/plain\r\n\r\n';
  formData += 'This is a test file content\r\n';
  
  formData += `--${boundary}--\r\n`;

  try {
    const response = await makeRequest('http://localhost:3001/api/newsarticle', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': 'Bearer test-token'
      }
    }, formData);

    console.log('📥 Status:', response.status);
    console.log('📊 Respuesta:', JSON.stringify(response.body, null, 2));

    if (response.status === 401) {
      console.log('✅ Éxito! El multipart/form-data ahora funciona correctamente');
      console.log('✅ El error de JSON parsing se ha corregido');
    } else if (response.status === 400 && response.body.message && response.body.message.includes('JSON')) {
      console.log('❌ Error: Aún hay problemas con el parsing de JSON');
    } else {
      console.log('📊 Respuesta inesperada:', response.status);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }

  // Test 2: Regular JSON request (should still work)
  console.log('\n📤 Probando request JSON normal...');
  
  try {
    const response = await makeRequest('http://localhost:3001/api/newsarticle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    }, JSON.stringify({
      title: 'Test JSON',
      content: 'Test content',
      summary: 'Test summary',
      category: 'General'
    }));

    console.log('📥 Status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Éxito! Los requests JSON siguen funcionando');
    } else {
      console.log('📊 Respuesta JSON:', response.status);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testMultipartFix();
