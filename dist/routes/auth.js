"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const JWT_SECRET = "supersecretkey";
const REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7;
const router = (0, express_1.Router)();
function generateAccessToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
}
function generateRefreshToken() {
    return (0, uuid_1.v4)() + (0, uuid_1.v4)();
}
router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: "Username, password, and role are required." });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }
        if (!Object.values(client_1.UserRole).includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma_1.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role
            }
        });
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: newUser.id,
                expiresAt,
            }
        });
        return res.status(201).json({
            user: { id: newUser.id, username: newUser.username, role: newUser.role },
            token: accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }
        let user = await prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (user && user.isActive) {
            const isValidPassword = await bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Invalid credentials." });
            }
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken();
            const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
            await prisma_1.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt,
                }
            });
            return res.json({
                token: accessToken,
                refreshToken,
                role: user.role,
                type: 'user',
                user: { id: user.id, username: user.username, role: user.role }
            });
        }
        const municipality = await prisma_1.prisma.municipality.findUnique({
            where: { username }
        });
        if (municipality && municipality.isActive) {
            const isValidPassword = await bcrypt_1.default.compare(password, municipality.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Invalid credentials." });
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
                token,
                type: 'municipality',
                municipality: municipalityWithoutPassword,
                message: "Municipality login successful"
            });
        }
        const company = await prisma_1.prisma.company.findUnique({
            where: { username }
        });
        if (company && company.isActive) {
            const isValidPassword = await bcrypt_1.default.compare(password, company.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Invalid credentials." });
            }
            const token = jsonwebtoken_1.default.sign({
                id: company.id,
                username: company.username,
                name: company.name,
                businessSector: company.businessSector,
                type: 'company'
            }, JWT_SECRET, { expiresIn: "24h" });
            const { password: _, ...companyWithoutPassword } = company;
            return res.json({
                token,
                type: 'company',
                company: companyWithoutPassword,
                message: "Company login successful"
            });
        }
        return res.status(401).json({ message: "Invalid credentials." });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token required." });
        }
        const dbToken = await prisma_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
            return res.status(401).json({ message: "Invalid or expired refresh token." });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: dbToken.userId } });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "User not found or inactive." });
        }
        await prisma_1.prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
        const newRefreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
        await prisma_1.prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt } });
        const accessToken = generateAccessToken(user);
        return res.json({ token: accessToken, refreshToken: newRefreshToken, role: user.role });
    }
    catch (error) {
        console.error("Refresh error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const dbToken = await prisma_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
            if (dbToken && !dbToken.revoked) {
                await prisma_1.prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
            }
        }
        return res.json({ message: "Logged out successfully." });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
async function authMiddleware(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No Bearer token." });
        }
        const token = auth.replace("Bearer ", "");
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.id }
        });
        if (!user || !user.isActive || user.role !== payload.role) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }
        req.user = { id: user.id, username: user.username, role: user.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}
router.get("/me", authMiddleware, (req, res) => {
    return res.json({ user: req.user });
});
router.get("/check-role/:role", authMiddleware, (req, res) => {
    const { role } = req.params;
    const user = req.user;
    if (user && user.role === role) {
        return res.json({ allowed: true });
    }
    else {
        return res.json({ allowed: false });
    }
});
router.get("/users", authMiddleware, async (req, res) => {
    const user = req.user;
    if (user.role !== client_1.UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Super Admin access required." });
    }
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json(users);
    }
    catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.get("/users/:id", authMiddleware, async (req, res) => {
    const user = req.user;
    if (user.role !== client_1.UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Super Admin access required." });
    }
    try {
        const found = await prisma_1.prisma.user.findUnique({
            where: { id: req.params['id'] || '' },
            select: {
                id: true,
                username: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!found)
            return res.status(404).json({ message: "User not found." });
        return res.json(found);
    }
    catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.post("/users", authMiddleware, async (req, res) => {
    const user = req.user;
    if (user.role !== client_1.UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Super Admin access required." });
    }
    try {
        const { username, password, role, isActive } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: "Username, password, and role are required." });
        }
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await prisma_1.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                isActive: isActive !== undefined ? isActive : true
            }
        });
        return res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role, isActive: newUser.isActive });
    }
    catch (error) {
        console.error("Create user error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.put("/users/:id", authMiddleware, async (req, res) => {
    const user = req.user;
    if (user.role !== client_1.UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Super Admin access required." });
    }
    try {
        const { password, role, isActive } = req.body;
        const updateData = {};
        if (password)
            updateData.password = await bcrypt_1.default.hash(password, 10);
        if (role)
            updateData.role = role;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const updated = await prisma_1.prisma.user.update({
            where: { id: req.params['id'] || '' },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json(updated);
    }
    catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
router.delete("/users/:id", authMiddleware, async (req, res) => {
    const user = req.user;
    if (user.role !== client_1.UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Super Admin access required." });
    }
    try {
        await prisma_1.prisma.user.delete({ where: { id: req.params['id'] || '' } });
        return res.json({ message: "User deleted." });
    }
    catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map