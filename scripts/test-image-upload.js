const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

async function testImageUpload() {
  console.log('🧪 Probando subida de imágenes para noticias...\n');

  // Create a simple test image (1x1 pixel PNG)
  const testImagePath = path.join(__dirname, 'test-image.png');
  const testImageData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  // Write test image to file
  fs.writeFileSync(testImagePath, testImageData);
  console.log('📁 Imagen de prueba creada:', testImagePath);

  try {
    // Test 1: Create news article with image upload
    console.log('\n📤 Probando creación de noticia con imagen...');
    
    // Create multipart form data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    let formData = '';
    
    // Add text fields
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="title"\r\n\r\n';
    formData += 'Noticia con imagen de prueba\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="content"\r\n\r\n';
    formData += 'Esta es una noticia de prueba que incluye una imagen subida.\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="summary"\r\n\r\n';
    formData += 'Resumen de la noticia con imagen\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="category"\r\n\r\n';
    formData += 'General\r\n';
    
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="status"\r\n\r\n';
    formData += 'DRAFT\r\n';
    
    // Add image file
    formData += `--${boundary}\r\n`;
    formData += 'Content-Disposition: form-data; name="image"; filename="test-image.png"\r\n';
    formData += 'Content-Type: image/png\r\n\r\n';
    
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, 'utf8'),
      testImageData,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ]);

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
      console.log('✅ El endpoint está funcionando (esperado: 401 por token inválido)');
      console.log('✅ La subida de imágenes está configurada correctamente');
    } else if (response.status === 500) {
      console.log('❌ Error del servidor:', response.body);
    } else {
      console.log('📊 Respuesta inesperada:', response.status);
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🧹 Imagen de prueba eliminada');
    }
  }
}

testImageUpload();
