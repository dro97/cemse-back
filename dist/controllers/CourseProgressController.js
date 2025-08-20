"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeLesson = completeLesson;
exports.completeModule = completeModule;
exports.getEnrollmentProgress = getEnrollmentProgress;
const prisma_1 = require("../lib/prisma");
async function completeLesson(req, res) {
    try {
        const user = req.user;
        const { enrollmentId, lessonId, timeSpent = 0, videoProgress = 1.0 } = req.body;
        if (!enrollmentId || !lessonId) {
            return res.status(400).json({
                message: "enrollmentId and lessonId are required"
            });
        }
        const enrollment = await prisma_1.prisma.courseEnrollment.findUnique({
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
        let targetLesson = null;
        let targetModule = null;
        for (const module of enrollment.course.modules) {
            const lesson = module.lessons.find((l) => l.id === lessonId);
            if (lesson) {
                targetLesson = lesson;
                targetModule = module;
                break;
            }
        }
        if (!targetLesson) {
            return res.status(404).json({ message: "Lesson not found in this course" });
        }
        const lessonProgress = await prisma_1.prisma.lessonProgress.upsert({
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
        const moduleLessons = targetModule.lessons;
        const completedModuleLessons = await prisma_1.prisma.lessonProgress.count({
            where: {
                enrollmentId,
                lessonId: {
                    in: moduleLessons.map((l) => l.id)
                },
                isCompleted: true
            }
        });
        const moduleProgress = (completedModuleLessons / moduleLessons.length) * 100;
        const isModuleCompleted = moduleProgress >= 100;
        const totalLessons = enrollment.course.modules.reduce((acc, module) => {
            return acc + module.lessons.length;
        }, 0);
        const completedLessons = await prisma_1.prisma.lessonProgress.count({
            where: {
                enrollmentId,
                isCompleted: true
            }
        });
        const courseProgress = (completedLessons / totalLessons) * 100;
        const isCourseCompleted = courseProgress >= 100;
        let nextLesson = null;
        let nextModule = null;
        if (!isModuleCompleted) {
            const currentLessonIndex = moduleLessons.findIndex((l) => l.id === lessonId);
            if (currentLessonIndex < moduleLessons.length - 1) {
                nextLesson = moduleLessons[currentLessonIndex + 1];
                nextModule = targetModule;
            }
        }
        else {
            const currentModuleIndex = enrollment.course.modules.findIndex((m) => m.id === targetModule.id);
            if (currentModuleIndex < enrollment.course.modules.length - 1) {
                nextModule = enrollment.course.modules[currentModuleIndex + 1];
                if (nextModule.lessons.length > 0) {
                    nextLesson = nextModule.lessons[0];
                }
            }
        }
        const updatedEnrollment = await prisma_1.prisma.courseEnrollment.update({
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
                moduleId: nextModule.id,
                moduleTitle: nextModule.title
            } : null,
            enrollment: {
                id: updatedEnrollment.id,
                progress: updatedEnrollment.progress,
                status: updatedEnrollment.status,
                currentModuleId: updatedEnrollment.currentModuleId,
                currentLessonId: updatedEnrollment.currentLessonId
            }
        });
    }
    catch (error) {
        console.error("Error completing lesson:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function completeModule(req, res) {
    try {
        const user = req.user;
        const { enrollmentId, moduleId } = req.body;
        if (!enrollmentId || !moduleId) {
            return res.status(400).json({
                message: "enrollmentId and moduleId are required"
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
        const module = await prisma_1.prisma.courseModule.findUnique({
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
        const completedLessons = [];
        let totalTimeSpent = 0;
        for (const lesson of module.lessons) {
            const lessonProgress = await prisma_1.prisma.lessonProgress.upsert({
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
        const course = await prisma_1.prisma.course.findUnique({
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
            return acc + module.lessons.length;
        }, 0) || 0;
        const allCompletedLessons = await prisma_1.prisma.lessonProgress.count({
            where: {
                enrollmentId,
                isCompleted: true
            }
        });
        const courseProgress = (allCompletedLessons / totalLessons) * 100;
        const isCourseCompleted = courseProgress >= 100;
        let nextModule = null;
        let nextLesson = null;
        if (course) {
            const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
            if (currentModuleIndex < course.modules.length - 1) {
                nextModule = course.modules[currentModuleIndex + 1];
                if (nextModule.lessons.length > 0) {
                    nextLesson = nextModule.lessons[0];
                }
            }
        }
        const updatedEnrollment = await prisma_1.prisma.courseEnrollment.update({
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
                totalLessons: module.lessons.length,
                progress: 100
            },
            courseProgress: {
                progress: courseProgress,
                completedLessons: allCompletedLessons,
                totalLessons,
                isCompleted: isCourseCompleted
            },
            nextModule: nextModule ? {
                id: nextModule.id,
                title: nextModule.title,
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
    }
    catch (error) {
        console.error("Error completing module:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getEnrollmentProgress(req, res) {
    try {
        const user = req.user;
        const { enrollmentId } = req.params;
        const enrollment = await prisma_1.prisma.courseEnrollment.findUnique({
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
        const moduleProgress = enrollment.course.modules.map((module) => {
            const moduleLessons = module.lessons;
            const completedLessons = enrollment.lessonProgress.filter((progress) => progress.isCompleted && moduleLessons.some((lesson) => lesson.id === progress.lessonId)).length;
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
                lessons: moduleLessons.map((lesson) => {
                    const lessonProgress = enrollment.lessonProgress.find((lp) => lp.lessonId === lesson.id);
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
        const totalLessons = enrollment.course.modules.reduce((acc, module) => {
            return acc + module.lessons.length;
        }, 0);
        const completedLessons = enrollment.lessonProgress.filter((p) => p.isCompleted).length;
        const courseProgress = (completedLessons / totalLessons) * 100;
        let nextLesson = null;
        let nextModule = null;
        for (const module of moduleProgress) {
            if (!module.isCompleted) {
                const incompleteLesson = module.lessons.find((lesson) => !lesson.isCompleted);
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
                id: enrollment.course.id,
                title: enrollment.course.title,
                totalLessons,
                completedLessons,
                progress: courseProgress,
                isCompleted: courseProgress >= 100
            },
            modules: moduleProgress,
            nextLesson: nextLesson ? {
                id: nextLesson.id,
                title: nextLesson.title,
                moduleId: nextModule.id,
                moduleTitle: nextModule.title
            } : null
        });
    }
    catch (error) {
        console.error("Error getting enrollment progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=CourseProgressController.js.map