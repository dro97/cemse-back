import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import crypto from "crypto";
import { UserRole } from "@prisma/client";

// Middleware para requerir superadmin
function requireSuperAdmin(req: Request, res: Response, next: Function): void | Response {
  if (!req.user || req.user.role !== UserRole.SUPERADMIN) {
    return res.status(403).json({ message: "Solo SUPERADMIN puede gestionar API Keys externas" });
  }
  next();
}

/**
 * @swagger
 * /external-api-keys:
 *   post:
 *     summary: Crear una nueva API Key externa
 *     tags: [ExternalApiKey]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del sistema externo
 *     responses:
 *       201:
 *         description: API Key creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 key:
 *                   type: string
 *                 name:
 *                   type: string
 *                 active:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */
export const createExternalApiKey = [requireSuperAdmin, async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Falta el nombre del sistema externo" });
  const key = crypto.randomBytes(32).toString("hex");
  const apiKey = await prisma.externalApiKey.create({ data: { name, key } });
  return res.status(201).json(apiKey);
}];

/**
 * @swagger
 * /external-api-keys:
 *   get:
 *     summary: Listar todas las API Keys externas
 *     tags: [ExternalApiKey]
 *     responses:
 *       200:
 *         description: Lista de API Keys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   key:
 *                     type: string
 *                   name:
 *                     type: string
 *                   active:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   revokedAt:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 */
export const listExternalApiKeys = [requireSuperAdmin, async (_: Request, res: Response) => {
  const keys = await prisma.externalApiKey.findMany();
  return res.json(keys);
}];

/**
 * @swagger
 * /external-api-keys/{id}/revoke:
 *   patch:
 *     summary: Revocar una API Key externa
 *     tags: [ExternalApiKey]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la API Key
 *     responses:
 *       200:
 *         description: API Key revocada
 *       404:
 *         description: API Key no encontrada
 */
export const revokeExternalApiKey = [requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing id" });
  const apiKey = await prisma.externalApiKey.update({
    where: { id: id || '' },
    data: { active: false, revokedAt: new Date() }
  }).catch(() => null);
  if (!apiKey) return res.status(404).json({ message: "API Key no encontrada" });
  return res.json(apiKey);
}]; 