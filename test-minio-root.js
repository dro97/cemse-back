const { Client } = require('minio');

// Probar con credenciales root
const minioClient = new Client({
  endPoint: 'bucket-production-1a58.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'EhBs2erfGeHfTbz0NgdeW5qPYr1I0zUg', // Root user
  secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU' // Root password
});

async function testMinIORoot() {
  try {
    console.log('🔍 Probando conexión a MinIO con credenciales root...');
    
    // Probar listar buckets
    console.log('📋 Listando buckets...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
  } catch (error) {
    console.error('❌ Error con credenciales root:', error.message);
    console.error('📋 Código de error:', error.code);
  }
}

testMinIORoot();
