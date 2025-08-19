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
    const newItem = await prisma_1.prisma.courseModule.create({
        data: req.body
    });
    return res.status(201).json(newItem);
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