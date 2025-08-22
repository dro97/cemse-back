import { Router } from "express";
import {
  getMunicipalityProfile,
  changeMunicipalityPassword,
  updateMunicipalityProfile
} from "../controllers/MunicipalityAuthController";
import { authenticateToken, requireMunicipality } from "../middleware/auth";

const router = Router();

// Protected routes (authentication required)
router.use(authenticateToken);
router.use(requireMunicipality);
router.get("/me", getMunicipalityProfile);
router.post("/change-password", changeMunicipalityPassword);
router.put("/update-profile", updateMunicipalityProfile);

export default router; 