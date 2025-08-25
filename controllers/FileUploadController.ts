import { Request, Response } from "express";
import multer from "multer";
import { uploadToMinio, BUCKETS } from '../lib/minio';

// Configurar multer para memoria (no almacenamiento local)
const memoryStorage = multer.memoryStorage();

const imageUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo para imágenes
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Permitir solo imágenes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)'));
    }
  }
});

const videoUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo para videos
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Permitir solo videos
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video (MP4, WebM, OGG, AVI, MOV, WMV, FLV)'));
    }
  }
});

const documentUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para documentos
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Permitir solo PDFs
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

const coverLetterUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para cartas de presentación
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    // Permitir solo PDFs
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

// Middleware para subir imagen de perfil
export const uploadProfileImage = imageUpload.single('profileImage');

// Middleware para subir video de lección
export const uploadLessonVideo = videoUpload.single('video');

// Middleware para subir CV en PDF
export const uploadCV = documentUpload.single('cvFile');

// Middleware para subir carta de presentación en PDF
export const uploadCoverLetter = coverLetterUpload.single('coverLetterFile');

// Función helper para generar nombres únicos de archivo
function generateUniqueFilename(originalname: string, prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const extension = originalname.split('.').pop();
  return `${prefix}${timestamp}-${random}.${extension}`;
}

// Endpoint para subir imagen de perfil
export async function uploadProfileImageHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Generar nombre único para el archivo
    const filename = generateUniqueFilename(req.file.originalname, 'profile-');
    
    // Subir a MinIO
    const imageUrl = await uploadToMinio(
      BUCKETS.IMAGES,
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Endpoint para subir CV en PDF
export async function uploadCVHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No CV file provided" });
    }

    // Generar nombre único para el archivo
    const filename = generateUniqueFilename(req.file.originalname, 'cv-');
    
    // Subir a MinIO
    const cvUrl = await uploadToMinio(
      BUCKETS.DOCUMENTS,
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({
      message: "CV uploaded successfully",
      cvUrl: cvUrl,
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error: any) {
    console.error("Error uploading CV:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Endpoint para subir carta de presentación en PDF
export async function uploadCoverLetterHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No cover letter file provided" });
    }

    // Generar nombre único para el archivo
    const filename = generateUniqueFilename(req.file.originalname, 'cover-');
    
    // Subir a MinIO
    const coverLetterUrl = await uploadToMinio(
      BUCKETS.DOCUMENTS,
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({
      message: "Cover letter uploaded successfully",
      coverLetterUrl: coverLetterUrl,
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error: any) {
    console.error("Error uploading cover letter:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Endpoint para subir video de lección
export async function uploadLessonVideoHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    // Generar nombre único para el archivo
    const filename = generateUniqueFilename(req.file.originalname, 'video-');
    
    // Subir a MinIO
    const videoUrl = await uploadToMinio(
      BUCKETS.VIDEOS,
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({
      message: "Video uploaded successfully",
      videoUrl: videoUrl,
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error: any) {
    console.error("Error uploading lesson video:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Endpoint para subir archivo genérico
export async function uploadGenericFileHandler(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Determinar el bucket según el tipo de archivo
    let bucket: string = BUCKETS.RESOURCES;
    if (req.file.mimetype.startsWith('image/')) {
      bucket = BUCKETS.IMAGES;
    } else if (req.file.mimetype.startsWith('video/')) {
      bucket = BUCKETS.VIDEOS;
    } else if (req.file.mimetype === 'application/pdf') {
      bucket = BUCKETS.DOCUMENTS;
    }

    // Generar nombre único para el archivo
    const filename = generateUniqueFilename(req.file.originalname);
    
    // Subir a MinIO
    const fileUrl = await uploadToMinio(
      bucket,
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    return res.json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bucket: bucket
    });

  } catch (error: any) {
    console.error("Error uploading file:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Middleware para subir archivo genérico
export const uploadGenericFile = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo para archivos genéricos
  }
}).single('file');
