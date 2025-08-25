import express from "express";
import { authenticateToken, requireSuperAdmin } from "../middleware/auth";
import { uploadCourseFilesToMinIO } from "../middleware/minioUpload";
import * as CourseController from "../controllers/CourseController";

const router = express.Router();

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

// Rutas para creadores, super admin, municipios y organizaciones
router.post("/", requireCourseCreation, uploadCourseFilesToMinIO, CourseController.createCourse);
router.post("/json", requireCourseCreation, CourseController.createCourse);
router.put("/:id", requireCourseCreation, uploadCourseFilesToMinIO, CourseController.updateCourse);

// DELETE /courses/:id - Delete course (Super Admin only)
router.delete("/:id", requireSuperAdmin, CourseController.deleteCourse);

export default router;
