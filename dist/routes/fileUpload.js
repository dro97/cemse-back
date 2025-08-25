"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FileUploadController_1 = require("../controllers/FileUploadController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post("/upload/profile-image", FileUploadController_1.uploadProfileImage, FileUploadController_1.uploadProfileImageHandler);
router.post("/upload/lesson-video", auth_1.requireOrganization, FileUploadController_1.uploadLessonVideo, FileUploadController_1.uploadLessonVideoHandler);
router.post("/upload/cv", FileUploadController_1.uploadCV, FileUploadController_1.uploadCVHandler);
router.post("/upload/cover-letter", FileUploadController_1.uploadCoverLetter, FileUploadController_1.uploadCoverLetterHandler);
router.post("/upload/file", FileUploadController_1.uploadGenericFile, FileUploadController_1.uploadGenericFileHandler);
exports.default = router;
//# sourceMappingURL=fileUpload.js.map