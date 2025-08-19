"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResources = listResources;
exports.getResource = getResource;
exports.createResource = createResource;
exports.updateResource = updateResource;
exports.deleteResource = deleteResource;
const prisma_1 = require("../lib/prisma");
async function listResources(_req, res) {
    const items = await prisma_1.prisma.resource.findMany();
    return res.json(items);
}
async function getResource(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const item = await prisma_1.prisma.resource.findUnique({ where: { id } });
    if (!item)
        return res.status(404).json({ message: "Resource not found" });
    return res.json(item);
}
async function createResource(req, res) {
    const { title, description, type, category, format, thumbnail, author } = req.body;
    if (!title || !description || !type || !category || !format || !thumbnail || !author) {
        return res.status(400).json({
            message: "title, description, type, category, format, thumbnail, and author are required"
        });
    }
    const item = await prisma_1.prisma.resource.create({
        data: {
            title,
            description,
            type,
            category,
            format,
            thumbnail,
            author,
            publishedDate: new Date(),
            downloads: 0,
            rating: 0,
            tags: []
        }
    });
    return res.status(201).json(item);
}
async function updateResource(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const data = req.body;
    try {
        const item = await prisma_1.prisma.resource.update({ where: { id }, data });
        return res.json(item);
    }
    catch {
        return res.status(404).json({ message: "Resource not found" });
    }
}
async function deleteResource(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    try {
        await prisma_1.prisma.resource.delete({ where: { id } });
        return res.status(204).end();
    }
    catch {
        return res.status(404).json({ message: "Resource not found" });
    }
}
//# sourceMappingURL=ResourceController.js.map