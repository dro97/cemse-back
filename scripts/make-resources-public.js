const { Client } = require('minio');

// Configuración de MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'false' ? false : true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

async function makeResourcesPublic() {
  try {
    console.log('🔓 Configurando bucket "resources" como público...');
    
    const bucketName = 'resources';
    
    // Verificar que el bucket existe
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`📦 Creando bucket '${bucketName}'...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
    }
    
    // Configurar política pública
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*']
          },
          Action: [
            's3:GetObject'
          ],
          Resource: [
            `arn:aws:s3:::${bucketName}/*`
          ]
        }
      ]
    };
    
    console.log('📋 Aplicando política pública...');
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    
    console.log('✅ Bucket "resources" configurado como público exitosamente!');
    console.log('🌐 Ahora puedes acceder a los archivos directamente desde el navegador');
    console.log('📁 URL de ejemplo: http://127.0.0.1:9000/resources/tu-archivo.pdf');
    
    // Verificar la política aplicada
    try {
      const currentPolicy = await minioClient.getBucketPolicy(bucketName);
      console.log('📋 Política actual del bucket:');
      console.log(JSON.parse(currentPolicy));
    } catch (error) {
      console.log('⚠️ No se pudo verificar la política actual');
    }
    
  } catch (error) {
    console.error('❌ Error configurando bucket como público:', error);
    console.error('📋 Detalles del error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  makeResourcesPublic();
}

module.exports = { makeResourcesPublic };
