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

async function testNewsCreation() {
  console.log('📰 Probando creación de noticia sin imagen...\n');

  try {
    // Test data
    const testData = {
      title: 'Test News Article',
      summary: 'This is a test summary',
      content: 'This is the test content of the news article',
      category: 'Ofertas de Empleo',
      tags: 'test,news,article',
      priority: 'LOW',
      status: 'DRAFT',
      featured: false,
      targetAudience: 'YOUTH',
      region: 'Cochabamba'
    };

    console.log('📤 Enviando noticia sin imagen...');
    
    const response = await makeRequest('http://localhost:3001/api/newsarticle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    }, JSON.stringify(testData));

    console.log('📥 Status:', response.status);
    console.log('📊 Respuesta:', JSON.stringify(response.body, null, 2));

    if (response.status === 401) {
      console.log('✅ Éxito! El endpoint responde correctamente (token inválido esperado)');
    } else if (response.status === 400 && response.body.message) {
      console.log('📋 Error de validación:', response.body.message);
    } else if (response.status === 201) {
      console.log('✅ Éxito! Noticia creada sin imagen');
    } else {
      console.log('📊 Respuesta inesperada:', response.status);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testNewsCreation();
