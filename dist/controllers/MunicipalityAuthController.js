"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.municipalityLogin = municipalityLogin;
exports.getMunicipalityProfile = getMunicipalityProfile;
exports.changeMunicipalityPassword = changeMunicipalityPassword;
exports.updateMunicipalityProfile = updateMunicipalityProfile;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "supersecretkey";
async function municipalityLogin(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
            where: { username }
        });
        if (!municipality || !municipality.isActive) {
            return res.status(401).json({
                message: "Invalid credentials or municipality is inactive"
            });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, municipality.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: municipality.id,
            username: municipality.username,
            name: municipality.name,
            department: municipality.department,
            type: 'municipality'
        }, JWT_SECRET, { expiresIn: "24h" });
        const { password: _, ...municipalityWithoutPassword } = municipality;
        return res.json({
            municipality: municipalityWithoutPassword,
            token,
            message: "Municipality login successful"
        });
    }
    catch (error) {
        console.error("Municipality login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getMunicipalityProfile(req, res) {
    try {
        const municipalityId = req.user?.id;
        if (!municipalityId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
            where: { id: municipalityId },
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
                companies: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        businessSector: true,
                        companySize: true
                    }
                }
            }
        });
        if (!municipality) {
            return res.status(404).json({ message: "Municipality not found" });
        }
        return res.json({ municipality });
    }
    catch (error) {
        console.error("Error getting municipality profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function changeMunicipalityPassword(req, res) {
    try {
        const municipalityId = req.user?.id;
        if (!municipalityId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
            where: { id: municipalityId }
        });
        if (!municipality) {
            return res.status(404).json({ message: "Municipality not found" });
        }
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, municipality.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid current password"
            });
        }
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.prisma.municipality.update({
            where: { id: municipalityId },
            data: { password: hashedNewPassword }
        });
        return res.json({
            message: "Password changed successfully"
        });
    }
    catch (error) {
        console.error("Error changing municipality password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function updateMunicipalityProfile(req, res) {
    try {
        const municipalityId = req.user?.id;
        if (!municipalityId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { name, department, region, population, mayorName, mayorEmail, mayorPhone, address, website, email, phone, primaryColor, secondaryColor, customType } = req.body;
        if (!name || !department) {
            return res.status(400).json({
                message: "Name and department are required"
            });
        }
        const existingMunicipality = await prisma_1.prisma.municipality.findUnique({
            where: { id: municipalityId }
        });
        if (!existingMunicipality) {
            return res.status(404).json({ message: "Municipality not found" });
        }
        if (name !== existingMunicipality.name || department !== existingMunicipality.department) {
            const duplicateMunicipality = await prisma_1.prisma.municipality.findFirst({
                where: {
                    name,
                    department,
                    id: { not: municipalityId }
                }
            });
            if (duplicateMunicipality) {
                return res.status(400).json({
                    message: "A municipality with this name and department already exists"
                });
            }
        }
        if (email && email !== existingMunicipality.email) {
            const duplicateEmail = await prisma_1.prisma.municipality.findFirst({
                where: {
                    email,
                    id: { not: municipalityId }
                }
            });
            if (duplicateEmail) {
                return res.status(400).json({
                    message: "This email is already registered by another municipality"
                });
            }
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }
        if (mayorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mayorEmail)) {
            return res.status(400).json({
                message: "Invalid mayor email format"
            });
        }
        if (population !== undefined && (population < 0 || !Number.isInteger(population))) {
            return res.status(400).json({
                message: "Population must be a positive integer"
            });
        }
        const updateData = {
            name,
            department,
            region: region || null,
            population: population || null,
            mayorName: mayorName || null,
            mayorEmail: mayorEmail || null,
            mayorPhone: mayorPhone || null,
            address: address || null,
            website: website || null,
            email: email || null,
            phone: phone || null,
            primaryColor: primaryColor || null,
            secondaryColor: secondaryColor || null,
            customType: customType || null
        };
        const updatedMunicipality = await prisma_1.prisma.municipality.update({
            where: { id: municipalityId },
            data: updateData,
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
                primaryColor: true,
                secondaryColor: true,
                customType: true,
                institutionType: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json({
            municipality: updatedMunicipality,
            message: "Municipality profile updated successfully"
        });
    }
    catch (error) {
        console.error("Error updating municipality profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=MunicipalityAuthController.js.map