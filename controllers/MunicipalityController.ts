import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *     Municipality:
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *         institutionType:
 *           type: string
 *           enum: [MUNICIPALITY, NGO, FOUNDATION, OTHER]
 *         customType:
 *           type: string
 *         primaryColor:
 *           type: string
 *         secondaryColor:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/municipality:
 *   get:
 *     summary: Get all municipalities
 *     tags: [Municipalities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of municipalities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Municipality'
 */
export async function listMunicipalities(_req: Request, res: Response) {
  try {
    const municipalities = await prisma.municipality.findMany({
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
    return res.json(municipalities);
  } catch (error) {
    console.error("Error listing municipalities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/municipality/{id}:
 *   get:
 *     summary: Get municipality by ID
 *     tags: [Municipalities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Municipality ID
 *     responses:
 *       200:
 *         description: Municipality found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Municipality'
 *       404:
 *         description: Municipality not found
 */
export async function getMunicipality(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing municipality ID" });
    }

    const municipality = await prisma.municipality.findUnique({
      where: { id: id || '' },
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
        companies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            businessSector: true
          }
        }
      }
    });

    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    return res.json(municipality);
  } catch (error) {
    console.error("Error getting municipality:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/municipality:
 *   post:
 *     summary: Create a new municipality (SuperAdmin only)
 *     tags: [Municipalities]
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
 *     responses:
 *       201:
 *         description: Municipality created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Municipality'
 *       403:
 *         description: Insufficient permissions
 *       400:
 *         description: Invalid input data
 */
export async function createMunicipality(req: Request, res: Response): Promise<Response> {
  try {
    // Check if user is SuperAdmin
    const user = (req as any).user;
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can create municipalities" });
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

    const municipality = await prisma.municipality.create({
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
    const { password: _, ...municipalityWithoutPassword } = municipality;
    return res.status(201).json(municipalityWithoutPassword);
  } catch (error: any) {
    console.error("Error creating municipality:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Municipality with this name, department, username, or email already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/municipality/{id}:
 *   put:
 *     summary: Update municipality (SuperAdmin only)
 *     tags: [Municipalities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Municipality ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Municipality'
 *     responses:
 *       200:
 *         description: Municipality updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Municipality'
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Municipality not found
 */
export async function updateMunicipality(req: Request, res: Response): Promise<Response> {
  try {
    // Check if user is SuperAdmin
    const user = (req as any).user;
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can update municipalities" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing municipality ID" });
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
      isActive 
    } = req.body;

    const municipality = await prisma.municipality.update({
      where: { id: id || '' },
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
        isActive
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

    return res.json(municipality);
  } catch (error: any) {
    console.error("Error updating municipality:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Municipality not found" });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Municipality with this name and department already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/municipality/{id}:
 *   delete:
 *     summary: Delete municipality (SuperAdmin only)
 *     tags: [Municipalities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Municipality ID
 *     responses:
 *       204:
 *         description: Municipality deleted successfully
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Municipality not found
 */
export async function deleteMunicipality(req: Request, res: Response): Promise<Response> {
  try {
    // Check if user is SuperAdmin
    const user = (req as any).user;
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can delete municipalities" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing municipality ID" });
    }

    // Check if municipality has companies
    const municipality = await prisma.municipality.findUnique({
      where: { id: id || '' },
      include: {
        companies: {
          where: { isActive: true }
        }
      }
    });

    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    if (municipality.companies.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete municipality with active companies. Deactivate companies first." 
      });
    }

    await prisma.municipality.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting municipality:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Municipality not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
} 

/**
 * @swagger
 * /api/municipality/public:
 *   get:
 *     summary: Get all active municipalities (public endpoint)
 *     tags: [Municipalities]
 *     description: Public endpoint to get municipalities for forms and profiles
 *     responses:
 *       200:
 *         description: List of active municipalities
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
 */
export async function listPublicMunicipalities(_req: Request, res: Response) {
  try {
    const municipalities = await prisma.municipality.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        department: true,
        region: true,
        population: true
      },
      orderBy: [
        { department: 'asc' },
        { name: 'asc' }
      ]
    });
    return res.json(municipalities);
  } catch (error) {
    console.error("Error listing public municipalities:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 