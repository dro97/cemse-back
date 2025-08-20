"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLessonProgresss = listLessonProgresss;
exports.getLessonProgress = getLessonProgress;
exports.createLessonProgress = createLessonProgress;
exports.updateLessonProgress = updateLessonProgress;
exports.deleteLessonProgress = deleteLessonProgress;
exports.getCourseProgress = getCourseProgress;
const prisma_1 = require("../lib/prisma");
async function listLessonProgresss(req, res) {
    try {
        const user = req.user;
        const { enrollmentId, lessonId } = req.query;
        let whereClause = {};
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
        const items = await prisma_1.prisma.lessonProgress.findMany({
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
    }
    catch (error) {
        console.error("Error listing lesson progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getLessonProgress(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const item = await prisma_1.prisma.lessonProgress.findUnique({
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
        if (user && user.type === 'user' && item.enrollment.student.id !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error getting lesson progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createLessonProgress(req, res) {
    try {
        const user = req.user;
        const { enrollmentId, lessonId, isCompleted, timeSpent, videoProgress } = req.body;
        if (!enrollmentId || !lessonId) {
            return res.status(400).json({
                message: "enrollmentId and lessonId are required"
            });
        }
        const enrollment = await prisma_1.prisma.courseEnrollment.findUnique({
            where: { id: enrollmentId }
        });
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        if (user.type === 'user' && enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        const existingProgress = await prisma_1.prisma.lessonProgress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId,
                    lessonId
                }
            }
        });
        if (existingProgress) {
            const updated = await prisma_1.prisma.lessonProgress.update({
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
        }
        else {
            const newItem = await prisma_1.prisma.lessonProgress.create({
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
    }
    catch (error) {
        console.error("Error creating lesson progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateLessonProgress(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const { isCompleted, timeSpent, videoProgress } = req.body;
        const existingProgress = await prisma_1.prisma.lessonProgress.findUnique({
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
        if (user.type === 'user' && existingProgress.enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        const updateData = {
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
        const updated = await prisma_1.prisma.lessonProgress.update({
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
    }
    catch (error) {
        console.error("Error updating lesson progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteLessonProgress(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const existingProgress = await prisma_1.prisma.lessonProgress.findUnique({
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
        if (user.type === 'user' && existingProgress.enrollment.studentId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        await prisma_1.prisma.lessonProgress.delete({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: req.params['enrollmentId'] || '',
                    lessonId: req.params['lessonId'] || ''
                }
            }
        });
        return res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting lesson progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getCourseProgress(req, res) {
    try {
        const user = req.user;
        const { courseId } = req.params;
        const enrollment = await prisma_1.prisma.courseEnrollment.findFirst({
            where: {
                courseId,
                studentId: user.id
            }
        });
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found for this course" });
        }
        const progress = await prisma_1.prisma.lessonProgress.findMany({
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
        const totalLessons = await prisma_1.prisma.lesson.count({
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
    }
    catch (error) {
        console.error("Error getting course progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=LessonProgressController.js.map