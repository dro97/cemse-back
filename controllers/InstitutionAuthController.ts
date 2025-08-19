import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey";

/**
 * @swagger
 * components:
 *   schemas:
 *     InstitutionLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     InstitutionLoginResponse:
 *       type: object
 *       properties:
 *         institution:
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
 *             institutionType:
 *               type: string
 *             customType:
 *               type: string
 *             primaryColor:
 *               type: string
 *             secondaryColor:
 *               type: string
 *         token:
 *           type: string
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/institution/auth/login:
 *   post:
 *     summary: Institution login
 *     tags: [Institution Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstitutionLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Missing required fields
 */
export async function institutionLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: "Username and password are required" 
      });
    }

    // Find institution by username
    const institution = await prisma.institution.findUnique({
      where: { username }
    });

    if (!institution || !institution.isActive) {
      return res.status(401).json({ 
        message: "Invalid credentials or institution is inactive" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, institution.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: institution.id, 
        username: institution.username, 
        name: institution.name,
        department: institution.department,
        institutionType: institution.institutionType,
        type: 'institution',
        role: 'MUNICIPAL_GOVERNMENTS' // Mantiene el mismo rol que municipios
      }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    );

    // Return institution data without password
    const { password: _, ...institutionWithoutPassword } = institution;

    return res.json({
      institution: institutionWithoutPassword,
      token,
      message: "Institution login successful"
    });

  } catch (error) {
    console.error("Institution login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution/auth/me:
 *   get:
 *     summary: Get current institution info
 *     tags: [Institution Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current institution info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 institution:
 *                   type: object
 *       401:
 *         description: Invalid or missing token
 */
export async function getInstitutionProfile(req: Request, res: Response) {
  try {
    const institutionId = (req as any).user?.id;
    
    if (!institutionId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
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

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    return res.json({ institution });

  } catch (error) {
    console.error("Error getting institution profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/institution/auth/change-password:
 *   post:
 *     summary: Change institution password
 *     tags: [Institution Auth]
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
export async function changeInstitutionPassword(req: Request, res: Response) {
  try {
    const institutionId = (req as any).user?.id;
    
    if (!institutionId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    // Get institution with password
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, institution.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.institution.update({
      where: { id: institutionId },
      data: { password: hashedNewPassword }
    });

    return res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Error changing institution password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
