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
        where: { id: req.params["id"] || "" },
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
    const item = await prisma_1.prisma.course.findUnique({
        where: { id: req.params["id"] || "" },
        include: {
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
async function createCourse(req, res) {
    try {
        const { title, slug, description, shortDescription, thumbnail, videoPreview, objectives, prerequisites, duration, level, category, isMandatory, isActive, price, tags, certification, includedMaterials, instructor, institutionName, publishedAt } = req.body;
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
            thumbnail,
            videoPreview,
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
    const updated = await prisma_1.prisma.course.update({
        where: { id: req.params["id"] || "" },
        data: req.body
    });
    server_1.io.emit("course:updated", updated);
    res.json(updated);
}
async function deleteCourse(req, res) {
    await prisma_1.prisma.course.delete({
        where: { id: req.params["id"] || "" }
    });
    server_1.io.emit("course:deleted", { id: req.params["id"] });
    return res.status(204).end();
}
//# sourceMappingURL=CourseController.js.map