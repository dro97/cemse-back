import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { io } from "../server";

/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       required:
 *         - title
 *         - moduleId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the quiz
 *         title:
 *           type: string
 *           description: Quiz title
 *         description:
 *           type: string
 *           description: Quiz description
 *         moduleId:
 *           type: string
 *           description: ID of the module this quiz belongs to
 *         timeLimit:
 *           type: integer
 *           description: Time limit in minutes
 *         isActive:
 *           type: boolean
 *           description: Whether the quiz is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Quiz creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Quiz last update timestamp
 *     QuizInput:
 *       type: object
 *       required:
 *         - title
 *         - moduleId
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         moduleId:
 *           type: string
 *         timeLimit:
 *           type: integer
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     responses:
 *       200:
 *         description: List of all quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 */
export async function listQuizs(_req: Request, res: Response) {
  const items = await prisma.quiz.findMany();
  return res.json(items);
}

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get a quiz by ID
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 */
export async function getQuiz(req: Request, res: Response) {
  const item = await prisma.quiz.findUnique({
    where: { id: req.params["id"] || "" }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizInput'
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Invalid input data
 */
export async function createQuiz(req: Request, res: Response) {
  const newItem = await prisma.quiz.create({
    data: req.body
  });
  
  // Emit real-time update
  io.emit("quiz:created", newItem);
  
  res.status(201).json(newItem);
}

/**
 * @swagger
 * /quizzes/{id}:
 *   put:
 *     summary: Update a quiz
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizInput'
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 */
export async function updateQuiz(req: Request, res: Response) {
  const updated = await prisma.quiz.update({
    where: { id: req.params["id"] || "" },
    data: req.body
  });
  
  // Emit real-time update
  io.emit("quiz:updated", updated);
  
  res.json(updated);
}

/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       204:
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 */
export async function deleteQuiz(req: Request, res: Response) {
  await prisma.quiz.delete({
    where: { id: req.params["id"] || "" }
  });
  
  // Emit real-time update
  io.emit("quiz:deleted", { id: req.params["id"] });
  
  return res.status(204).end();
}
