const { Client } = require('minio');

// Configuración de MinIO con las credenciales correctas
const minioClient = new Client({
  endPoint: 'bucket-production-1a58.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'EhBs2erfGeHfTbz0NgdeW5qPYr1I0zUg',
  secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});

async function testMinIOConnection() {
  try {
    console.log('🔍 Probando conexión a MinIO...');
    
    // Probar listar buckets
    console.log('📋 Listando buckets...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    // Probar crear un bucket de prueba
    const testBucketName = 'test-bucket-' + Date.now();
    console.log(`📦 Creando bucket de prueba: ${testBucketName}`);
    await minioClient.makeBucket(testBucketName, 'us-east-1');
    console.log('✅ Bucket creado exitosamente');
    
    // Probar subir un archivo de prueba
    const testContent = 'Hello MinIO!';
    const testFileName = 'test-file.txt';
    console.log(`📤 Subiendo archivo de prueba: ${testFileName}`);
    
    await minioClient.putObject(testBucketName, testFileName, Buffer.from(testContent), testContent.length, {
      'Content-Type': 'text/plain'
    });
    console.log('✅ Archivo subido exitosamente');
    
    // Probar obtener el archivo
    console.log('📥 Descargando archivo...');
    const dataStream = await minioClient.getObject(testBucketName, testFileName);
    let data = '';
    dataStream.on('data', chunk => data += chunk);
    dataStream.on('end', () => {
      console.log('✅ Archivo descargado:', data);
    });
    
    // Limpiar - eliminar bucket de prueba
    console.log('🧹 Limpiando bucket de prueba...');
    await minioClient.removeObject(testBucketName, testFileName);
    await minioClient.removeBucket(testBucketName);
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error en la prueba de MinIO:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

// Ejecutar la prueba
testMinIOConnection();
