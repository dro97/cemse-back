"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNewsComments = listNewsComments;
exports.getNewsComment = getNewsComment;
exports.createNewsComment = createNewsComment;
exports.updateNewsComment = updateNewsComment;
exports.deleteNewsComment = deleteNewsComment;
const prisma_1 = require("../lib/prisma");
async function listNewsComments(_req, res) {
    const items = await prisma_1.prisma.newsComment.findMany();
    return res.json(items);
}
async function getNewsComment(req, res) {
    const item = await prisma_1.prisma.newsComment.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createNewsComment(req, res) {
    const newItem = await prisma_1.prisma.newsComment.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateNewsComment(req, res) {
    const updated = await prisma_1.prisma.newsComment.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteNewsComment(req, res) {
    await prisma_1.prisma.newsComment.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=NewsCommentController.js.map