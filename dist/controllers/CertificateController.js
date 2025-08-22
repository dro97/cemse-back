"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCertificates = listCertificates;
exports.getCertificate = getCertificate;
exports.createCertificate = createCertificate;
exports.updateCertificate = updateCertificate;
exports.deleteCertificate = deleteCertificate;
const prisma_1 = require("../lib/prisma");
async function listCertificates(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        let whereClause = {};
        if (user.type === 'user' && user.role !== 'SUPERADMIN') {
            whereClause.userId = user.id;
        }
        const certificates = await prisma_1.prisma.certificate.findMany({
            where: whereClause,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                issuedAt: 'desc'
            }
        });
        return res.json(certificates);
    }
    catch (error) {
        console.error("Error listing certificates:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getCertificate(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const certificate = await prisma_1.prisma.certificate.findUnique({
            where: { id: id || '' },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }
        if (user.type === 'user' && certificate.userId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.json(certificate);
    }
    catch (error) {
        console.error("Error getting certificate:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createCertificate(req, res) {
    const { title, description, criteria, verificationCode } = req.body;
    if (!title || !description || !criteria || !verificationCode) {
        return res.status(400).json({
            message: "title, description, criteria, and verificationCode are required"
        });
    }
    const newItem = await prisma_1.prisma.certificate.create({
        data: {
            title,
            description,
            criteria,
            verificationCode,
            isActive: true
        }
    });
    return res.status(201).json(newItem);
}
async function updateCertificate(req, res) {
    const updated = await prisma_1.prisma.certificate.update({
        where: { id: req.params['id'] || "" },
        data: req.body
    });
    return res.json(updated);
}
async function deleteCertificate(req, res) {
    await prisma_1.prisma.certificate.delete({
        where: { id: req.params['id'] || "" }
    });
    return res.status(204).end();
}
//# sourceMappingURL=CertificateController.js.map