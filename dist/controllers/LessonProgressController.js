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
            if (isCompleted && !existingProgress.isCompleted) {
                checkModuleCompletionAndGenerateCertificate(enrollmentId, lessonId).catch(error => {
                    console.error('Error verificando completación de módulo:', error);
                });
            }
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
            if (isCompleted) {
                checkModuleCompletionAndGenerateCertificate(enrollmentId, lessonId).catch(error => {
                    console.error('Error verificando completación de módulo:', error);
                });
            }
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
                courseId: courseId || '',
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
    }
    catch (error) {
        console.error("Error getting course progress:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function checkModuleCompletionAndGenerateCertificate(enrollmentId, lessonId) {
    try {
        const lesson = await prisma_1.prisma.lesson.findUnique({
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
        const enrollment = await prisma_1.prisma.courseEnrollment.findUnique({
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
        if (!lesson.module.hasCertificate) {
            console.log('Módulo no tiene certificados habilitados');
            return;
        }
        const totalLessons = await prisma_1.prisma.lesson.count({
            where: { moduleId: lesson.module.id }
        });
        const completedLessons = await prisma_1.prisma.lessonProgress.count({
            where: {
                enrollmentId: enrollmentId,
                isCompleted: true,
                lesson: {
                    moduleId: lesson.module.id
                }
            }
        });
        console.log(`Módulo ${lesson.module.title}: ${completedLessons}/${totalLessons} lecciones completadas`);
        if (completedLessons === totalLessons) {
            console.log(`¡Módulo ${lesson.module.title} completado! Generando certificado...`);
            const existingCertificate = await prisma_1.prisma.moduleCertificate.findUnique({
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
            const lessonProgresses = await prisma_1.prisma.lessonProgress.findMany({
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
            let totalGrade = 0;
            let validLessons = 0;
            for (const progress of lessonProgresses) {
                let lessonGrade = 0;
                if (progress.isCompleted) {
                    lessonGrade += 70;
                }
                if (progress.timeSpent > 0) {
                    const timeBonus = Math.min(20, (progress.timeSpent / 300) * 20);
                    lessonGrade += timeBonus;
                }
                if (progress.videoProgress > 0) {
                    lessonGrade += progress.videoProgress * 10;
                }
                totalGrade += Math.min(100, lessonGrade);
                validLessons++;
            }
            const averageGrade = validLessons > 0 ? Math.round(totalGrade / validLessons) : 85;
            const certificateUrl = `https://minio.example.com/certificates/module-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`;
            const certificate = await prisma_1.prisma.moduleCertificate.create({
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
            await checkCourseCompletionAndGenerateCertificate(enrollmentId, lesson.module.course.id);
        }
    }
    catch (error) {
        console.error('Error verificando completación de módulo:', error);
    }
}
async function checkCourseCompletionAndGenerateCertificate(enrollmentId, courseId) {
    try {
        const enrollment = await prisma_1.prisma.courseEnrollment.findUnique({
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
        const totalLessons = await prisma_1.prisma.lesson.count({
            where: {
                module: {
                    courseId: courseId
                }
            }
        });
        const completedLessons = await prisma_1.prisma.lessonProgress.count({
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
        if (completedLessons === totalLessons && totalLessons > 0) {
            console.log(`¡Curso ${enrollment.course.title} completado! Generando certificado...`);
            const existingCertificate = await prisma_1.prisma.certificate.findFirst({
                where: {
                    courseId: courseId,
                    userId: enrollment.student.userId
                }
            });
            if (existingCertificate) {
                console.log('Certificado de curso ya existe para este estudiante');
                return;
            }
            const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const digitalSignature = `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const certificateUrl = `https://minio.example.com/certificates/course-cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`;
            const certificate = await prisma_1.prisma.certificate.create({
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
        }
    }
    catch (error) {
        console.error('Error verificando completación de curso:', error);
    }
}
//# sourceMappingURL=LessonProgressController.js.map