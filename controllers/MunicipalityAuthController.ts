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
    console.log("🔍 MUNICIPALITY PROFILE DEBUG: Function called");
    console.log("🔍 MUNICIPALITY PROFILE DEBUG: User object:", (req as any).user);
    
    const user = (req as any).user;
    
    if (!user) {
      console.log("🔍 MUNICIPALITY PROFILE DEBUG: No user found");
      return res.status(401).json({ message: "Authentication required" });
    }

    let municipalityId = user.id;
    let municipality = null;

    // If user is municipality type, use the ID directly
    if (user.type === 'municipality') {
      console.log("🔍 MUNICIPALITY PROFILE DEBUG: User is municipality type, using ID directly");
      municipality = await prisma.municipality.findUnique({
        where: { id: municipalityId }
      });
    }
    // If user is user type with MUNICIPAL_GOVERNMENTS role, find municipality by username
    else if (user.type === 'user' && user.role === 'MUNICIPAL_GOVERNMENTS') {
      console.log("🔍 MUNICIPALITY PROFILE DEBUG: User is user type with MUNICIPAL_GOVERNMENTS role, finding municipality by username");
      municipality = await prisma.municipality.findUnique({
        where: { username: user.username }
      });
      if (municipality) {
        municipalityId = municipality.id;
      }
    }

    if (!municipality) {
      console.log("🔍 MUNICIPALITY PROFILE DEBUG: Municipality not found");
      return res.status(404).json({ message: "Municipality not found" });
    }

    console.log("🔍 MUNICIPALITY PROFILE DEBUG: Municipality found:", municipality.id);

    const municipalityData = await prisma.municipality.findUnique({
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

    if (!municipalityData) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    return res.json({ municipality: municipalityData });

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

/**
 * @swagger
 * /api/municipality/auth/update-profile:
 *   put:
 *     summary: Update municipality profile
 *     tags: [Municipality Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Municipality name
 *               department:
 *                 type: string
 *                 description: Department
 *               region:
 *                 type: string
 *                 description: Region
 *               population:
 *                 type: integer
 *                 description: Population
 *               mayorName:
 *                 type: string
 *                 description: Mayor name
 *               mayorEmail:
 *                 type: string
 *                 description: Mayor email
 *               mayorPhone:
 *                 type: string
 *                 description: Mayor phone
 *               address:
 *                 type: string
 *                 description: Address
 *               website:
 *                 type: string
 *                 description: Website
 *               email:
 *                 type: string
 *                 description: Municipality email
 *               phone:
 *                 type: string
 *                 description: Municipality phone
 *               primaryColor:
 *                 type: string
 *                 description: Primary color for branding
 *               secondaryColor:
 *                 type: string
 *                 description: Secondary color for branding
 *               customType:
 *                 type: string
 *                 description: Custom institution type (when institutionType is OTHER)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 municipality:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Municipality not found
 */
export async function updateMunicipalityProfile(req: Request, res: Response): Promise<Response> {
  try {
    const municipalityId = (req as any).user?.id;
    
    if (!municipalityId) {
      return res.status(401).json({ message: "Authentication required" });
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
      email,
      phone,
      primaryColor,
      secondaryColor,
      customType
    } = req.body;

    // Validate required fields
    if (!name || !department) {
      return res.status(400).json({ 
        message: "Name and department are required" 
      });
    }

    // Check if municipality exists
    const existingMunicipality = await prisma.municipality.findUnique({
      where: { id: municipalityId }
    });

    if (!existingMunicipality) {
      return res.status(404).json({ message: "Municipality not found" });
    }

    // Check if name and department combination already exists (excluding current municipality)
    if (name !== existingMunicipality.name || department !== existingMunicipality.department) {
      const duplicateMunicipality = await prisma.municipality.findFirst({
        where: {
          name,
          department,
          id: { not: municipalityId }
        }
      });

      if (duplicateMunicipality) {
        return res.status(400).json({ 
          message: "A municipality with this name and department already exists" 
        });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingMunicipality.email) {
      const duplicateEmail = await prisma.municipality.findFirst({
        where: {
          email,
          id: { not: municipalityId }
        }
      });

      if (duplicateEmail) {
        return res.status(400).json({ 
          message: "This email is already registered by another municipality" 
        });
      }
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format" 
      });
    }

    // Validate mayor email format if provided
    if (mayorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mayorEmail)) {
      return res.status(400).json({ 
        message: "Invalid mayor email format" 
      });
    }

    // Validate population if provided
    if (population !== undefined && (population < 0 || !Number.isInteger(population))) {
      return res.status(400).json({ 
        message: "Population must be a positive integer" 
      });
    }

    // Prepare update data
    const updateData: any = {
      name,
      department,
      region: region || null,
      population: population || null,
      mayorName: mayorName || null,
      mayorEmail: mayorEmail || null,
      mayorPhone: mayorPhone || null,
      address: address || null,
      website: website || null,
      email: email || null,
      phone: phone || null,
      primaryColor: primaryColor || null,
      secondaryColor: secondaryColor || null,
      customType: customType || null
    };

    // Update municipality
    const updatedMunicipality = await prisma.municipality.update({
      where: { id: municipalityId },
      data: updateData,
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
        primaryColor: true,
        secondaryColor: true,
        customType: true,
        institutionType: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.json({
      municipality: updatedMunicipality,
      message: "Municipality profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating municipality profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 