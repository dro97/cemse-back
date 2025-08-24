import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

/**
 * @swagger
 * /api/user-activities/{userId}/dashboard:
 *   get:
 *     summary: Get user dashboard statistics and recent activities
 *     tags: [User Activities]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalCourses:
 *                       type: number
 *                     totalJobs:
 *                       type: number
 *                     totalEntrepreneurships:
 *                       type: number
 *                     totalInstitutions:
 *                       type: number
 *                     userCourses:
 *                       type: number
 *                     userJobApplications:
 *                       type: number
 *                     userEntrepreneurships:
 *                       type: number
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       title:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *       404:
 *         description: User not found
 */
export async function getDashboardActivities(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Get statistics and activities in parallel
    const [
      // Global statistics
      totalCourses,
      totalJobs,
      totalEntrepreneurships,
      totalInstitutions,
      
      // User-specific statistics
      userCourses,
      userJobApplications,
      userEntrepreneurships,
      
      // Recent activities
      jobApplications,
      courseEnrollments,
      youthApplications,
      eventAttendances,
      quizAttempts,
      lessonProgress
    ] = await Promise.all([
      // Global statistics
      prisma.course.count({ where: { isActive: true } }),
      prisma.jobOffer.count({ where: { isActive: true, status: 'ACTIVE' } }),
      prisma.entrepreneurship.count({ where: { isActive: true, isPublic: true } }),
      prisma.institution.count({ where: { isActive: true } }),
      
      // User-specific statistics
      prisma.courseEnrollment.count({ where: { studentId: userId } }),
      prisma.jobApplication.count({ where: { applicantId: userId } }),
      prisma.entrepreneurship.count({ where: { ownerId: userId } }),
      
      // Recent activities (last 5 of each type)
      prisma.jobApplication.findMany({
        where: { applicantId: userId },
        include: {
          jobOffer: {
            select: {
              title: true,
              company: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        take: 5
      }),

      prisma.courseEnrollment.findMany({
        where: { studentId: userId },
        include: {
          course: { select: { title: true } }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5
      }),

      prisma.youthApplication.findMany({
        where: { youthProfileId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      prisma.eventAttendee.findMany({
        where: { attendeeId: userId },
        include: {
          event: { select: { title: true } }
        },
        orderBy: { registeredAt: 'desc' },
        take: 5
      }),

      prisma.quizAttempt.findMany({
        where: { studentId: userId },
        include: {
          quiz: { select: { title: true } }
        },
        orderBy: { completedAt: 'desc' },
        take: 5
      }),

      prisma.lessonProgress.findMany({
        where: { 
          enrollment: {
            studentId: userId
          },
          isCompleted: true
        },
        include: {
          lesson: { select: { title: true } }
        },
        orderBy: { completedAt: 'desc' },
        take: 5
      })
    ]);

    // Format activities
    const allActivities: Array<{
      id: string;
      type: string;
      icon: string;
      title: string;
      description: string;
      timestamp: string;
      createdAt: Date;
    }> = [];

    // Job applications
    jobApplications.forEach(app => {
      allActivities.push({
        id: app.id,
        type: 'JOB_APPLICATION',
        icon: '💼',
        title: `¡Postulaste a un trabajo!`,
        description: `${app.jobOffer.title} en ${app.jobOffer.company.name}`,
        timestamp: formatTimestamp(app.appliedAt),
        createdAt: app.appliedAt
      });
    });

    // Course enrollments
    courseEnrollments.forEach(enrollment => {
      allActivities.push({
        id: enrollment.id,
        type: 'COURSE_ENROLLMENT',
        icon: '📚',
        title: `¡Te inscribiste a un curso!`,
        description: enrollment.course.title,
        timestamp: formatTimestamp(enrollment.enrolledAt),
        createdAt: enrollment.enrolledAt
      });
    });

    // Course completions
    courseEnrollments
      .filter(enrollment => enrollment.status === 'COMPLETED')
      .forEach(enrollment => {
        allActivities.push({
          id: `completed-${enrollment.id}`,
          type: 'COURSE_COMPLETION',
          icon: '🎓',
          title: `¡Completaste un curso!`,
          description: enrollment.course.title,
          timestamp: formatTimestamp(enrollment.completedAt || enrollment.enrolledAt || new Date()),
          createdAt: enrollment.completedAt || enrollment.enrolledAt || new Date()
        });
      });

    // Youth applications
    youthApplications.forEach(app => {
      allActivities.push({
        id: app.id,
        type: 'YOUTH_APPLICATION_CREATED',
        icon: '📝',
        title: `¡Creaste una postulación!`,
        description: app.title,
        timestamp: formatTimestamp(app.createdAt),
        createdAt: app.createdAt
      });
    });

    // Event attendances
    eventAttendances.forEach(attendance => {
      allActivities.push({
        id: attendance.id,
        type: 'EVENT_ATTENDANCE',
        icon: '🎉',
        title: `¡Te registraste a un evento!`,
        description: attendance.event.title,
        timestamp: formatTimestamp(attendance.registeredAt),
        createdAt: attendance.registeredAt
      });
    });

    // Quiz completions
    quizAttempts.forEach(attempt => {
      allActivities.push({
        id: attempt.id,
        type: 'QUIZ_COMPLETED',
        icon: '✅',
        title: `¡Completaste un quiz!`,
        description: attempt.quiz.title,
        timestamp: formatTimestamp(attempt.completedAt || attempt.startedAt || new Date()),
        createdAt: attempt.completedAt || attempt.startedAt || new Date()
      });
    });

    // Lesson completions
    lessonProgress.forEach(progress => {
      allActivities.push({
        id: progress.id,
        type: 'LESSON_COMPLETED',
        icon: '📖',
        title: `¡Completaste una lección!`,
        description: progress.lesson.title,
        timestamp: formatTimestamp(progress.completedAt || progress.lastWatchedAt || new Date()),
        createdAt: progress.completedAt || progress.lastWatchedAt || new Date()
      });
    });

    // Sort activities by date and take the most recent 10
    const recentActivities = allActivities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return res.status(200).json({
      statistics: {
        totalCourses,
        totalJobs,
        totalEntrepreneurships,
        totalInstitutions,
        userCourses,
        userJobApplications,
        userEntrepreneurships
      },
      recentActivities,
      total: recentActivities.length
    });

  } catch (error: any) {
    console.error("Error getting dashboard data:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Helper function to format timestamps
function formatTimestamp(date: Date): string {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMs = now.getTime() - activityDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInDays > 0) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  } else if (diffInHours > 0) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else {
    return "Hace unos minutos";
  }
}
