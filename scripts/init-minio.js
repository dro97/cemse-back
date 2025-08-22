const { Client } = require('minio');

// Configuración de MinIO
// Use environment variables or fallback to docker service name
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
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
  LESSONS: 'lessons'
};

// Función para inicializar buckets
async function initializeBuckets() {
  try {
    console.log('🚀 Inicializando buckets de MinIO...\n');
    
    const buckets = Object.values(BUCKETS);
    
    for (const bucketName of buckets) {
      try {
        const exists = await minioClient.bucketExists(bucketName);
        
        if (!exists) {
          await minioClient.makeBucket(bucketName, 'us-east-1');
          console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
          
          // Configurar política pública para videos e imágenes
          if (bucketName === BUCKETS.VIDEOS || bucketName === BUCKETS.IMAGES) {
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
          }
        } else {
          console.log(`ℹ️ Bucket '${bucketName}' ya existe`);
        }
      } catch (error) {
        console.error(`❌ Error con bucket '${bucketName}':`, error.message);
      }
    }
    
    console.log('\n🎉 Inicialización completada!');
    console.log('\n📋 Información de acceso:');
    console.log('🌐 Consola Web: http://127.0.0.1:9001');
    console.log('🔑 Usuario: minioadmin');
    console.log('🔐 Contraseña: minioadmin');
    console.log('\n📁 Buckets creados:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket}`);
    });
    
  } catch (error) {
    console.error('❌ Error inicializando buckets:', error);
  }
}

// Función para probar subida de archivo
async function testUpload() {
  try {
    console.log('\n🧪 Probando subida de archivo...');
    
    // Crear un archivo de prueba
    const testData = Buffer.from('Este es un archivo de prueba para MinIO');
    const objectName = `test-${Date.now()}.txt`;
    
    await minioClient.putObject('videos', objectName, testData, testData.length, {
      'Content-Type': 'text/plain'
    });
    
    console.log(`✅ Archivo de prueba subido: ${objectName}`);
    
    // Generar URL pública
    const publicUrl = `http://127.0.0.1:9000/videos/${objectName}`;
    console.log(`🔗 URL pública: ${publicUrl}`);
    
    // Verificar que el archivo existe
    const exists = await minioClient.statObject('videos', objectName);
    console.log(`📊 Tamaño del archivo: ${exists.size} bytes`);
    
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Error en prueba de subida:', error);
  }
}

// Función principal
async function main() {
  try {
    // Verificar conexión
    console.log('🔍 Verificando conexión con MinIO...');
    await minioClient.listBuckets();
    console.log('✅ Conexión exitosa con MinIO\n');
    
    // Inicializar buckets
    await initializeBuckets();
    
    // Probar subida
    await testUpload();
    
  } catch (error) {
    console.error('❌ Error de conexión con MinIO:', error.message);
    console.log('\n💡 Asegúrate de que MinIO esté ejecutándose:');
    console.log('   minio.exe server C:\\minio-data --console-address ":9001"');
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  initializeBuckets,
  testUpload
};
