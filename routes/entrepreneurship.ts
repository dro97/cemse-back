import express from "express";
import { listEntrepreneurships, getEntrepreneurship, createEntrepreneurship, updateEntrepreneurship, deleteEntrepreneurship, getMyEntrepreneurships, listPublicEntrepreneurships } from "../controllers/EntrepreneurshipController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public endpoint (no authentication required)
router.get("/public", listPublicEntrepreneurships);

// Apply authentication to all other routes
router.use(authenticateToken);

router.get("/", listEntrepreneurships);
router.get("/my", getMyEntrepreneurships);
router.get("/:id", getEntrepreneurship);
router.post("/", createEntrepreneurship);
router.put("/:id", updateEntrepreneurship);
router.delete("/:id", deleteEntrepreneurship);

export default router;
