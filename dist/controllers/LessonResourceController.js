"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLessonResources = listLessonResources;
exports.getLessonResource = getLessonResource;
exports.createLessonResource = createLessonResource;
exports.updateLessonResource = updateLessonResource;
exports.deleteLessonResource = deleteLessonResource;
const prisma_1 = require("../lib/prisma");
async function listLessonResources(req, res) {
    try {
        const { lessonId, type } = req.query;
        let whereClause = {};
        if (lessonId) {
            whereClause.lessonId = lessonId;
        }
        if (type) {
            whereClause.type = type;
        }
        const resources = await prisma_1.prisma.lessonResource.findMany({
            where: whereClause,
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
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
                }
            },
            orderBy: [
                { orderIndex: 'asc' },
                { createdAt: 'desc' }
            ]
        });
        return res.json(resources);
    }
    catch (error) {
        console.error("Error listing lesson resources:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getLessonResource(req, res) {
    try {
        const { id } = req.params;
        const resource = await prisma_1.prisma.lessonResource.findUnique({
            where: { id: id || '' },
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
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
                }
            }
        });
        if (!resource) {
            return res.status(404).json({ message: "Lesson resource not found" });
        }
        return res.json(resource);
    }
    catch (error) {
        console.error("Error getting lesson resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createLessonResource(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
            return res.status(403).json({ message: "Access denied. Only instructors and organizations can create lesson resources" });
        }
        console.log('🔍 [DEBUG] req.body:', req.body);
        console.log('📁 [DEBUG] req.files:', req.files);
        console.log('📋 [DEBUG] (req as any).uploadedResource:', req.uploadedResource);
        const { lessonId, title, description, type, orderIndex, isDownloadable } = req.body || {};
        const files = req.files || {};
        if (!lessonId || !title || !type) {
            console.log('❌ [DEBUG] Missing required fields:', { lessonId, title, type });
            return res.status(400).json({
                message: "Lesson ID, title, and type are required",
                received: { lessonId, title, type }
            });
        }
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId }
        });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }
        let fileUrl = '';
        let filePath = '';
        let fileSize = 0;
        if (req.uploadedResource) {
            console.log('🎥 [DEBUG] Procesando (req as any).uploadedResource');
            fileUrl = req.uploadedResource.url;
            filePath = req.uploadedResource.filename;
            fileSize = req.uploadedResource.size;
            console.log('🎥 [DEBUG] Resource URL desde uploadedResource:', fileUrl);
        }
        else if (files['file'] && files['file'][0]) {
            console.log('⚠️ [DEBUG] Fallback a archivo local');
            const file = files['file'][0];
            fileUrl = `/uploads/resources/${file.filename}`;
            filePath = file.path;
            fileSize = file?.size;
        }
        if (type === 'LINK' && req.body.url) {
            fileUrl = req.body.url;
        }
        const resource = await prisma_1.prisma.lessonResource.create({
            data: {
                lessonId,
                title: title.trim(),
                description: description?.trim(),
                type: type,
                url: fileUrl,
                filePath: filePath || null,
                fileSize: fileSize || null,
                orderIndex: parseInt(orderIndex) || 0,
                isDownloadable: isDownloadable === 'true' || isDownloadable === true
            },
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
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
                }
            }
        });
        return res.status(201).json({
            ...resource,
            uploadedFile: req.uploadedResource ? {
                url: req.uploadedResource.url,
                filename: req.uploadedResource.filename,
                originalName: req.uploadedResource.originalName,
                size: req.uploadedResource.size,
                mimetype: req.uploadedResource.mimetype
            } : undefined
        });
    }
    catch (error) {
        console.error("Error creating lesson resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateLessonResource(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
            return res.status(403).json({ message: "Access denied. Only instructors and organizations can update lesson resources" });
        }
        const existingResource = await prisma_1.prisma.lessonResource.findUnique({
            where: { id: id || '' }
        });
        if (!existingResource) {
            return res.status(404).json({ message: "Lesson resource not found" });
        }
        const { title, description, type, orderIndex, isDownloadable } = req.body;
        const files = req.files || {};
        let updateData = {};
        if (title !== undefined)
            updateData.title = title.trim();
        if (description !== undefined)
            updateData.description = description?.trim();
        if (type !== undefined)
            updateData.type = type;
        if (orderIndex !== undefined)
            updateData.orderIndex = parseInt(orderIndex);
        if (isDownloadable !== undefined)
            updateData.isDownloadable = isDownloadable === 'true' || isDownloadable === true;
        if (req.uploadedResource) {
            console.log('🎥 [DEBUG] Procesando actualización con MinIO');
            updateData.url = req.uploadedResource.url;
            updateData.filePath = req.uploadedResource.filename;
            updateData.fileSize = req.uploadedResource.size;
        }
        else if (files['file'] && files['file'][0]) {
            console.log('⚠️ [DEBUG] Fallback a archivo local para actualización');
            const file = files['file'][0];
            updateData.url = `/uploads/resources/${file.filename}`;
            updateData.filePath = file.path;
            updateData.fileSize = file?.size;
        }
        const resource = await prisma_1.prisma.lessonResource.update({
            where: { id: id || '' },
            data: updateData,
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
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
                }
            }
        });
        return res.json({
            ...resource,
            uploadedFile: req.uploadedResource ? {
                url: req.uploadedResource.url,
                filename: req.uploadedResource.filename,
                originalName: req.uploadedResource.originalName,
                size: req.uploadedResource.size,
                mimetype: req.uploadedResource.mimetype
            } : undefined
        });
    }
    catch (error) {
        console.error("Error updating lesson resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteLessonResource(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied. Only admins can delete lesson resources" });
        }
        const resource = await prisma_1.prisma.lessonResource.findUnique({
            where: { id: id || '' }
        });
        if (!resource) {
            return res.status(404).json({ message: "Lesson resource not found" });
        }
        if (resource.filePath && resource.filePath.includes('lesson-resource-')) {
            try {
                const { deleteFromMinio } = require('../lib/minio');
                await deleteFromMinio(resource.filePath, 'resources');
                console.log('🗑️ [DEBUG] Archivo eliminado de MinIO:', resource.filePath);
            }
            catch (error) {
                console.error('⚠️ [WARNING] Error deleting file from MinIO:', error);
            }
        }
        else if (resource.filePath) {
            const fs = require('fs');
            if (fs.existsSync(resource.filePath)) {
                fs.unlinkSync(resource.filePath);
            }
        }
        await prisma_1.prisma.lessonResource.delete({
            where: { id: id || '' }
        });
        return res.json({ message: "Lesson resource deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting lesson resource:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=LessonResourceController.js.map