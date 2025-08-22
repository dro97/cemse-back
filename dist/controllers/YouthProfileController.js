"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerYouthProfile = registerYouthProfile;
exports.getYouthProfile = getYouthProfile;
exports.updateYouthProfile = updateYouthProfile;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function registerYouthProfile(req, res) {
    try {
        const { username, password, firstName, lastName, email, phone, address, municipality, department = "Cochabamba", country = "Bolivia", birthDate, gender, documentType, documentNumber, educationLevel, currentInstitution, graduationYear, isStudying, currentDegree, universityName, skills = [], interests = [], parentalConsent = false, parentEmail } = req.body;
        if (!username || !password || !firstName || !lastName || !email || !birthDate || !educationLevel) {
            return res.status(400).json({
                message: "Username, password, firstName, lastName, email, birthDate, and educationLevel are required"
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }
        const existingProfile = await prisma_1.prisma.profile.findFirst({
            where: { email }
        });
        if (existingProfile) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    role: client_1.UserRole.YOUTH,
                    isActive: true
                }
            });
            const profile = await tx.profile.create({
                data: {
                    userId: user.id,
                    firstName,
                    lastName,
                    email,
                    phone,
                    address,
                    municipality,
                    department,
                    country,
                    birthDate: new Date(birthDate),
                    gender,
                    documentType,
                    documentNumber,
                    educationLevel,
                    currentInstitution,
                    graduationYear: graduationYear ? parseInt(graduationYear) : null,
                    isStudying,
                    currentDegree,
                    universityName,
                    skills,
                    interests,
                    role: client_1.UserRole.YOUTH,
                    status: 'ACTIVE',
                    active: true,
                    profileCompletion: 75,
                    parentalConsent,
                    parentEmail,
                    consentDate: parentalConsent ? new Date() : null
                }
            });
            return { user, profile };
        });
        const accessToken = generateAccessToken(result.user);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: result.user.id,
                expiresAt,
            }
        });
        const { password: _, ...userWithoutPassword } = result.user;
        return res.status(201).json({
            user: userWithoutPassword,
            profile: {
                id: result.profile.id,
                firstName: result.profile.firstName,
                lastName: result.profile.lastName,
                email: result.profile.email,
                userId: result.profile.userId,
                educationLevel: result.profile.educationLevel,
                skills: result.profile.skills,
                interests: result.profile.interests
            },
            token: accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error("Youth profile registration error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function getYouthProfile(req, res) {
    try {
        const { userId } = req.params;
        const profile = await prisma_1.prisma.profile.findUnique({
            where: { userId }
        });
        if (!profile) {
            return res.status(404).json({
                message: "Youth profile not found"
            });
        }
        return res.status(200).json(profile);
    }
    catch (error) {
        console.error("Error getting youth profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
async function updateYouthProfile(req, res) {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        delete updateData.username;
        delete updateData.password;
        delete updateData.role;
        const profile = await prisma_1.prisma.profile.update({
            where: { userId },
            data: updateData
        });
        return res.status(200).json(profile);
    }
    catch (error) {
        console.error("Error updating youth profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        type: 'user'
    };
    return require('jsonwebtoken').sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '24h'
    });
}
function generateRefreshToken() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4() + uuidv4();
}
//# sourceMappingURL=YouthProfileController.js.map