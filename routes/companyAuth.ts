import { Router } from "express";
import {
  getCompanyProfile,
  changeCompanyPassword
} from "../controllers/CompanyAuthController";
import { authenticateToken, requireCompany } from "../middleware/auth";

const router = Router();

// Protected routes (authentication required)
router.use(authenticateToken);
router.use(requireCompany);
router.get("/me", getCompanyProfile);
router.post("/change-password", changeCompanyPassword);

export default router; 