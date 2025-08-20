import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - category
 *         - format
 *         - thumbnail
 *         - author
 *         - publishedDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the resource
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         category:
 *           type: string
 *         format:
 *           type: string
 *         downloadUrl:
 *           type: string
 *         externalUrl:
 *           type: string
 *         thumbnail:
 *           type: string
 *         author:
 *           type: string
 *         publishedDate:
 *           type: string
 *           format: date-time
 *         downloads:
 *           type: integer
 *         rating:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ResourceInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - category
 *         - format
 *         - thumbnail
 *         - author
 *         - publishedDate
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         category:
 *           type: string
 *         format:
 *           type: string
 *         downloadUrl:
 *           type: string
 *         externalUrl:
 *           type: string
 *         thumbnail:
 *           type: string
 *         author:
 *           type: string
 *         publishedDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of all resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export async function listResources(_req: Request, res: Response) {
  const items = await prisma.resource.findMany();
  return res.json(items);
}

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 */
export async function getResource(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing id" });
  const item = await prisma.resource.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ message: "Resource not found" });
  return res.json(item);
}

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResourceInput'
 *     responses:
 *       201:
 *         description: Resource created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 */
export async function createResource(req: Request, res: Response): Promise<Response> {
  const { 
    title, 
    description, 
    type, 
    category, 
    format, 
    thumbnail, 
    author 
  } = req.body;
  
  if (!title || !description || !type || !category || !format || !thumbnail || !author) {
    return res.status(400).json({ 
      message: "title, description, type, category, format, thumbnail, and author are required" 
    });
  }

  const item = await prisma.resource.create({ 
    data: {
      title,
      description,
      type,
      category,
      format,
      thumbnail,
      author,
      publishedDate: new Date(),
      downloads: 0,
      rating: 0,
      tags: []
    } as any
  });
  return res.status(201).json(item);
}

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResourceInput'
 *     responses:
 *       200:
 *         description: Resource updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 */
export async function updateResource(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing id" });
  const data = req.body;
  try {
    const item = await prisma.resource.update({ where: { id: id || '' }, data });
    return res.json(item);
  } catch {
    return res.status(404).json({ message: "Resource not found" });
  }
}

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       204:
 *         description: Resource deleted
 *       404:
 *         description: Resource not found
 */
export async function deleteResource(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing id" });
  try {
    await prisma.resource.delete({ where: { id } });
    return res.status(204).end();
  } catch {
    return res.status(404).json({ message: "Resource not found" });
  }
} 