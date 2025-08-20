import { Router } from "express";
import * as CourseProgressController from "../controllers/CourseProgressController";
import { authenticateToken, requireStudent } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// POST /course-progress/complete-lesson - Complete a lesson and update progress
router.post("/complete-lesson", requireStudent, CourseProgressController.completeLesson);

// POST /course-progress/complete-module - Complete all lessons in a module
router.post("/complete-module", requireStudent, CourseProgressController.completeModule);

// GET /course-progress/enrollment/:enrollmentId - Get detailed progress for an enrollment
router.get("/enrollment/:enrollmentId", CourseProgressController.getEnrollmentProgress);

export default router;
