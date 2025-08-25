const { Client } = require('minio');

// Configurar las credenciales de MinIO directamente
const minioClient = new Client({
  endPoint: 'bucket-production-1a58.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg',
  secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});

async function testMinioUpload() {
  try {
    console.log('🚀 Probando subida a MinIO...');
    console.log('📡 Conectando a: bucket-production-1a58.up.railway.app');
    
    // Crear un archivo de prueba simple
    const testContent = 'Este es un archivo de prueba para verificar la subida a MinIO';
    const buffer = Buffer.from(testContent, 'utf8');
    
    const bucketName = 'resources';
    const filename = `test-${Date.now()}.txt`;
    
    console.log('📤 Subiendo archivo de prueba...');
    
    // Verificar si el bucket existe, si no, crearlo
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
    }
    
    // Subir archivo a MinIO
    await minioClient.putObject(bucketName, filename, buffer, buffer.length, {
      'Content-Type': 'text/plain'
    });
    
    // Generar URL pública
    const publicUrl = `https://bucket-production-1a58.up.railway.app/${bucketName}/${filename}`;
    
    console.log('✅ Subida exitosa!');
    console.log('📋 URL del archivo:', publicUrl);
    console.log('📁 Nombre del archivo:', filename);
    console.log('📏 Tamaño:', buffer.length, 'bytes');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testMinioUpload();
}

module.exports = { testMinioUpload };
