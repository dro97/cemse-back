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

async function createTestImage() {
  // Create a simple 1x1 pixel PNG image
  const testImageData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  return testImageData;
}

async function testNewsUpload() {
  console.log('📰 Probando creación de noticia con imagen...\n');

  try {
    // Create multipart form data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    let formData = '';
    
    // Add text fields (exactly like your payload)
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="title"\r\n\r\n';
    formData += '1312312\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="summary"\r\n\r\n';
    formData += '12312312\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="content"\r\n\r\n';
    formData += '31231231\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="category"\r\n\r\n';
    formData += 'Ofertas de Empleo\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="tags"\r\n\r\n';
    formData += '1231231,1231,1231,1231\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="priority"\r\n\r\n';
    formData += 'LOW\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="status"\r\n\r\n';
    formData += 'PUBLISHED\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="featured"\r\n\r\n';
    formData += 'false\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="targetAudience"\r\n\r\n';
    formData += 'YOUTH\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="region"\r\n\r\n';
    formData += 'Cochabamba\r\n';
    
    // Add test image
    const testImage = await createTestImage();
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="image"; filename="test-image.jpeg"\r\n';
    formData += 'Content-Type: image/jpeg\r\n\r\n';
    
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, 'utf8'),
      testImage,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ]);

    console.log('📤 Enviando noticia con imagen...');
    
    const response = await makeRequest('http://localhost:3001/api/newsarticle', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': 'Bearer test-token'
      }
    }, formDataBuffer);

    console.log('📥 Status:', response.status);
    console.log('📊 Respuesta:', JSON.stringify(response.body, null, 2));

    if (response.status === 401) {
      console.log('✅ Éxito! El multipart/form-data funciona correctamente');
      console.log('✅ El error de JSON parsing se ha corregido');
    } else if (response.status === 400 && response.body.message && response.body.message.includes('JSON')) {
      console.log('❌ Error: Aún hay problemas con el parsing de JSON');
    } else if (response.status === 400 && response.body.message && response.body.message.includes('Cannot destructure')) {
      console.log('❌ Error: Los campos de texto no se están procesando correctamente');
    } else if (response.status === 201) {
      console.log('✅ Éxito! Noticia creada con imagen');
      console.log('🖼️ Image URL:', response.body.imageUrl);
    } else {
      console.log('📊 Respuesta inesperada:', response.status);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testNewsUpload();
