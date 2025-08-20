"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCertificates = listCertificates;
exports.getCertificate = getCertificate;
exports.createCertificate = createCertificate;
exports.updateCertificate = updateCertificate;
exports.deleteCertificate = deleteCertificate;
const prisma_1 = require("../lib/prisma");
async function listCertificates(_req, res) {
    const items = await prisma_1.prisma.certificate.findMany();
    return res.json(items);
}
async function getCertificate(req, res) {
    const item = await prisma_1.prisma.certificate.findUnique({
        where: { id: req.params['id'] || "" }
    });
    if (!item)
        return res.status(404).json({ message: "Not found" });
    return res.json(item);
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