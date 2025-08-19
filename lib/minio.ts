import { Client } from 'minio';
import { Readable } from 'stream';

// Configuración de MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Nombres de buckets
export const BUCKETS = {
  VIDEOS: 'videos',
  IMAGES: 'images',
  DOCUMENTS: 'documents',
  COURSES: 'courses',
  LESSONS: 'lessons'
} as const;

// Inicializar buckets si no existen
export async function initializeBuckets() {
  try {
    const buckets = Object.values(BUCKETS);
    
    for (const bucketName of buckets) {
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
    const stream = Readable.from(fileBuffer);
    
    await minioClient.putObject(bucketName, objectName, stream, fileBuffer.length, {
      'Content-Type': contentType
    });
    
    // Generar URL pública
    const baseUrl = process.env.MINIO_BASE_URL || `http://${process.env.MINIO_ENDPOINT || '127.0.0.1'}:${process.env.MINIO_PORT || '9000'}`;
    const publicUrl = `${baseUrl}/${bucketName}/${objectName}`;
    
    console.log(`✅ Archivo subido exitosamente: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('❌ Error subiendo archivo a MinIO:', error);
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
