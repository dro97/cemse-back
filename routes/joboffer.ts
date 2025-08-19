import { Router } from "express";
import * as JobOfferController from "../controllers/JobOfferController";
import { authenticateToken, requireSuperAdmin } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /job-offers - List all job offers (accessible by all authenticated users)
router.get("/", JobOfferController.listJobOffers);

// GET /job-offers/:id - Get job offer by ID (accessible by all authenticated users)
router.get("/:id", JobOfferController.getJobOffer);

// Custom middleware to allow SuperAdmin, Organizations, and Companies
const requireJobOfferCreation = (req: any, res: any, next: any) => {
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
  
  // Allow Companies (type 'company')
  if (user.type === 'company') {
    return next();
  }
  
  return res.status(403).json({ 
    message: "Access denied. Only SuperAdmin, Organizations, and Companies can create job offers" 
  });
};

// POST /job-offers - Create new job offer (SuperAdmin, Organizations, and Companies)
router.post("/", requireJobOfferCreation, JobOfferController.uploadJobOfferImages, JobOfferController.createJobOffer);

// PUT /job-offers/:id - Update job offer (SuperAdmin, Organizations, and Companies)
router.put("/:id", requireJobOfferCreation, JobOfferController.uploadJobOfferImages, JobOfferController.updateJobOffer);

// DELETE /job-offers/:id - Delete job offer (Super Admin only)
router.delete("/:id", requireSuperAdmin, JobOfferController.deleteJobOffer);

export default router;
