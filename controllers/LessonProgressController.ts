import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * /api/lessonprogress:
 *   get:
 *     summary: List lesson progress for a student
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: enrollmentId
 *         schema:
 *           type: string
 *         description: Filter by enrollment ID
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
 *         description: Filter by lesson ID
 *     responses:
 *       200:
 *         description: List of lesson progress
 */
export async function listLessonProgresss(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { enrollmentId, lessonId } = req.query;
    
    let whereClause: any = {};
    
    // If user is a regular user, only show their own progress
    if (user && user.type === 'user' && user.role !== 'SUPERADMIN') {
      whereClause.enrollment = {
        studentId: user.id
      };
    }
    
    if (enrollmentId) {
      whereClause.enrollmentId = enrollmentId;
    }
    
    if (lessonId) {
      whereClause.lessonId = lessonId;
    }
    
    const items = await prisma.lessonProgress.findMany({
      where: whereClause,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
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
        },
        enrollment: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        lastWatchedAt: 'desc'
      }
    });
    
    return res.json(items);
  } catch (error: any) {
    console.error("Error listing lesson progress:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonprogress/{id}:
 *   get:
 *     summary: Get lesson progress by ID
 *     tags: [Lesson Progress]
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
 *         description: Lesson progress found
 *       404:
 *         description: Lesson progress not found
 */
export async function getLessonProgress(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const item = await prisma.lessonProgress.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
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
        },
        enrollment: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    if (!item) {
      return res.status(404).json({ message: "Lesson progress not found" });
    }
    
    // Check permissions - users can only see their own progress, but admins can see all
    if (user && user.type === 'user' && item.enrollment.student.id !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    return res.json(item);
  } catch (error: any) {
    console.error("Error getting lesson progress:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonprogress:
 *   post:
 *     summary: Create or update lesson progress
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enrollmentId
 *               - lessonId
 *             properties:
 *               enrollmentId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *               timeSpent:
 *                 type: integer
 *               videoProgress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       201:
 *         description: Lesson progress created successfully
 */
export async function createLessonProgress(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { enrollmentId, lessonId, isCompleted, timeSpent, videoProgress } = req.body;
    
    if (!enrollmentId || !lessonId) {
      return res.status(400).json({ 
        message: "enrollmentId and lessonId are required" 
      });
    }
    
    // Check if user owns this enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId }
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    
    if (user.type === 'user' && enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Check if progress already exists
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId
        }
      }
    });
    
    if (existingProgress) {
      // Update existing progress
      const updated = await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          isCompleted: isCompleted !== undefined ? isCompleted : existingProgress.isCompleted,
          timeSpent: timeSpent !== undefined ? timeSpent : existingProgress.timeSpent,
          videoProgress: videoProgress !== undefined ? videoProgress : existingProgress.videoProgress,
          lastWatchedAt: new Date(),
          completedAt: isCompleted ? new Date() : existingProgress.completedAt
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              duration: true
            }
          }
        }
      });
      
      return res.json(updated);
    } else {
      // Create new progress
      const newItem = await prisma.lessonProgress.create({
        data: {
          enrollmentId,
          lessonId,
          isCompleted: isCompleted || false,
          timeSpent: timeSpent || 0,
          videoProgress: videoProgress || 0,
          lastWatchedAt: new Date(),
          completedAt: isCompleted ? new Date() : null
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              duration: true
            }
          }
        }
      });
      
      return res.status(201).json(newItem);
    }
  } catch (error: any) {
    console.error("Error creating lesson progress:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonprogress/{id}:
 *   put:
 *     summary: Update lesson progress
 *     tags: [Lesson Progress]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *               timeSpent:
 *                 type: integer
 *               videoProgress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lesson progress updated successfully
 *       404:
 *         description: Lesson progress not found
 */
export async function updateLessonProgress(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { isCompleted, timeSpent, videoProgress } = req.body;
    
    // Check if progress exists
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { id },
      include: {
        enrollment: {
          select: {
            studentId: true
          }
        }
      }
    });
    
    if (!existingProgress) {
      return res.status(404).json({ message: "Lesson progress not found" });
    }
    
    // Check permissions
    if (user.type === 'user' && existingProgress.enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const updateData: any = {
      lastWatchedAt: new Date()
    };
    
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }
    
    if (timeSpent !== undefined) {
      updateData.timeSpent = timeSpent;
    }
    
    if (videoProgress !== undefined) {
      updateData.videoProgress = videoProgress;
    }
    
    const updated = await prisma.lessonProgress.update({
      where: { id },
      data: updateData,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true
          }
        }
      }
    });
    
    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating lesson progress:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonprogress/{id}:
 *   delete:
 *     summary: Delete lesson progress
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lesson progress deleted successfully
 *       404:
 *         description: Lesson progress not found
 */
export async function deleteLessonProgress(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check if progress exists
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { id },
      include: {
        enrollment: {
          select: {
            studentId: true
          }
        }
      }
    });
    
    if (!existingProgress) {
      return res.status(404).json({ message: "Lesson progress not found" });
    }
    
    // Check permissions
    if (user.type === 'user' && existingProgress.enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await prisma.lessonProgress.delete({
      where: { id }
    });
    
    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting lesson progress:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/lessonprogress/course/{courseId}:
 *   get:
 *     summary: Get lesson progress for a specific course
 *     tags: [Lesson Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course progress found
 */
export async function getCourseProgress(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    
    // Get enrollment for this course and user
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId: user.id
      }
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found for this course" });
    }
    
    // Get all lesson progress for this enrollment
    const progress = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            module: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        lastWatchedAt: 'desc'
      }
    });
    
    // Calculate overall progress
    const totalLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId
        }
      }
    });
    
    const completedLessons = progress.filter(p => p.isCompleted).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    return res.json({
      enrollment,
      progress,
      overallProgress,
      completedLessons,
      totalLessons
    });
  } catch (error: any) {
    console.error("Error getting course progress:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}
