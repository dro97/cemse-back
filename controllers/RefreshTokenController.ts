import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshToken:
 *       type: object
 *       required:
 *         - token
 *         - userId
 *         - expiresAt
 *       properties:
 *         id:
 *           type: string
 *         token:
 *           type: string
 *         userId:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         revoked:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export async function listRefreshTokens(_req: Request, res: Response) {
  const tokens = await prisma.refreshToken.findMany();
  return res.json(tokens);
}

export async function getRefreshToken(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  const token = await prisma.refreshToken.findUnique({ where: { id } });
  if (!token) return res.status(404).json({ error: "RefreshToken not found" });
  return res.json(token);
}

export async function createRefreshToken(req: Request, res: Response) {
  try {
    const newToken = await prisma.refreshToken.create({ data: req.body });
    return res.status(201).json(newToken);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

export async function updateRefreshToken(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    const updated = await prisma.refreshToken.update({ where: { id }, data: req.body });
    return res.json(updated);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

export async function deleteRefreshToken(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  try {
    await prisma.refreshToken.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
} 