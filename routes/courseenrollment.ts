import { Router } from "express";
import * as CourseEnrollmentController from "../controllers/CourseEnrollmentController";
import { authenticateToken, requireStudent } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /course-enrollments - List all enrollments (Students can see their own, Organizations can see all)
router.get("/", CourseEnrollmentController.listCourseEnrollments);

// GET /course-enrollments/:id - Get enrollment by ID (Students can see their own, Organizations can see all)
router.get("/:id", CourseEnrollmentController.getCourseEnrollment);

// POST /course-enrollments - Create new enrollment (Students and Organizations)
router.post("/", requireStudent, CourseEnrollmentController.createCourseEnrollment);

// PUT /course-enrollments/:id - Update enrollment (Students can update their own, Organizations can update any)
router.put("/:id", CourseEnrollmentController.updateCourseEnrollment);

// DELETE /course-enrollments/:id - Delete enrollment (Students can delete their own, Organizations can delete any)
router.delete("/:id", CourseEnrollmentController.deleteCourseEnrollment);

export default router;
