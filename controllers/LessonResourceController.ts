import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
// import { uploadSingleFile } from "../middleware/upload";

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonResource:
 *       type: object
 *       required:
 *         - lessonId
 *         - title
 *         - type
 *         - url
 *       properties:
 *         id:
 *           type: string
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [PDF, DOCUMENT, VIDEO, AUDIO, IMAGE, LINK, ZIP, OTHER]
 *         url:
 *           type: string
 *         filePath:
 *           type: string
 *         fileSize:
 *           type: integer
 *         orderIndex:
 *           type: integer
 *         isDownloadable:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/lessonresource:
 *   get:
 *     summary: List all lesson resources
 *     tags: [Lesson Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
 *         description: Filter by lesson ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *     responses:
 *       200:
 *         description: List of lesson resources
 */
export async function listLessonResources(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId, type } = req.query;
    
    let whereClause: any = {};
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    const resources = await prisma.lessonResource.findMany({
      where: whereClause,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    return res.json(resources);
  } catch (error: any) {
    console.error("Error listing lesson resources:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonresource/{id}:
 *   get:
 *     summary: Get lesson resource by ID
 *     tags: [Lesson Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson resource found
 *       404:
 *         description: Lesson resource not found
 */
export async function getLessonResource(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    
    const resource = await prisma.lessonResource.findUnique({
      where: { id: id || '' },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!resource) {
      return res.status(404).json({ message: "Lesson resource not found" });
    }
    
    return res.json(resource);
  } catch (error: any) {
    console.error("Error getting lesson resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonresource:
 *   post:
 *     summary: Create new lesson resource
 *     tags: [Lesson Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               lessonId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               isDownloadable:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lesson resource created successfully
 */
export async function createLessonResource(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only instructors, organizations, and admins can create resources
    if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Only instructors and organizations can create lesson resources" });
    }
    
    // Debug: Log the request body and files
    console.log('🔍 [DEBUG] req.body:', req.body);
    console.log('📁 [DEBUG] req.files:', req.files);
    console.log('📋 [DEBUG] (req as any).uploadedResource:', (req as any).uploadedResource);
    
    const { lessonId, title, description, type, orderIndex, isDownloadable } = req.body || {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    // Validate required fields
    if (!lessonId || !title || !type) {
      console.log('❌ [DEBUG] Missing required fields:', { lessonId, title, type });
      return res.status(400).json({ 
        message: "Lesson ID, title, and type are required",
        received: { lessonId, title, type }
      });
    }
    
    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    });
    
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    
    let fileUrl = '';
    let filePath = '';
    let fileSize = 0;
    
    // Handle file upload from MinIO if provided
    if ((req as any).uploadedResource) {
      console.log('🎥 [DEBUG] Procesando (req as any).uploadedResource');
      fileUrl = (req as any).uploadedResource.url;
      filePath = (req as any).uploadedResource.filename; // Store filename instead of path for MinIO
      fileSize = (req as any).uploadedResource.size;
      console.log('🎥 [DEBUG] Resource URL desde uploadedResource:', fileUrl);
    } else if (files['file'] && files['file'][0]) {
      // Fallback to local file if MinIO upload failed
      console.log('⚠️ [DEBUG] Fallback a archivo local');
      const file = files['file'][0];
      fileUrl = `/uploads/resources/${file.filename}`;
      filePath = file.path;
      fileSize = file?.size;
    }
    
    // For external links, use the URL directly
    if (type === 'LINK' && req.body.url) {
      fileUrl = req.body.url;
    }
    
    const resource = await prisma.lessonResource.create({
      data: {
        lessonId,
        title: title.trim(),
        description: description?.trim(),
        type: type as any,
        url: fileUrl,
        filePath: filePath || null,
        fileSize: fileSize || null,
        orderIndex: parseInt(orderIndex) || 0,
        isDownloadable: isDownloadable === 'true' || isDownloadable === true
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    return res.status(201).json({
      ...resource,
      uploadedFile: (req as any).uploadedResource ? {
        url: (req as any).uploadedResource.url,
        filename: (req as any).uploadedResource.filename,
        originalName: (req as any).uploadedResource.originalName,
        size: (req as any).uploadedResource.size,
        mimetype: (req as any).uploadedResource.mimetype
      } : undefined
    });
  } catch (error: any) {
    console.error("Error creating lesson resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonresource/{id}:
 *   put:
 *     summary: Update lesson resource
 *     tags: [Lesson Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               orderIndex:
 *                 type: integer
 *               isDownloadable:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lesson resource updated successfully
 *       404:
 *         description: Lesson resource not found
 */
export async function updateLessonResource(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only instructors, organizations, and admins can update resources
    if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Only instructors and organizations can update lesson resources" });
    }
    
    // Check if resource exists
    const existingResource = await prisma.lessonResource.findUnique({
      where: { id: id || '' }
    });
    
    if (!existingResource) {
      return res.status(404).json({ message: "Lesson resource not found" });
    }
    
    const { title, description, type, orderIndex, isDownloadable } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    
    let updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (type !== undefined) updateData.type = type;
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex);
    if (isDownloadable !== undefined) updateData.isDownloadable = isDownloadable === 'true' || isDownloadable === true;
    
    // Handle file upload from MinIO if provided
    if ((req as any).uploadedResource) {
      console.log('🎥 [DEBUG] Procesando actualización con MinIO');
      updateData.url = (req as any).uploadedResource.url;
      updateData.filePath = (req as any).uploadedResource.filename; // Store filename instead of path for MinIO
      updateData.fileSize = (req as any).uploadedResource.size;
    } else if (files['file'] && files['file'][0]) {
      // Fallback to local file if MinIO upload failed
      console.log('⚠️ [DEBUG] Fallback a archivo local para actualización');
      const file = files['file'][0];
      updateData.url = `/uploads/resources/${file.filename}`;
      updateData.filePath = file.path;
      updateData.fileSize = file?.size;
    }
    
    const resource = await prisma.lessonResource.update({
      where: { id: id || '' },
      data: updateData,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    return res.json({
      ...resource,
      uploadedFile: (req as any).uploadedResource ? {
        url: (req as any).uploadedResource.url,
        filename: (req as any).uploadedResource.filename,
        originalName: (req as any).uploadedResource.originalName,
        size: (req as any).uploadedResource.size,
        mimetype: (req as any).uploadedResource.mimetype
      } : undefined
    });
  } catch (error: any) {
    console.error("Error updating lesson resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonresource/{id}:
 *   delete:
 *     summary: Delete lesson resource
 *     tags: [Lesson Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson resource deleted successfully
 *       404:
 *         description: Lesson resource not found
 */
export async function deleteLessonResource(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Only admins can delete resources
    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied. Only admins can delete lesson resources" });
    }
    
    // Check if resource exists
    const resource = await prisma.lessonResource.findUnique({
      where: { id: id || '' }
    });
    
    if (!resource) {
      return res.status(404).json({ message: "Lesson resource not found" });
    }
    
    // Delete the file from MinIO if it exists
    if (resource.filePath && resource.filePath.includes('lesson-resource-')) {
      try {
        const { deleteFromMinio } = require('../lib/minio');
        await deleteFromMinio(resource.filePath, 'resources');
        console.log('🗑️ [DEBUG] Archivo eliminado de MinIO:', resource.filePath);
      } catch (error) {
        console.error('⚠️ [WARNING] Error deleting file from MinIO:', error);
        // Continue with deletion even if MinIO deletion fails
      }
    } else if (resource.filePath) {
      // Fallback to local file deletion
      const fs = require('fs');
      if (fs.existsSync(resource.filePath)) {
        fs.unlinkSync(resource.filePath);
      }
    }
    
    await prisma.lessonResource.delete({
      where: { id: id || '' }
    });
    
    return res.json({ message: "Lesson resource deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting lesson resource:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}
