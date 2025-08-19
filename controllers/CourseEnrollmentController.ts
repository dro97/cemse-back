import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

export async function listCourseEnrollments(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    
    // Build where clause based on user type
    let whereClause: any = {};
    
    // If user is a regular user (youth, adolescent), only show their own enrollments
    // But admins can see all enrollments
    if (user && user.type === 'user' && user.role !== 'SUPERADMIN') {
      whereClause.studentId = user.id;
    }
    
    const items = await prisma.courseEnrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' }
                }
              },
              orderBy: { orderIndex: 'asc' }
            },
            instructor: true
          }
        },
        student: true
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });
    
    return res.json(items);
  } catch (error: any) {
    console.error("Error listing course enrollments:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getCourseEnrollment(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const enrollmentId = req.params['id'] || '';
    
    const item = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' }
                }
              },
              orderBy: { orderIndex: 'asc' }
            },
            instructor: true
          }
        },
        student: true
      }
    });
    
    if (!item) {
      return res.status(404).json({ message: "Course enrollment not found" });
    }
    
    // Check permissions - users can only see their own enrollments, but admins can see all
    if (user && user.type === 'user' && item.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    return res.json(item);
  } catch (error: any) {
    console.error("Error getting course enrollment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function createCourseEnrollment(req: Request, res: Response) {
  try {
    const { studentId, courseId, ...otherData } = req.body;
    
    // Validar que se proporcionen los campos requeridos
    if (!studentId || !courseId) {
      return res.status(400).json({ 
        message: "studentId and courseId are required" 
      });
    }

    const newItem = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId,
        ...otherData
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        student: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    return res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Error creating course enrollment:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: "Student is already enrolled in this course" 
      });
    }
    
    return res.status(500).json({ 
      message: "Error creating course enrollment",
      error: error.message 
    });
  }
}

export async function updateCourseEnrollment(req: Request, res: Response) {
  const updated = await prisma.courseEnrollment.update({
    where: { id: req.params['id'] || '' },
    data: req.body
  });
  return res.json(updated);
}

export async function deleteCourseEnrollment(req: Request, res: Response) {
  await prisma.courseEnrollment.delete({
    where: { id: req.params['id'] || '' }
  });
  return res.status(204).end();
}
