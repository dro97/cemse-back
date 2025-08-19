import { Router } from "express";
import {
  listCompanies,
  searchCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  testAuth
} from "../controllers/CompanyController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get("/", listCompanies);
router.get("/search", searchCompanies);
router.get("/stats", getCompanyStats);
router.get("/test-auth", testAuth);
router.get("/:id", getCompany);
router.post("/", createCompany);
router.put("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router; 