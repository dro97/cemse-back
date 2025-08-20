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
  try {
    // Debug logs
    console.log('🔍 DEBUG - createQuiz llamado');
    console.log('🔍 DEBUG - req.body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 DEBUG - req.headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔍 DEBUG - req.method:', req.method);
    console.log('🔍 DEBUG - req.url:', req.url);
    
    // Validar que req.body existe y tiene los campos requeridos
    if (!req.body || !req.body.title) {
      console.log('❌ DEBUG - req.body es undefined o no tiene title');
      console.log('❌ DEBUG - req.body type:', typeof req.body);
      console.log('❌ DEBUG - req.body keys:', req.body ? Object.keys(req.body) : 'undefined');
      
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'El título del quiz es requerido',
        debug: {
          bodyExists: !!req.body,
          bodyType: typeof req.body,
          bodyKeys: req.body ? Object.keys(req.body) : 'undefined',
          hasTitle: req.body ? !!req.body.title : false
        }
      });
    }

    // Extraer y validar los datos
    const {
      courseId,
      lessonId,
      title,
      description,
      timeLimit,
      passingScore = 70,
      showCorrectAnswers = false,
      isActive = true
    } = req.body;

    // Validar que al menos uno de courseId o lessonId esté presente
    if (!courseId && !lessonId) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Debe especificar courseId o lessonId'
      });
    }

    const newItem = await prisma.quiz.create({
      data: {
        courseId: courseId || null,
        lessonId: lessonId || null,
        title,
        description: description || null,
        timeLimit: timeLimit ? parseInt(timeLimit as string) : null,
        passingScore: parseInt(passingScore as string),
        showCorrectAnswers: showCorrectAnswers === "true" || showCorrectAnswers === true,
        isActive: isActive === "true" || isActive === true
      }
    });
    
    // Emit real-time update
    io.emit("quiz:created", newItem);
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creando quiz:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
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
  try {
    const quizId = req.params["id"];
    if (!quizId) {
      return res.status(400).json({
        error: 'ID requerido',
        message: 'El ID del quiz es requerido'
      });
    }

    // Validar que req.body existe
    if (!req.body) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'No se proporcionaron datos para actualizar'
      });
    }

    // Extraer y validar los datos
    const {
      courseId,
      lessonId,
      title,
      description,
      timeLimit,
      passingScore,
      showCorrectAnswers,
      isActive
    } = req.body;

    // Construir objeto de datos para actualizar
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (courseId !== undefined) updateData.courseId = courseId || null;
    if (lessonId !== undefined) updateData.lessonId = lessonId || null;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit ? parseInt(timeLimit as string) : null;
    if (passingScore !== undefined) updateData.passingScore = parseInt(passingScore as string);
    if (showCorrectAnswers !== undefined) updateData.showCorrectAnswers = showCorrectAnswers === "true" || showCorrectAnswers === true;
    if (isActive !== undefined) updateData.isActive = isActive === "true" || isActive === true;

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: updateData
    });
    
    // Emit real-time update
    io.emit("quiz:updated", updated);
    
    res.json(updated);
  } catch (error) {
    console.error('Error actualizando quiz:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
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
