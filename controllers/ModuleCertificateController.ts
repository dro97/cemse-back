import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     ModuleCertificate:
 *       type: object
 *       required:
 *         - moduleId
 *         - studentId
 *         - certificateUrl
 *       properties:
 *         id:
 *           type: string
 *         moduleId:
 *           type: string
 *         studentId:
 *           type: string
 *         certificateUrl:
 *           type: string
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         grade:
 *           type: integer
 *         completedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/modulecertificate:
 *   get:
 *     summary: List all module certificates
 *     tags: [Module Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: Filter by module ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *     responses:
 *       200:
 *         description: List of module certificates
 */
export async function listModuleCertificates(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { moduleId, studentId } = req.query;
    
    let whereClause: any = {};
    
    // If user is a regular user, only show their own certificates
    if (user && user.type === 'user' && user.role !== 'SUPERADMIN') {
      whereClause.studentId = user.id;
    }
    
    if (moduleId) {
      whereClause.moduleId = moduleId;
    }
    
    if (studentId && user.role === 'SUPERADMIN') {
      whereClause.studentId = studentId;
    }
    
    const certificates = await prisma.moduleCertificate.findMany({
      where: whereClause,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });
    
    return res.json(certificates);
  } catch (error: any) {
    console.error("Error listing module certificates:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/modulecertificate/{id}:
 *   get:
 *     summary: Get module certificate by ID
 *     tags: [Module Certificates]
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
 *         description: Module certificate found
 *       404:
 *         description: Module certificate not found
 */
export async function getModuleCertificate(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const certificate = await prisma.moduleCertificate.findUnique({
      where: { id },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (!certificate) {
      return res.status(404).json({ message: "Module certificate not found" });
    }
    
    // Check permissions - users can only see their own certificates, but admins can see all
    if (user && user.type === 'user' && certificate.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    return res.json(certificate);
  } catch (error: any) {
    console.error("Error getting module certificate:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/modulecertificate:
 *   post:
 *     summary: Create new module certificate
 *     tags: [Module Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleId
 *               - studentId
 *               - certificateUrl
 *             properties:
 *               moduleId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               certificateUrl:
 *                 type: string
 *               grade:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module certificate created successfully
 */
export async function createModuleCertificate(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only admins and instructors can create certificates
    if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Only admins and instructors can create certificates" });
    }
    
    const { moduleId, studentId, certificateUrl, grade } = req.body;
    
    // Validate required fields
    if (!moduleId || !studentId || !certificateUrl) {
      return res.status(400).json({ 
        message: "Module ID, student ID, and certificate URL are required" 
      });
    }
    
    // Check if module exists
    const module = await prisma.courseModule.findUnique({
      where: { id: moduleId }
    });
    
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    
    // Check if student exists
    const student = await prisma.profile.findUnique({
      where: { userId: studentId }
    });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Check if certificate already exists
    const existingCertificate = await prisma.moduleCertificate.findUnique({
      where: {
        moduleId_studentId: {
          moduleId,
          studentId
        }
      }
    });
    
    if (existingCertificate) {
      return res.status(400).json({ message: "Certificate already exists for this student and module" });
    }
    
    const certificate = await prisma.moduleCertificate.create({
      data: {
        moduleId,
        studentId,
        certificateUrl,
        grade: grade || null,
        completedAt: new Date()
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    return res.status(201).json(certificate);
  } catch (error: any) {
    console.error("Error creating module certificate:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/modulecertificate/{id}:
 *   put:
 *     summary: Update module certificate
 *     tags: [Module Certificates]
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
 *               certificateUrl:
 *                 type: string
 *               grade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module certificate updated successfully
 *       404:
 *         description: Module certificate not found
 */
export async function updateModuleCertificate(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only admins and instructors can update certificates
    if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Only admins and instructors can update certificates" });
    }
    
    // Check if certificate exists
    const existingCertificate = await prisma.moduleCertificate.findUnique({
      where: { id }
    });
    
    if (!existingCertificate) {
      return res.status(404).json({ message: "Module certificate not found" });
    }
    
    const { certificateUrl, grade } = req.body;
    
    let updateData: any = {};
    
    if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl;
    if (grade !== undefined) updateData.grade = grade;
    
    const certificate = await prisma.moduleCertificate.update({
      where: { id },
      data: updateData,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    return res.json(certificate);
  } catch (error: any) {
    console.error("Error updating module certificate:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/modulecertificate/{id}:
 *   delete:
 *     summary: Delete module certificate
 *     tags: [Module Certificates]
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
 *         description: Module certificate deleted successfully
 *       404:
 *         description: Module certificate not found
 */
export async function deleteModuleCertificate(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only admins can delete certificates
    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied. Only admins can delete certificates" });
    }
    
    // Check if certificate exists
    const certificate = await prisma.moduleCertificate.findUnique({
      where: { id }
    });
    
    if (!certificate) {
      return res.status(404).json({ message: "Module certificate not found" });
    }
    
    await prisma.moduleCertificate.delete({
      where: { id }
    });
    
    return res.json({ message: "Module certificate deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting module certificate:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}
