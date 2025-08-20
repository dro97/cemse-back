const { Client } = require('minio');

// Configuración de MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Nombres de buckets
const BUCKETS = {
  VIDEOS: 'videos',
  IMAGES: 'images',
  DOCUMENTS: 'documents',
  COURSES: 'courses',
  LESSONS: 'lessons',
  RESOURCES: 'resources'
};

// Inicializar buckets si no existen
async function initializeBuckets() {
  try {
    const buckets = Object.values(BUCKETS);
    
    for (const bucketName of buckets) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
      }
      
      // Configurar política pública para videos, imágenes y recursos (siempre)
      if (bucketName === BUCKETS.VIDEOS || bucketName === BUCKETS.IMAGES || bucketName === BUCKETS.RESOURCES) {
        try {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucketName}/*`]
              }
            ]
          };
          
          await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
          console.log(`✅ Política pública configurada para bucket '${bucketName}'`);
        } catch (policyError) {
          console.log(`⚠️ No se pudo configurar política para '${bucketName}':`, policyError.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando buckets de MinIO:', error);
    throw error;
  }
}

async function initResourcesBucket() {
  try {
    console.log('🚀 Inicializando bucket de recursos en MinIO...');
    
    await initializeBuckets();
    
    console.log('✅ Bucket de recursos inicializado correctamente');
    console.log('📋 Buckets disponibles:');
    console.log('   - videos');
    console.log('   - images');
    console.log('   - documents');
    console.log('   - courses');
    console.log('   - lessons');
    console.log('   - resources (nuevo)');
    
  } catch (error) {
    console.error('❌ Error inicializando bucket de recursos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initResourcesBucket();
}

module.exports = { initResourcesBucket };
