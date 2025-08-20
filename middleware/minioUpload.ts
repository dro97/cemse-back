import multer from 'multer';
import { uploadToMinio, BUCKETS } from '../lib/minio';
import path from 'path'; // Added for path.extname

// Configurar multer para almacenamiento en memoria (para luego subir a MinIO)
const storage = multer.memoryStorage();

// Configurar multer para videos de lecciones
export const uploadLessonVideo = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB máximo para videos de lecciones
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo videos
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
    
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video (MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV)'));
    }
  }
}).single('video');

// Middleware para procesar y subir video a MinIO
export const processAndUploadVideo = async (req: any, res: any, next: any) => {
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
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer ? file.buffer.length : 'No buffer'
    });

    const { originalname, buffer, mimetype, size } = file;

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const fileExtension = originalname.split('.').pop();
    const objectName = `lesson-video-${timestamp}-${randomSuffix}.${fileExtension}`;
    
    console.log('📝 [DEBUG] Nombre del objeto generado:', objectName);

    // Subir archivo a MinIO
    console.log('☁️ [DEBUG] Subiendo archivo a MinIO...');
    const videoUrl = await uploadToMinio(
      BUCKETS.VIDEOS,
      objectName,
      buffer,
      mimetype
    );
    console.log('✅ [DEBUG] Archivo subido a MinIO:', videoUrl);

    // Agregar información del archivo al request
    req.uploadedVideo = {
      url: videoUrl,
      filename: objectName,
      originalName: originalname,
      size: size,
      mimetype: mimetype,
      bucket: BUCKETS.VIDEOS
    };
    
    console.log('📋 [DEBUG] req.uploadedVideo configurado:', req.uploadedVideo);

    next();
  } catch (error: any) {
    console.error('❌ [DEBUG] Error procesando video:', error);
    return res.status(500).json({
      message: 'Error subiendo video a MinIO',
      error: error.message
    });
  }
};

// Middleware para subir múltiples tipos de archivos de lección
export const uploadLessonFiles = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB máximo
    files: 5 // Máximo 5 archivos
  },
  fileFilter: (req, file, cb) => {
    // Permitir videos, imágenes y documentos
    const allowedTypes = [
      // Videos
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
      // Imágenes
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Documentos
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip', 'application/x-zip-compressed',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
      // Texto
      'text/plain', 'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
  }
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'attachments', maxCount: 3 }
]);

// Middleware para procesar múltiples archivos de lección
export const processAndUploadLessonFiles = async (req: any, res: any, next: any) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        message: 'No se proporcionaron archivos'
      });
    }

    const uploadedFiles: any = {};

    // Procesar cada tipo de archivo
    for (const [fieldName, files] of Object.entries(req.files)) {
      const fileArray = files as Express.Multer.File[];
      
      if (fieldName === 'video') {
        // Procesar video
        const file = fileArray[0];
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split('.').pop();
        const objectName = `lesson-video-${timestamp}-${randomSuffix}.${fileExtension}`;

        const videoUrl = await uploadToMinio(
          BUCKETS.VIDEOS,
          objectName,
          file.buffer,
          file.mimetype
        );

        uploadedFiles.video = {
          url: videoUrl,
          filename: objectName,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          bucket: BUCKETS.VIDEOS
        };
      } else if (fieldName === 'thumbnail') {
        // Procesar thumbnail
        const file = fileArray[0];
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split('.').pop();
        const objectName = `lesson-thumbnail-${timestamp}-${randomSuffix}.${fileExtension}`;

        const imageUrl = await uploadToMinio(
          BUCKETS.IMAGES,
          objectName,
          file.buffer,
          file.mimetype
        );

        uploadedFiles.thumbnail = {
          url: imageUrl,
          filename: objectName,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          bucket: BUCKETS.IMAGES
        };
      } else if (fieldName === 'attachments') {
        // Procesar attachments
        uploadedFiles.attachments = [];
        
        for (const file of fileArray) {
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = file.originalname.split('.').pop();
          const objectName = `lesson-attachment-${timestamp}-${randomSuffix}.${fileExtension}`;

          // Determinar bucket según tipo de archivo
          let bucket = BUCKETS.DOCUMENTS;
          if (file.mimetype.startsWith('image/')) {
            bucket = BUCKETS.IMAGES;
          } else if (file.mimetype.startsWith('video/')) {
            bucket = BUCKETS.VIDEOS;
          }

          const fileUrl = await uploadToMinio(
            bucket,
            objectName,
            file.buffer,
            file.mimetype
          );

          uploadedFiles.attachments.push({
            url: fileUrl,
            filename: objectName,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            bucket: bucket
          });
        }
      }
    }

    // Agregar archivos subidos al request
    req.uploadedFiles = uploadedFiles;

    next();
  } catch (error: any) {
    console.error('Error procesando archivos de lección:', error);
    return res.status(500).json({
      message: 'Error subiendo archivos a MinIO',
      error: error.message
    });
  }
};

// Middleware for lesson resources with MinIO upload
export const uploadLessonResourceToMinIO = (req: any, res: any, next: any) => {
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit for resources
      files: 1
    },
    fileFilter: (req, file, cb) => {
      // Allow common document and media types
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
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'));
      }
    }
  }).fields([
    { name: 'file', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    // Ensure form fields are available in req.body
    if (req.body) {
      // Convert string values to appropriate types
      if (req.body.orderIndex !== undefined) {
        req.body.orderIndex = parseInt(req.body.orderIndex) || 0;
      }
      if (req.body.isDownloadable !== undefined) {
        req.body.isDownloadable = req.body.isDownloadable === 'true' || req.body.isDownloadable === true;
      }
    }
    
    // Process file upload to MinIO if file exists
    if (req.files && req.files['file'] && req.files['file'][0]) {
      try {
        const file = req.files['file'][0];
        console.log('📁 [DEBUG] Archivo recibido:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferLength: file.buffer.length
        });
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `lesson-resource-${uniqueSuffix}${ext}`;
        
        console.log('📝 [DEBUG] Nombre del objeto generado:', filename);
        
        // Upload to MinIO
        console.log('☁️ [DEBUG] Subiendo archivo a MinIO...');
        const url = await uploadToMinio('resources', filename, file.buffer, file.mimetype);
        console.log('✅ Archivo subido exitosamente:', url);
        
        // Store file info in request for controller to use
        req.uploadedResource = {
          url: url,
          filename: filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          bucket: 'resources'
        };
        
        console.log('✅ [DEBUG] Archivo subido a MinIO:', url);
        console.log('📋 [DEBUG] req.uploadedResource configurado:', req.uploadedResource);
        
      } catch (error) {
        console.error('❌ [ERROR] Error uploading to MinIO:', error);
        return next(error);
      }
    }
    
    next();
  });
};
