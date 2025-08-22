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
export async function listLessonProgresss(req: Request, res: Response): Promise<Response> {
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
export async function getLessonProgress(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    const item = await prisma.lessonProgress.findUnique({
      where: { id: id || '' },
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
    if (user && user.type === 'user' && (item as any).enrollment.student.id !== user.id && user.role !== 'SUPERADMIN') {
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
export async function createLessonProgress(req: Request, res: Response): Promise<Response> {
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

      // Si la lección se marcó como completada, verificar si se completó el módulo
      if (isCompleted && !existingProgress.isCompleted) {
        // Ejecutar en background para no bloquear la respuesta
        checkModuleCompletionAndGenerateCertificate(enrollmentId, lessonId).catch(error => {
          console.error('Error verificando completación de módulo:', error);
        });
      }
      
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

      // Si la lección se marcó como completada, verificar si se completó el módulo
      if (isCompleted) {
        // Ejecutar en background para no bloquear la respuesta
        checkModuleCompletionAndGenerateCertificate(enrollmentId, lessonId).catch(error => {
          console.error('Error verificando completación de módulo:', error);
        });
      }
      
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
export async function updateLessonProgress(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { isCompleted, timeSpent, videoProgress } = req.body;
    
    // Check if progress exists
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { id: id || '' },
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
    if (user.type === 'user' && (existingProgress as any).enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
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
      where: { id: id || '' },
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
export async function deleteLessonProgress(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // Check if progress exists
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: { id: id || '' },
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
    if (user.type === 'user' && (existingProgress as any).enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await prisma.lessonProgress.delete({
              where: { 
          enrollmentId_lessonId: {
            enrollmentId: req.params['enrollmentId'] || '',
            lessonId: req.params['lessonId'] || ''
          }
        }
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
export async function getCourseProgress(req: Request, res: Response): Promise<Response> {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    
    // Get enrollment for this course and user
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId: courseId || '',
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
          courseId: courseId || ''
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

// Función para verificar si se completó un módulo y generar certificado
async function checkModuleCompletionAndGenerateCertificate(enrollmentId: string, lessonId: string) {
  try {
    // Obtener la lección y su módulo
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            hasCertificate: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!lesson || !lesson.module) {
      console.log('Lección o módulo no encontrado');
      return;
    }

    // Obtener el enrollment para saber el estudiante
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!enrollment) {
      console.log('Enrollment no encontrado');
      return;
    }

    // Verificar si el módulo tiene certificados habilitados
    if (!lesson.module.hasCertificate) {
      console.log('Módulo no tiene certificados habilitados');
      return;
    }

    // Contar todas las lecciones del módulo
    const totalLessons = await prisma.lesson.count({
      where: { moduleId: lesson.module.id }
    });

    // Contar lecciones completadas del módulo para este estudiante
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollmentId,
        isCompleted: true,
        lesson: {
          moduleId: lesson.module.id
        }
      }
    });

    console.log(`Módulo ${lesson.module.title}: ${completedLessons}/${totalLessons} lecciones completadas`);

    // Si se completaron todas las lecciones del módulo
    if (completedLessons === totalLessons) {
      console.log(`¡Módulo ${lesson.module.title} completado! Generando certificado...`);

      // Verificar si ya existe un certificado para este módulo y estudiante
      const existingCertificate = await prisma.moduleCertificate.findUnique({
        where: {
          moduleId_studentId: {
            moduleId: lesson.module.id,
            studentId: enrollment.student.userId
          }
        }
      });

      if (existingCertificate) {
        console.log('Certificado ya existe para este módulo y estudiante');
        return;
      }

      // Calcular calificación promedio del módulo
      const lessonProgresses = await prisma.lessonProgress.findMany({
        where: {
          enrollmentId: enrollmentId,
          isCompleted: true,
          lesson: {
            moduleId: lesson.module.id
          }
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      // Calcular calificación basada en tiempo dedicado y progreso de video
      let totalGrade = 0;
      let validLessons = 0;

      for (const progress of lessonProgresses) {
        let lessonGrade = 0;
        
        // Si completó la lección, dar puntos base
        if (progress.isCompleted) {
          lessonGrade += 70; // 70% por completar
        }

        // Puntos adicionales por tiempo dedicado (máximo 20%)
        if (progress.timeSpent > 0) {
          const timeBonus = Math.min(20, (progress.timeSpent / 300) * 20); // 5 min = 20%
          lessonGrade += timeBonus;
        }

        // Puntos adicionales por progreso de video (máximo 10%)
        if (progress.videoProgress > 0) {
          lessonGrade += progress.videoProgress * 10;
        }

        totalGrade += Math.min(100, lessonGrade);
        validLessons++;
      }

      const averageGrade = validLessons > 0 ? Math.round(totalGrade / validLessons) : 85;

      // Generar URL del certificado
      const certificateUrl = `https://minio.example.com/certificates/module-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`;

      // Crear el certificado
      const certificate = await prisma.moduleCertificate.create({
        data: {
          moduleId: lesson.module.id,
          studentId: enrollment.student.userId,
          certificateUrl: certificateUrl,
          grade: averageGrade,
          completedAt: new Date()
        },
        include: {
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
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      console.log(`✅ Certificado de módulo generado exitosamente para ${enrollment.student.firstName} ${enrollment.student.lastName}`);
      console.log(`   📚 Módulo: ${certificate.module.title}`);
      console.log(`   🎓 Curso: ${certificate.module.course.title}`);
      console.log(`   📊 Calificación: ${certificate.grade}%`);
      console.log(`   🔗 URL: ${certificate.certificateUrl}`);

      // Después de generar el certificado del módulo, verificar si se completó todo el curso
      await checkCourseCompletionAndGenerateCertificate(enrollmentId, lesson.module.course.id);

      return certificate;
    }
  } catch (error) {
    console.error('Error verificando completación de módulo:', error);
  }
}

// Función para verificar si se completó todo el curso y generar certificado
async function checkCourseCompletionAndGenerateCertificate(enrollmentId: string, courseId: string) {
  try {
    // Obtener el enrollment para saber el estudiante
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          select: {
            userId: true,
            firstName: true,
            lastName: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!enrollment) {
      console.log('Enrollment no encontrado para verificación de curso');
      return;
    }

    // Contar todas las lecciones del curso
    const totalLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId: courseId
        }
      }
    });

    // Contar lecciones completadas del curso para este estudiante
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollmentId,
        isCompleted: true,
        lesson: {
          module: {
            courseId: courseId
          }
        }
      }
    });

    console.log(`Curso ${enrollment.course.title}: ${completedLessons}/${totalLessons} lecciones completadas`);

    // Si se completaron todas las lecciones del curso
    if (completedLessons === totalLessons && totalLessons > 0) {
      console.log(`¡Curso ${enrollment.course.title} completado! Generando certificado...`);

      // Verificar si ya existe un certificado para este curso y estudiante
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          courseId: courseId,
          userId: enrollment.student.userId
        }
      });

      if (existingCertificate) {
        console.log('Certificado de curso ya existe para este estudiante');
        return;
      }

      // Generar código de verificación único
      const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Generar firma digital (simplificada)
      const digitalSignature = `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Generar URL del certificado
      const certificateUrl = `https://minio.example.com/certificates/course-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`;

      // Crear el certificado del curso
      const certificate = await prisma.certificate.create({
        data: {
          userId: enrollment.student.userId,
          courseId: courseId,
          template: 'default',
          verificationCode: verificationCode,
          digitalSignature: digitalSignature,
          url: certificateUrl,
          isValid: true
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      console.log(`✅ Certificado de curso generado exitosamente para ${enrollment.student.firstName} ${enrollment.student.lastName}`);
      console.log(`   🎓 Curso: ${certificate.course.title}`);
      console.log(`   🔐 Código de verificación: ${certificate.verificationCode}`);
      console.log(`   🔗 URL: ${certificate.url}`);

      return certificate;
    }
  } catch (error) {
    console.error('Error verificando completación de curso:', error);
  }
}
