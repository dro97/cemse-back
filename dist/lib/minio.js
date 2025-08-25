"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKETS = void 0;
exports.initializeBuckets = initializeBuckets;
exports.uploadToMinio = uploadToMinio;
exports.deleteFromMinio = deleteFromMinio;
exports.getSignedUrl = getSignedUrl;
exports.fileExists = fileExists;
const minio_1 = require("minio");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const minioClient = new minio_1.Client({
    endPoint: 'bucket-production-1a58.up.railway.app',
    port: 443,
    useSSL: true,
    accessKey: 'EhBs2erfGeHfTbz0NgdeM5qPYrlI0zUg',
    secretKey: 'f09Z3szghyPcfAvF71xuk0C6xwxqKZPxYpZeRgIqoBtpeOjU'
});
exports.BUCKETS = {
    VIDEOS: 'videos',
    IMAGES: 'images',
    DOCUMENTS: 'documents',
    COURSES: 'courses',
    LESSONS: 'lessons',
    RESOURCES: 'resources',
    AUDIO: 'audio'
};
const BASE_URL = 'http://localhost:3001/uploads';
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
async function initializeBuckets() {
    try {
        console.log('🔍 Inicializando almacenamiento local...');
        const buckets = Object.values(exports.BUCKETS);
        for (const bucketName of buckets) {
            const bucketDir = path.join(uploadsDir, bucketName);
            if (!fs.existsSync(bucketDir)) {
                fs.mkdirSync(bucketDir, { recursive: true });
                console.log(`✅ Directorio '${bucketName}' creado exitosamente`);
            }
        }
        console.log('✅ Almacenamiento local inicializado');
    }
    catch (error) {
        console.error('❌ Error inicializando almacenamiento:', error);
    }
}
async function uploadToMinio(bucketName, objectName, fileBuffer, contentType) {
    try {
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName);
            console.log(`✅ Bucket '${bucketName}' creado exitosamente`);
        }
        await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, {
            'Content-Type': contentType
        });
        const publicUrl = `https://${process.env['MINIO_PUBLIC_HOST'] || 'bucket-production-1a58.up.railway.app'}/${bucketName}/${objectName}`;
        console.log(`✅ Archivo subido a MinIO: ${publicUrl}`);
        return publicUrl;
    }
    catch (error) {
        console.error('❌ Error subiendo archivo a MinIO:', error);
        throw error;
    }
}
async function deleteFromMinio(bucketName, objectName) {
    try {
        await minioClient.removeObject(bucketName, objectName);
        console.log(`✅ Archivo eliminado de MinIO: ${bucketName}/${objectName}`);
    }
    catch (error) {
        console.error('❌ Error eliminando archivo de MinIO:', error);
        throw error;
    }
}
async function getSignedUrl(bucketName, objectName, expirySeconds = 3600) {
    return `https://bucket-production-1a58.up.railway.app/${bucketName}/${objectName}`;
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