"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageToMinIO = exports.uploadResourceToMinIO = exports.uploadLessonResourceToMinIO = exports.processAndUploadLessonFiles = exports.uploadLessonFiles = exports.processAndUploadVideo = exports.uploadLessonVideo = void 0;
const multer_1 = __importDefault(require("multer"));
const minio_1 = require("../lib/minio");
const path_1 = __importDefault(require("path"));

// Configurar multer para almacenamiento en memoria (para luego subir a MinIO)
const storage = multer_1.default.memoryStorage();

// Middleware para subir imágenes (eventos, noticias, perfiles, etc.)
const uploadImageToMinIO = (req, res, next) => {
    multer_1.default({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB máximo para imágenes
            files: 1
        },
        fileFilter: (_req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedTypes.includes(file?.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'));
            }
        }
    }).fields([
        { name: 'image', maxCount: 1 },
        { name: 'profileImage', maxCount: 1 },
        { name: 'avatar', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ])(req, res, async (err) => {
        if (err) {
            return next(err);
        }

        // Procesar archivos subidos
        if (req.files) {
            const uploadedFiles = {};

            for (const [fieldName, files] of Object.entries(req.files)) {
                const fileArray = files;
                if (fileArray.length > 0) {
                    const file = fileArray[0];
                    
                    // Generar nombre único
                    const timestamp = Date.now();
                    const randomSuffix = Math.round(Math.random() * 1E9);
                    const fileExtension = path_1.default.extname(file?.originalname);
                    const objectName = `${fieldName}-${timestamp}-${randomSuffix}${fileExtension}`;

                    try {
                        const imageUrl = await (0, minio_1.uploadToMinio)(
                            minio_1.BUCKETS.IMAGES,
                            objectName,
                            file?.buffer || Buffer.alloc(0),
                            file?.mimetype || 'image/jpeg'
                        );

                        uploadedFiles[fieldName] = {
                            url: imageUrl,
                            filename: objectName,
                            originalName: file?.originalname,
                            size: file?.size,
                            mimetype: file?.mimetype,
                            bucket: minio_1.BUCKETS.IMAGES
                        };
                    } catch (error) {
                        console.error(`Error subiendo imagen ${fieldName}:`, error);
                        return res.status(500).json({
                            message: `Error subiendo imagen ${fieldName}`,
                            error: error.message
                        });
                    }
                }
            }

            req.uploadedImages = uploadedFiles;
        }

        next();
    });
};

exports.uploadImageToMinIO = uploadImageToMinIO;
exports.uploadLessonVideo = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024,
        files: 1
    },
    fileFilter: (_req, file, cb) => {
        const allowedVideoTypes = [
            'video/mp4',
            'video/webm',
            'video/ogg',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/flv',
            'video/mkv'
        ];
        if (allowedVideoTypes.includes(file?.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de video (MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV)'));
        }
    }
}).single('video');
const processAndUploadVideo = async (req, res, next) => {
    try {
        console.log('🔍 [DEBUG] processAndUploadVideo iniciado');
        console.log('📋 [DEBUG] req.file:', req.file ? 'Existe' : 'No existe');
        console.log('📋 [DEBUG] req.body:', req.body);
        if (!req.file) {
            console.log('❌ [DEBUG] No se encontró archivo en req.file');
            return res.status(400).json({
                message: 'No se proporcionó ningún archivo de video'
            });
        }
        const file = req.file;
        console.log('📁 [DEBUG] Archivo recibido:', {
            originalname: file?.originalname,
            mimetype: file?.mimetype,
            size: file?.size,
            bufferLength: file.buffer ? file.buffer.length : 'No buffer'
        });
        const { originalname, buffer, mimetype, size } = file;
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const fileExtension = originalname.split('.').pop();
        const objectName = `lesson-video-${timestamp}-${randomSuffix}.${fileExtension}`;
        console.log('📝 [DEBUG] Nombre del objeto generado:', objectName);
        console.log('☁️ [DEBUG] Subiendo archivo a MinIO...');
        const videoUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.VIDEOS, objectName, buffer, mimetype);
        console.log('✅ [DEBUG] Archivo subido a MinIO:', videoUrl);
        req.uploadedVideo = {
            url: videoUrl,
            filename: objectName,
            originalName: originalname,
            size: size,
            mimetype: mimetype,
            bucket: minio_1.BUCKETS.VIDEOS
        };
        console.log('📋 [DEBUG] req.uploadedVideo configurado:', req.uploadedVideo);
        next();
    }
    catch (error) {
        console.error('❌ [DEBUG] Error procesando video:', error);
        return res.status(500).json({
            message: 'Error subiendo video a MinIO',
            error: error.message
        });
    }
};
exports.processAndUploadVideo = processAndUploadVideo;
exports.uploadLessonFiles = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024,
        files: 5
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip', 'application/x-zip-compressed',
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
            'text/plain', 'text/csv'
        ];
        if (allowedTypes.includes(file?.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Tipo de archivo no permitido: ${file?.mimetype}`));
        }
    }
}).fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'attachments', maxCount: 3 }
]);
const processAndUploadLessonFiles = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                message: 'No se proporcionaron archivos'
            });
        }
        const uploadedFiles = {};
        for (const [fieldName, files] of Object.entries(req.files)) {
            const fileArray = files;
            if (fieldName === 'video') {
                const file = fileArray[0];
                const timestamp = Date.now();
                const randomSuffix = Math.round(Math.random() * 1E9);
                const fileExtension = file?.originalname?.split('.')?.pop() || 'mp4';
                const objectName = `lesson-video-${timestamp}-${randomSuffix}.${fileExtension}`;
                const videoUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.VIDEOS, objectName, file?.buffer || Buffer.alloc(0), file?.mimetype || 'application/octet-stream');
                uploadedFiles.video = {
                    url: videoUrl,
                    filename: objectName,
                    originalName: file?.originalname,
                    size: file?.size,
                    mimetype: file?.mimetype,
                    bucket: minio_1.BUCKETS.VIDEOS
                };
            }
            else if (fieldName === 'thumbnail') {
                const file = fileArray[0];
                const timestamp = Date.now();
                const randomSuffix = Math.round(Math.random() * 1E9);
                const fileExtension = file?.originalname?.split('.')?.pop() || 'mp4';
                const objectName = `lesson-thumbnail-${timestamp}-${randomSuffix}.${fileExtension}`;
                const imageUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.IMAGES, objectName, file?.buffer || Buffer.alloc(0), file?.mimetype || 'application/octet-stream');
                uploadedFiles.thumbnail = {
                    url: imageUrl,
                    filename: objectName,
                    originalName: file?.originalname,
                    size: file?.size,
                    mimetype: file?.mimetype,
                    bucket: minio_1.BUCKETS.IMAGES
                };
            }
            else if (fieldName === 'attachments') {
                uploadedFiles.attachments = [];
                for (const file of fileArray) {
                    const timestamp = Date.now();
                    const randomSuffix = Math.round(Math.random() * 1E9);
                    const fileExtension = file?.originalname?.split('.')?.pop() || 'mp4';
                    const objectName = `lesson-attachment-${timestamp}-${randomSuffix}.${fileExtension}`;
                    let bucket = minio_1.BUCKETS.DOCUMENTS;
                    if (file?.mimetype.startsWith('image/')) {
                        bucket = minio_1.BUCKETS.IMAGES;
                    }
                    else if (file?.mimetype.startsWith('video/')) {
                        bucket = minio_1.BUCKETS.VIDEOS;
                    }
                    const fileUrl = await (0, minio_1.uploadToMinio)(bucket, objectName, file?.buffer || Buffer.alloc(0), file?.mimetype || 'application/octet-stream');
                    uploadedFiles.attachments.push({
                        url: fileUrl,
                        filename: objectName,
                        originalName: file?.originalname,
                        size: file?.size,
                        mimetype: file?.mimetype,
                        bucket: bucket
                    });
                }
            }
        }
        req.uploadedFiles = uploadedFiles;
        next();
    }
    catch (error) {
        console.error('Error procesando archivos de lección:', error);
        return res.status(500).json({
            message: 'Error subiendo archivos a MinIO',
            error: error.message
        });
    }
};
exports.processAndUploadLessonFiles = processAndUploadLessonFiles;
const uploadLessonResourceToMinIO = (req, res, next) => {
    (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 1
        },
        fileFilter: (_req, file, cb) => {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip',
                'application/x-zip-compressed',
                'video/mp4',
                'video/webm',
                'video/ogg',
                'audio/mpeg',
                'audio/wav',
                'audio/ogg',
                'image/jpeg',
                'image/png',
                'image/gif',
                'text/plain'
            ];
            if (allowedTypes.includes(file?.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('File type not allowed'));
            }
        }
    }).fields([
        { name: 'file', maxCount: 1 }
    ])(req, res, async (err) => {
        if (err) {
            return next(err);
        }
        if (req.body) {
            if (req.body.orderIndex !== undefined) {
                req.body.orderIndex = parseInt(req.body.orderIndex) || 0;
            }
            if (req.body.isDownloadable !== undefined) {
                req.body.isDownloadable = req.body.isDownloadable === 'true' || req.body.isDownloadable === true;
            }
        }
        if (req.files && req.files['file'] && req.files['file'][0]) {
            try {
                const file = req.files['file'][0];
                console.log('📁 [DEBUG] Archivo recibido:', {
                    originalname: file?.originalname,
                    mimetype: file?.mimetype,
                    size: file?.size,
                    bufferLength: file.buffer.length
                });
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path_1.default.extname(file?.originalname);
                const filename = `lesson-resource-${uniqueSuffix}${ext}`;
                console.log('📝 [DEBUG] Nombre del objeto generado:', filename);
                console.log('☁️ [DEBUG] Subiendo archivo a MinIO...');
                const url = await (0, minio_1.uploadToMinio)('resources', filename, file?.buffer || Buffer.alloc(0), file?.mimetype);
                console.log('✅ Archivo subido exitosamente:', url);
                req.uploadedResource = {
                    url: url,
                    filename: filename,
                    originalName: file?.originalname,
                    size: file?.size,
                    mimetype: file?.mimetype,
                    bucket: 'resources'
                };
                console.log('✅ [DEBUG] Archivo subido a MinIO:', url);
                console.log('📋 [DEBUG] (req as any).uploadedResource configurado:', req.uploadedResource);
            }
            catch (error) {
                console.error('❌ [ERROR] Error uploading to MinIO:', error);
                return next(error);
            }
        }
        next();
    });
};
exports.uploadLessonResourceToMinIO = uploadLessonResourceToMinIO;
const uploadResourceToMinIO = (req, res, next) => {
    (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: {
            fileSize: 100 * 1024 * 1024,
            files: 1
        },
        fileFilter: (_req, file, cb) => {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/zip',
                'application/x-zip-compressed',
                'application/rar',
                'application/x-rar-compressed',
                'video/mp4',
                'video/webm',
                'video/ogg',
                'video/avi',
                'video/mov',
                'video/wmv',
                'video/flv',
                'video/mkv',
                'audio/mpeg',
                'audio/wav',
                'audio/ogg',
                'audio/mp3',
                'audio/aac',
                'audio/flac',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
                'image/bmp',
                'image/tiff',
                'text/plain',
                'text/csv',
                'text/html',
                'text/css',
                'text/javascript',
                'application/json',
                'application/xml'
            ];
            if (allowedTypes.includes(file?.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error(`Tipo de archivo no permitido: ${file?.mimetype}`));
            }
        }
    }).fields([
        { name: 'file', maxCount: 1 }
    ])(req, res, async (err) => {
        if (err) {
            return next(err);
        }
        if (req.files && req.files['file'] && req.files['file'][0]) {
            try {
                const file = req.files['file'][0];
                console.log('📁 [DEBUG] Archivo de recurso recibido:', {
                    originalname: file?.originalname,
                    mimetype: file?.mimetype,
                    size: file?.size,
                    bufferLength: file.buffer.length
                });
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path_1.default.extname(file?.originalname);
                const filename = `general-resource-${uniqueSuffix}${ext}`;
                console.log('📝 [DEBUG] Nombre del objeto generado:', filename);
                let bucket = 'resources';
                if (file?.mimetype.startsWith('image/')) {
                    bucket = 'images';
                }
                else if (file?.mimetype.startsWith('video/')) {
                    bucket = 'videos';
                }
                else if (file?.mimetype.startsWith('audio/')) {
                    bucket = 'audio';
                }
                console.log('☁️ [DEBUG] Subiendo archivo a MinIO bucket:', bucket);
                const url = await (0, minio_1.uploadToMinio)(bucket, filename, file?.buffer || Buffer.alloc(0), file?.mimetype);
                console.log('✅ Archivo subido exitosamente:', url);
                req.uploadedResource = {
                    url: url,
                    filename: filename,
                    originalName: file?.originalname,
                    size: file?.size,
                    mimetype: file?.mimetype,
                    bucket: bucket
                };
                console.log('✅ [DEBUG] Archivo subido a MinIO:', url);
                console.log('📋 [DEBUG] (req as any).uploadedResource configurado:', req.uploadedResource);
            }
            catch (error) {
                console.error('❌ [ERROR] Error uploading to MinIO:', error);
                return next(error);
            }
        }
        next();
    });
};
exports.uploadResourceToMinIO = uploadResourceToMinIO;
//# sourceMappingURL=minioUpload.js.map