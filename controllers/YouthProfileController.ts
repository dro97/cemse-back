import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

/**
 * @swagger
 * components:
 *   schemas:
 *     YouthProfileRegistration:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - firstName
 *         - lastName
 *         - email
 *         - birthDate
 *         - educationLevel
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre de usuario único
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del joven
 *         lastName:
 *           type: string
 *           description: Apellido del joven
 *         email:
 *           type: string
 *           format: email
 *           description: Email del joven
 *         phone:
 *           type: string
 *           description: Número de teléfono
 *         address:
 *           type: string
 *           description: Dirección del joven
 *         municipality:
 *           type: string
 *           description: Municipio
 *         department:
 *           type: string
 *           description: Departamento
 *         country:
 *           type: string
 *           description: País
 *         birthDate:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         gender:
 *           type: string
 *           enum: [Masculino, Femenino, Otro]
 *           description: Género
 *         documentType:
 *           type: string
 *           description: Tipo de documento
 *         documentNumber:
 *           type: string
 *           description: Número de documento
 *         educationLevel:
 *           type: string
 *           enum: [PRIMARY, SECONDARY, TECHNICAL, UNIVERSITY, POSTGRADUATE, OTHER]
 *           description: Nivel de educación
 *         currentInstitution:
 *           type: string
 *           description: Institución educativa actual
 *         graduationYear:
 *           type: integer
 *           description: Año de graduación
 *         isStudying:
 *           type: boolean
 *           description: Si está estudiando actualmente
 *         currentDegree:
 *           type: string
 *           description: Grado actual (ej. Ingeniería en Sistemas)
 *         universityName:
 *           type: string
 *           description: Nombre de la universidad
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Habilidades del joven
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           description: Intereses del joven
 *         parentalConsent:
 *           type: boolean
 *           description: Consentimiento parental
 *         parentEmail:
 *           type: string
 *           format: email
 *           description: Email de los padres
 */

/**
 * @swagger
 * /api/youth-profile/register:
 *   post:
 *     summary: Register a new youth profile with user account
 *     tags: [Youth Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YouthProfileRegistration'
 *     responses:
 *       201:
 *         description: Youth profile registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     userId:
 *                       type: string
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Username or email already exists
 */
export async function registerYouthProfile(req: Request, res: Response): Promise<Response> {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      address,
      municipality,
      department = "Cochabamba",
      country = "Bolivia",
      birthDate,
      gender,
      documentType,
      documentNumber,
      educationLevel,
      currentInstitution,
      graduationYear,
      isStudying,
      currentDegree,
      universityName,
      skills = [],
      interests = [],
      parentalConsent = false,
      parentEmail
    } = req.body;

    // Validate required fields
    if (!username || !password || !firstName || !lastName || !email || !birthDate || !educationLevel) {
      return res.status(400).json({
        message: "Username, password, firstName, lastName, email, birthDate, and educationLevel are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists"
      });
    }

    // Check if email already exists
    const existingProfile = await prisma.profile.findFirst({
      where: { email }
    });

    if (existingProfile) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          role: UserRole.YOUTH,
          isActive: true
        }
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          email,
          phone,
          address,
          municipality,
          department,
          country,
          birthDate: new Date(birthDate),
          gender,
          documentType,
          documentNumber,
          educationLevel,
          currentInstitution,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          isStudying,
          currentDegree,
          universityName,
          skills,
          interests,
          role: UserRole.YOUTH,
          status: 'ACTIVE',
          active: true,
          profileCompletion: 75, // Default completion percentage
          parentalConsent,
          parentEmail,
          consentDate: parentalConsent ? new Date() : null
        }
      });

      return { user, profile };
    });

    // Generate tokens for the new user
    const accessToken = generateAccessToken(result.user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: result.user.id,
        expiresAt,
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    return res.status(201).json({
      user: userWithoutPassword,
      profile: {
        id: result.profile.id,
        firstName: result.profile.firstName,
        lastName: result.profile.lastName,
        email: result.profile.email,
        userId: result.profile.userId,
        educationLevel: result.profile.educationLevel,
        skills: result.profile.skills,
        interests: result.profile.interests
      },
      token: accessToken,
      refreshToken
    });

  } catch (error: any) {
    console.error("Youth profile registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/youth-profile/{userId}:
 *   get:
 *     summary: Get youth profile by user ID
 *     tags: [Youth Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Youth profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
export async function getYouthProfile(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        message: "Youth profile not found"
      });
    }

    return res.status(200).json(profile);

  } catch (error: any) {
    console.error("Error getting youth profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/youth-profile/{userId}:
 *   put:
 *     summary: Update youth profile
 *     tags: [Youth Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YouthProfileRegistration'
 *     responses:
 *       200:
 *         description: Youth profile updated successfully
 *       404:
 *         description: Profile not found
 */
export async function updateYouthProfile(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.username;
    delete updateData.password;
    delete updateData.role;

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData
    });

    return res.status(200).json(profile);

  } catch (error: any) {
    console.error("Error updating youth profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Helper functions
function generateAccessToken(user: any): string {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    type: 'user'
  };
  
  return require('jsonwebtoken').sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
}

function generateRefreshToken(): string {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4() + uuidv4();
}
