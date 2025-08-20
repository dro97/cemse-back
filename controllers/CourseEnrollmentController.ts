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
            quizzes: {
              include: {
                questions: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
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

    // Enriquecer los datos con recursos y quizzes de lecciones
    console.log('🔍 Iniciando enriquecimiento de datos...');
    const enrichedItems = await Promise.all(
      items.map(async (enrollment) => {
        console.log(`📚 Procesando curso: ${enrollment.course.title}`);
        
        const enrichedCourse = {
          ...enrollment.course,
          modules: await Promise.all(
            enrollment.course.modules.map(async (module) => {
              console.log(`📦 Procesando módulo: ${module.title}`);
              
              const enrichedLessons = await Promise.all(
                module.lessons.map(async (lesson) => {
                  console.log(`📖 Procesando lección: ${lesson.title} (ID: ${lesson.id})`);
                  
                  try {
                    // Obtener recursos de la lección usando consulta raw
                    const resources = await prisma.$queryRaw`
                      SELECT id, lesson_id as lessonId, title, description, type, url, file_path as filePath, 
                             file_size as fileSize, order_index as orderIndex, is_downloadable as isDownloadable, 
                             created_at as createdAt
                      FROM lesson_resources 
                      WHERE lesson_id = ${lesson.id} 
                      ORDER BY order_index ASC
                    ` as any[];
                    console.log(`   📎 Recursos encontrados: ${resources.length}`);

                    // Obtener quizzes de la lección
                    const lessonQuizzes = await prisma.quiz.findMany({
                      where: { lessonId: lesson.id },
                      include: {
                        questions: {
                          orderBy: { orderIndex: 'asc' }
                        }
                      }
                    });
                    console.log(`   📝 Quizzes encontrados: ${lessonQuizzes.length}`);

                                      const enrichedLesson = {
                    ...lesson,
                    resources,
                    quizzes: lessonQuizzes
                  };
                  console.log(`   ✅ Lección enriquecida: ${enrichedLesson.title}`);
                  console.log(`      - Recursos: ${enrichedLesson.resources.length}`);
                  console.log(`      - Quizzes: ${enrichedLesson.quizzes.length}`);
                  return enrichedLesson;
                  } catch (error) {
                    console.error(`❌ Error procesando lección ${lesson.id}:`, error);
                    return {
                      ...lesson,
                      resources: [],
                      quizzes: []
                    };
                  }
                })
              );

              return {
                ...module,
                lessons: enrichedLessons
              };
            })
          )
        };

        return {
          ...enrollment,
          course: enrichedCourse
        };
      })
    );
    
    console.log('✅ Enriquecimiento completado');
    console.log(`📊 Total de inscripciones enriquecidas: ${enrichedItems.length}`);
    
    // Verificar qué estamos devolviendo
    console.log('🔍 VERIFICACIÓN FINAL - Enriquecimiento completado');
    
    // Agregar headers para evitar caché
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json(enrichedItems);
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
            quizzes: {
              include: {
                questions: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
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

    // Enriquecer los datos con recursos y quizzes de lecciones
    console.log('🔍 Iniciando enriquecimiento de inscripción específica...');
    
    const enrichedCourse = {
      ...item.course,
      modules: await Promise.all(
        item.course.modules.map(async (module) => {
          console.log(`📦 Procesando módulo: ${module.title}`);
          
          const enrichedLessons = await Promise.all(
            module.lessons.map(async (lesson) => {
              console.log(`📖 Procesando lección: ${lesson.title} (ID: ${lesson.id})`);
              
              try {
                // Obtener recursos de la lección usando consulta raw
                const resources = await prisma.$queryRaw`
                  SELECT id, lesson_id as lessonId, title, description, type, url, file_path as filePath, 
                         file_size as fileSize, order_index as orderIndex, is_downloadable as isDownloadable, 
                         created_at as createdAt
                  FROM lesson_resources 
                  WHERE lesson_id = ${lesson.id} 
                  ORDER BY order_index ASC
                ` as any[];
                console.log(`   📎 Recursos encontrados: ${resources.length}`);

                // Obtener quizzes de la lección
                const lessonQuizzes = await prisma.quiz.findMany({
                  where: { lessonId: lesson.id },
                  include: {
                    questions: {
                      orderBy: { orderIndex: 'asc' }
                    }
                  }
                });
                console.log(`   📝 Quizzes encontrados: ${lessonQuizzes.length}`);

                const enrichedLesson = {
                  ...lesson,
                  resources,
                  quizzes: lessonQuizzes
                };
                console.log(`   ✅ Lección enriquecida: ${enrichedLesson.title}`);
                console.log(`      - Recursos: ${enrichedLesson.resources.length}`);
                console.log(`      - Quizzes: ${enrichedLesson.quizzes.length}`);
                return enrichedLesson;
              } catch (error) {
                console.error(`❌ Error procesando lección ${lesson.id}:`, error);
                return {
                  ...lesson,
                  resources: [],
                  quizzes: []
                };
              }
            })
          );

          return {
            ...module,
            lessons: enrichedLessons
          };
        })
      )
    };

    const enrichedItem = {
      ...item,
      course: enrichedCourse
    };

    console.log('✅ Enriquecimiento de inscripción específica completado');
    
    // Agregar headers para evitar caché
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.json(enrichedItem);
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
    const { courseId } = req.body;
    
    // Obtener el studentId del usuario autenticado
    const studentId = req.user?.id;
    
    // Validar que se proporcionen los campos requeridos
    if (!studentId || !courseId) {
      return res.status(400).json({ 
        message: "courseId is required and user must be authenticated" 
      });
    }

    const newItem = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId
        // enrolledAt se establece automáticamente con la fecha actual
        // No incluir otherData para evitar campos no válidos
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
