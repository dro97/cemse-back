const { uploadToMinio } = require('../lib/minio');

// Configurar las credenciales de MinIO directamente
process.env.MINIO_PUBLIC_HOST = 'bucket-production-1a58.up.railway.app';
process.env.MINIO_PUBLIC_PORT = '443';
process.env.MINIO_ROOT_USER = 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg';
process.env.MINIO_ROOT_PASSWORD = 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU';

async function testMinioUpload() {
  try {
    console.log('🚀 Probando subida a MinIO...');
    console.log('📡 Conectando a:', process.env.MINIO_PUBLIC_HOST);
    
    // Crear un archivo de prueba simple
    const testContent = 'Este es un archivo de prueba para verificar la subida a MinIO';
    const buffer = Buffer.from(testContent, 'utf8');
    
    const filename = `test-${Date.now()}.txt`;
    
    console.log('📤 Subiendo archivo de prueba...');
    const url = await uploadToMinio('resources', filename, buffer, 'text/plain');
    
    console.log('✅ Subida exitosa!');
    console.log('📋 URL del archivo:', url);
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
