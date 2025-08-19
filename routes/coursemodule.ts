import { Router } from "express";
import * as CourseModuleController from "../controllers/CourseModuleController";
import { authenticateToken, requireSuperAdmin, requireOrganization } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /course-modules - List all modules (accessible by all authenticated users)
router.get("/", CourseModuleController.listCourseModules);

// GET /course-modules/:id - Get module by ID (accessible by all authenticated users)
router.get("/:id", CourseModuleController.getCourseModule);

// POST /course-modules - Create new module (Super Admin and Organizations only)
router.post("/", requireOrganization, CourseModuleController.createCourseModule);

// PUT /course-modules/:id - Update module (Super Admin and Organizations only)
router.put("/:id", requireOrganization, CourseModuleController.updateCourseModule);

// DELETE /course-modules/:id - Delete module (Super Admin only)
router.delete("/:id", requireSuperAdmin, CourseModuleController.deleteCourseModule);

export default router;
