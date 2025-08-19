import { Router } from "express";
import {
  institutionLogin,
  getInstitutionProfile,
  changeInstitutionPassword
} from "../controllers/InstitutionAuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes (no authentication required)
router.post("/login", institutionLogin);

// Protected routes (authentication required)
router.use(authenticateToken);
router.get("/me", getInstitutionProfile);
router.post("/change-password", changeInstitutionPassword);

export default router;
