const { Client } = require('minio');

// Configurar las credenciales de MinIO directamente
const minioClient = new Client({
  endPoint: 'bucket-production-1a58.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg',
  secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});

// Función helper para generar nombres únicos de archivo
function generateUniqueFilename(originalname, prefix = '') {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const extension = originalname.split('.').pop();
  return `${prefix}${timestamp}-${random}.${extension}`;
}

// Función para subir archivo a MinIO
async function uploadToMinio(bucketName, objectName, fileBuffer, contentType) {
  try {
    // Verificar si el bucket existe, si no, crearlo
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
    }
    
    // Subir archivo a MinIO
    await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, {
      'Content-Type': contentType
    });
    
    // Generar URL pública
    const publicUrl = `https://bucket-production-1a58.up.railway.app/${bucketName}/${objectName}`;
    
    console.log(`✅ Archivo subido a MinIO: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error subiendo archivo a MinIO:', error);
    throw error;
  }
}

async function testAllUploads() {
  try {
    console.log('🚀 Probando todas las funcionalidades de subida a MinIO...');
    console.log('📡 Conectando a: bucket-production-1a58.up.railway.app');
    
    // 1. Probar subida de imagen de perfil
    console.log('\n📸 1. Probando subida de imagen de perfil...');
    const imageContent = 'Este es un archivo de imagen de prueba (simulado)';
    const imageBuffer = Buffer.from(imageContent, 'utf8');
    const imageFilename = generateUniqueFilename('test-image.jpg', 'profile-');
    
    const imageUrl = await uploadToMinio('images', imageFilename, imageBuffer, 'image/jpeg');
    console.log('✅ Imagen de perfil subida:', imageUrl);
    
    // 2. Probar subida de CV (PDF)
    console.log('\n📄 2. Probando subida de CV...');
    const cvContent = 'Este es un archivo CV de prueba (simulado)';
    const cvBuffer = Buffer.from(cvContent, 'utf8');
    const cvFilename = generateUniqueFilename('test-cv.pdf', 'cv-');
    
    const cvUrl = await uploadToMinio('documents', cvFilename, cvBuffer, 'application/pdf');
    console.log('✅ CV subido:', cvUrl);
    
    // 3. Probar subida de carta de presentación (PDF)
    console.log('\n📝 3. Probando subida de carta de presentación...');
    const coverContent = 'Esta es una carta de presentación de prueba (simulado)';
    const coverBuffer = Buffer.from(coverContent, 'utf8');
    const coverFilename = generateUniqueFilename('test-cover.pdf', 'cover-');
    
    const coverUrl = await uploadToMinio('documents', coverFilename, coverBuffer, 'application/pdf');
    console.log('✅ Carta de presentación subida:', coverUrl);
    
    // 4. Probar subida de video
    console.log('\n🎥 4. Probando subida de video...');
    const videoContent = 'Este es un archivo de video de prueba (simulado)';
    const videoBuffer = Buffer.from(videoContent, 'utf8');
    const videoFilename = generateUniqueFilename('test-video.mp4', 'video-');
    
    const videoUrl = await uploadToMinio('videos', videoFilename, videoBuffer, 'video/mp4');
    console.log('✅ Video subido:', videoUrl);
    
    // 5. Probar subida de archivo genérico
    console.log('\n📁 5. Probando subida de archivo genérico...');
    const genericContent = 'Este es un archivo genérico de prueba';
    const genericBuffer = Buffer.from(genericContent, 'utf8');
    const genericFilename = generateUniqueFilename('test-file.txt');
    
    const genericUrl = await uploadToMinio('resources', genericFilename, genericBuffer, 'text/plain');
    console.log('✅ Archivo genérico subido:', genericUrl);
    
    // 6. Listar todos los buckets
    console.log('\n📋 6. Listando todos los buckets...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ Buckets disponibles:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (creado: ${bucket.creationDate})`);
    });
    
    // 7. Listar archivos en cada bucket
    console.log('\n📂 7. Listando archivos en cada bucket...');
    for (const bucket of buckets) {
      console.log(`\n📁 Archivos en bucket '${bucket.name}':`);
      const objectsStream = minioClient.listObjects(bucket.name, '', true);
      let fileCount = 0;
      
      objectsStream.on('data', (obj) => {
        console.log(`   - ${obj.name} (${obj.size} bytes)`);
        fileCount++;
      });
      
      objectsStream.on('end', () => {
        console.log(`   Total: ${fileCount} archivos`);
      });
      
      // Esperar un poco para que termine de listar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('\n📊 Resumen de archivos subidos:');
    console.log(`   - Imagen: ${imageUrl}`);
    console.log(`   - CV: ${cvUrl}`);
    console.log(`   - Carta: ${coverUrl}`);
    console.log(`   - Video: ${videoUrl}`);
    console.log(`   - Genérico: ${genericUrl}`);
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testAllUploads();
}

module.exports = { testAllUploads };
