import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { io } from "../server";
import { UserRole } from "@prisma/client";



/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - userId
 *         - status
 *         - role
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         active:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING_VERIFICATION, SUSPENDED]
 *         role:
 *           type: string
 *           enum: [YOUTH, ADOLESCENTS, COMPANIES, MUNICIPAL_GOVERNMENTS, TRAINING_CENTERS, NGOS_AND_FOUNDATIONS, SUPERADMIN]
 *         firstName:
 *           type: string
 *           nullable: true
 *         lastName:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         municipality:
 *           type: string
 *           nullable: true
 *         department:
 *           type: string
 *           nullable: true
 *         country:
 *           type: string
 *           nullable: true
 *         birthDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         gender:
 *           type: string
 *           nullable: true
 *         documentType:
 *           type: string
 *           nullable: true
 *         documentNumber:
 *           type: string
 *           nullable: true
 *         educationLevel:
 *           type: string
 *           enum: [PRIMARY, SECONDARY, TECHNICAL, UNIVERSITY, POSTGRADUATE, OTHER]
 *           nullable: true
 *         currentInstitution:
 *           type: string
 *           nullable: true
 *         graduationYear:
 *           type: integer
 *           nullable: true
 *         isStudying:
 *           type: boolean
 *           nullable: true
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         workExperience:
 *           type: object
 *           nullable: true
 *         companyName:
 *           type: string
 *           nullable: true
 *         taxId:
 *           type: string
 *           nullable: true
 *         legalRepresentative:
 *           type: string
 *           nullable: true
 *         businessSector:
 *           type: string
 *           nullable: true
 *         companySize:
 *           type: string
 *           enum: [MICRO, SMALL, MEDIUM, LARGE]
 *           nullable: true
 *         companyDescription:
 *           type: string
 *           nullable: true
 *         website:
 *           type: string
 *           nullable: true
 *         foundedYear:
 *           type: integer
 *           nullable: true
 *         institutionName:
 *           type: string
 *           nullable: true
 *         institutionType:
 *           type: string
 *           nullable: true
 *         serviceArea:
 *           type: string
 *           nullable: true
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *         institutionDescription:
 *           type: string
 *           nullable: true
 *         profileCompletion:
 *           type: integer
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         parentalConsent:
 *           type: boolean
 *         parentEmail:
 *           type: string
 *           nullable: true
 *         consentDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         achievements:
 *           type: object
 *           nullable: true
 *     ProfileInput:
 *       type: object
 *       properties:
 *         (igual que Profile, pero todos opcionales menos userId, status y role)
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: List of all profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 */
export async function listProfiles(_: Request, res: Response) {
  const items = await prisma.profile.findMany();
  res.json(items);
}

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Get a profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */
export async function getMyProfile(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (error: any) {
    console.error("Error getting my profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const profileId = req.params["id"];
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId || "" }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Allow access if user is SuperAdmin or if it's their own profile
    if (user.role === 'SUPERADMIN' || profile.userId === user.id) {
      return res.json(profile);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error: any) {
    console.error("Error getting profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid input data
 */
export async function createProfile(req: Request, res: Response) {
  const newItem = await prisma.profile.create({
    data: req.body
  });
  
  // Emit real-time update
  io.emit("profile:created", newItem);
  
  res.status(201).json(newItem);
}

/**
 * @swagger
 * /profiles/{id}:
 *   put:
 *     summary: Update a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const profileId = req.params["id"] || "";
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId }
    });
    
    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check permissions: user can only update their own profile or SuperAdmin can update any
    if (user.role !== 'SUPERADMIN' && existingProfile.userId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only update your own profile" });
    }

    // Handle file upload for avatar
    let updateData: any = { ...req.body };
    
    if (req.file) {
      // Process uploaded avatar
      const avatarUrl = `/uploads/profiles/${req.file.filename}`;
      updateData.avatarUrl = avatarUrl;
    }

    const updated = await prisma.profile.update({
      where: { id: profileId },
      data: updateData
    });
    
    // Emit real-time update
    io.emit("profile:updated", updated);
    
    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     summary: Delete a profile
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     responses:
 *       204:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 */
export async function deleteProfile(req: Request, res: Response) {
  await prisma.profile.delete({
    where: { id: req.params["id"] || "" }
  });
  
  // Emit real-time update
  io.emit("profile:deleted", { id: req.params["id"] });
  
  res.status(204).end();
}

/**
 * @swagger
 * /profiles/{id}/avatar:
 *   put:
 *     summary: Update profile avatar
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profile avatar image (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid file type or size
 *       403:
 *         description: Access denied
 *       404:
 *         description: Profile not found
 */
export async function updateProfileAvatar(req: Request, res: Response) {
  try {
    const profileId = req.params["id"] || "";
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId }
    });
    
    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check permissions: user can only update their own profile or SuperAdmin can update any
    if (user.role !== 'SUPERADMIN' && existingProfile.userId !== user.id) {
      return res.status(403).json({ message: "Access denied. You can only update your own profile" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    // Process uploaded avatar
    const avatarUrl = `/uploads/profiles/${req.file.filename}`;

    const updated = await prisma.profile.update({
      where: { id: profileId },
      data: { avatarUrl }
    });
    
    // Emit real-time update
    io.emit("profile:avatar:updated", updated);
    
    return res.json({
      message: "Avatar updated successfully",
      profile: updated
    });
  } catch (error: any) {
    console.error("Error updating profile avatar:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /profiles/external/{documentNumber}:
 *   get:
 *     summary: Consulta segura de perfil de joven/adolescente para sistemas externos
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: documentNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del joven/adolescente
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: API Key inválida
 *       404:
 *         description: Perfil no encontrado o no es joven/adolescente
 */
export async function getExternalProfile(req: Request, res: Response) {
  const apiKey = req.headers["x-api-key"] as string | undefined;
  if (!apiKey) {
    return res.status(401).json({ message: "API Key requerida" });
  }
  const keyRecord = await prisma.externalApiKey.findUnique({ where: { key: apiKey } });
  if (!keyRecord || !keyRecord.active) {
    return res.status(401).json({ message: "API Key inválida o revocada" });
  }
  const { documentNumber } = req.params;
  if (!documentNumber) {
    return res.status(400).json({ message: "Falta el número de documento" });
  }
  const profile = await prisma.profile.findFirst({
    where: {
      documentNumber: documentNumber,
      OR: [
        { role: UserRole.YOUTH },
        { role: UserRole.ADOLESCENTS }
      ]
    } as any
  });
  if (!profile) {
    return res.status(404).json({ message: "Perfil no encontrado o no es joven/adolescente" });
  }
  return res.json(profile);
}
