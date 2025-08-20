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
        where: { id: req.params['id'] || "" },
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
    let finalVideoUrl = videoUrl;
    let finalAttachments = attachments;
    console.log('🔍 [DEBUG] Procesando archivos subidos...');
    console.log('📋 [DEBUG] req.uploadedFiles:', req.uploadedFiles ? 'Existe' : 'No existe');
    console.log('📋 [DEBUG] req.uploadedVideo:', req.uploadedVideo ? 'Existe' : 'No existe');
    if (req.uploadedFiles) {
        console.log('📁 [DEBUG] Procesando req.uploadedFiles');
        if (req.uploadedFiles.video) {
            finalVideoUrl = req.uploadedFiles.video.url;
            console.log('🎥 [DEBUG] Video URL desde uploadedFiles:', finalVideoUrl);
        }
        if (req.uploadedFiles.attachments && req.uploadedFiles.attachments.length > 0) {
            finalAttachments = req.uploadedFiles.attachments.map((file) => ({
                url: file.url,
                filename: file.filename,
                originalName: file.originalName,
                size: file?.size,
                mimetype: file?.mimetype
            }));
            console.log('📎 [DEBUG] Attachments procesados:', finalAttachments.length);
        }
    }
    else if (req.uploadedVideo) {
        console.log('🎥 [DEBUG] Procesando req.uploadedVideo');
        finalVideoUrl = req.uploadedVideo.url;
        console.log('🎥 [DEBUG] Video URL desde uploadedVideo:', finalVideoUrl);
    }
    else {
        console.log('⚠️ [DEBUG] No se encontraron archivos subidos');
    }
    console.log('🎯 [DEBUG] finalVideoUrl:', finalVideoUrl);
    if (contentType === 'VIDEO') {
        if (!finalVideoUrl) {
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
            videoUrl: finalVideoUrl || null,
            duration: duration ? parseInt(duration) : null,
            orderIndex: parseInt(orderIndex),
            isRequired: isRequired !== undefined ? (isRequired === "true" || isRequired === true) : true,
            isPreview: isPreview !== undefined ? (isPreview === "true" || isPreview === true) : false,
            attachments: finalAttachments || null
        }
    });
    server_1.io.emit("lesson:created", newItem);
    return res.status(201).json({
        ...newItem,
        uploadedFiles: req.uploadedFiles || req.uploadedVideo ? {
            video: req.uploadedFiles?.video || req.uploadedVideo,
            attachments: req.uploadedFiles?.attachments || []
        } : undefined
    });
}
async function updateLesson(req, res) {
    const { title, description, content, contentType, videoUrl, duration, orderIndex, isRequired, isPreview, attachments } = req.body;
    if (contentType === 'VIDEO' && !videoUrl) {
        return res.status(400).json({
            message: "videoUrl is required for VIDEO content type"
        });
    }
    const updateData = {
        title,
        description,
        content,
        contentType,
        videoUrl,
        isRequired: isRequired !== undefined ? (isRequired === "true" || isRequired === true) : isRequired,
        isPreview: isPreview !== undefined ? (isPreview === "true" || isPreview === true) : isPreview,
        attachments
    };
    if (duration !== undefined) {
        updateData.duration = duration ? parseInt(duration) : null;
    }
    if (orderIndex !== undefined) {
        updateData.orderIndex = parseInt(orderIndex);
    }
    const updated = await prisma_1.prisma.lesson.update({
        where: { id: req.params['id'] || "" },
        data: updateData
    });
    server_1.io.emit("lesson:updated", updated);
    return res.json(updated);
}
async function deleteLesson(req, res) {
    await prisma_1.prisma.lesson.delete({
        where: { id: req.params['id'] || "" }
    });
    server_1.io.emit("lesson:deleted", { id: req.params['id'] });
    return res.status(204).end();
}
async function getLessonsByModule(req, res) {
    const moduleId = req.params["moduleId"];
    if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
    }
    const lessons = await prisma_1.prisma.lesson.findMany({
        where: { moduleId: moduleId || '' },
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