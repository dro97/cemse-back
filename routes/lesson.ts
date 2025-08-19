import { Router } from "express";
import * as LessonController from "../controllers/LessonController";
import { authenticateToken, requireSuperAdmin, requireOrganization } from "../middleware/auth";
import { 
  uploadLessonVideo, 
  processAndUploadVideo, 
  uploadLessonFiles, 
  processAndUploadLessonFiles 
} from "../middleware/minioUpload";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /lessons - List all lessons (accessible by all authenticated users)
router.get("/", LessonController.listLessons);

// GET /lessons/module/:moduleId - Get lessons by module (accessible by all authenticated users)
router.get("/module/:moduleId", LessonController.getLessonsByModule);

// GET /lessons/:id - Get lesson by ID (accessible by all authenticated users)
router.get("/:id", LessonController.getLesson);

// POST /lessons - Create new lesson (Super Admin and Organizations only)
router.post("/", requireOrganization, LessonController.createLesson);

// POST /lessons/with-video - Create lesson with video upload to MinIO
router.post("/with-video", requireOrganization, uploadLessonVideo, processAndUploadVideo, LessonController.createLesson);

// POST /lessons/test-video - Test endpoint without authentication (TEMPORARY)
router.post("/test-video", uploadLessonVideo, processAndUploadVideo, LessonController.createLesson);

// POST /lessons/with-files - Create lesson with multiple files (video, thumbnail, attachments)
router.post("/with-files", requireOrganization, uploadLessonFiles, processAndUploadLessonFiles, LessonController.createLesson);

// PUT /lessons/:id - Update lesson (Super Admin and Organizations only)
router.put("/:id", requireOrganization, LessonController.updateLesson);

// DELETE /lessons/:id - Delete lesson (Super Admin only)
router.delete("/:id", requireSuperAdmin, LessonController.deleteLesson);

export default router;
