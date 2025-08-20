"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUser = getUser;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const prisma_1 = require("../lib/prisma");
async function listUsers(_req, res) {
    const users = await prisma_1.prisma.user.findMany();
    return res.json(users);
}
async function getUser(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing id" });
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    return res.json(user);
}
async function createUser(req, res) {
    try {
        const newUser = await prisma_1.prisma.user.create({ data: req.body });
        return res.status(201).json(newUser);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
async function updateUser(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing id" });
    try {
        const updated = await prisma_1.prisma.user.update({ where: { id: id || '' }, data: req.body });
        return res.json(updated);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
async function deleteUser(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing id" });
    try {
        await prisma_1.prisma.user.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
//# sourceMappingURL=UserController.js.map