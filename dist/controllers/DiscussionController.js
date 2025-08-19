"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDiscussions = listDiscussions;
exports.getDiscussion = getDiscussion;
exports.createDiscussion = createDiscussion;
exports.updateDiscussion = updateDiscussion;
exports.deleteDiscussion = deleteDiscussion;
const prisma_1 = require("../lib/prisma");
async function listDiscussions(_req, res) {
    const items = await prisma_1.prisma.discussion.findMany();
    return res.json(items);
}
async function getDiscussion(req, res) {
    const item = await prisma_1.prisma.discussion.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createDiscussion(req, res) {
    const { lessonId, userId, content, parentId } = req.body;
    if (!lessonId || !userId || !content) {
        return res.status(400).json({ message: "lessonId, userId, and content are required" });
    }
    const newItem = await prisma_1.prisma.discussion.create({
        data: {
            lessonId,
            userId,
            content,
            parentId: parentId || null,
            likes: 0
        }
    });
    return res.status(201).json(newItem);
}
async function updateDiscussion(req, res) {
    const updated = await prisma_1.prisma.discussion.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteDiscussion(req, res) {
    await prisma_1.prisma.discussion.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=DiscussionController.js.map