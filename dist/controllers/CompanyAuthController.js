"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyLogin = companyLogin;
exports.getCompanyProfile = getCompanyProfile;
exports.changeCompanyPassword = changeCompanyPassword;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = "supersecretkey";
async function companyLogin(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { username }
        });
        if (!company || !company.isActive) {
            return res.status(401).json({
                message: "Invalid credentials or company is inactive"
            });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, company.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: company.id,
            username: company.username,
            name: company.name,
            businessSector: company.businessSector,
            type: 'company',
            role: 'COMPANIES'
        }, JWT_SECRET, { expiresIn: "24h" });
        const { password: _, ...companyWithoutPassword } = company;
        return res.json({
            company: companyWithoutPassword,
            token,
            message: "Company login successful"
        });
    }
    catch (error) {
        console.error("Company login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function getCompanyProfile(req, res) {
    try {
        const companyId = req.user?.id;
        if (!companyId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                name: true,
                description: true,
                businessSector: true,
                companySize: true,
                website: true,
                email: true,
                phone: true,
                address: true,
                foundedYear: true,
                isActive: true,
                username: true,
                loginEmail: true,
                createdAt: true,
                updatedAt: true,
                municipality: {
                    select: {
                        id: true,
                        name: true,
                        department: true
                    }
                },
                jobOffers: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                },
                profiles: {
                    where: { active: true },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        return res.json({ company });
    }
    catch (error) {
        console.error("Error getting company profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
async function changeCompanyPassword(req, res) {
    try {
        const companyId = req.user?.id;
        if (!companyId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { id: companyId }
        });
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, company.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid current password"
            });
        }
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        await prisma_1.prisma.company.update({
            where: { id: companyId },
            data: { password: hashedNewPassword }
        });
        return res.json({
            message: "Password changed successfully"
        });
    }
    catch (error) {
        console.error("Error changing company password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=CompanyAuthController.js.map