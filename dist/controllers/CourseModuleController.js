"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourseModules = listCourseModules;
exports.getCourseModule = getCourseModule;
exports.createCourseModule = createCourseModule;
exports.updateCourseModule = updateCourseModule;
exports.deleteCourseModule = deleteCourseModule;
const prisma_1 = require("../lib/prisma");
async function listCourseModules(_req, res) {
    const items = await prisma_1.prisma.courseModule.findMany();
    return res.json(items);
}
async function getCourseModule(req, res) {
    const item = await prisma_1.prisma.courseModule.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createCourseModule(req, res) {
    try {
        console.log('🔍 [DEBUG] createCourseModule - req.body:', req.body);
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Request body is required and cannot be empty",
                receivedBody: req.body
            });
        }
        const { title, courseId, orderIndex } = req.body;
        if (!title) {
            return res.status(400).json({ message: "title is required" });
        }
        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }
        if (orderIndex === undefined || orderIndex === null) {
            return res.status(400).json({ message: "orderIndex is required" });
        }
        console.log('📋 [DEBUG] Creating module with data:', { title, courseId, orderIndex });
        const newItem = await prisma_1.prisma.courseModule.create({
            data: {
                title,
                courseId,
                orderIndex,
                description: req.body.description || null,
                estimatedDuration: req.body.estimatedDuration || 0,
                isLocked: req.body.isLocked !== undefined ? req.body.isLocked : false,
                prerequisites: req.body.prerequisites || []
            }
        });
        console.log('✅ [DEBUG] Module created successfully:', newItem.id);
        return res.status(201).json(newItem);
    }
    catch (error) {
        console.error('❌ [DEBUG] Error creating module:', error);
        return res.status(500).json({
            message: "Error creating course module",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function updateCourseModule(req, res) {
    const updated = await prisma_1.prisma.courseModule.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteCourseModule(req, res) {
    await prisma_1.prisma.courseModule.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=CourseModuleController.js.map