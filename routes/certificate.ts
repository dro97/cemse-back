import { Router } from "express";
import * as CertificateController from "../controllers/CertificateController";
import { authenticateToken, requireSuperAdmin, requireOrganization } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /certificates - List all certificates (Organizations can see all, Students can see their own)
router.get("/", CertificateController.listCertificates);

// GET /certificates/:id - Get certificate by ID (Organizations can see all, Students can see their own)
router.get("/:id", CertificateController.getCertificate);

// POST /certificates - Create new certificate (Super Admin and Organizations only)
router.post("/", requireOrganization, CertificateController.createCertificate);

// PUT /certificates/:id - Update certificate (Super Admin and Organizations only)
router.put("/:id", requireOrganization, CertificateController.updateCertificate);

// DELETE /certificates/:id - Delete certificate (Super Admin only)
router.delete("/:id", requireSuperAdmin, CertificateController.deleteCertificate);

export default router;
