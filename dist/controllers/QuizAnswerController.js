"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizAnswers = listQuizAnswers;
exports.getQuizAnswer = getQuizAnswer;
exports.createQuizAnswer = createQuizAnswer;
exports.updateQuizAnswer = updateQuizAnswer;
exports.deleteQuizAnswer = deleteQuizAnswer;
const prisma_1 = require("../lib/prisma");
async function listQuizAnswers(_req, res) {
    const items = await prisma_1.prisma.quizAnswer.findMany();
    return res.json(items);
}
async function getQuizAnswer(req, res) {
    const item = await prisma_1.prisma.quizAnswer.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createQuizAnswer(req, res) {
    const newItem = await prisma_1.prisma.quizAnswer.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateQuizAnswer(req, res) {
    const updated = await prisma_1.prisma.quizAnswer.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteQuizAnswer(req, res) {
    await prisma_1.prisma.quizAnswer.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=QuizAnswerController.js.map