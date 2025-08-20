import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *     Institution:
 *       type: object
 *       required:
 *         - name
 *         - department
 *         - institutionType
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         department:
 *           type: string
 *         region:
 *           type: string
 *         population:
 *           type: integer
 *         mayorName:
 *           type: string
 *         mayorEmail:
 *           type: string
 *         mayorPhone:
 *           type: string
 *         address:
 *           type: string
 *         website:
 *           type: string
 *         isActive:
 *           type: boolean
 *         institutionType:
 *           type: string
 *           enum: [MUNICIPALITY, NGO, FOUNDATION, OTHER]
 *         customType:
 *           type: string
 *         primaryColor:
 *           type: string
 *         secondaryColor:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/institution:
 *   get:
 *     summary: Get all institutions
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Institution'
 */
export async function listInstitutions(_req: Request, res: Response) {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        population: true,
        mayorName: true,
        mayorEmail: true,
        mayorPhone: true,
        address: true,
        website: true,
        isActive: true,
        username: true,
        email: true,
        phone: true,
        institutionType: true,
        customType: true,
        primaryColor: true,
        secondaryColor: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });
    return res.json(institutions);
  } catch (error) {
    console.error("Error listing institutions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution/{id}:
 *   get:
 *     summary: Get institution by ID
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Institution ID
 *     responses:
 *       200:
 *         description: Institution found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 *       404:
 *         description: Institution not found
 */
export async function getInstitution(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing institution ID" });
    }

    const institution = await prisma.institution.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        population: true,
        mayorName: true,
        mayorEmail: true,
        mayorPhone: true,
        address: true,
        website: true,
        isActive: true,
        username: true,
        email: true,
        phone: true,
        institutionType: true,
        customType: true,
        primaryColor: true,
        secondaryColor: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        },
        // Note: Institution model doesn't have companies field
        // Companies are related to Municipality model
      }
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    return res.json(institution);
  } catch (error) {
    console.error("Error getting institution:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution:
 *   post:
 *     summary: Create a new institution (SuperAdmin only)
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - department
 *               - institutionType
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *               region:
 *                 type: string
 *               population:
 *                 type: integer
 *               mayorName:
 *                 type: string
 *               mayorEmail:
 *                 type: string
 *               mayorPhone:
 *                 type: string
 *               address:
 *                 type: string
 *               website:
 *                 type: string
 *               institutionType:
 *                 type: string
 *                 enum: [MUNICIPALITY, NGO, OTHER]
 *               customType:
 *                 type: string
 *               primaryColor:
 *                 type: string
 *               secondaryColor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Institution created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
export async function createInstitution(req: Request, res: Response) {
  try {
    // Check if user is SuperAdmin
    const user = (req as any).user;
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can create institutions" });
    }

    const { 
      name, 
      department, 
      region, 
      population, 
      mayorName, 
      mayorEmail, 
      mayorPhone, 
      address, 
      website,
      username,
      password,
      email,
      phone,
      institutionType,
      customType,
      primaryColor,
      secondaryColor
    } = req.body;

    if (!name || !department || !username || !password || !email || !institutionType) {
      return res.status(400).json({ 
        message: "Name, department, username, password, email, and institutionType are required" 
      });
    }

    // Validate institutionType
    if (!['MUNICIPALITY', 'NGO', 'FOUNDATION', 'OTHER'].includes(institutionType)) {
      return res.status(400).json({ 
        message: "institutionType must be MUNICIPALITY, NGO, FOUNDATION, or OTHER" 
      });
    }

    // If institutionType is OTHER, customType is required
    if (institutionType === 'OTHER' && !customType) {
      return res.status(400).json({ 
        message: "customType is required when institutionType is OTHER" 
      });
    }

    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const institution = await prisma.institution.create({
      data: {
        name,
        department,
        region,
        population: population ? parseInt(population) : null,
        mayorName,
        mayorEmail,
        mayorPhone,
        address,
        website,
        username,
        password: hashedPassword,
        email,
        phone,
        institutionType,
        customType: institutionType === 'OTHER' ? customType : null,
        primaryColor,
        secondaryColor,
        createdBy: user.id,
        isActive: true
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    // Don't return the password in the response
    const { password: _, ...institutionWithoutPassword } = institution;
    return res.status(201).json(institutionWithoutPassword);
  } catch (error: any) {
    console.error("Error creating institution:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Institution with this name, department, username, or email already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution/{id}:
 *   put:
 *     summary: Update institution (SuperAdmin only)
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Institution ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Institution'
 *     responses:
 *       200:
 *         description: Institution updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Institution not found
 */
export async function updateInstitution(req: Request, res: Response) {
  try {
    // Check if user is SuperAdmin
    const user = (req as any).user;
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can update institutions" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing institution ID" });
    }

    const { 
      name, 
      department, 
      region, 
      population, 
      mayorName, 
      mayorEmail, 
      mayorPhone, 
      address, 
      website,
      isActive,
      institutionType,
      customType,
      primaryColor,
      secondaryColor
    } = req.body;

    // Validate institutionType if provided
    if (institutionType && !['MUNICIPALITY', 'NGO', 'OTHER'].includes(institutionType)) {
      return res.status(400).json({ 
        message: "institutionType must be MUNICIPALITY, NGO, or OTHER" 
      });
    }

    // If institutionType is OTHER, customType is required
    if (institutionType === 'OTHER' && !customType) {
      return res.status(400).json({ 
        message: "customType is required when institutionType is OTHER" 
      });
    }

    const institution = await prisma.institution.update({
      where: { id },
      data: {
        name,
        department,
        region,
        population: population ? parseInt(population) : null,
        mayorName,
        mayorEmail,
        mayorPhone,
        address,
        website,
        isActive,
        institutionType,
        customType: institutionType === 'OTHER' ? customType : null,
        primaryColor,
        secondaryColor
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    return res.json(institution);
  } catch (error: any) {
    console.error("Error updating institution:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Institution not found" });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Institution with this name and department already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution/{id}:
 *   delete:
 *     summary: Delete institution (SuperAdmin only)
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Institution ID
 *     responses:
 *       204:
 *         description: Institution deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Institution not found
 */
export async function deleteInstitution(req: Request, res: Response) {
  try {
    // Check if user is SuperAdmin
    const user = (req as any).user;
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can delete institutions" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing institution ID" });
    }

    // Check if institution exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { id }
    });

    if (!existingInstitution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Delete the institution
    await prisma.institution.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting institution:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Institution not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution/public:
 *   get:
 *     summary: Get all active institutions (public endpoint)
 *     tags: [Institutions]
 *     description: Public endpoint to get institutions for forms and profiles
 *     responses:
 *       200:
 *         description: List of active institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   department:
 *                     type: string
 *                   region:
 *                     type: string
 *                   institutionType:
 *                     type: string
 *                   customType:
 *                     type: string
 */
export async function listPublicInstitutions(_req: Request, res: Response) {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        institutionType: true,
        customType: true
      },
      orderBy: [
        { department: 'asc' },
        { name: 'asc' }
      ]
    });
    return res.json(institutions);
  } catch (error) {
    console.error("Error listing public institutions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
