"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuizs = listQuizs;
exports.getQuiz = getQuiz;
exports.createQuiz = createQuiz;
exports.updateQuiz = updateQuiz;
exports.deleteQuiz = deleteQuiz;
const prisma_1 = require("../lib/prisma");
const server_1 = require("../server");
async function listQuizs(_req, res) {
    const items = await prisma_1.prisma.quiz.findMany();
    return res.json(items);
}
async function getQuiz(req, res) {
    const item = await prisma_1.prisma.quiz.findUnique({
        where: { id: req.params["id"] || "" }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createQuiz(req, res) {
    const newItem = await prisma_1.prisma.quiz.create({
        data: req.body
    });
    server_1.io.emit("quiz:created", newItem);
    res.status(201).json(newItem);
}
async function updateQuiz(req, res) {
    const updated = await prisma_1.prisma.quiz.update({
        where: { id: req.params["id"] || "" },
        data: req.body
    });
    server_1.io.emit("quiz:updated", updated);
    res.json(updated);
}
async function deleteQuiz(req, res) {
    await prisma_1.prisma.quiz.delete({
        where: { id: req.params["id"] || "" }
    });
    server_1.io.emit("quiz:deleted", { id: req.params["id"] });
    return res.status(204).end();
}
//# sourceMappingURL=QuizController.js.map