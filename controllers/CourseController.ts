import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { io } from "../server";
import { UserRole } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *         - description
 *         - duration
 *         - level
 *         - category
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         shortDescription:
 *           type: string
 *           nullable: true
 *         thumbnail:
 *           type: string
 *           nullable: true
 *         videoPreview:
 *           type: string
 *           nullable: true
 *         objectives:
 *           type: array
 *           items:
 *             type: string
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *         duration:
 *           type: integer
 *         level:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         category:
 *           type: string
 *           enum: [SOFT_SKILLS, BASIC_COMPETENCIES, JOB_PLACEMENT, ENTREPRENEURSHIP, TECHNICAL_SKILLS, DIGITAL_LITERACY, COMMUNICATION, LEADERSHIP]
 *         isMandatory:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         price:
 *           type: number
 *           format: float
 *         rating:
 *           type: number
 *           format: float
 *         studentsCount:
 *           type: integer
 *         completionRate:
 *           type: number
 *           format: float
 *         totalLessons:
 *           type: integer
 *         totalQuizzes:
 *           type: integer
 *         totalResources:
 *           type: integer
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         certification:
 *           type: boolean
 *         includedMaterials:
 *           type: array
 *           items:
 *             type: string
 *         instructorId:
 *           type: string
 *           nullable: true
 *         institutionName:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     CourseInput:
 *       type: object
 *       properties:
 *         (igual que Course, pero todos opcionales menos los requeridos)
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of all courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */
export async function listCourses(_req: Request, res: Response) {
  const items = await prisma.course.findMany();
  return res.json(items);
}

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
export async function getCourse(req: Request, res: Response): Promise<Response> {
  const item = await prisma.course.findUnique({
    where: { id: req.params['id'] || "" },
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
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          specialization: true
        }
      }
    }
  });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

/**
 * @swagger
 * /courses/{id}/preview:
 *   get:
 *     summary: Get course preview (without modules and lessons)
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course preview found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
export async function getCoursePreview(req: Request, res: Response): Promise<Response> {
  try {
    const courseId = req.params['id'] || "";
    
    // Obtener información básica del curso
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        shortDescription: true,
        thumbnail: true,
        videoPreview: true,
        duration: true,
        level: true,
        category: true,
        price: true,
        rating: true,
        tags: true,
        certification: true,
        institutionName: true,
      },
    });
    
    if (!course) return res.status(404).json({ message: "Course not found" });
    
    // Calcular estadísticas en tiempo real
    const [
      studentsCount,
      totalLessons,
      totalQuizzes,
      totalResources,
      completionRate
    ] = await Promise.all([
      // Contar estudiantes inscritos
      prisma.courseEnrollment.count({
        where: { courseId: courseId }
      }),
      
      // Contar total de lecciones
      prisma.lesson.count({
        where: {
          module: {
            courseId: courseId
          }
        }
      }),
      
      // Contar total de quizzes
      prisma.quiz.count({
        where: {
          OR: [
            { courseId: courseId },
            {
              lesson: {
                module: {
                  courseId: courseId
                }
              }
            }
          ]
        }
      }),
      
      // Contar total de recursos
      prisma.lessonResource.count({
        where: {
          lesson: {
            module: {
              courseId: courseId
            }
          }
        }
      }),
      
      // Calcular tasa de finalización
      (async () => {
        const totalEnrollments = await prisma.courseEnrollment.count({
          where: { courseId: courseId }
        });
        
        if (totalEnrollments === 0) return 0;
        
        const completedEnrollments = await prisma.courseEnrollment.count({
          where: { 
            courseId: courseId,
            status: "COMPLETED"
          }
        });
        
        return Math.round((completedEnrollments / totalEnrollments) * 100);
      })()
    ]);
    
    // Combinar datos del curso con estadísticas calculadas
    const courseWithStats = {
      ...course,
      studentsCount,
      totalLessons,
      totalQuizzes,
      totalResources,
      completionRate
    };
    
    return res.json(courseWithStats);
      } catch (error) {
      console.error('Error getting course preview:', error);
      return res.status(500).json({ 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
}

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: integer
 *               level:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *               category:
 *                 type: string
 *                 enum: [SOFT_SKILLS, BASIC_COMPETENCIES, JOB_PLACEMENT, ENTREPRENEURSHIP, TECHNICAL_SKILLS, DIGITAL_LITERACY, COMMUNICATION, LEADERSHIP]
 *               isMandatory:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               price:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               certification:
 *                 type: boolean
 *               includedMaterials:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructor:
 *                 type: object
 *               institutionName:
 *                 type: string
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Course thumbnail image (JPEG, PNG, GIF, WebP)
 *               videoPreview:
 *                 type: string
 *                 format: binary
 *                 description: Course preview video (MP4, WebM, OGG, AVI, MOV)
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input data
 */
export async function createCourse(req: Request, res: Response): Promise<Response> {
  try {
    const {
      title,
      slug,
      description,
      shortDescription,
      objectives,
      prerequisites,
      duration,
      level,
      category,
      isMandatory,
      isActive,
      price,
      tags,
      certification,
      includedMaterials,
      instructor,
      institutionName,
      publishedAt
    } = req.body;

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    let thumbnailUrl = '';
    let videoPreviewUrl = '';

    // Process thumbnail if uploaded
    if (files['thumbnail'] && files['thumbnail'][0]) {
      const thumbnailFile = files['thumbnail'][0];
      thumbnailUrl = `/uploads/courses/${thumbnailFile.filename}`;
    }

    // Process video preview if uploaded
    if (files['videoPreview'] && files['videoPreview'][0]) {
      const videoFile = files['videoPreview'][0];
      videoPreviewUrl = `/uploads/courses/${videoFile.filename}`;
    }

    // Validate required fields
    if (!title || !slug || !description || !duration || !level || !category) {
      return res.status(400).json({
        message: "title, slug, description, duration, level, and category are required"
      });
    }

    // Normalize enum values to uppercase
    const normalizedLevel = level.toUpperCase();
    const normalizedCategory = category.toUpperCase();

    // Validate enum values
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    const validCategories = [
      'SOFT_SKILLS', 'BASIC_COMPETENCIES', 'JOB_PLACEMENT', 
      'ENTREPRENEURSHIP', 'TECHNICAL_SKILLS', 'DIGITAL_LITERACY', 
      'COMMUNICATION', 'LEADERSHIP'
    ];

    if (!validLevels.includes(normalizedLevel)) {
      return res.status(400).json({
        message: `Invalid level. Must be one of: ${validLevels.join(', ')}`
      });
    }

    if (!validCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Handle instructor data
    let instructorId = null;
    
    // If the current user is an instructor, automatically assign them
    if (req.user && req.user.role === UserRole.INSTRUCTOR) {
      const instructorProfile = await prisma.profile.findUnique({
        where: { userId: req.user.id }
      });
      if (instructorProfile) {
        instructorId = instructorProfile.userId;
      }
    } else if (instructor && instructor.name) {
      // For now, we'll create a simple instructor profile
      // In a real app, you might want to create a proper Profile record
      instructorId = instructor.name; // This is a temporary solution
    }

    const courseData = {
      title,
      slug,
      description,
      shortDescription,
      thumbnail: thumbnailUrl || null,
      videoPreview: videoPreviewUrl || null,
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      duration: parseInt(duration) || 0,
      level: normalizedLevel,
      category: normalizedCategory,
      isMandatory: isMandatory || false,
      isActive: isActive !== undefined ? isActive : true,
      price: price || 0,
      tags: tags || [],
      certification: certification !== undefined ? certification : true,
      includedMaterials: includedMaterials || [],
      instructorId,
      institutionName,
      publishedAt: publishedAt ? new Date(publishedAt) : null
    };

    const newItem = await prisma.course.create({
      data: courseData
    });
    
    // Emit real-time update
    io.emit("course:created", newItem);
    
    return res.status(201).json(newItem);
  } catch (error: any) {
    console.error("Error creating course:", error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: "Course with this slug already exists"
      });
    }
    
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
export async function updateCourse(req: Request, res: Response): Promise<Response> {
  try {
    const courseId = req.params['id'] || "";
    
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
    let updateData: any = { ...req.body };

    // Process thumbnail if uploaded
    if (files['thumbnail'] && files['thumbnail'][0]) {
      const thumbnailFile = files['thumbnail'][0];
      updateData.thumbnail = `/uploads/courses/${thumbnailFile.filename}`;
    }

    // Process video preview if uploaded
    if (files['videoPreview'] && files['videoPreview'][0]) {
      const videoFile = files['videoPreview'][0];
      updateData.videoPreview = `/uploads/courses/${videoFile.filename}`;
    }

    // Normalize enum values if provided
    if (updateData.level) {
      updateData.level = updateData.level.toUpperCase();
    }
    if (updateData.category) {
      updateData.category = updateData.category.toUpperCase();
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: updateData
    });
    
    // Emit real-time update
    io.emit("course:updated", updated);
    
    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       204:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
export async function deleteCourse(req: Request, res: Response): Promise<Response> {
  await prisma.course.delete({
    where: { id: req.params['id'] || "" }
  });
  
  // Emit real-time update
  io.emit("course:deleted", { id: req.params['id'] });
  
  return res.status(204).end();
}
