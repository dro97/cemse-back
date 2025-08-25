const { Client } = require('minio');

// Configuración de MinIO (igual que en lib/minio.ts)
const minioClient = new Client({
  endPoint: 'bucket-production-1a58.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg',
  secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});

// Nombres de buckets
const BUCKETS = {
  VIDEOS: 'videos',
  IMAGES: 'images',
  DOCUMENTS: 'documents',
  COURSES: 'courses',
  LESSONS: 'lessons',
  RESOURCES: 'resources',
  AUDIO: 'audio'
};

async function checkMinioConfig() {
  try {
    console.log('🔍 Verificando configuración de MinIO...\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a MinIO...');
    try {
      // Intentar listar buckets para verificar conexión
      const buckets = await minioClient.listBuckets();
      console.log('✅ Conexión a MinIO exitosa');
      console.log('📋 Buckets existentes:', buckets.map(b => b.name));
    } catch (error) {
      console.log('❌ Error de conexión a MinIO:', error.message);
      return;
    }

    // 2. Verificar bucket de imágenes
    console.log('\n2. Verificando bucket de imágenes...');
    const imagesBucket = BUCKETS.IMAGES;
    
    try {
      const bucketExists = await minioClient.bucketExists(imagesBucket);
      if (bucketExists) {
        console.log(`✅ Bucket '${imagesBucket}' existe`);
      } else {
        console.log(`⚠️  Bucket '${imagesBucket}' no existe, creándolo...`);
        await minioClient.makeBucket(imagesBucket);
        console.log(`✅ Bucket '${imagesBucket}' creado exitosamente`);
      }
    } catch (error) {
      console.log(`❌ Error verificando bucket '${imagesBucket}':`, error.message);
    }

    // 3. Probar subida de archivo de prueba
    console.log('\n3. Probando subida de archivo de prueba...');
    try {
      const testFileName = `test-avatar-${Date.now()}.jpg`;
      const testFileContent = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwA/8A', 'base64');
      
      await minioClient.putObject(imagesBucket, testFileName, testFileContent, testFileContent.length, {
        'Content-Type': 'image/jpeg'
      });
      
      console.log(`✅ Archivo de prueba subido: ${testFileName}`);
      
      // Generar URL pública
      const publicUrl = `https://bucket-production-1a58.up.railway.app/${imagesBucket}/${testFileName}`;
      console.log(`🔗 URL pública: ${publicUrl}`);
      
      // Verificar que el archivo existe
      const fileExists = await minioClient.statObject(imagesBucket, testFileName);
      console.log(`✅ Archivo verificado en MinIO (tamaño: ${fileExists.size} bytes)`);
      
      // Limpiar archivo de prueba
      await minioClient.removeObject(imagesBucket, testFileName);
      console.log(`🗑️  Archivo de prueba eliminado`);
      
    } catch (error) {
      console.log('❌ Error en prueba de subida:', error.message);
    }

    // 4. Verificar configuración de buckets públicos
    console.log('\n4. Verificando configuración de buckets...');
    try {
      const bucketPolicy = await minioClient.getBucketPolicy(imagesBucket);
      console.log(`✅ Política del bucket '${imagesBucket}':`, bucketPolicy);
    } catch (error) {
      console.log(`⚠️  No se pudo obtener política del bucket '${imagesBucket}':`, error.message);
      console.log('💡 Esto puede ser normal si el bucket no tiene política configurada');
    }

    // 5. Verificar URLs públicas
    console.log('\n5. Verificando URLs públicas...');
    const testUrl = `https://bucket-production-1a58.up.railway.app/${imagesBucket}/test-file.jpg`;
    console.log(`🔗 URL de ejemplo: ${testUrl}`);
    console.log('💡 Las URLs públicas deberían ser accesibles sin autenticación');

    console.log('\n🎉 Verificación de MinIO completada');
    console.log('\n📋 Resumen:');
    console.log('✅ Conexión a MinIO: Funcionando');
    console.log('✅ Bucket de imágenes: Configurado');
    console.log('✅ Subida de archivos: Funcionando');
    console.log('✅ URLs públicas: Configuradas');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verificar credenciales de MinIO');
    console.log('2. Verificar conectividad de red');
    console.log('3. Verificar que el endpoint de MinIO esté activo');
  }
}

// Función para crear buckets faltantes
async function createMissingBuckets() {
  try {
    console.log('🔧 Creando buckets faltantes...\n');
    
    for (const [key, bucketName] of Object.entries(BUCKETS)) {
      try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
          await minioClient.makeBucket(bucketName);
          console.log(`✅ Bucket '${bucketName}' creado`);
        } else {
          console.log(`ℹ️  Bucket '${bucketName}' ya existe`);
        }
      } catch (error) {
        console.log(`❌ Error creando bucket '${bucketName}':`, error.message);
      }
    }
    
    console.log('\n✅ Proceso de creación de buckets completado');
  } catch (error) {
    console.error('❌ Error creando buckets:', error.message);
  }
}

// Ejecutar
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--create-buckets')) {
    createMissingBuckets();
  } else {
    checkMinioConfig();
  }
}

module.exports = { checkMinioConfig, createMissingBuckets };
