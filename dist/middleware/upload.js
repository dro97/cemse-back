"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFileUrl = exports.uploadImage = exports.uploadLessonResource = exports.uploadSingleFile = exports.uploadProfileAvatar = exports.uploadCourseFiles = exports.uploadMultipleImages = exports.uploadNewsArticle = exports.uploadSingleImageWithDebug = exports.uploadYouthProfileList = exports.uploadEventImage = exports.uploadSingleImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file?.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const fileFilter = (_req, file, cb) => {
    if (file?.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
const multerConfig = {
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
};
const upload = (0, multer_1.default)(multerConfig);
exports.uploadSingleImage = upload.fields([
    { name: 'image', maxCount: 1 }
]);
const uploadEventImage = (req, res, next) => {
    upload.fields([
        { name: 'image', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            return next(err);
        }
        if (req.body) {
            if (req.body.featured !== undefined) {
                req.body.featured = req.body.featured === 'true';
            }
            if (req.body.maxCapacity && typeof req.body.maxCapacity === 'string') {
                req.body.maxCapacity = parseInt(req.body.maxCapacity);
            }
            if (req.body.price && typeof req.body.price === 'string') {
                req.body.price = parseFloat(req.body.price);
            }
            if (req.body.tags && typeof req.body.tags === 'string') {
                try {
                    req.body.tags = JSON.parse(req.body.tags);
                }
                catch (e) {
                    req.body.tags = req.body.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
                }
            }
            if (req.body.requirements && typeof req.body.requirements === 'string') {
                try {
                    req.body.requirements = JSON.parse(req.body.requirements);
                }
                catch (e) {
                    req.body.requirements = req.body.requirements.split(',').map((req) => req.trim()).filter((req) => req);
                }
            }
            if (req.body.agenda && typeof req.body.agenda === 'string') {
                try {
                    req.body.agenda = JSON.parse(req.body.agenda);
                }
                catch (e) {
                    req.body.agenda = req.body.agenda.split(',').map((item) => item.trim()).filter((item) => item);
                }
            }
            if (req.body.speakers && typeof req.body.speakers === 'string') {
                try {
                    req.body.speakers = JSON.parse(req.body.speakers);
                }
                catch (e) {
                    req.body.speakers = req.body.speakers.split(',').map((speaker) => speaker.trim()).filter((speaker) => speaker);
                }
            }
            if (!Array.isArray(req.body.tags))
                req.body.tags = [];
            if (!Array.isArray(req.body.requirements))
                req.body.requirements = [];
            if (!Array.isArray(req.body.agenda))
                req.body.agenda = [];
            if (!Array.isArray(req.body.speakers))
                req.body.speakers = [];
        }
        next();
    });
};
exports.uploadEventImage = uploadEventImage;
const uploadYouthProfileList = (req, res, next) => {
    (0, multer_1.default)().none()(req, res, (err) => {
        if (err) {
            return next(err);
        }
        if (req.body) {
            if (req.body.page && typeof req.body.page === 'string') {
                req.body.page = parseInt(req.body.page) || 1;
            }
            if (req.body.limit && typeof req.body.limit === 'string') {
                req.body.limit = parseInt(req.body.limit) || 10;
            }
        }
        next();
    });
};
exports.uploadYouthProfileList = uploadYouthProfileList;
const uploadSingleImageWithDebug = (req, res, next) => {
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
exports.uploadSingleImageWithDebug = uploadSingleImageWithDebug;
const uploadNewsArticle = (req, res, next) => {
    const contentType = req.get('Content-Type');
    console.log('=== UPLOAD NEWS ARTICLE MIDDLEWARE ===');
    console.log('Content-Type:', contentType);
    console.log('Headers:', req.headers);
    console.log('Using permissive multer configuration');
    const permissiveUpload = (0, multer_1.default)({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024,
            files: 1
        }
    }).fields([
        { name: 'image', maxCount: 1 }
    ]);
    permissiveUpload(req, res, (err) => {
        if (err) {
            console.log('Multer error:', err);
            return next(err);
        }
        console.log('Multer processing completed');
        console.log('req.body after multer:', req.body);
        console.log('req.files after multer:', req.files);
        if (req.body) {
            if (req.body.featured !== undefined) {
                req.body.featured = req.body.featured === 'true';
            }
            if (req.body.tags && typeof req.body.tags === 'string') {
                req.body.tags = req.body.tags.split(',').map((tag) => tag.trim());
            }
            if (req.body.targetAudience && typeof req.body.targetAudience === 'string') {
                req.body.targetAudience = [req.body.targetAudience];
            }
        }
        next();
    });
};
exports.uploadNewsArticle = uploadNewsArticle;
exports.uploadMultipleImages = upload.array('images', 5);
exports.uploadCourseFiles = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            const uploadDir = path_1.default.join(__dirname, '../uploads/courses');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path_1.default.extname(file?.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    }),
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 2
    },
    fileFilter: (_req, file, cb) => {
        if (file.fieldname === 'thumbnail') {
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedImageTypes.includes(file?.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for thumbnail'));
            }
        }
        else if (file.fieldname === 'videoPreview') {
            const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
            if (allowedVideoTypes.includes(file?.mimetype)) {
                cb(null, true);
            }
            else {
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
exports.uploadProfileAvatar = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            const uploadDir = path_1.default.join(__dirname, '../uploads/profiles');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path_1.default.extname(file?.originalname);
            cb(null, 'avatar-' + uniqueSuffix + ext);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    fileFilter: (_req, file, cb) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedImageTypes.includes(file?.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for profile avatars'));
        }
    }
}).single('avatar');
exports.uploadSingleFile = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            const uploadDir = path_1.default.join(__dirname, '../uploads/resources');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path_1.default.extname(file?.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    }),
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
]);
const uploadLessonResource = (req, res, next) => {
    (0, multer_1.default)({
        storage: multer_1.default.diskStorage({
            destination: (_req, _file, cb) => {
                const uploadDir = path_1.default.join(__dirname, '../uploads/resources');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path_1.default.extname(file?.originalname);
                cb(null, file.fieldname + '-' + uniqueSuffix + ext);
            }
        }),
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
    ])(req, res, (err) => {
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
        next();
    });
};
exports.uploadLessonResource = uploadLessonResource;
exports.uploadImage = exports.uploadSingleImage;
const getFileUrl = (filename) => {
    return `/uploads/${filename}`;
};
exports.getFileUrl = getFileUrl;
const deleteFile = (filename) => {
    const filePath = path_1.default.join(uploadsDir, filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=upload.js.map