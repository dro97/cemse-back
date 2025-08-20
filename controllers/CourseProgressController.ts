import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * /api/course-progress/update-video-progress:
 *   post:
 *     summary: Update video progress for a lesson
 *     tags: [Course Progress]
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
 *               - videoProgress
 *             properties:
 *               enrollmentId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               videoProgress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               timeSpent:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Video progress updated successfully
 *       404:
 *         description: Enrollment or lesson not found
 */
export async function updateVideoProgress(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { enrollmentId, lessonId, videoProgress, timeSpent = 0 } = req.body;

    if (!enrollmentId || !lessonId || videoProgress === undefined) {
      return res.status(400).json({
        message: "enrollmentId, lessonId, and videoProgress are required"
      });
    }

    // Validate videoProgress range
    if (videoProgress < 0 || videoProgress > 1) {
      return res.status(400).json({
        message: "videoProgress must be between 0 and 1"
      });
    }

    // Verificar que el usuario tiene acceso a esta inscripción
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId || '' }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (user.type === 'user' && enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verificar que la lección existe
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId || '' },
      include: {
        module: {
          select: {
            courseId: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Verificar que la lección pertenece al curso de la inscripción
    if ((lesson as any).module.courseId !== enrollment.courseId) {
      return res.status(400).json({ 
        message: "Lesson does not belong to the enrolled course" 
      });
    }

    // Crear o actualizar el progreso de la lección
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId
        }
      },
      update: {
        videoProgress,
        timeSpent,
        lastWatchedAt: new Date(),
        // Marcar como completado si el progreso es 100%
        isCompleted: videoProgress >= 1.0,
        completedAt: videoProgress >= 1.0 ? new Date() : undefined
      },
      create: {
        enrollmentId,
        lessonId,
        videoProgress,
        timeSpent,
        lastWatchedAt: new Date(),
        isCompleted: videoProgress >= 1.0,
        completedAt: videoProgress >= 1.0 ? new Date() : null
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

    return res.json({
      message: "Video progress updated successfully",
      progress: lessonProgress
    });

  } catch (error: any) {
    console.error("Error updating video progress:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/course-progress/complete-lesson:
 *   post:
 *     summary: Complete a lesson and update module/course progress
 *     tags: [Course Progress]
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
 *               timeSpent:
 *                 type: integer
 *               videoProgress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lesson completed successfully
 */
export async function completeLesson(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { enrollmentId, lessonId, timeSpent = 0, videoProgress = 1.0 } = req.body;

    if (!enrollmentId || !lessonId) {
      return res.status(400).json({
        message: "enrollmentId and lessonId are required"
      });
    }

    // Verificar que el usuario tiene acceso a esta inscripción
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId || '' },
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
            }
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (user.type === 'user' && enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Encontrar la lección y su módulo
    let targetLesson: any = null;
    let targetModule: any = null;

    for (const module of (enrollment as any).course.modules) {
      const lesson = (module as any).lessons.find((l: any) => l.id === lessonId);
      if (lesson) {
        targetLesson = lesson;
        targetModule = module;
        break;
      }
    }

    if (!targetLesson) {
      return res.status(404).json({ message: "Lesson not found in this course" });
    }

    // Crear o actualizar el progreso de la lección
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId
        }
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        timeSpent,
        videoProgress,
        lastWatchedAt: new Date()
      },
      create: {
        enrollmentId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
        timeSpent,
        videoProgress,
        lastWatchedAt: new Date()
      }
    });

    // Calcular progreso del módulo
    const moduleLessons = targetModule.lessons;
    const completedModuleLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        lessonId: {
          in: moduleLessons.map((l: any) => l.id)
        },
        isCompleted: true
      }
    });

    const moduleProgress = (completedModuleLessons / moduleLessons.length) * 100;
    const isModuleCompleted = moduleProgress >= 100;

    // Calcular progreso del curso
    const totalLessons = (enrollment as any).course.modules.reduce((acc: number, module: any) => {
      return acc + (module as any).lessons.length;
    }, 0);

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        isCompleted: true
      }
    });

    const courseProgress = (completedLessons / totalLessons) * 100;
    const isCourseCompleted = courseProgress >= 100;

    // Encontrar la siguiente lección
    let nextLesson = null;
    let nextModule = null;

    if (!isModuleCompleted) {
      // Buscar siguiente lección en el mismo módulo
      const currentLessonIndex = moduleLessons.findIndex((l: any) => l.id === lessonId);
      if (currentLessonIndex < moduleLessons.length - 1) {
        nextLesson = moduleLessons[currentLessonIndex + 1];
        nextModule = targetModule;
      }
    } else {
      // Buscar siguiente módulo
      const currentModuleIndex = (enrollment as any).course.modules.findIndex((m: any) => m.id === targetModule.id);
      if (currentModuleIndex < (enrollment as any).course.modules.length - 1) {
        nextModule = (enrollment as any).course.modules[currentModuleIndex + 1];
        if ((nextModule as any).lessons.length > 0) {
          nextLesson = (nextModule as any).lessons[0];
        }
      }
    }

    // Actualizar la inscripción con el progreso y la siguiente lección
    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: { id: enrollmentId || '' },
      data: {
        progress: courseProgress,
        currentModuleId: nextModule?.id || targetModule.id,
        currentLessonId: nextLesson?.id || null,
        completedAt: isCourseCompleted ? new Date() : null,
        status: isCourseCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        timeSpent: {
          increment: timeSpent
        }
      }
    });

    return res.json({
      message: "Lesson completed successfully",
      lessonProgress,
      moduleProgress: {
        moduleId: targetModule.id,
        moduleTitle: targetModule.title,
        progress: moduleProgress,
        completedLessons: completedModuleLessons,
        totalLessons: moduleLessons.length,
        isCompleted: isModuleCompleted
      },
      courseProgress: {
        progress: courseProgress,
        completedLessons,
        totalLessons,
        isCompleted: isCourseCompleted
      },
      nextLesson: nextLesson ? {
        id: nextLesson.id,
        title: nextLesson.title,
        moduleId: (nextModule as any).id,
        moduleTitle: (nextModule as any).title
      } : null,
      enrollment: {
        id: updatedEnrollment.id,
        progress: updatedEnrollment.progress,
        status: updatedEnrollment.status,
        currentModuleId: updatedEnrollment.currentModuleId,
        currentLessonId: updatedEnrollment.currentLessonId
      }
    });

  } catch (error: any) {
    console.error("Error completing lesson:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/course-progress/complete-module:
 *   post:
 *     summary: Complete all lessons in a module
 *     tags: [Course Progress]
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
 *               - moduleId
 *     responses:
 *       200:
 *         description: Module completed successfully
 */
export async function completeModule(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { enrollmentId, moduleId } = req.body;

    if (!enrollmentId || !moduleId) {
      return res.status(400).json({
        message: "enrollmentId and moduleId are required"
      });
    }

    // Verificar acceso
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (user.type === 'user' && enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Obtener el módulo y sus lecciones
    const module = await prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Completar todas las lecciones del módulo
    const completedLessons = [];
    let totalTimeSpent = 0;

    for (const lesson of module.lessons) {
      const lessonProgress = await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId,
            lessonId: lesson.id
          }
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
          videoProgress: 1.0,
          lastWatchedAt: new Date()
        },
        create: {
          enrollmentId,
          lessonId: lesson.id,
          isCompleted: true,
          completedAt: new Date(),
          timeSpent: lesson.duration || 300,
          videoProgress: 1.0,
          lastWatchedAt: new Date()
        }
      });

      completedLessons.push(lessonProgress);
      totalTimeSpent += lessonProgress.timeSpent;
    }

    // Calcular progreso del curso
    const course = await prisma.course.findUnique({
      where: { id: enrollment.courseId },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    });

    const totalLessons = course?.modules.reduce((acc, module) => {
      return acc + (module as any).lessons.length;
    }, 0) || 0;

    const allCompletedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        isCompleted: true
      }
    });

    const courseProgress = (allCompletedLessons / totalLessons) * 100;
    const isCourseCompleted = courseProgress >= 100;

    // Encontrar el siguiente módulo
    let nextModule = null;
    let nextLesson = null;

    if (course) {
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      if (currentModuleIndex < course.modules.length - 1) {
        nextModule = course.modules[currentModuleIndex + 1];
        if ((nextModule as any).lessons.length > 0) {
          nextLesson = (nextModule as any).lessons[0];
        }
      }
    }

    // Actualizar la inscripción
    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: { id: enrollmentId || '' },
      data: {
        progress: courseProgress,
        currentModuleId: nextModule?.id || moduleId,
        currentLessonId: nextLesson?.id || null,
        completedAt: isCourseCompleted ? new Date() : null,
        status: isCourseCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        timeSpent: {
          increment: totalTimeSpent
        }
      }
    });

    return res.json({
      message: "Module completed successfully",
      module: {
        id: module.id,
        title: module.title,
        completedLessons: completedLessons.length,
        totalLessons: (module as any).lessons.length,
        progress: 100
      },
      courseProgress: {
        progress: courseProgress,
        completedLessons: allCompletedLessons,
        totalLessons,
        isCompleted: isCourseCompleted
      },
      nextModule: nextModule ? {
        id: (nextModule as any).id,
        title: (nextModule as any).title,
        firstLesson: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title
        } : null
      } : null,
      enrollment: {
        id: updatedEnrollment.id,
        progress: updatedEnrollment.progress,
        status: updatedEnrollment.status,
        currentModuleId: updatedEnrollment.currentModuleId,
        currentLessonId: updatedEnrollment.currentLessonId
      }
    });

  } catch (error: any) {
    console.error("Error completing module:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /api/course-progress/enrollment/{enrollmentId}:
 *   get:
 *     summary: Get detailed progress for an enrollment
 *     tags: [Course Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment progress details
 */
export async function getEnrollmentProgress(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { enrollmentId } = req.params;

    // Verificar acceso
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId || '' },
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
            }
          }
        },
        lessonProgress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                duration: true,
                moduleId: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (user.type === 'user' && enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Calcular progreso por módulo
    const moduleProgress = (enrollment as any).course.modules.map((module: any) => {
      const moduleLessons = module.lessons;
      const completedLessons = (enrollment as any).lessonProgress.filter(
        (progress: any) => progress.isCompleted && moduleLessons.some((lesson: any) => lesson.id === progress.lessonId)
      ).length;

      const progress = (completedLessons / moduleLessons.length) * 100;
      const isCompleted = progress >= 100;

      return {
        id: module.id,
        title: module.title,
        orderIndex: module.orderIndex,
        totalLessons: moduleLessons.length,
        completedLessons,
        progress,
        isCompleted,
        lessons: moduleLessons.map((lesson: any) => {
          const lessonProgress = (enrollment as any).lessonProgress.find(
            (lp: any) => lp.lessonId === lesson.id
          );

          return {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            orderIndex: lesson.orderIndex,
            isCompleted: lessonProgress?.isCompleted || false,
            timeSpent: lessonProgress?.timeSpent || 0,
            videoProgress: lessonProgress?.videoProgress || 0,
            completedAt: lessonProgress?.completedAt,
            lastWatchedAt: lessonProgress?.lastWatchedAt
          };
        })
      };
    });

    // Calcular progreso general del curso
    const totalLessons = (enrollment as any).course.modules.reduce((acc: number, module: any) => {
      return acc + (module as any).lessons.length;
    }, 0);

    const completedLessons = (enrollment as any).lessonProgress.filter((p: any) => p.isCompleted).length;
    const courseProgress = (completedLessons / totalLessons) * 100;

    // Encontrar la siguiente lección recomendada
    let nextLesson = null;
    let nextModule = null;

    for (const module of moduleProgress) {
      if (!module.isCompleted) {
        const incompleteLesson = (module as any).lessons.find((lesson: any) => !lesson.isCompleted);
        if (incompleteLesson) {
          nextLesson = incompleteLesson;
          nextModule = module;
          break;
        }
      }
    }

    return res.json({
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        progress: enrollment.progress,
        currentModuleId: enrollment.currentModuleId,
        currentLessonId: enrollment.currentLessonId,
        enrolledAt: enrollment.enrolledAt,
        startedAt: enrollment.startedAt,
        completedAt: enrollment.completedAt,
        timeSpent: enrollment.timeSpent
      },
      course: {
        id: (enrollment as any).course.id,
        title: (enrollment as any).course.title,
        totalLessons,
        completedLessons,
        progress: courseProgress,
        isCompleted: courseProgress >= 100
      },
      modules: moduleProgress,
      nextLesson: nextLesson ? {
        id: nextLesson.id,
        title: nextLesson.title,
        moduleId: (nextModule as any).id,
        moduleTitle: (nextModule as any).title
      } : null
    });

  } catch (error: any) {
    console.error("Error getting enrollment progress:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
