"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModuleCertificates = listModuleCertificates;
exports.getModuleCertificate = getModuleCertificate;
exports.createModuleCertificate = createModuleCertificate;
exports.updateModuleCertificate = updateModuleCertificate;
exports.deleteModuleCertificate = deleteModuleCertificate;
const prisma_1 = require("../lib/prisma");
async function listModuleCertificates(req, res) {
    try {
        const user = req.user;
        const { moduleId, studentId } = req.query;
        let whereClause = {};
        if (user && user.type === 'user' && user.role !== 'SUPERADMIN') {
            whereClause.studentId = user.id;
        }
        if (moduleId) {
            whereClause.moduleId = moduleId;
        }
        if (studentId && user.role === 'SUPERADMIN') {
            whereClause.studentId = studentId;
        }
        const certificates = await prisma_1.prisma.moduleCertificate.findMany({
            where: whereClause,
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                },
                student: {
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
        console.error("Error listing module certificates:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getModuleCertificate(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        const certificate = await prisma_1.prisma.moduleCertificate.findUnique({
            where: { id: id || '' },
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                },
                student: {
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
            return res.status(404).json({ message: "Module certificate not found" });
        }
        if (user && user.type === 'user' && certificate.studentId !== user.id && user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.json(certificate);
    }
    catch (error) {
        console.error("Error getting module certificate:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function createModuleCertificate(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and instructors can create certificates" });
        }
        const { moduleId, studentId, certificateUrl, grade } = req.body;
        if (!moduleId || !studentId || !certificateUrl) {
            return res.status(400).json({
                message: "Module ID, student ID, and certificate URL are required"
            });
        }
        const module = await prisma_1.prisma.courseModule.findUnique({
            where: { id: moduleId }
        });
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }
        const student = await prisma_1.prisma.profile.findUnique({
            where: { userId: studentId }
        });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const existingCertificate = await prisma_1.prisma.moduleCertificate.findUnique({
            where: {
                moduleId_studentId: {
                    moduleId,
                    studentId
                }
            }
        });
        if (existingCertificate) {
            return res.status(400).json({ message: "Certificate already exists for this student and module" });
        }
        const certificate = await prisma_1.prisma.moduleCertificate.create({
            data: {
                moduleId,
                studentId,
                certificateUrl,
                grade: grade || null,
                completedAt: new Date()
            },
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return res.status(201).json(certificate);
    }
    catch (error) {
        console.error("Error creating module certificate:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateModuleCertificate(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (!['SUPERADMIN', 'COMPANIES', 'MUNICIPAL_GOVERNMENTS', 'TRAINING_CENTERS', 'NGOS_AND_FOUNDATIONS'].includes(user.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and instructors can update certificates" });
        }
        const existingCertificate = await prisma_1.prisma.moduleCertificate.findUnique({
            where: { id }
        });
        if (!existingCertificate) {
            return res.status(404).json({ message: "Module certificate not found" });
        }
        const { certificateUrl, grade } = req.body;
        let updateData = {};
        if (certificateUrl !== undefined)
            updateData.certificateUrl = certificateUrl;
        if (grade !== undefined)
            updateData.grade = grade;
        const certificate = await prisma_1.prisma.moduleCertificate.update({
            where: { id: id || '' },
            data: updateData,
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return res.json(certificate);
    }
    catch (error) {
        console.error("Error updating module certificate:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function deleteModuleCertificate(req, res) {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({ message: "Access denied. Only admins can delete certificates" });
        }
        const certificate = await prisma_1.prisma.moduleCertificate.findUnique({
            where: { id }
        });
        if (!certificate) {
            return res.status(404).json({ message: "Module certificate not found" });
        }
        await prisma_1.prisma.moduleCertificate.delete({
            where: { id }
        });
        return res.json({ message: "Module certificate deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting module certificate:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
//# sourceMappingURL=ModuleCertificateController.js.map