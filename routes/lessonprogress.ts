import { Router } from "express";
import * as LessonProgressController from "../controllers/LessonProgressController";
import { authenticateToken, requireStudent } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /lesson-progress - List all progress (Students can see their own, Organizations can see all)
router.get("/", LessonProgressController.listLessonProgresss);

// GET /lesson-progress/:id - Get progress by ID (Students can see their own, Organizations can see all)
router.get("/:id", LessonProgressController.getLessonProgress);

// POST /lesson-progress - Create new progress (Students and Organizations)
router.post("/", requireStudent, LessonProgressController.createLessonProgress);

// PUT /lesson-progress/:id - Update progress (Students can update their own, Organizations can update any)
router.put("/:id", LessonProgressController.updateLessonProgress);

// DELETE /lesson-progress/:id - Delete progress (Students can delete their own, Organizations can delete any)
router.delete("/:id", LessonProgressController.deleteLessonProgress);

// GET /lesson-progress/course/:courseId - Get course progress
router.get("/course/:courseId", LessonProgressController.getCourseProgress);

export default router;
