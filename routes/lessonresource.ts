import { Router } from "express";
import * as LessonResourceController from "../controllers/LessonResourceController";
import { authenticateToken, requireOrganization, requireSuperAdmin } from "../middleware/auth";
import { uploadSingleFile } from "../middleware/upload";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /lessonresource - List all lesson resources
router.get("/", LessonResourceController.listLessonResources);

// GET /lessonresource/:id - Get lesson resource by ID
router.get("/:id", LessonResourceController.getLessonResource);

// POST /lessonresource - Create new lesson resource (Organizations only)
router.post("/", requireOrganization, uploadSingleFile, LessonResourceController.createLessonResource);

// PUT /lessonresource/:id - Update lesson resource (Organizations only)
router.put("/:id", requireOrganization, uploadSingleFile, LessonResourceController.updateLessonResource);

// DELETE /lessonresource/:id - Delete lesson resource (Super Admin only)
router.delete("/:id", requireSuperAdmin, LessonResourceController.deleteLessonResource);

export default router;
