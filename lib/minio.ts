import { Client } from 'minio';
import { Readable } from 'stream';

// Configuración de MinIO para Railway
const minioClient = new Client({
  endPoint: process.env['MINIO_ENDPOINT'] || 'bucket-production-1a58.up.railway.app',
  port: parseInt(process.env['MINIO_PORT'] || '443'),
  useSSL: true, // Railway usa HTTPS
  accessKey: process.env['MINIO_ACCESS_KEY'] || 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg',
  secretKey: process.env['MINIO_SECRET_KEY'] || 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});

// Nombres de buckets
export const BUCKETS = {
  VIDEOS: 'videos',
  IMAGES: 'images',
  DOCUMENTS: 'documents',
  COURSES: 'courses',
  LESSONS: 'lessons',
  RESOURCES: 'resources',
  AUDIO: 'audio'
} as const;

// URL base para acceder a los archivos
const BASE_URL = 'https://bucket-production-1a58.up.railway.app:443';

// Inicializar buckets si no existen
export async function initializeBuckets() {
  try {
    const buckets = Object.values(BUCKETS);
    
    for (const bucketName of buckets) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1');
        console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
      }
      
      // Configurar política pública para TODOS los buckets
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
        console.log(`⚠️ No se pudo configurar política para '${bucketName}':`, (policyError as any).message);
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando buckets de MinIO:', error);
  }
}

// Función para subir archivo a MinIO
export async function uploadToMinio(
  bucketName: string,
  objectName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  try {
    // Verificar que el bucket existe
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`📦 Creando bucket '${bucketName}'...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      
      // Configurar política pública para TODOS los buckets
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
    
    // Verificar que el buffer es válido
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Buffer de archivo vacío o inválido');
    }
    
    console.log(`📤 Subiendo archivo: ${objectName} (${fileBuffer.length} bytes) a bucket: ${bucketName}`);
    
    const stream = Readable.from(fileBuffer);
    
    await minioClient.putObject(bucketName, objectName, stream, fileBuffer.length, {
      'Content-Type': contentType
    });
    
    // Generar URL pública usando la URL de Railway
    const publicUrl = `${BASE_URL}/${bucketName}/${objectName}`;
    
    console.log(`✅ Archivo subido exitosamente: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error subiendo archivo a MinIO:', error);
    console.error('📋 Detalles del error:', {
      bucketName,
      objectName,
      bufferLength: fileBuffer?.length,
      contentType
    });
    throw error;
  }
}

// Función para eliminar archivo de MinIO
export async function deleteFromMinio(bucketName: string, objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`✅ Archivo eliminado exitosamente: ${bucketName}/${objectName}`);
  } catch (error) {
    console.error('❌ Error eliminando archivo de MinIO:', error);
    throw error;
  }
}

// Función para obtener URL firmada (para archivos privados)
export async function getSignedUrl(bucketName: string, objectName: string, expirySeconds: number = 3600): Promise<string> {
  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
    return url;
  } catch (error) {
    console.error('❌ Error generando URL firmada:', error);
    throw error;
  }
}

// Función para verificar si un archivo existe
export async function fileExists(bucketName: string, objectName: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucketName, objectName);
    return true;
  } catch (error) {
    return false;
  }
}

export default minioClient;
