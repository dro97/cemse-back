"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardActivities = getDashboardActivities;
const prisma_1 = require("../lib/prisma");
async function getDashboardActivities(req, res) {
    try {
        const { userId } = req.params;
        const user = await prisma_1.prisma.profile.findUnique({
            where: { userId }
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const [totalCourses, totalJobs, totalEntrepreneurships, totalInstitutions, userCourses, userJobApplications, userEntrepreneurships, jobApplications, courseEnrollments, youthApplications, eventAttendances, quizAttempts, lessonProgress] = await Promise.all([
            prisma_1.prisma.course.count({ where: { isActive: true } }),
            prisma_1.prisma.jobOffer.count({ where: { isActive: true, status: 'ACTIVE' } }),
            prisma_1.prisma.entrepreneurship.count({ where: { isActive: true, isPublic: true } }),
            prisma_1.prisma.institution.count({ where: { isActive: true } }),
            prisma_1.prisma.courseEnrollment.count({ where: { studentId: userId } }),
            prisma_1.prisma.jobApplication.count({ where: { applicantId: userId } }),
            prisma_1.prisma.entrepreneurship.count({ where: { ownerId: userId } }),
            prisma_1.prisma.jobApplication.findMany({
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
            prisma_1.prisma.courseEnrollment.findMany({
                where: { studentId: userId },
                include: {
                    course: { select: { title: true } }
                },
                orderBy: { enrolledAt: 'desc' },
                take: 5
            }),
            prisma_1.prisma.youthApplication.findMany({
                where: { youthProfileId: userId },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma_1.prisma.eventAttendee.findMany({
                where: { attendeeId: userId },
                include: {
                    event: { select: { title: true } }
                },
                orderBy: { registeredAt: 'desc' },
                take: 5
            }),
            prisma_1.prisma.quizAttempt.findMany({
                where: { studentId: userId },
                include: {
                    quiz: { select: { title: true } }
                },
                orderBy: { completedAt: 'desc' },
                take: 5
            }),
            prisma_1.prisma.lessonProgress.findMany({
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
        const allActivities = [];
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
    }
    catch (error) {
        console.error("Error getting dashboard data:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
function formatTimestamp(date) {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInDays > 0) {
        return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
    else if (diffInHours > 0) {
        return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    }
    else {
        return "Hace unos minutos";
    }
}
//# sourceMappingURL=UserActivityController.js.map