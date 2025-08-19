import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         role:
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
 * /api/user:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany();
  return res.json(users);
}

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
export async function getUser(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
}

export async function createUser(req: Request, res: Response) {
  try {
    const newUser = await prisma.user.create({ data: req.body });
    return res.status(201).json(newUser);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    const updated = await prisma.user.update({ where: { id }, data: req.body });
    return res.json(updated);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
} 