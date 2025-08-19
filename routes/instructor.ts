import { Router } from "express";
import * as InstructorController from "../controllers/InstructorController";
import { authenticateToken, requireSuperAdmin, requireInstructor } from "../middleware/auth";

const router = Router();

// Public routes (no authentication required)
router.post("/auth/login", InstructorController.instructorLogin);

// Protected routes (authentication required)
router.use(authenticateToken);

// Routes accessible by SuperAdmin only
router.post("/", requireSuperAdmin, InstructorController.createInstructor);
router.delete("/:id", requireSuperAdmin, InstructorController.deleteInstructor);
router.get("/stats", requireSuperAdmin, InstructorController.getInstructorStats);

// Routes accessible by SuperAdmin and Instructors
router.get("/", InstructorController.listInstructors);
router.get("/:id", InstructorController.getInstructor);
router.put("/:id", requireInstructor, InstructorController.updateInstructor);

export default router;
