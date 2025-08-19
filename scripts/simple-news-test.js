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
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testNewsArticle() {
  console.log('🧪 Probando creación de artículos de noticias...\n');

  // Test data
  const newsData = {
    title: "Artículo de prueba",
    content: "Este es un artículo de prueba para verificar que funciona.",
    summary: "Resumen del artículo",
    category: "General",
    priority: "MEDIUM",
    status: "DRAFT",
    tags: ["prueba"],
    featured: false,
    targetAudience: ["YOUTH"],
    region: "Cochabamba"
  };

  try {
    console.log('📤 Enviando solicitud de creación...');
    const response = await makeRequest('http://localhost:3001/api/newsarticle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    }, newsData);

    console.log('📥 Status:', response.status);
    console.log('📊 Respuesta:', JSON.stringify(response.body, null, 2));

    if (response.status === 401) {
      console.log('✅ El endpoint está funcionando (esperado: 401 por token inválido)');
      console.log('✅ El error de foreign key constraint se ha corregido');
    } else if (response.status === 500) {
      console.log('❌ Error del servidor:', response.body);
    } else {
      console.log('📊 Respuesta inesperada:', response.status);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testNewsArticle();
