import multer from 'multer';
import { uploadToMinio, BUCKETS } from '../lib/minio';
import path from 'path'; // Added for path.extname

// Configurar multer para almacenamiento en memoria (para luego subir a MinIO)
const storage = multer.memoryStorage();

// ===== MIDDLEWARES UNIFICADOS PARA MINIO =====

// Middleware para subir imágenes (eventos, noticias, perfiles, etc.)
export const uploadImageToMinIO = (req: any, res: any, next: any) => {
  console.log('🔍 MINIO UPLOAD MIDDLEWARE - Iniciando...');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  multer({
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
    console.log('🔍 MINIO UPLOAD - Archivos recibidos:', req.files);
    console.log('🔍 MINIO UPLOAD - Tipo de req.files:', typeof req.files);
    console.log('🔍 MINIO UPLOAD - Keys de req.files:', req.files ? Object.keys(req.files) : 'No files');
    
    if (req.files) {
      const uploadedFiles: any = {};

      for (const [fieldName, files] of Object.entries(req.files)) {
        const fileArray = files as Express.Multer.File[];
        if (fileArray.length > 0) {
          const file = fileArray[0];
          
          // Generar nombre único
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(file?.originalname);
          const objectName = `${fieldName}-${timestamp}-${randomSuffix}${fileExtension}`;

          try {
            const imageUrl = await uploadToMinio(
              BUCKETS.IMAGES,
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
              bucket: BUCKETS.IMAGES
            };
          } catch (error) {
            console.error(`Error subiendo imagen ${fieldName}:`, error);
            return res.status(500).json({
              message: `Error subiendo imagen ${fieldName}`,
              error: (error as any).message
            });
          }
        }
      }

      req.uploadedImages = uploadedFiles;
      console.log('🔍 MINIO UPLOAD - uploadedFiles final:', uploadedFiles);
    } else {
      console.log('🔍 MINIO UPLOAD - No se encontraron archivos para procesar');
    }

    console.log('🔍 MINIO UPLOAD - Finalizando middleware');
    next();
  });
};

// Middleware específico para eventos que combina MinIO upload con conversión de tipos
export const uploadEventImageToMinIO = (req: any, res: any, next: any) => {
  console.log('🔍 EVENT MINIO UPLOAD MIDDLEWARE - Iniciando...');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  multer({
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
    { name: 'image', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    // Procesar archivos subidos a MinIO
    console.log('🔍 EVENT MINIO UPLOAD - Archivos recibidos:', req.files);
    
    if (req.files) {
      const uploadedFiles: any = {};

      for (const [fieldName, files] of Object.entries(req.files)) {
        const fileArray = files as Express.Multer.File[];
        if (fileArray.length > 0) {
          const file = fileArray[0];
          
          // Generar nombre único
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(file?.originalname);
          const objectName = `${fieldName}-${timestamp}-${randomSuffix}${fileExtension}`;

          try {
            const imageUrl = await uploadToMinio(
              BUCKETS.IMAGES,
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
              bucket: BUCKETS.IMAGES
            };
          } catch (error) {
            console.error(`Error subiendo imagen ${fieldName}:`, error);
            return res.status(500).json({
              message: `Error subiendo imagen ${fieldName}`,
              error: (error as any).message
            });
          }
        }
      }

      req.uploadedImages = uploadedFiles;
      console.log('🔍 EVENT MINIO UPLOAD - uploadedFiles final:', uploadedFiles);
    } else {
      console.log('🔍 EVENT MINIO UPLOAD - No se encontraron archivos para procesar');
    }

    // Convertir tipos de datos para eventos
    if (req.body) {
      // Convert string values to appropriate types for events
      if (req.body.featured !== undefined) {
        req.body.featured = req.body.featured === 'true';
      }
      if (req.body.maxCapacity && typeof req.body.maxCapacity === 'string') {
        req.body.maxCapacity = parseInt(req.body.maxCapacity);
      }
      if (req.body.price && typeof req.body.price === 'string') {
        req.body.price = parseFloat(req.body.price);
      }
      
      // Handle arrays that come as JSON strings
      if (req.body.tags && typeof req.body.tags === 'string') {
        try {
          req.body.tags = JSON.parse(req.body.tags);
        } catch (e) {
          // If JSON parsing fails, try comma-separated values
          req.body.tags = req.body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        }
      }
      
      if (req.body.requirements && typeof req.body.requirements === 'string') {
        try {
          req.body.requirements = JSON.parse(req.body.requirements);
        } catch (e) {
          req.body.requirements = req.body.requirements.split(',').map((req: string) => req.trim()).filter((req: string) => req);
        }
      }
      
      if (req.body.agenda && typeof req.body.agenda === 'string') {
        try {
          req.body.agenda = JSON.parse(req.body.agenda);
        } catch (e) {
          req.body.agenda = req.body.agenda.split(',').map((item: string) => item.trim()).filter((item: string) => item);
        }
      }
      
      if (req.body.speakers && typeof req.body.speakers === 'string') {
        try {
          req.body.speakers = JSON.parse(req.body.speakers);
        } catch (e) {
          req.body.speakers = req.body.speakers.split(',').map((speaker: string) => speaker.trim()).filter((speaker: string) => speaker);
        }
      }
      
      // Ensure arrays are always arrays
      if (!Array.isArray(req.body.tags)) req.body.tags = [];
      if (!Array.isArray(req.body.requirements)) req.body.requirements = [];
      if (!Array.isArray(req.body.agenda)) req.body.agenda = [];
      if (!Array.isArray(req.body.speakers)) req.body.speakers = [];
    }

    console.log('🔍 EVENT MINIO UPLOAD - Finalizando middleware');
    next();
  });
};

// Middleware para subir múltiples imágenes (job offers, etc.)
export const uploadMultipleImagesToMinIO = (req: any, res: any, next: any) => {
  multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB máximo por imagen
      files: 10 // Máximo 10 imágenes
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
    { name: 'images', maxCount: 10 },
    { name: 'logo', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    // Procesar archivos subidos
    if (req.files) {
      const uploadedFiles: any = {};

      for (const [fieldName, files] of Object.entries(req.files)) {
        const fileArray = files as Express.Multer.File[];
        
        if (fieldName === 'images') {
          uploadedFiles.images = [];
          
          for (const file of fileArray) {
            const timestamp = Date.now();
            const randomSuffix = Math.round(Math.random() * 1E9);
            const fileExtension = path.extname(file?.originalname);
            const objectName = `job-image-${timestamp}-${randomSuffix}${fileExtension}`;

            try {
              const imageUrl = await uploadToMinio(
                BUCKETS.IMAGES,
                objectName,
                file?.buffer || Buffer.alloc(0),
                file?.mimetype || 'image/jpeg'
              );

              uploadedFiles.images.push({
                url: imageUrl,
                filename: objectName,
                originalName: file?.originalname,
                size: file?.size,
                mimetype: file?.mimetype,
                bucket: BUCKETS.IMAGES
              });
            } catch (error) {
              console.error('Error subiendo imagen de trabajo:', error);
              return res.status(500).json({
                message: 'Error subiendo imagen de trabajo',
                error: (error as any).message
              });
            }
          }
        } else if (fieldName === 'logo') {
          const file = fileArray[0];
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(file?.originalname);
          const objectName = `job-logo-${timestamp}-${randomSuffix}${fileExtension}`;

          try {
            const logoUrl = await uploadToMinio(
              BUCKETS.IMAGES,
              objectName,
              file?.buffer || Buffer.alloc(0),
              file?.mimetype || 'image/jpeg'
            );

            uploadedFiles.logo = {
              url: logoUrl,
              filename: objectName,
              originalName: file?.originalname,
              size: file?.size,
              mimetype: file?.mimetype,
              bucket: BUCKETS.IMAGES
            };
          } catch (error) {
            console.error('Error subiendo logo:', error);
            return res.status(500).json({
              message: 'Error subiendo logo',
              error: (error as any).message
            });
          }
        }
      }

      req.uploadedJobImages = uploadedFiles;
    }

    next();
  });
};

// Middleware para subir documentos (PDFs, CVs, cartas de presentación)
export const uploadDocumentsToMinIO = (req: any, res: any, next: any) => {
  multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo para documentos
      files: 1
    },
    fileFilter: (_req, file, cb) => {
      const allowedTypes = ['application/pdf'];
      if (allowedTypes.includes(file?.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF'));
      }
    }
  }).fields([
    { name: 'document', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    // Procesar archivos subidos
    if (req.files) {
      const uploadedFiles: any = {};

      for (const [fieldName, files] of Object.entries(req.files)) {
        const fileArray = files as Express.Multer.File[];
        if (fileArray.length > 0) {
          const file = fileArray[0];
          
          // Generar nombre único
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(file?.originalname);
          const objectName = `${fieldName}-${timestamp}-${randomSuffix}${fileExtension}`;

          try {
            const documentUrl = await uploadToMinio(
              BUCKETS.DOCUMENTS,
              objectName,
              file?.buffer || Buffer.alloc(0),
              file?.mimetype || 'application/pdf'
            );

            uploadedFiles[fieldName] = {
              url: documentUrl,
              filename: objectName,
              originalName: file?.originalname,
              size: file?.size,
              mimetype: file?.mimetype,
              bucket: BUCKETS.DOCUMENTS
            };
          } catch (error) {
            console.error(`Error subiendo documento ${fieldName}:`, error);
            return res.status(500).json({
              message: `Error subiendo documento ${fieldName}`,
              error: (error as any).message
            });
          }
        }
      }

      req.uploadedDocuments = uploadedFiles;
    }

    next();
  });
};

// Middleware para subir archivos de cursos
export const uploadCourseFilesToMinIO = (req: any, res: any, next: any) => {
  multer({
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB máximo para archivos de curso
      files: 2 // Máximo 2 archivos (thumbnail + video)
    },
    fileFilter: (_req, file, cb) => {
      if (file.fieldname === 'thumbnail') {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedImageTypes.includes(file?.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP) para thumbnail'));
        }
      } else if (file.fieldname === 'videoPreview') {
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
        if (allowedVideoTypes.includes(file?.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos de video (MP4, WebM, OGG, AVI, MOV) para video preview'));
        }
      } else {
        cb(new Error('Nombre de campo inválido. Use "thumbnail" para imágenes o "videoPreview" para videos'));
      }
    }
  }).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'videoPreview', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    // Procesar archivos subidos
    if (req.files) {
      const uploadedFiles: any = {};

      for (const [fieldName, files] of Object.entries(req.files)) {
        const fileArray = files as Express.Multer.File[];
        if (fileArray.length > 0) {
          const file = fileArray[0];
          
          // Generar nombre único
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(file?.originalname);
          const objectName = `course-${fieldName}-${timestamp}-${randomSuffix}${fileExtension}`;

          // Determinar bucket según tipo de archivo
          const bucket = fieldName === 'thumbnail' ? BUCKETS.IMAGES : BUCKETS.VIDEOS;

          try {
            const fileUrl = await uploadToMinio(
              bucket,
              objectName,
              file?.buffer || Buffer.alloc(0),
              file?.mimetype || 'application/octet-stream'
            );

            uploadedFiles[fieldName] = {
              url: fileUrl,
              filename: objectName,
              originalName: file?.originalname,
              size: file?.size,
              mimetype: file?.mimetype,
              bucket: bucket
            };
          } catch (error) {
            console.error(`Error subiendo archivo de curso ${fieldName}:`, error);
            return res.status(500).json({
              message: `Error subiendo archivo de curso ${fieldName}`,
              error: (error as any).message
            });
          }
        }
      }

      req.uploadedCourseFiles = uploadedFiles;
    }

    next();
  });
};

// ===== MIDDLEWARES EXISTENTES (mantener compatibilidad) =====

// Configurar multer para videos de lecciones
export const uploadLessonVideo = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB máximo para videos de lecciones
    files: 1
  },
  fileFilter: (_req, file, cb) => {
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
    
    if (allowedVideoTypes.includes(file?.mimetype)) {
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
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
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
  fileFilter: (_req, file, cb) => {
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
    
    if (allowedTypes.includes(file?.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file?.mimetype}`));
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
        const fileExtension = file?.originalname?.split('.')?.pop() || 'mp4';
        const objectName = `lesson-video-${timestamp}-${randomSuffix}.${fileExtension}`;

        const videoUrl = await uploadToMinio(
          BUCKETS.VIDEOS,
          objectName,
          file?.buffer || Buffer.alloc(0),
          file?.mimetype || 'application/octet-stream'
        );

        uploadedFiles.video = {
          url: videoUrl,
          filename: objectName,
          originalName: file?.originalname,
          size: file?.size,
          mimetype: file?.mimetype,
          bucket: BUCKETS.VIDEOS
        };
      } else if (fieldName === 'thumbnail') {
        // Procesar thumbnail
        const file = fileArray[0];
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const fileExtension = file?.originalname?.split('.')?.pop() || 'mp4';
        const objectName = `lesson-thumbnail-${timestamp}-${randomSuffix}.${fileExtension}`;

        const imageUrl = await uploadToMinio(
          BUCKETS.IMAGES,
          objectName,
          file?.buffer || Buffer.alloc(0),
          file?.mimetype || 'application/octet-stream'
        );

        uploadedFiles.thumbnail = {
          url: imageUrl,
          filename: objectName,
          originalName: file?.originalname,
          size: file?.size,
          mimetype: file?.mimetype,
          bucket: BUCKETS.IMAGES
        };
      } else if (fieldName === 'attachments') {
        // Procesar attachments
        uploadedFiles.attachments = [];
        
        for (const file of fileArray) {
          const timestamp = Date.now();
          const randomSuffix = Math.round(Math.random() * 1E9);
          const fileExtension = file?.originalname?.split('.')?.pop() || 'mp4';
          const objectName = `lesson-attachment-${timestamp}-${randomSuffix}.${fileExtension}`;

          // Determinar bucket según tipo de archivo
          let bucket = BUCKETS.DOCUMENTS;
          if (file?.mimetype.startsWith('image/')) {
            bucket = BUCKETS.IMAGES as any;
          } else if (file?.mimetype.startsWith('video/')) {
            bucket = BUCKETS.VIDEOS as any;
          }

          const fileUrl = await uploadToMinio(
            bucket,
            objectName,
            file?.buffer || Buffer.alloc(0),
            file?.mimetype || 'application/octet-stream'
          );

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
    fileFilter: (_req, file, cb) => {
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
      
      if (allowedTypes.includes(file?.mimetype)) {
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
          originalname: file?.originalname,
          mimetype: file?.mimetype,
          size: file?.size,
          bufferLength: file.buffer.length
        });
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file?.originalname);
        const filename = `lesson-resource-${uniqueSuffix}${ext}`;
        
        console.log('📝 [DEBUG] Nombre del objeto generado:', filename);
        
        // Upload to MinIO
        console.log('☁️ [DEBUG] Subiendo archivo a MinIO...');
        const url = await uploadToMinio('resources', filename, file?.buffer || Buffer.alloc(0), file?.mimetype);
        console.log('✅ Archivo subido exitosamente:', url);
        
        // Store file info in request for controller to use
        (req as any).uploadedResource = {
          url: url,
          filename: filename,
          originalName: file?.originalname,
          size: file?.size,
          mimetype: file?.mimetype,
          bucket: 'resources'
        };
        
        console.log('✅ [DEBUG] Archivo subido a MinIO:', url);
        console.log('📋 [DEBUG] (req as any).uploadedResource configurado:', (req as any).uploadedResource);
        
      } catch (error) {
        console.error('❌ [ERROR] Error uploading to MinIO:', error);
        return next(error);
      }
    }
    
    next();
  });
};

// Middleware for general resources with MinIO upload
export const uploadResourceToMinIO = (req: any, res: any, next: any) => {
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit for general resources
      files: 1
    },
    fileFilter: (_req, file, cb) => {
      // Allow common document, media, and image types
      const allowedTypes = [
        // Documents
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
        // Videos
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
        'video/mkv',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp3',
        'audio/aac',
        'audio/flac',
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        // Text
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
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file?.mimetype}`));
      }
    }
  }).fields([
    { name: 'file', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    // Process file upload to MinIO if file exists
    if (req.files && req.files['file'] && req.files['file'][0]) {
      try {
        const file = req.files['file'][0];
        console.log('📁 [DEBUG] Archivo de recurso recibido:', {
          originalname: file?.originalname,
          mimetype: file?.mimetype,
          size: file?.size,
          bufferLength: file.buffer.length
        });
        
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file?.originalname);
        const filename = `general-resource-${uniqueSuffix}${ext}`;
        
        console.log('📝 [DEBUG] Nombre del objeto generado:', filename);
        
        // Determine bucket based on file type
        let bucket = 'resources';
        if (file?.mimetype.startsWith('image/')) {
          bucket = 'images';
        } else if (file?.mimetype.startsWith('video/')) {
          bucket = 'videos';
        } else if (file?.mimetype.startsWith('audio/')) {
          bucket = 'audio';
        }
        
        // Upload to MinIO
        console.log('☁️ [DEBUG] Subiendo archivo a MinIO bucket:', bucket);
        const url = await uploadToMinio(bucket, filename, file?.buffer || Buffer.alloc(0), file?.mimetype);
        console.log('✅ Archivo subido exitosamente:', url);
        
        // Store file info in request for controller to use
        (req as any).uploadedResource = {
          url: url,
          filename: filename,
          originalName: file?.originalname,
          size: file?.size,
          mimetype: file?.mimetype,
          bucket: bucket
        };
        
        console.log('✅ [DEBUG] Archivo subido a MinIO:', url);
        console.log('📋 [DEBUG] (req as any).uploadedResource configurado:', (req as any).uploadedResource);
        
      } catch (error) {
        console.error('❌ [ERROR] Error uploading to MinIO:', error);
        return next(error);
      }
    }
    
    next();
  });
};
