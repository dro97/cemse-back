import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configurar multer para subida de imágenes
const imageStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configurar multer para subida de videos
const videoStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configurar multer para subida de documentos (PDFs)
const documentStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configurar multer para subida de cartas de presentación (PDFs)
const coverLetterStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../uploads/cover-letters');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageUpload = multer({
  storage: imageStorage,
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
  storage: videoStorage,
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
  storage: documentStorage,
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
  storage: coverLetterStorage,
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

    // Generar URL relativa para la imagen
    const imageUrl = `/uploads/images/${req.file.filename}`;

    return res.json({
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
      filename: req.file.filename
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

    // Generar URL relativa para el CV
    const cvUrl = `/uploads/documents/${req.file.filename}`;

    return res.json({
      message: "CV uploaded successfully",
      cvUrl: cvUrl,
      filename: req.file.filename,
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

    // Generar URL relativa para la carta de presentación
    const coverLetterUrl = `/uploads/cover-letters/${req.file.filename}`;

    return res.json({
      message: "Cover letter uploaded successfully",
      coverLetterUrl: coverLetterUrl,
      filename: req.file.filename,
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

    // Generar URL relativa para el video
    const videoUrl = `/uploads/videos/${req.file.filename}`;

    return res.json({
      message: "Video uploaded successfully",
      videoUrl: videoUrl,
      filename: req.file.filename,
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

// Endpoint para servir imágenes
export async function serveImage(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }
    
    const imagePath = path.join(__dirname, '../uploads/images', filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    return res.sendFile(imagePath);
  } catch (error: any) {
    console.error("Error serving image:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Endpoint para servir documentos (PDFs)
export async function serveDocument(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const { type } = req.query; // 'documents' o 'cover-letters'
    
    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }
    
    // Determinar la carpeta según el tipo
    let folder = 'documents'; // default
    if (type === 'cover-letters') {
      folder = 'cover-letters';
    }
    
    const documentPath = path.join(__dirname, `../uploads/${folder}`, filename);
    
    if (!fs.existsSync(documentPath)) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Configurar headers para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    return res.sendFile(documentPath);
  } catch (error: any) {
    console.error("Error serving document:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Endpoint para servir videos
export async function serveVideo(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }
    
    const videoPath = path.join(__dirname, '../uploads/videos', filename);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Configurar headers para streaming de video
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error: any) {
    console.error("Error serving video:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
