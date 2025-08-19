import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { io } from "../server";

// Extender el tipo Request para incluir archivos subidos
interface RequestWithUploadedFiles extends Request {
  uploadedFiles?: {
    video?: {
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
      bucket: string;
    };
    thumbnail?: {
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
      bucket: string;
    };
    attachments?: Array<{
      url: string;
      filename: string;
      originalName: string;
      size: number;
      mimetype: string;
      bucket: string;
    }>;
  };
  uploadedVideo?: {
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    bucket: string;
  };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - contentType
 *         - orderIndex
 *         - moduleId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the lesson
 *         title:
 *           type: string
 *           description: Lesson title
 *         description:
 *           type: string
 *           description: Lesson description
 *         content:
 *           type: string
 *           description: Lesson content (text content or video description)
 *         contentType:
 *           type: string
 *           enum: [VIDEO, TEXT, QUIZ, EXERCISE, DOCUMENT, INTERACTIVE]
 *           description: Type of lesson content
 *         videoUrl:
 *           type: string
 *           description: URL of the video file (for VIDEO content type)
 *         duration:
 *           type: integer
 *           description: Lesson duration in minutes
 *         orderIndex:
 *           type: integer
 *           description: Lesson order within module
 *         moduleId:
 *           type: string
 *           description: ID of the module this lesson belongs to
 *         isRequired:
 *           type: boolean
 *           description: Whether the lesson is required to complete the module
 *         isPreview:
 *           type: boolean
 *           description: Whether the lesson is available as preview
 *         attachments:
 *           type: object
 *           description: Additional attachments for the lesson
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Lesson creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Lesson last update timestamp
 *     LessonInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - contentType
 *         - orderIndex
 *         - moduleId
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         contentType:
 *           type: string
 *           enum: [VIDEO, TEXT, QUIZ, EXERCISE, DOCUMENT, INTERACTIVE]
 *         videoUrl:
 *           type: string
 *         duration:
 *           type: integer
 *         orderIndex:
 *           type: integer
 *         moduleId:
 *           type: string
 *         isRequired:
 *           type: boolean
 *         isPreview:
 *           type: boolean
 *         attachments:
 *           type: object
 */

/**
 * @swagger
 * /lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: List of all lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */
export async function listLessons(_req: Request, res: Response) {
  const items = await prisma.lesson.findMany({
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });
  return res.json(items);
}

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get a lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
export async function getLesson(req: Request, res: Response) {
  const item = await prisma.lesson.findUnique({
    where: { id: req.params["id"] || "" },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

/**
 * @swagger
 * /lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Invalid input data
 */
export async function createLesson(req: RequestWithUploadedFiles, res: Response) {
  const { 
    title, 
    description,
    content, 
    moduleId, 
    contentType, 
    videoUrl,
    duration, 
    orderIndex,
    isRequired,
    isPreview,
    attachments
  } = req.body;
  
  if (!title || !content || !moduleId || !contentType || orderIndex === undefined) {
    return res.status(400).json({ 
      message: "title, content, moduleId, contentType, and orderIndex are required" 
    });
  }

  // Validar que el módulo existe
  const module = await prisma.courseModule.findUnique({
    where: { id: moduleId }
  });

  if (!module) {
    return res.status(400).json({ 
      message: "Module not found" 
    });
  }

  // Procesar video subido a MinIO si existe
  let finalVideoUrl = videoUrl;
  let finalAttachments = attachments;

  console.log('🔍 [DEBUG] Procesando archivos subidos...');
  console.log('📋 [DEBUG] req.uploadedFiles:', req.uploadedFiles ? 'Existe' : 'No existe');
  console.log('📋 [DEBUG] req.uploadedVideo:', req.uploadedVideo ? 'Existe' : 'No existe');

  if (req.uploadedFiles) {
    console.log('📁 [DEBUG] Procesando req.uploadedFiles');
    // Si hay archivos subidos a MinIO
    if (req.uploadedFiles.video) {
      finalVideoUrl = req.uploadedFiles.video.url;
      console.log('🎥 [DEBUG] Video URL desde uploadedFiles:', finalVideoUrl);
    }
    
    if (req.uploadedFiles.attachments && req.uploadedFiles.attachments.length > 0) {
      finalAttachments = req.uploadedFiles.attachments.map((file: any) => ({
        url: file.url,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        mimetype: file.mimetype
      }));
      console.log('📎 [DEBUG] Attachments procesados:', finalAttachments.length);
    }
  } else if (req.uploadedVideo) {
    console.log('🎥 [DEBUG] Procesando req.uploadedVideo');
    // Si hay un video subido individualmente
    finalVideoUrl = req.uploadedVideo.url;
    console.log('🎥 [DEBUG] Video URL desde uploadedVideo:', finalVideoUrl);
  } else {
    console.log('⚠️ [DEBUG] No se encontraron archivos subidos');
  }

  console.log('🎯 [DEBUG] finalVideoUrl:', finalVideoUrl);

  // Validaciones específicas para videos
  if (contentType === 'VIDEO') {
    if (!finalVideoUrl) {
      return res.status(400).json({ 
        message: "videoUrl is required for VIDEO content type" 
      });
    }
  }

  const newItem = await prisma.lesson.create({
    data: {
      title,
      description: description || null,
      content,
      moduleId,
      contentType,
      videoUrl: finalVideoUrl || null,
      duration: duration || null,
      orderIndex,
      isRequired: isRequired !== undefined ? isRequired : true,
      isPreview: isPreview !== undefined ? isPreview : false,
      attachments: finalAttachments || null
    }
  });
  
  // Emit real-time update
  io.emit("lesson:created", newItem);
  
  return res.status(201).json({
    ...newItem,
    uploadedFiles: req.uploadedFiles || req.uploadedVideo ? {
      video: req.uploadedFiles?.video || req.uploadedVideo,
      attachments: req.uploadedFiles?.attachments || []
    } : undefined
  });
}

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
export async function updateLesson(req: Request, res: Response) {
  const { 
    title, 
    description,
    content, 
    contentType, 
    videoUrl,
    duration, 
    orderIndex,
    isRequired,
    isPreview,
    attachments
  } = req.body;

  // Validaciones específicas para videos
  if (contentType === 'VIDEO' && !videoUrl) {
    return res.status(400).json({ 
      message: "videoUrl is required for VIDEO content type" 
    });
  }

  const updated = await prisma.lesson.update({
    where: { id: req.params["id"] || "" },
    data: {
      title,
      description,
      content,
      contentType,
      videoUrl,
      duration,
      orderIndex,
      isRequired,
      isPreview,
      attachments
    }
  });
  
  // Emit real-time update
  io.emit("lesson:updated", updated);
  
  res.json(updated);
}

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       204:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson not found
 */
export async function deleteLesson(req: Request, res: Response) {
  await prisma.lesson.delete({
    where: { id: req.params["id"] || "" }
  });
  
  // Emit real-time update
  io.emit("lesson:deleted", { id: req.params["id"] });
  
  return res.status(204).end();
}

/**
 * @swagger
 * /lessons/module/{moduleId}:
 *   get:
 *     summary: Get all lessons for a specific module
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: List of lessons for the module
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */
export async function getLessonsByModule(req: Request, res: Response) {
  const moduleId = req.params["moduleId"];
  
  if (!moduleId) {
    return res.status(400).json({ message: "Module ID is required" });
  }

  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { orderIndex: 'asc' },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });

  return res.json(lessons);
}
