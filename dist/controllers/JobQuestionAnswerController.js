"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobQuestionAnswers = listJobQuestionAnswers;
exports.getJobQuestionAnswer = getJobQuestionAnswer;
exports.createJobQuestionAnswer = createJobQuestionAnswer;
exports.updateJobQuestionAnswer = updateJobQuestionAnswer;
exports.deleteJobQuestionAnswer = deleteJobQuestionAnswer;
const prisma_1 = require("../lib/prisma");
async function listJobQuestionAnswers(_req, res) {
    const items = await prisma_1.prisma.jobQuestionAnswer.findMany();
    return res.json(items);
}
async function getJobQuestionAnswer(req, res) {
    const item = await prisma_1.prisma.jobQuestionAnswer.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createJobQuestionAnswer(req, res) {
    const newItem = await prisma_1.prisma.jobQuestionAnswer.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateJobQuestionAnswer(req, res) {
    const updated = await prisma_1.prisma.jobQuestionAnswer.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteJobQuestionAnswer(req, res) {
    await prisma_1.prisma.jobQuestionAnswer.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=JobQuestionAnswerController.js.map