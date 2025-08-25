import { Client } from 'minio';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

// Configuración de MinIO para Railway
const minioClient = new Client({
  endPoint: 'bucket-production-1a58.up.railway.app',
  port: 443,
  useSSL: true,
  accessKey: 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg',
  secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
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

// URL base para acceder a los archivos (local)
const BASE_URL = 'http://localhost:3001/uploads';

// Asegurar que existe el directorio de uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Inicializar buckets si no existen (versión local)
export async function initializeBuckets() {
  try {
    console.log('🔍 Inicializando almacenamiento local...');
    
    // Crear directorios locales
    const buckets = Object.values(BUCKETS);
    for (const bucketName of buckets) {
      const bucketDir = path.join(uploadsDir, bucketName);
      if (!fs.existsSync(bucketDir)) {
        fs.mkdirSync(bucketDir, { recursive: true });
        console.log(`✅ Directorio '${bucketName}' creado exitosamente`);
      }
    }
    
    console.log('✅ Almacenamiento local inicializado');
  } catch (error) {
    console.error('❌ Error inicializando almacenamiento:', error);
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
    const publicUrl = `https://${process.env['MINIO_PUBLIC_HOST'] || 'bucket-production-1a58.up.railway.app'}/${bucketName}/${objectName}`;
    
    console.log(`✅ Archivo subido a MinIO: ${publicUrl}`);
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
    console.log(`✅ Archivo eliminado de MinIO: ${bucketName}/${objectName}`);
  } catch (error) {
    console.error('❌ Error eliminando archivo de MinIO:', error);
    throw error;
  }
}

// Función para obtener URL pública de MinIO
export async function getSignedUrl(bucketName: string, objectName: string, expirySeconds: number = 3600): Promise<string> {
  return `https://bucket-production-1a58.up.railway.app/${bucketName}/${objectName}`;
}

// Función para verificar si un archivo existe en MinIO
export async function fileExists(bucketName: string, objectName: string): Promise<boolean> {
  try {
    await minioClient.statObject(bucketName, objectName);
    return true;
  } catch (error) {
    return false;
  }
}

export default minioClient;
