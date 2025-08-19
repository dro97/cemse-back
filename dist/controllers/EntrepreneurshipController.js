"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEntrepreneurships = listEntrepreneurships;
exports.getEntrepreneurship = getEntrepreneurship;
exports.createEntrepreneurship = createEntrepreneurship;
exports.updateEntrepreneurship = updateEntrepreneurship;
exports.deleteEntrepreneurship = deleteEntrepreneurship;
const prisma_1 = require("../lib/prisma");
async function listEntrepreneurships(_req, res) {
    const items = await prisma_1.prisma.entrepreneurship.findMany();
    return res.json(items);
}
async function getEntrepreneurship(req, res) {
    const item = await prisma_1.prisma.entrepreneurship.findUnique({
        where: { id: req.params['id'] || '' }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
}
async function createEntrepreneurship(req, res) {
    const newItem = await prisma_1.prisma.entrepreneurship.create({
        data: req.body
    });
    return res.status(201).json(newItem);
}
async function updateEntrepreneurship(req, res) {
    const updated = await prisma_1.prisma.entrepreneurship.update({
        where: { id: req.params['id'] || '' },
        data: req.body
    });
    return res.json(updated);
}
async function deleteEntrepreneurship(req, res) {
    await prisma_1.prisma.entrepreneurship.delete({
        where: { id: req.params['id'] || '' }
    });
    return res.status(204).end();
}
//# sourceMappingURL=EntrepreneurshipController.js.map