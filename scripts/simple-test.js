const http = require('http');

const courseId = 'cme8sp5iu0000kn51lnawd6km';
const url = `http://localhost:3001/api/course/${courseId}`;

console.log(`🔍 Probando: ${url}`);

const req = http.get(url, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Respuesta completa:');
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
