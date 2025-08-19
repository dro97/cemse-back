import express from "express";
import { 
  getUserCV, 
  updateUserCV, 
  getUserCoverLetter, 
  saveUserCoverLetter, 
  generateCVForApplication 
} from "../controllers/CVController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// CV routes
router.get("/", getUserCV); // Obtener CV del usuario actual
router.put("/", updateUserCV); // Actualizar CV del usuario

// Cover letter routes
router.get("/cover-letter", getUserCoverLetter); // Obtener carta de presentación
router.post("/cover-letter", saveUserCoverLetter); // Guardar carta de presentación

// Generate CV for specific job application
router.post("/generate-for-application", generateCVForApplication);

export default router;
