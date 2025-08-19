import { Router } from "express";
import {
  listInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  listPublicInstitutions
} from "../controllers/InstitutionController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public endpoint (no authentication required)
router.get("/public", listPublicInstitutions);

// Apply authentication middleware to all other routes
router.use(authenticateToken);

router.get("/", listInstitutions);
router.get("/:id", getInstitution);
router.post("/", createInstitution);
router.put("/:id", updateInstitution);
router.delete("/:id", deleteInstitution);

export default router;
