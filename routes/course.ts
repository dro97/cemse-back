import { Router } from "express";
import * as CourseController from "../controllers/CourseController";
import { authenticateToken, requireSuperAdmin } from "../middleware/auth";
import { uploadCourseFiles } from "../middleware/upload";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /courses - List all courses (accessible by all authenticated users)
router.get("/", CourseController.listCourses);

// GET /courses/:id - Get course by ID (accessible by all authenticated users)
router.get("/:id", CourseController.getCourse);

// GET /courses/:id/preview - Get course preview (accessible by all authenticated users)
router.get("/:id/preview", CourseController.getCoursePreview);

// Custom middleware to allow SuperAdmin, Organizations, and Municipalities
const requireCourseCreation = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Allow SuperAdmin
  if (user.role === 'SUPERADMIN') {
    return next();
  }
  
  // Allow Organizations (users with specific roles)
  if (user.role && ['COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
    return next();
  }
  
  // Allow Municipalities (type 'municipality')
  if (user.type === 'municipality') {
    return next();
  }
  
  return res.status(403).json({ 
    message: "Access denied. Only SuperAdmin, Organizations, and Municipalities can create courses" 
  });
};

// POST /courses - Create new course (SuperAdmin, Organizations, and Municipalities)
router.post("/", requireCourseCreation, uploadCourseFiles, CourseController.createCourse);

// POST /courses/json - Create new course without file uploads (JSON only)
router.post("/json", requireCourseCreation, CourseController.createCourse);

// PUT /courses/:id - Update course (SuperAdmin, Organizations, and Municipalities)
router.put("/:id", requireCourseCreation, uploadCourseFiles, CourseController.updateCourse);

// DELETE /courses/:id - Delete course (Super Admin only)
router.delete("/:id", requireSuperAdmin, CourseController.deleteCourse);

export default router;
