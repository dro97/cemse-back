"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.institutionLogin = institutionLogin;
exports.getInstitutionProfile = getInstitutionProfile;
exports.changeInstitutionPassword = changeInstitutionPassword;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "supersecretkey";
async function institutionLogin(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }
        const institution = await prisma_1.prisma.institution.findUnique({
            where: { username }
        });
        if (!institution || !institution.isActive) {
            return res.status(401).json({
                message: "Invalid credentials or institution is inactive"
            });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, institution.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: institution.id,
            username: institution.username,
            name: institution.name,
            department: institution.department,
            institutionType: institution.institutionType,
            type: 'institution',
            role: 'MUNICIPAL_GOVERNMENTS'
        }, JWT_SECRET, { expiresIn: "24h" });
        const { password: _, ...institutionWithoutPassword } = institution;
        return res.json({
            institution: institutionWithoutPassword,
            token,
            message: "Institution login successful"
        });
    }
    catch (error) {
        console.error("Institution login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getInstitutionProfile(req, res) {
    try {
        const institutionId = req.user?.id;
        if (!institutionId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const institution = await prisma_1.prisma.institution.findUnique({
            where: { id: institutionId },
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
            }
        });
        if (!institution) {
            return res.status(404).json({ message: "Institution not found" });
        }
        return res.json({ institution });
    }
    catch (error) {
        console.error("Error getting institution profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function changeInstitutionPassword(req, res) {
    try {
        const institutionId = req.user?.id;
        if (!institutionId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }
        const institution = await prisma_1.prisma.institution.findUnique({
            where: { id: institutionId }
        });
        if (!institution) {
            return res.status(404).json({ message: "Institution not found" });
        }
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, institution.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid current password" });
        }
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.prisma.institution.update({
            where: { id: institutionId },
            data: { password: hashedNewPassword }
        });
        return res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Error changing institution password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=InstitutionAuthController.js.map