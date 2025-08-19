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
export async function listCertificates(_req: Request, res: Response) {
  const items = await prisma.certificate.findMany();
  return res.json(items);
}

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     summary: Get a certificate by ID
 *     tags: [Certificates]
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
export async function getCertificate(req: Request, res: Response) {
  const item = await prisma.certificate.findUnique({
    where: { id: req.params["id"] || "" }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
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
export async function createCertificate(req: Request, res: Response) {
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
export async function updateCertificate(req: Request, res: Response) {
  const updated = await prisma.certificate.update({
    where: { id: req.params["id"] || "" },
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
export async function deleteCertificate(req: Request, res: Response) {
  await prisma.certificate.delete({
    where: { id: req.params["id"] || "" }
  });
  return res.status(204).end();
}
