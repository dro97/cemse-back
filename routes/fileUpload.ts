import express from "express";
import { 
  uploadProfileImage, 
  uploadProfileImageHandler, 
  serveImage,
  uploadLessonVideo,
  uploadLessonVideoHandler,
  serveVideo,
  uploadCV,
  uploadCVHandler,
  uploadCoverLetter,
  uploadCoverLetterHandler,
  serveDocument
} from "../controllers/FileUploadController";
import { authenticateToken, requireOrganization } from "../middleware/auth";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Upload profile image
router.post("/upload/profile-image", uploadProfileImage, uploadProfileImageHandler);

// Upload lesson video (Organizations only)
router.post("/upload/lesson-video", requireOrganization, uploadLessonVideo, uploadLessonVideoHandler);

// Serve images
router.get("/images/:filename", serveImage);

// Upload CV (PDF)
router.post("/upload/cv", uploadCV, uploadCVHandler);

// Upload cover letter (PDF)
router.post("/upload/cover-letter", uploadCoverLetter, uploadCoverLetterHandler);

// Serve videos
router.get("/videos/:filename", serveVideo);

// Serve documents (PDFs)
router.get("/documents/:filename", (req, res) => {
  (req.query as any).type = 'documents';
  serveDocument(req, res);
});

// Serve cover letters (PDFs)
router.get("/cover-letters/:filename", (req, res) => {
  (req.query as any).type = 'cover-letters';
  serveDocument(req, res);
});

export default router;
