import { Router } from "express";
import {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getMunicipalityResources,
  searchMunicipalityResources
} from "../controllers/ResourceController";
import { authenticateToken, requireOrganization, requireSuperAdmin } from "../middleware/auth";
import { uploadResourceToMinIO } from "../middleware/minioUpload";

const router = Router();

// Public routes - anyone can view resources
router.get("/", listResources);
router.get("/:id", getResource);

// Municipality-specific resource routes
router.get("/municipality/:municipalityId", getMunicipalityResources);
router.get("/municipality/:municipalityName/search", searchMunicipalityResources);

// Protected routes - require authentication and specific permissions
router.post("/", authenticateToken, requireOrganization, uploadResourceToMinIO, createResource);
router.put("/:id", authenticateToken, requireOrganization, uploadResourceToMinIO, updateResource);
router.delete("/:id", authenticateToken, requireSuperAdmin, deleteResource);

export default router; 