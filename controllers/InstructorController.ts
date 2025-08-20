import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * components:
 *   schemas:
 *     Instructor:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - firstName
 *         - lastName
 *         - specialization
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         specialization:
 *           type: array
 *           items:
 *             type: string
 *         bio:
 *           type: string
 *         experience:
 *           type: string
 *         education:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/instructors:
 *   get:
 *     summary: List all instructors
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of instructors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instructor'
 */
export async function listInstructors(_req: Request, res: Response) {
  try {
    const instructors = await prisma.profile.findMany({
      where: { role: 'INSTRUCTOR' },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        specialization: true,
        educationHistory: true,
        workExperience: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        instructedCourses: {
          select: {
            id: true,
            title: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(instructors);
  } catch (error) {
    console.error("Error listing instructors:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/instructors/{id}:
 *   get:
 *     summary: Get instructor by ID
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instructor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instructor'
 *       404:
 *         description: Instructor not found
 */
export async function getInstructor(req: Request, res: Response) {
  try {
    const instructor = await prisma.profile.findFirst({
      where: { 
        id: req.params['id'] || '',
        role: 'INSTRUCTOR'
      },
      include: {
        instructedCourses: {
          select: {
            id: true,
            title: true,
            description: true,
            isActive: true,
            studentsCount: true,
            rating: true,
            createdAt: true
          }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    return res.json(instructor);
  } catch (error) {
    console.error("Error getting instructor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/instructors:
 *   post:
 *     summary: Create a new instructor
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - firstName
 *               - lastName
 *               - specialization
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *     responses:
 *       201:
 *         description: Instructor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instructor'
 *       400:
 *         description: Invalid input data
 */
export async function createInstructor(req: Request, res: Response) {
  try {
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      specialization,
      // bio, // Removed as it doesn't exist in Profile model
      experience,
      education
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !firstName || !lastName || !specialization) {
      return res.status(400).json({
        message: "username, password, email, firstName, lastName, and specialization are required"
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    // Check if email already exists
    const existingProfile = await prisma.profile.findFirst({
      where: { email }
    });

    if (existingProfile) {
      return res.status(400).json({
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
          role: 'INSTRUCTOR'
        }
      });

      // Create profile
      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          email,
          specialization,
          workExperience: experience ? JSON.parse(experience) : null,
          educationHistory: education ? JSON.parse(education) : null,
          role: 'INSTRUCTOR',
          active: true
        }
      });

      return { user, profile };
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    return res.status(201).json({
      message: "Instructor created successfully",
      instructor: {
        ...result.profile,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error("Error creating instructor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/instructors/{id}:
 *   put:
 *     summary: Update instructor
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Instructor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instructor'
 *       404:
 *         description: Instructor not found
 */
export async function updateInstructor(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      email,
      specialization,
      experience,
      education,
      isActive
    } = req.body;

    const instructor = await prisma.profile.findFirst({
      where: { 
        id: req.params['id'] || '',
        role: 'INSTRUCTOR'
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== instructor.email) {
      const existingProfile = await prisma.profile.findFirst({
        where: { 
          email,
          id: { not: req.params['id'] || '' }
        }
      });

      if (existingProfile) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }
    }

    const updatedInstructor = await prisma.profile.update({
      where: { id: req.params['id'] || '' },
      data: {
        firstName,
        lastName,
        email,
        specialization,
        workExperience: experience ? JSON.parse(experience) : undefined,
        educationHistory: education ? JSON.parse(education) : undefined,
        active: isActive
      }
    });

    return res.json({
      message: "Instructor updated successfully",
      instructor: updatedInstructor
    });
  } catch (error) {
    console.error("Error updating instructor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/instructors/{id}:
 *   delete:
 *     summary: Delete instructor
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instructor deleted successfully
 *       404:
 *         description: Instructor not found
 */
export async function deleteInstructor(req: Request, res: Response) {
  try {
    const instructor = await prisma.profile.findFirst({
      where: { 
        id: req.params['id'] || '',
        role: 'INSTRUCTOR'
      },
      include: {
        instructedCourses: true
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Check if instructor has active courses
    const activeCourses = instructor.instructedCourses.filter(course => course.isActive);
    if (activeCourses.length > 0) {
      return res.status(400).json({
        message: "Cannot delete instructor with active courses. Please deactivate or reassign courses first."
      });
    }

    // Delete instructor and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete profile
      await tx.profile.delete({
        where: { id: req.params['id'] || '' }
      });

      // Delete user
      await tx.user.delete({
        where: { id: instructor.userId }
      });
    });

    return res.json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/instructors/auth/login:
 *   post:
 *     summary: Instructor login
 *     tags: [Instructors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 instructor:
 *                   $ref: '#/components/schemas/Instructor'
 *       401:
 *         description: Invalid credentials
 */
export async function instructorLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.role !== 'INSTRUCTOR') {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // Get instructor profile
    const instructor = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!instructor || !instructor.active) {
      return res.status(401).json({
        message: "Instructor account is inactive"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        instructorId: instructor.id
      },
      process.env['JWT_SECRET'] || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    await prisma.profile.update({
      where: { id: instructor.id },
      data: { lastLoginAt: new Date() }
    });

    return res.json({
      message: "Login successful",
      token,
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        specialization: instructor.specialization,
        workExperience: instructor.workExperience,
        educationHistory: instructor.educationHistory,
        active: instructor.active
      }
    });
  } catch (error) {
    console.error("Error in instructor login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /api/instructors/stats:
 *   get:
 *     summary: Get instructor statistics
 *     tags: [Instructors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor statistics
 */
export async function getInstructorStats(_req: Request, res: Response) {
  try {
    const totalInstructors = await prisma.profile.count({
      where: { role: 'INSTRUCTOR' }
    });

    const activeInstructors = await prisma.profile.count({
      where: { 
        role: 'INSTRUCTOR',
        active: true
      }
    });

    const totalCourses = await prisma.course.count({
      where: {
        instructor: {
          role: 'INSTRUCTOR'
        }
      }
    });

    const activeCourses = await prisma.course.count({
      where: {
        instructor: {
          role: 'INSTRUCTOR'
        },
        isActive: true
      }
    });

    const totalStudents = await prisma.courseEnrollment.count({
      where: {
        course: {
          instructor: {
            role: 'INSTRUCTOR'
          }
        }
      }
    });

    return res.json({
      totalInstructors,
      activeInstructors,
      totalCourses,
      activeCourses,
      totalStudents
    });
  } catch (error) {
    console.error("Error getting instructor stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
