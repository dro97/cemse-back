import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listCourseModules(_req: Request, res: Response) {
  const items = await prisma.courseModule.findMany();
  return res.json(items);
}

export async function getCourseModule(req: Request, res: Response) {
  const item = await prisma.courseModule.findUnique({
    where: { id: req.params['id'] || '' }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createCourseModule(req: Request, res: Response) {
  try {
    console.log('🔍 [DEBUG] createCourseModule - req.body:', req.body);
    
    // Validar que req.body existe y no está vacío
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        message: "Request body is required and cannot be empty",
        receivedBody: req.body 
      });
    }

    // Validar campos requeridos
    const { title, courseId, orderIndex } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }
    
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }
    
    if (orderIndex === undefined || orderIndex === null) {
      return res.status(400).json({ message: "orderIndex is required" });
    }

    console.log('📋 [DEBUG] Creating module with data:', { title, courseId, orderIndex });

    // Crear el módulo con solo los campos básicos para evitar errores de TypeScript
    const newItem = await prisma.courseModule.create({
      data: {
        title,
        courseId,
        orderIndex,
        description: req.body.description || null,
        estimatedDuration: req.body.estimatedDuration || 0,
        isLocked: req.body.isLocked !== undefined ? req.body.isLocked : false,
        prerequisites: req.body.prerequisites || []
      }
    });
    
    console.log('✅ [DEBUG] Module created successfully:', newItem.id);
    return res.status(201).json(newItem);
    
  } catch (error) {
    console.error('❌ [DEBUG] Error creating module:', error);
    return res.status(500).json({ 
      message: "Error creating course module",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function updateCourseModule(req: Request, res: Response) {
  const updated = await prisma.courseModule.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteCourseModule(req: Request, res: Response) {
  await prisma.courseModule.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
