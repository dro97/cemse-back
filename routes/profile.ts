import express from "express";
import { authenticateToken } from "../middleware/auth";
import { uploadImageToMinIO } from "../middleware/minioUpload";
import * as ProfileController from "../controllers/ProfileController";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /profiles - List all profiles (Super Admin only)
router.get("/", ProfileController.listProfiles);

// GET /profiles/me - Get current user's profile
router.get("/me", ProfileController.getMyProfile);

// GET /profiles/:id - Get profile by ID (Super Admin, or own profile)
router.get("/:id", ProfileController.getProfile);

// POST /profiles - Create new profile (Super Admin only)
router.post("/", ProfileController.createProfile);

// PUT /profiles/:id - Update profile (Super Admin, or own profile)
router.put("/:id", uploadImageToMinIO, ProfileController.updateProfile);

// PUT /profiles/:id/avatar - Update profile avatar only (Super Admin, or own profile)
router.put("/:id/avatar", uploadImageToMinIO, ProfileController.updateProfileAvatar);

// DELETE /profiles/:id - Delete profile (Super Admin only)
router.delete("/:id", ProfileController.deleteProfile);

export default router;
