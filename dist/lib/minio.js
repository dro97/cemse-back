"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKETS = void 0;
exports.initializeBuckets = initializeBuckets;
exports.uploadToMinio = uploadToMinio;
exports.deleteFromMinio = deleteFromMinio;
exports.getSignedUrl = getSignedUrl;
exports.fileExists = fileExists;
const minio_1 = require("minio");
const stream_1 = require("stream");
const minioClient = new minio_1.Client({
    endPoint: 'bucket-production-1a58.up.railway.app',
    port: 443,
    useSSL: true,
    accessKey: 'EhBs2erfGeHfTbz0NgdeM5qPYr1I0zUg',
    secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});
exports.BUCKETS = {
    VIDEOS: 'videos',
    IMAGES: 'images',
    DOCUMENTS: 'documents',
    COURSES: 'courses',
    LESSONS: 'lessons',
    RESOURCES: 'resources'
};
async function initializeBuckets() {
    try {
        const buckets = Object.values(exports.BUCKETS);
        for (const bucketName of buckets) {
            const exists = await minioClient.bucketExists(bucketName);
            if (!exists) {
                await minioClient.makeBucket(bucketName, 'us-east-1');
                console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
            }
            if (bucketName === exports.BUCKETS.VIDEOS || bucketName === exports.BUCKETS.IMAGES || bucketName === exports.BUCKETS.RESOURCES) {
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
                }
                catch (policyError) {
                    console.log(`⚠️ No se pudo configurar política para '${bucketName}':`, policyError.message);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Error inicializando buckets de MinIO:', error);
    }
}
async function uploadToMinio(bucketName, objectName, fileBuffer, contentType) {
    try {
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            console.log(`📦 Creando bucket '${bucketName}'...`);
            await minioClient.makeBucket(bucketName, 'us-east-1');
            if (bucketName === 'resources') {
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
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error('Buffer de archivo vacío o inválido');
        }
        console.log(`📤 Subiendo archivo: ${objectName} (${fileBuffer.length} bytes) a bucket: ${bucketName}`);
        const stream = stream_1.Readable.from(fileBuffer);
        await minioClient.putObject(bucketName, objectName, stream, fileBuffer.length, {
            'Content-Type': contentType
        });
        const baseUrl = 'https://bucket-production-1a58.up.railway.app:443';
        const publicUrl = `${baseUrl}/${bucketName}/${objectName}`;
        console.log(`✅ Archivo subido exitosamente: ${publicUrl}`);
        return publicUrl;
    }
    catch (error) {
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
async function deleteFromMinio(bucketName, objectName) {
    try {
        await minioClient.removeObject(bucketName, objectName);
        console.log(`✅ Archivo eliminado exitosamente: ${bucketName}/${objectName}`);
    }
    catch (error) {
        console.error('❌ Error eliminando archivo de MinIO:', error);
        throw error;
    }
}
async function getSignedUrl(bucketName, objectName, expirySeconds = 3600) {
    try {
        const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
        return url;
    }
    catch (error) {
        console.error('❌ Error generando URL firmada:', error);
        throw error;
    }
}
async function fileExists(bucketName, objectName) {
    try {
        await minioClient.statObject(bucketName, objectName);
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.default = minioClient;
//# sourceMappingURL=minio.js.map