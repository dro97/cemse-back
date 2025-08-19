"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizQuestions = listQuizQuestions;
exports.getQuizQuestion = getQuizQuestion;
exports.createQuizQuestion = createQuizQuestion;
exports.updateQuizQuestion = updateQuizQuestion;
exports.deleteQuizQuestion = deleteQuizQuestion;
const prisma_1 = require("../lib/prisma");
async function listQuizQuestions(_req, res) {
    const items = await prisma_1.prisma.quizQuestion.findMany();
    return res.json(items);
}
async function getQuizQuestion(req, res) {
    const item = await prisma_1.prisma.quizQuestion.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createQuizQuestion(req, res) {
    const newItem = await prisma_1.prisma.quizQuestion.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateQuizQuestion(req, res) {
    const updated = await prisma_1.prisma.quizQuestion.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteQuizQuestion(req, res) {
    await prisma_1.prisma.quizQuestion.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=QuizQuestionController.js.map