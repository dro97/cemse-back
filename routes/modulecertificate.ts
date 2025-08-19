import { Router } from "express";
import * as ModuleCertificateController from "../controllers/ModuleCertificateController";
import { authenticateToken, requireOrganization, requireSuperAdmin } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /modulecertificate - List all module certificates
router.get("/", ModuleCertificateController.listModuleCertificates);

// GET /modulecertificate/:id - Get module certificate by ID
router.get("/:id", ModuleCertificateController.getModuleCertificate);

// POST /modulecertificate - Create new module certificate (Organizations only)
router.post("/", requireOrganization, ModuleCertificateController.createModuleCertificate);

// PUT /modulecertificate/:id - Update module certificate (Organizations only)
router.put("/:id", requireOrganization, ModuleCertificateController.updateModuleCertificate);

// DELETE /modulecertificate/:id - Delete module certificate (Super Admin only)
router.delete("/:id", requireSuperAdmin, ModuleCertificateController.deleteModuleCertificate);

export default router;
