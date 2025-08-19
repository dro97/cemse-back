import { Router } from "express";
import {
  listMunicipalities,
  getMunicipality,
  createMunicipality,
  updateMunicipality,
  deleteMunicipality,
  listPublicMunicipalities
} from "../controllers/MunicipalityController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public endpoint (no authentication required)
router.get("/public", listPublicMunicipalities);

// Apply authentication middleware to all other routes
router.use(authenticateToken);

router.get("/", listMunicipalities);
router.get("/:id", getMunicipality);
router.post("/", createMunicipality);
router.put("/:id", updateMunicipality);
router.delete("/:id", deleteMunicipality);

export default router; 