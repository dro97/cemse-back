import { Router } from "express";
import {
  getMunicipalityProfile,
  changeMunicipalityPassword
} from "../controllers/MunicipalityAuthController";
import { authenticateToken, requireMunicipality } from "../middleware/auth";

const router = Router();

// Protected routes (authentication required)
router.use(authenticateToken);
router.use(requireMunicipality);
router.get("/me", getMunicipalityProfile);
router.post("/change-password", changeMunicipalityPassword);

export default router; 