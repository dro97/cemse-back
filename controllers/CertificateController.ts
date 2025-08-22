import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       required:
 *         - studentId
 *         - courseId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the certificate
 *         studentId:
 *           type: string
 *           description: ID of the student who earned the certificate
 *         courseId:
 *           type: string
 *           description: ID of the course the certificate is for
 *         issuedAt:
 *           type: string
 *           format: date-time
 *           description: Certificate issuance timestamp
 *         certificateUrl:
 *           type: string
 *           description: URL to the certificate document
 *     CertificateInput:
 *       type: object
 *       required:
 *         - studentId
 *         - courseId
 *       properties:
 *         studentId:
 *           type: string
 *         courseId:
 *           type: string
 *         certificateUrl:
 *           type: string
 */

/**
 * @swagger
 * /certificates:
 *   get:
 *     summary: Get all certificates
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 */
export async function listCertificates(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let whereClause: any = {};
    
    // If user is a regular student, only show their own certificates
    if (user.type === 'user' && user.role !== 'SUPERADMIN') {
      whereClause.userId = user.id;
    }
    
    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        user: {
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
    console.error("Error listing certificates:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     summary: Get a certificate by ID
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       200:
 *         description: Certificate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Certificate not found
 */
export async function getCertificate(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const certificate = await prisma.certificate.findUnique({
      where: { id: id || '' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        user: {
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
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    // Check permissions - users can only see their own certificates, but admins can see all
    if (user.type === 'user' && certificate.userId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    return res.json(certificate);
  } catch (error: any) {
    console.error("Error getting certificate:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /certificates:
 *   post:
 *     summary: Create a new certificate
 *     tags: [Certificates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateInput'
 *     responses:
 *       201:
 *         description: Certificate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Invalid input data
 */
export async function createCertificate(req: Request, res: Response): Promise<Response> {
  const { 
    title, 
    description, 
    criteria, 
    verificationCode 
  } = req.body;
  
  if (!title || !description || !criteria || !verificationCode) {
    return res.status(400).json({ 
      message: "title, description, criteria, and verificationCode are required" 
    });
  }

  const newItem = await prisma.certificate.create({
    data: {
      title,
      description,
      criteria,
      verificationCode,
      isActive: true
    } as any
  });
  return res.status(201).json(newItem);
}

/**
 * @swagger
 * /certificates/{id}:
 *   put:
 *     summary: Update a certificate
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateInput'
 *     responses:
 *       200:
 *         description: Certificate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Certificate not found
 */
export async function updateCertificate(req: Request, res: Response): Promise<Response> {
  const updated = await prisma.certificate.update({
    where: { id: req.params['id'] || "" },
    data: req.body
  });
  return res.json(updated);
}

/**
 * @swagger
 * /certificates/{id}:
 *   delete:
 *     summary: Delete a certificate
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID
 *     responses:
 *       204:
 *         description: Certificate deleted successfully
 *       404:
 *         description: Certificate not found
 */
export async function deleteCertificate(req: Request, res: Response): Promise<Response> {
  await prisma.certificate.delete({
    where: { id: req.params['id'] || "" }
  });
  return res.status(204).end();
}
