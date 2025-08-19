"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMunicipalities = listMunicipalities;
exports.getMunicipality = getMunicipality;
exports.createMunicipality = createMunicipality;
exports.updateMunicipality = updateMunicipality;
exports.deleteMunicipality = deleteMunicipality;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
async function listMunicipalities(_req, res) {
    try {
        const municipalities = await prisma_1.prisma.municipality.findMany({
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
        return res.json(municipalities);
    }
    catch (error) {
        console.error("Error listing municipalities:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getMunicipality(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing municipality ID" });
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
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
                createdAt: true,
                updatedAt: true,
                creator: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                companies: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        businessSector: true
                    }
                }
            }
        });
        if (!municipality) {
            return res.status(404).json({ message: "Municipality not found" });
        }
        return res.json(municipality);
    }
    catch (error) {
        console.error("Error getting municipality:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function createMunicipality(req, res) {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.UserRole.SUPERADMIN) {
            return res.status(403).json({ message: "Only SuperAdmin can create municipalities" });
        }
        const { name, department, region, population, mayorName, mayorEmail, mayorPhone, address, website, username, password, email, phone } = req.body;
        if (!name || !department || !username || !password || !email) {
            return res.status(400).json({
                message: "Name, department, username, password, and email are required"
            });
        }
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        const municipality = await prisma_1.prisma.municipality.create({
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
        const { password: _, ...municipalityWithoutPassword } = municipality;
        return res.status(201).json(municipalityWithoutPassword);
    }
    catch (error) {
        console.error("Error creating municipality:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Municipality with this name, department, username, or email already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function updateMunicipality(req, res) {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.UserRole.SUPERADMIN) {
            return res.status(403).json({ message: "Only SuperAdmin can update municipalities" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing municipality ID" });
        }
        const { name, department, region, population, mayorName, mayorEmail, mayorPhone, address, website, isActive } = req.body;
        const municipality = await prisma_1.prisma.municipality.update({
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
                isActive
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
        return res.json(municipality);
    }
    catch (error) {
        console.error("Error updating municipality:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Municipality not found" });
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Municipality with this name and department already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function deleteMunicipality(req, res) {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.UserRole.SUPERADMIN) {
            return res.status(403).json({ message: "Only SuperAdmin can delete municipalities" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing municipality ID" });
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
            where: { id },
            include: {
                companies: {
                    where: { isActive: true }
                }
            }
        });
        if (!municipality) {
            return res.status(404).json({ message: "Municipality not found" });
        }
        if (municipality.companies.length > 0) {
            return res.status(400).json({
                message: "Cannot delete municipality with active companies. Deactivate companies first."
            });
        }
        await prisma_1.prisma.municipality.delete({
            where: { id }
        });
        return res.status(204).end();
    }
    catch (error) {
        console.error("Error deleting municipality:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Municipality not found" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=MunicipalityController.js.map