import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey";

/**
 * @swagger
 * components:
 *   schemas:
 *     MunicipalityLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     MunicipalityLoginResponse:
 *       type: object
 *       properties:
 *         municipality:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             department:
 *               type: string
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         token:
 *           type: string
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/municipality/auth/login:
 *   post:
 *     summary: Municipality login
 *     tags: [Municipality Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MunicipalityLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MunicipalityLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Missing required fields
 */
export async function municipalityLogin(req: Request, res: Response): Promise<Response> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: "Username and password are required" 
      });
    }

    // Find municipality by username
    const municipality = await prisma.municipality.findUnique({
      where: { username }
    });

    if (!municipality || !municipality.isActive) {
      return res.status(401).json({ 
        message: "Invalid credentials or municipality is inactive" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, municipality.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: municipality.id, 
        username: municipality.username, 
        name: municipality.name,
        department: municipality.department,
        type: 'municipality'
      }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    );

    // Return municipality data without password
    const { password: _, ...municipalityWithoutPassword } = municipality;

    return res.json({
      municipality: municipalityWithoutPassword,
      token,
      message: "Municipality login successful"
    });

  } catch (error) {
    console.error("Municipality login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/municipality/auth/me:
 *   get:
 *     summary: Get current municipality info
 *     tags: [Municipality Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current municipality info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 municipality:
 *                   type: object
 *       401:
 *         description: Invalid or missing token
 */
export async function getMunicipalityProfile(req: Request, res: Response): Promise<Response> {
  try {
    const municipalityId = (req as any).user?.id;
    
    if (!municipalityId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const municipality = await prisma.municipality.findUnique({
      where: { id: municipalityId },
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
        createdAt: true,
        updatedAt: true,
        companies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            businessSector: true,
            companySize: true
          }
        }
      }
    });

    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    return res.json({ municipality });

  } catch (error) {
    console.error("Error getting municipality profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/municipality/auth/change-password:
 *   post:
 *     summary: Change municipality password
 *     tags: [Municipality Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 *       400:
 *         description: Missing required fields
 */
export async function changeMunicipalityPassword(req: Request, res: Response): Promise<Response> {
  try {
    const municipalityId = (req as any).user?.id;
    
    if (!municipalityId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    // Get municipality with password
    const municipality = await prisma.municipality.findUnique({
      where: { id: municipalityId }
    });

    if (!municipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, municipality.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid current password" 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.municipality.update({
      where: { id: municipalityId },
      data: { password: hashedNewPassword }
    });

    return res.json({ 
      message: "Password changed successfully" 
    });

  } catch (error) {
    console.error("Error changing municipality password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 