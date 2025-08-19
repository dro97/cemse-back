const { Client } = require('minio');

// Configuración de MinIO
const minioClient = new Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin'
});

// Función para verificar y configurar políticas
async function checkAndSetPolicies() {
  try {
    console.log('🔍 Verificando políticas de buckets...\n');
    
    const bucketsToCheck = ['videos', 'images'];
    
    for (const bucketName of bucketsToCheck) {
      try {
        console.log(`📋 Verificando bucket: ${bucketName}`);
        
        // Verificar si el bucket existe
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
          console.log(`❌ Bucket '${bucketName}' no existe`);
          continue;
        }
        
        // Intentar obtener la política actual
        try {
          const currentPolicy = await minioClient.getBucketPolicy(bucketName);
          console.log(`ℹ️ Política actual de '${bucketName}':`, currentPolicy);
        } catch (error) {
          console.log(`⚠️ No hay política configurada para '${bucketName}'`);
        }
        
        // Configurar política pública
        const publicPolicy = {
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
        
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
        console.log(`✅ Política pública configurada para '${bucketName}'\n`);
        
      } catch (error) {
        console.error(`❌ Error con bucket '${bucketName}':`, error.message);
      }
    }
    
    console.log('🎉 Verificación de políticas completada!');
    
  } catch (error) {
    console.error('❌ Error verificando políticas:', error);
  }
}

// Función para probar acceso público
async function testPublicAccess() {
  try {
    console.log('\n🧪 Probando acceso público...');
    
    // Crear un archivo de prueba
    const testData = Buffer.from('Archivo de prueba para acceso público');
    const objectName = `public-test-${Date.now()}.txt`;
    
    // Subir archivo
    await minioClient.putObject('videos', objectName, testData, testData.length, {
      'Content-Type': 'text/plain'
    });
    
    console.log(`✅ Archivo subido: ${objectName}`);
    
    // Generar URL pública
    const publicUrl = `http://127.0.0.1:9000/videos/${objectName}`;
    console.log(`🔗 URL pública: ${publicUrl}`);
    
    // Probar acceso con fetch (simular acceso desde navegador)
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        const content = await response.text();
        console.log(`✅ Acceso público exitoso! Contenido: "${content}"`);
      } else {
        console.log(`❌ Error de acceso público: ${response.status} ${response.statusText}`);
      }
    } catch (fetchError) {
      console.log(`⚠️ No se pudo probar acceso público (puede ser normal en Node.js): ${fetchError.message}`);
    }
    
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Error en prueba de acceso público:', error);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando verificación de MinIO...\n');
    
    // Verificar conexión
    console.log('🔍 Verificando conexión con MinIO...');
    await minioClient.listBuckets();
    console.log('✅ Conexión exitosa con MinIO\n');
    
    // Verificar y configurar políticas
    await checkAndSetPolicies();
    
    // Probar acceso público
    await testPublicAccess();
    
    console.log('\n📋 Resumen:');
    console.log('🌐 Consola Web: http://127.0.0.1:9001');
    console.log('🔑 Usuario: minioadmin');
    console.log('🔐 Contraseña: minioadmin');
    console.log('📁 Buckets públicos: videos, images');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  checkAndSetPolicies,
  testPublicAccess
};
