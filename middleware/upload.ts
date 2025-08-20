import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer base
const multerConfig = {
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only 1 file per request
  }
};

// Create multer instance
const upload = multer(multerConfig);

// Middleware for single image upload with form fields (for news articles)
export const uploadSingleImage = upload.fields([
  { name: 'image', maxCount: 1 }
]);

// Debug middleware to log what's being processed
export const uploadSingleImageWithDebug = (req: any, res: any, next: any) => {
  console.log('=== UPLOAD MIDDLEWARE DEBUG ===');
  console.log('Before multer processing:');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body before:', req.body);
  
  upload.fields([
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.log('Multer error:', err);
      return next(err);
    }
    
    console.log('After multer processing:');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', JSON.stringify(req.files, null, 2));
    console.log('=====================================');
    
    next();
  });
};

// Enhanced middleware for news articles that ensures form fields are processed
export const uploadNewsArticle = (req: any, res: any, next: any) => {
  upload.fields([
    { name: 'image', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // Ensure form fields are available in req.body
    if (req.body) {
      // Convert string values to appropriate types
      if (req.body.featured !== undefined) {
        req.body.featured = req.body.featured === 'true';
      }
      if (req.body.tags && typeof req.body.tags === 'string') {
        req.body.tags = req.body.tags.split(',').map((tag: string) => tag.trim());
      }
      if (req.body.targetAudience && typeof req.body.targetAudience === 'string') {
        req.body.targetAudience = [req.body.targetAudience];
      }
    }
    
    next();
  });
};

// Middleware for multiple images (if needed)
export const uploadMultipleImages = upload.array('images', 5); // Max 5 images

// Middleware for course files (thumbnail and video preview)
export const uploadCourseFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/courses');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for course files
    files: 2 // Max 2 files (thumbnail + video)
  },
  fileFilter: (req, file, cb) => {
    // Allow images for thumbnail
    if (file.fieldname === 'thumbnail') {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for thumbnail'));
      }
    }
    // Allow videos for video preview
    else if (file.fieldname === 'videoPreview') {
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only video files (MP4, WebM, OGG, AVI, MOV) are allowed for video preview'));
      }
    }
    else {
      cb(new Error('Invalid field name. Use "thumbnail" for images or "videoPreview" for videos'));
    }
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videoPreview', maxCount: 1 }
]);

// Middleware for profile avatar upload
export const uploadProfileAvatar = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/profiles');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'avatar-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for profile avatars
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files for avatars
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for profile avatars'));
    }
  }
}).single('avatar');

// Middleware for lesson resources
export const uploadSingleFile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/resources');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
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
]);

// Enhanced middleware for lesson resources that ensures form fields are processed
export const uploadLessonResource = (req: any, res: any, next: any) => {
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/resources');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    }),
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
  ])(req, res, (err) => {
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
    
    next();
  });
};

// Legacy export for backward compatibility
export const uploadImage = uploadSingleImage;

// Helper function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filename: string): void => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
