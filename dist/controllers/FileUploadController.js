"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLessonVideo = exports.uploadProfileImage = void 0;
exports.uploadProfileImageHandler = uploadProfileImageHandler;
exports.uploadLessonVideoHandler = uploadLessonVideoHandler;
exports.serveImage = serveImage;
exports.serveVideo = serveVideo;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const imageStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../uploads/images');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const videoStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../uploads/videos');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const imageUpload = (0, multer_1.default)({
    storage: imageStorage,
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
    storage: videoStorage,
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
exports.uploadProfileImage = imageUpload.single('profileImage');
exports.uploadLessonVideo = videoUpload.single('video');
async function uploadProfileImageHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        const imageUrl = `/uploads/images/${req.file.filename}`;
        return res.json({
            message: "Image uploaded successfully",
            imageUrl: imageUrl,
            filename: req.file.filename
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
async function uploadLessonVideoHandler(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No video file provided" });
        }
        const videoUrl = `/uploads/videos/${req.file.filename}`;
        return res.json({
            message: "Video uploaded successfully",
            videoUrl: videoUrl,
            filename: req.file.filename,
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
async function serveImage(req, res) {
    try {
        const { filename } = req.params;
        if (!filename) {
            return res.status(400).json({ message: "Filename is required" });
        }
        const imagePath = path_1.default.join(__dirname, '../uploads/images', filename);
        if (!fs_1.default.existsSync(imagePath)) {
            return res.status(404).json({ message: "Image not found" });
        }
        return res.sendFile(imagePath);
    }
    catch (error) {
        console.error("Error serving image:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function serveVideo(req, res) {
    try {
        const { filename } = req.params;
        if (!filename) {
            return res.status(400).json({ message: "Filename is required" });
        }
        const videoPath = path_1.default.join(__dirname, '../uploads/videos', filename);
        if (!fs_1.default.existsSync(videoPath)) {
            return res.status(404).json({ message: "Video not found" });
        }
        const stat = fs_1.default.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs_1.default.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        }
        else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs_1.default.createReadStream(videoPath).pipe(res);
        }
    }
    catch (error) {
        console.error("Error serving video:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=FileUploadController.js.map