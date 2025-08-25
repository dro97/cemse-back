import express from "express";
import { 
  uploadProfileImage, 
  uploadProfileImageHandler, 
  uploadLessonVideo,
  uploadLessonVideoHandler,
  uploadCV,
  uploadCVHandler,
  uploadCoverLetter,
  uploadCoverLetterHandler,
  uploadGenericFile,
  uploadGenericFileHandler
} from "../controllers/FileUploadController";
import { authenticateToken, requireOrganization } from "../middleware/auth";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Upload profile image
router.post("/upload/profile-image", uploadProfileImage, uploadProfileImageHandler);

// Upload lesson video (Organizations only)
router.post("/upload/lesson-video", requireOrganization, uploadLessonVideo, uploadLessonVideoHandler);

// Upload CV (PDF)
router.post("/upload/cv", uploadCV, uploadCVHandler);

// Upload cover letter (PDF)
router.post("/upload/cover-letter", uploadCoverLetter, uploadCoverLetterHandler);

// Upload generic file
router.post("/upload/file", uploadGenericFile, uploadGenericFileHandler);

export default router;
