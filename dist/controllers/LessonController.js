"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLessons = listLessons;
exports.getLesson = getLesson;
exports.createLesson = createLesson;
exports.updateLesson = updateLesson;
exports.deleteLesson = deleteLesson;
exports.getLessonsByModule = getLessonsByModule;
const prisma_1 = require("../lib/prisma");
const server_1 = require("../server");
async function listLessons(_req, res) {
    const items = await prisma_1.prisma.lesson.findMany({
        include: {
            module: {
                include: {
                    course: true
                }
            }
        }
    });
    return res.json(items);
}
async function getLesson(req, res) {
    const item = await prisma_1.prisma.lesson.findUnique({
        where: { id: req.params["id"] || "" },
        include: {
            module: {
                include: {
                    course: true
                }
            }
        }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createLesson(req, res) {
    const { title, description, content, moduleId, contentType, videoUrl, duration, orderIndex, isRequired, isPreview, attachments } = req.body;
    if (!title || !content || !moduleId || !contentType || orderIndex === undefined) {
        return res.status(400).json({
            message: "title, content, moduleId, contentType, and orderIndex are required"
        });
    }
    const module = await prisma_1.prisma.courseModule.findUnique({
        where: { id: moduleId }
    });
    if (!module) {
        return res.status(400).json({
            message: "Module not found"
        });
    }
    if (contentType === 'VIDEO') {
        if (!videoUrl) {
            return res.status(400).json({
                message: "videoUrl is required for VIDEO content type"
            });
        }
    }
    const newItem = await prisma_1.prisma.lesson.create({
        data: {
            title,
            description: description || null,
            content,
            moduleId,
            contentType,
            videoUrl: videoUrl || null,
            duration: duration || null,
            orderIndex,
            isRequired: isRequired !== undefined ? isRequired : true,
            isPreview: isPreview !== undefined ? isPreview : false,
            attachments: attachments || null
        }
    });
    server_1.io.emit("lesson:created", newItem);
    return res.status(201).json(newItem);
}
async function updateLesson(req, res) {
    const { title, description, content, contentType, videoUrl, duration, orderIndex, isRequired, isPreview, attachments } = req.body;
    if (contentType === 'VIDEO' && !videoUrl) {
        return res.status(400).json({
            message: "videoUrl is required for VIDEO content type"
        });
    }
    const updated = await prisma_1.prisma.lesson.update({
        where: { id: req.params["id"] || "" },
        data: {
            title,
            description,
            content,
            contentType,
            videoUrl,
            duration,
            orderIndex,
            isRequired,
            isPreview,
            attachments
        }
    });
    server_1.io.emit("lesson:updated", updated);
    res.json(updated);
}
async function deleteLesson(req, res) {
    await prisma_1.prisma.lesson.delete({
        where: { id: req.params["id"] || "" }
    });
    server_1.io.emit("lesson:deleted", { id: req.params["id"] });
    return res.status(204).end();
}
async function getLessonsByModule(req, res) {
    const moduleId = req.params["moduleId"];
    if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
    }
    const lessons = await prisma_1.prisma.lesson.findMany({
        where: { moduleId },
        orderBy: { orderIndex: 'asc' },
        include: {
            module: {
                include: {
                    course: true
                }
            }
        }
    });
    return res.json(lessons);
}
//# sourceMappingURL=LessonController.js.map