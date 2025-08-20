"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourses = listCourses;
exports.getCourse = getCourse;
exports.getCoursePreview = getCoursePreview;
exports.createCourse = createCourse;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
const prisma_1 = require("../lib/prisma");
const server_1 = require("../server");
const client_1 = require("@prisma/client");
async function listCourses(_req, res) {
    const items = await prisma_1.prisma.course.findMany();
    return res.json(items);
}
async function getCourse(req, res) {
    const item = await prisma_1.prisma.course.findUnique({
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
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function getCoursePreview(req, res) {
    try {
        const courseId = req.params['id'] || "";
        const course = await prisma_1.prisma.course.findUnique({
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
        if (!course)
            return res.status(404).json({ message: "Course not found" });
        const [studentsCount, totalLessons, totalQuizzes, totalResources, completionRate] = await Promise.all([
            prisma_1.prisma.courseEnrollment.count({
                where: { courseId: courseId }
            }),
            prisma_1.prisma.lesson.count({
                where: {
                    module: {
                        courseId: courseId
                    }
                }
            }),
            prisma_1.prisma.quiz.count({
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
            prisma_1.prisma.lessonResource.count({
                where: {
                    lesson: {
                        module: {
                            courseId: courseId
                        }
                    }
                }
            }),
            (async () => {
                const totalEnrollments = await prisma_1.prisma.courseEnrollment.count({
                    where: { courseId: courseId }
                });
                if (totalEnrollments === 0)
                    return 0;
                const completedEnrollments = await prisma_1.prisma.courseEnrollment.count({
                    where: {
                        courseId: courseId,
                        status: "COMPLETED"
                    }
                });
                return Math.round((completedEnrollments / totalEnrollments) * 100);
            })()
        ]);
        const courseWithStats = {
            ...course,
            studentsCount,
            totalLessons,
            totalQuizzes,
            totalResources,
            completionRate
        };
        return res.json(courseWithStats);
    }
    catch (error) {
        console.error('Error getting course preview:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function createCourse(req, res) {
    try {
        const { title, slug, description, shortDescription, objectives, prerequisites, duration, level, category, isMandatory, isActive, price, tags, certification, includedMaterials, instructor, institutionName, publishedAt } = req.body;
        const files = req.files || {};
        let thumbnailUrl = '';
        let videoPreviewUrl = '';
        if (files['thumbnail'] && files['thumbnail'][0]) {
            const thumbnailFile = files['thumbnail'][0];
            thumbnailUrl = `/uploads/courses/${thumbnailFile.filename}`;
        }
        if (files['videoPreview'] && files['videoPreview'][0]) {
            const videoFile = files['videoPreview'][0];
            videoPreviewUrl = `/uploads/courses/${videoFile.filename}`;
        }
        if (!title || !slug || !description || !duration || !level || !category) {
            return res.status(400).json({
                message: "title, slug, description, duration, level, and category are required"
            });
        }
        const normalizedLevel = level.toUpperCase();
        const normalizedCategory = category.toUpperCase();
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
        let instructorId = null;
        if (req.user && req.user.role === client_1.UserRole.INSTRUCTOR) {
            const instructorProfile = await prisma_1.prisma.profile.findUnique({
                where: { userId: req.user.id }
            });
            if (instructorProfile) {
                instructorId = instructorProfile.userId;
            }
        }
        else if (instructor && instructor.name) {
            instructorId = instructor.name;
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
        const newItem = await prisma_1.prisma.course.create({
            data: courseData
        });
        server_1.io.emit("course:created", newItem);
        return res.status(201).json(newItem);
    }
    catch (error) {
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
async function updateCourse(req, res) {
    try {
        const courseId = req.params['id'] || "";
        const existingCourse = await prisma_1.prisma.course.findUnique({
            where: { id: courseId }
        });
        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        const files = req.files || {};
        let updateData = { ...req.body };
        if (files['thumbnail'] && files['thumbnail'][0]) {
            const thumbnailFile = files['thumbnail'][0];
            updateData.thumbnail = `/uploads/courses/${thumbnailFile.filename}`;
        }
        if (files['videoPreview'] && files['videoPreview'][0]) {
            const videoFile = files['videoPreview'][0];
            updateData.videoPreview = `/uploads/courses/${videoFile.filename}`;
        }
        if (updateData.level) {
            updateData.level = updateData.level.toUpperCase();
        }
        if (updateData.category) {
            updateData.category = updateData.category.toUpperCase();
        }
        const updated = await prisma_1.prisma.course.update({
            where: { id: courseId },
            data: updateData
        });
        server_1.io.emit("course:updated", updated);
        return res.json(updated);
    }
    catch (error) {
        console.error("Error updating course:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteCourse(req, res) {
    await prisma_1.prisma.course.delete({
        where: { id: req.params['id'] || "" }
    });
    server_1.io.emit("course:deleted", { id: req.params['id'] });
    return res.status(204).end();
}
//# sourceMappingURL=CourseController.js.map