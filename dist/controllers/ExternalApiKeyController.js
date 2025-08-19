"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeExternalApiKey = exports.listExternalApiKeys = exports.createExternalApiKey = void 0;
const prisma_1 = require("../lib/prisma");
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
function requireSuperAdmin(req, res, next) {
    if (!req.user || req.user.role !== client_1.UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Solo SUPERADMIN puede gestionar API Keys externas" });
    }
    next();
}
exports.createExternalApiKey = [requireSuperAdmin, async (req, res) => {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ message: "Falta el nombre del sistema externo" });
        const key = crypto_1.default.randomBytes(32).toString("hex");
        const apiKey = await prisma_1.prisma.externalApiKey.create({ data: { name, key } });
        return res.status(201).json(apiKey);
    }];
exports.listExternalApiKeys = [requireSuperAdmin, async (_, res) => {
        const keys = await prisma_1.prisma.externalApiKey.findMany();
        return res.json(keys);
    }];
exports.revokeExternalApiKey = [requireSuperAdmin, async (req, res) => {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ message: "Missing id" });
        const apiKey = await prisma_1.prisma.externalApiKey.update({
            where: { id },
            data: { active: false, revokedAt: new Date() }
        }).catch(() => null);
        if (!apiKey)
            return res.status(404).json({ message: "API Key no encontrada" });
        return res.json(apiKey);
    }];
//# sourceMappingURL=ExternalApiKeyController.js.map