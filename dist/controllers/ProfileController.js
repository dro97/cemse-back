"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProfiles = listProfiles;
exports.getMyProfile = getMyProfile;
exports.getProfile = getProfile;
exports.createProfile = createProfile;
exports.updateProfile = updateProfile;
exports.deleteProfile = deleteProfile;
exports.getExternalProfile = getExternalProfile;
const prisma_1 = require("../lib/prisma");
const server_1 = require("../server");
const client_1 = require("@prisma/client");
async function listProfiles(_, res) {
    const items = await prisma_1.prisma.profile.findMany();
    res.json(items);
}
async function getMyProfile(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId: user.id }
        });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        return res.json(profile);
    }
    catch (error) {
        console.error("Error getting my profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getProfile(req, res) {
    try {
        const user = req.user;
        const profileId = req.params["id"];
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { id: profileId || "" }
        });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        if (user.role === 'SUPERADMIN' || profile.userId === user.id) {
            return res.json(profile);
        }
        return res.status(403).json({ message: "Access denied" });
    }
    catch (error) {
        console.error("Error getting profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createProfile(req, res) {
    const newItem = await prisma_1.prisma.profile.create({
        data: req.body
    });
    server_1.io.emit("profile:created", newItem);
    res.status(201).json(newItem);
}
async function updateProfile(req, res) {
    const updated = await prisma_1.prisma.profile.update({
        where: { id: req.params["id"] || "" },
        data: req.body
    });
    server_1.io.emit("profile:updated", updated);
    res.json(updated);
}
async function deleteProfile(req, res) {
    await prisma_1.prisma.profile.delete({
        where: { id: req.params["id"] || "" }
    });
    server_1.io.emit("profile:deleted", { id: req.params["id"] });
    res.status(204).end();
}
async function getExternalProfile(req, res) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        return res.status(401).json({ message: "API Key requerida" });
    }
    const keyRecord = await prisma_1.prisma.externalApiKey.findUnique({ where: { key: apiKey } });
    if (!keyRecord || !keyRecord.active) {
        return res.status(401).json({ message: "API Key inválida o revocada" });
    }
    const { documentNumber } = req.params;
    if (!documentNumber) {
        return res.status(400).json({ message: "Falta el número de documento" });
    }
    const profile = await prisma_1.prisma.profile.findFirst({
        where: {
            documentNumber: documentNumber,
            OR: [
                { role: client_1.UserRole.YOUTH },
                { role: client_1.UserRole.ADOLESCENTS }
            ]
        }
    });
    if (!profile) {
        return res.status(404).json({ message: "Perfil no encontrado o no es joven/adolescente" });
    }
    return res.json(profile);
}
//# sourceMappingURL=ProfileController.js.map