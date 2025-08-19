"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobQuestions = listJobQuestions;
exports.getJobQuestion = getJobQuestion;
exports.createJobQuestion = createJobQuestion;
exports.updateJobQuestion = updateJobQuestion;
exports.deleteJobQuestion = deleteJobQuestion;
const prisma_1 = require("../lib/prisma");
async function listJobQuestions(_req, res) {
    const items = await prisma_1.prisma.jobQuestion.findMany();
    return res.json(items);
}
async function getJobQuestion(req, res) {
    const item = await prisma_1.prisma.jobQuestion.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createJobQuestion(req, res) {
    const newItem = await prisma_1.prisma.jobQuestion.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateJobQuestion(req, res) {
    const updated = await prisma_1.prisma.jobQuestion.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteJobQuestion(req, res) {
    await prisma_1.prisma.jobQuestion.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=JobQuestionController.js.map