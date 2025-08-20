"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRefreshTokens = listRefreshTokens;
exports.getRefreshToken = getRefreshToken;
exports.createRefreshToken = createRefreshToken;
exports.updateRefreshToken = updateRefreshToken;
exports.deleteRefreshToken = deleteRefreshToken;
const prisma_1 = require("../lib/prisma");
async function listRefreshTokens(_req, res) {
    const tokens = await prisma_1.prisma.refreshToken.findMany();
    return res.json(tokens);
}
async function getRefreshToken(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing id" });
    const token = await prisma_1.prisma.refreshToken.findUnique({ where: { id } });
    if (!token)
        return res.status(404).json({ error: "RefreshToken not found" });
    return res.json(token);
}
async function createRefreshToken(req, res) {
    try {
        const newToken = await prisma_1.prisma.refreshToken.create({ data: req.body });
        return res.status(201).json(newToken);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
async function updateRefreshToken(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing id" });
    try {
        const updated = await prisma_1.prisma.refreshToken.update({ where: { id: id || '' }, data: req.body });
        return res.json(updated);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
async function deleteRefreshToken(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing id" });
    try {
        await prisma_1.prisma.refreshToken.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
//# sourceMappingURL=RefreshTokenController.js.map