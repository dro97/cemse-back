"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadGenericFile = exports.uploadCoverLetter = exports.uploadCV = exports.uploadLessonVideo = exports.uploadProfileImage = void 0;
exports.uploadProfileImageHandler = uploadProfileImageHandler;
exports.uploadCVHandler = uploadCVHandler;
exports.uploadCoverLetterHandler = uploadCoverLetterHandler;
exports.uploadLessonVideoHandler = uploadLessonVideoHandler;
exports.uploadGenericFileHandler = uploadGenericFileHandler;
const multer_1 = __importDefault(require("multer"));
const minio_1 = require("../lib/minio");
const memoryStorage = multer_1.default.memoryStorage();
const imageUpload = (0, multer_1.default)({
    storage: memoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF)'));
        }
    }
});
const videoUpload = (0, multer_1.default)({
    storage: memoryStorage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
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
        }
        else {
            cb(new Error('Solo se permiten archivos de video (MP4, WebM, OGG, AVI, MOV, WMV, FLV)'));
        }
    }
});
const documentUpload = (0, multer_1.default)({
    storage: memoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});
const coverLetterUpload = (0, multer_1.default)({
    storage: memoryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});
exports.uploadProfileImage = imageUpload.single('profileImage');
exports.uploadLessonVideo = videoUpload.single('video');
exports.uploadCV = documentUpload.single('cvFile');
exports.uploadCoverLetter = coverLetterUpload.single('coverLetterFile');
function generateUniqueFilename(originalname, prefix = '') {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const extension = originalname.split('.').pop();
    return `${prefix}${timestamp}-${random}.${extension}`;
}
async function uploadProfileImageHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        const filename = generateUniqueFilename(req.file.originalname, 'profile-');
        const imageUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.IMAGES, filename, req.file.buffer, req.file.mimetype);
        return res.json({
            message: "Image uploaded successfully",
            imageUrl: imageUrl,
            filename: filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    }
    catch (error) {
        console.error("Error uploading profile image:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function uploadCVHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No CV file provided" });
        }
        const filename = generateUniqueFilename(req.file.originalname, 'cv-');
        const cvUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.DOCUMENTS, filename, req.file.buffer, req.file.mimetype);
        return res.json({
            message: "CV uploaded successfully",
            cvUrl: cvUrl,
            filename: filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    }
    catch (error) {
        console.error("Error uploading CV:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function uploadCoverLetterHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No cover letter file provided" });
        }
        const filename = generateUniqueFilename(req.file.originalname, 'cover-');
        const coverLetterUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.DOCUMENTS, filename, req.file.buffer, req.file.mimetype);
        return res.json({
            message: "Cover letter uploaded successfully",
            coverLetterUrl: coverLetterUrl,
            filename: filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    }
    catch (error) {
        console.error("Error uploading cover letter:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function uploadLessonVideoHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No video file provided" });
        }
        const filename = generateUniqueFilename(req.file.originalname, 'video-');
        const videoUrl = await (0, minio_1.uploadToMinio)(minio_1.BUCKETS.VIDEOS, filename, req.file.buffer, req.file.mimetype);
        return res.json({
            message: "Video uploaded successfully",
            videoUrl: videoUrl,
            filename: filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    }
    catch (error) {
        console.error("Error uploading lesson video:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function uploadGenericFileHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }
        let bucket = minio_1.BUCKETS.RESOURCES;
        if (req.file.mimetype.startsWith('image/')) {
            bucket = minio_1.BUCKETS.IMAGES;
        }
        else if (req.file.mimetype.startsWith('video/')) {
            bucket = minio_1.BUCKETS.VIDEOS;
        }
        else if (req.file.mimetype === 'application/pdf') {
            bucket = minio_1.BUCKETS.DOCUMENTS;
        }
        const filename = generateUniqueFilename(req.file.originalname);
        const fileUrl = await (0, minio_1.uploadToMinio)(bucket, filename, req.file.buffer, req.file.mimetype);
        return res.json({
            message: "File uploaded successfully",
            fileUrl: fileUrl,
            filename: filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            bucket: bucket
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
exports.uploadGenericFile = (0, multer_1.default)({
    storage: memoryStorage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    }
}).single('file');
//# sourceMappingURL=FileUploadController.js.map