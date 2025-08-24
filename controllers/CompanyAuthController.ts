import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecretkey";

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     CompanyLoginResponse:
 *       type: object
 *       properties:
 *         company:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             businessSector:
 *               type: string
 *             username:
 *               type: string
 *             loginEmail:
 *               type: string
 *         token:
 *           type: string
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/company/auth/login:
 *   post:
 *     summary: Company login
 *     tags: [Company Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Missing required fields
 */
export async function companyLogin(req: Request, res: Response): Promise<Response> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: "Username and password are required" 
      });
    }

    // Find company by username
    const company = await prisma.company.findUnique({
      where: { username }
    });

    if (!company || !company.isActive) {
      return res.status(401).json({ 
        message: "Invalid credentials or company is inactive" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, company.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: company.id, 
        username: company.username, 
        name: company.name,
        businessSector: company.businessSector,
        type: 'company',
        role: 'COMPANIES'
      }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    );

    // Return company data without password
    const { password: _, ...companyWithoutPassword } = company;

    return res.json({
      company: companyWithoutPassword,
      token,
      message: "Company login successful"
    });

  } catch (error) {
    console.error("Company login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/auth/me:
 *   get:
 *     summary: Get current company info
 *     tags: [Company Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current company info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *       401:
 *         description: Invalid or missing token
 */
export async function getCompanyProfile(req: Request, res: Response): Promise<Response> {
  try {
    const companyId = (req as any).user?.id;
    
    if (!companyId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        description: true,
        businessSector: true,
        companySize: true,
        website: true,
        email: true,
        phone: true,
        address: true,
        foundedYear: true,
        isActive: true,
        username: true,
        loginEmail: true,
        createdAt: true,
        updatedAt: true,
        municipality: {
          select: {
            id: true,
            name: true,
            department: true
          }
        },
        jobOffers: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        profiles: {
          where: { active: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.json({ company });

  } catch (error) {
    console.error("Error getting company profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/company/auth/change-password:
 *   post:
 *     summary: Change company password
 *     tags: [Company Auth]
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
export async function changeCompanyPassword(req: Request, res: Response): Promise<Response> {
  try {
    const companyId = (req as any).user?.id;
    
    if (!companyId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    // Get company with password
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, company.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid current password" 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.company.update({
      where: { id: companyId },
      data: { password: hashedNewPassword }
    });

    return res.json({ 
      message: "Password changed successfully" 
    });

  } catch (error) {
    console.error("Error changing company password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 