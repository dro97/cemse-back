"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizAttempts = listQuizAttempts;
exports.getQuizAttempt = getQuizAttempt;
exports.createQuizAttempt = createQuizAttempt;
exports.updateQuizAttempt = updateQuizAttempt;
exports.deleteQuizAttempt = deleteQuizAttempt;
const prisma_1 = require("../lib/prisma");
async function listQuizAttempts(_req, res) {
    const items = await prisma_1.prisma.quizAttempt.findMany();
    return res.json(items);
}
async function getQuizAttempt(req, res) {
    const item = await prisma_1.prisma.quizAttempt.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createQuizAttempt(req, res) {
    const newItem = await prisma_1.prisma.quizAttempt.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateQuizAttempt(req, res) {
    const updated = await prisma_1.prisma.quizAttempt.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteQuizAttempt(req, res) {
    await prisma_1.prisma.quizAttempt.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=QuizAttemptController.js.map