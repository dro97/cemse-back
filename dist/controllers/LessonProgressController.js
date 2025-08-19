"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLessonProgresss = listLessonProgresss;
exports.getLessonProgress = getLessonProgress;
exports.createLessonProgress = createLessonProgress;
exports.updateLessonProgress = updateLessonProgress;
exports.deleteLessonProgress = deleteLessonProgress;
const prisma_1 = require("../lib/prisma");
async function listLessonProgresss(_req, res) {
    const items = await prisma_1.prisma.lessonProgress.findMany();
    return res.json(items);
}
async function getLessonProgress(req, res) {
    const item = await prisma_1.prisma.lessonProgress.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createLessonProgress(req, res) {
    const newItem = await prisma_1.prisma.lessonProgress.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateLessonProgress(req, res) {
    const updated = await prisma_1.prisma.lessonProgress.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteLessonProgress(req, res) {
    await prisma_1.prisma.lessonProgress.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=LessonProgressController.js.map