import { Router } from "express";
import { io } from "../server";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SocketEvent:
 *       type: object
 *       properties:
 *         event:
 *           type: string
 *           description: Event name
 *         data:
 *           type: object
 *           description: Event data
 *     SocketConnection:
 *       type: object
 *       properties:
 *         socketId:
 *           type: string
 *         connected:
 *           type: boolean
 */

/**
 * @swagger
 * /socket/status:
 *   get:
 *     summary: Get Socket.IO server status
 *     tags: [Socket.IO]
 *     responses:
 *       200:
 *         description: Socket.IO server status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "running"
 *                 connections:
 *                   type: number
 *                   description: Number of active connections
 */
router.get("/status", (_req, res) => {
  const connections = io.engine.clientsCount;
  return res.json({
    status: "running",
    connections,
    events: [
      "profile:created",
      "profile:updated", 
      "profile:deleted",
      "course:created",
      "course:updated",
      "course:deleted"
    ]
  });
});

/**
 * @swagger
 * /socket/emit:
 *   post:
 *     summary: Emit a custom event to all connected clients
 *     tags: [Socket.IO]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocketEvent'
 *     responses:
 *       200:
 *         description: Event emitted successfully
 */
router.post("/emit", (req, res) => {
  const { event, data } = req.body;
  if (!event) {
    return res.status(400).json({ message: "Event name is required" });
  }
  
  io.emit(event, data || {});
  return res.json({ message: `Event '${event}' emitted successfully` });
});

export default router; 