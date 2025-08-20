"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInstitutions = listInstitutions;
exports.getInstitution = getInstitution;
exports.createInstitution = createInstitution;
exports.updateInstitution = updateInstitution;
exports.deleteInstitution = deleteInstitution;
exports.listPublicInstitutions = listPublicInstitutions;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function listInstitutions(_req, res) {
    try {
        const institutions = await prisma_1.prisma.institution.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                department: true,
                region: true,
                population: true,
                mayorName: true,
                mayorEmail: true,
                mayorPhone: true,
                address: true,
                website: true,
                isActive: true,
                username: true,
                email: true,
                phone: true,
                institutionType: true,
                customType: true,
                primaryColor: true,
                secondaryColor: true,
                createdAt: true,
                updatedAt: true,
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json(institutions);
    }
    catch (error) {
        console.error("Error listing institutions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getInstitution(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing institution ID" });
        }
        const institution = await prisma_1.prisma.institution.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                department: true,
                region: true,
                population: true,
                mayorName: true,
                mayorEmail: true,
                mayorPhone: true,
                address: true,
                website: true,
                isActive: true,
                username: true,
                email: true,
                phone: true,
                institutionType: true,
                customType: true,
                primaryColor: true,
                secondaryColor: true,
                createdAt: true,
                updatedAt: true,
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
            }
        });
        if (!institution) {
            return res.status(404).json({ message: "Institution not found" });
        }
        return res.json(institution);
    }
    catch (error) {
        console.error("Error getting institution:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function createInstitution(req, res) {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.UserRole.SUPERADMIN) {
            return res.status(403).json({ message: "Only SuperAdmin can create institutions" });
        }
        const { name, department, region, population, mayorName, mayorEmail, mayorPhone, address, website, username, password, email, phone, institutionType, customType, primaryColor, secondaryColor } = req.body;
        if (!name || !department || !username || !password || !email || !institutionType) {
            return res.status(400).json({
                message: "Name, department, username, password, email, and institutionType are required"
            });
        }
        if (!['MUNICIPALITY', 'NGO', 'FOUNDATION', 'OTHER'].includes(institutionType)) {
            return res.status(400).json({
                message: "institutionType must be MUNICIPALITY, NGO, FOUNDATION, or OTHER"
            });
        }
        if (institutionType === 'OTHER' && !customType) {
            return res.status(400).json({
                message: "customType is required when institutionType is OTHER"
            });
        }
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        const institution = await prisma_1.prisma.institution.create({
            data: {
                name,
                department,
                region,
                population: population ? parseInt(population) : null,
                mayorName,
                mayorEmail,
                mayorPhone,
                address,
                website,
                username,
                password: hashedPassword,
                email,
                phone,
                institutionType,
                customType: institutionType === 'OTHER' ? customType : null,
                primaryColor,
                secondaryColor,
                createdBy: user.id,
                isActive: true
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        const { password: _, ...institutionWithoutPassword } = institution;
        return res.status(201).json(institutionWithoutPassword);
    }
    catch (error) {
        console.error("Error creating institution:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Institution with this name, department, username, or email already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function updateInstitution(req, res) {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.UserRole.SUPERADMIN) {
            return res.status(403).json({ message: "Only SuperAdmin can update institutions" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing institution ID" });
        }
        const { name, department, region, population, mayorName, mayorEmail, mayorPhone, address, website, isActive, institutionType, customType, primaryColor, secondaryColor } = req.body;
        if (institutionType && !['MUNICIPALITY', 'NGO', 'OTHER'].includes(institutionType)) {
            return res.status(400).json({
                message: "institutionType must be MUNICIPALITY, NGO, or OTHER"
            });
        }
        if (institutionType === 'OTHER' && !customType) {
            return res.status(400).json({
                message: "customType is required when institutionType is OTHER"
            });
        }
        const institution = await prisma_1.prisma.institution.update({
            where: { id },
            data: {
                name,
                department,
                region,
                population: population ? parseInt(population) : null,
                mayorName,
                mayorEmail,
                mayorPhone,
                address,
                website,
                isActive,
                institutionType,
                customType: institutionType === 'OTHER' ? customType : null,
                primaryColor,
                secondaryColor
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });
        return res.json(institution);
    }
    catch (error) {
        console.error("Error updating institution:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Institution not found" });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Institution with this name and department already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function deleteInstitution(req, res) {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.UserRole.SUPERADMIN) {
            return res.status(403).json({ message: "Only SuperAdmin can delete institutions" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing institution ID" });
        }
        const existingInstitution = await prisma_1.prisma.institution.findUnique({
            where: { id }
        });
        if (!existingInstitution) {
            return res.status(404).json({ message: "Institution not found" });
        }
        await prisma_1.prisma.institution.delete({
            where: { id }
        });
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting institution:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Institution not found" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function listPublicInstitutions(_req, res) {
    try {
        const institutions = await prisma_1.prisma.institution.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                department: true,
                region: true,
                institutionType: true,
                customType: true
            },
            orderBy: [
                { department: 'asc' },
                { name: 'asc' }
            ]
        });
        return res.json(institutions);
    }
    catch (error) {
        console.error("Error listing public institutions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=InstitutionController.js.map