"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrganizationEntity = exports.requireCompany = exports.requireMunicipality = exports.requireUser = exports.requireOrganization = exports.requireStudent = exports.requireInstructor = exports.requireOngs = exports.requireCentros = exports.requireGobiernos = exports.requireEmpresas = exports.requireAdolescentes = exports.requireJovenes = exports.requireAgent = exports.requireClient = exports.requireAdmin = exports.requireSuperAdmin = void 0;
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
exports.requireEntityType = requireEntityType;
exports.optionalAuth = optionalAuth;
exports.requireOwnership = requireOwnership;
exports.rateLimit = rateLimit;
exports.requestLogger = requestLogger;
exports.errorHandler = errorHandler;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
const JWT_SECRET = "supersecretkey";
async function authenticateToken(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No Bearer token provided." });
        }
        const token = auth.replace("Bearer ", "");
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (payload.role) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.id }
            });
            if (!user || !user.isActive || user.role !== payload.role) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }
            req.user = { id: user.id, username: user.username, role: user.role, type: 'user' };
            return next();
        }
        if (payload.type === 'municipality') {
            const municipality = await prisma_1.prisma.municipality.findUnique({
                where: { id: payload.id }
            });
            if (!municipality || !municipality.isActive) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }
            req.user = { id: municipality.id, username: municipality.username, type: 'municipality' };
            return next();
        }
        if (payload.type === 'company') {
            const company = await prisma_1.prisma.company.findUnique({
                where: { id: payload.id }
            });
            if (!company || !company.isActive) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }
            req.user = { id: company.id, username: company.username, type: 'company' };
            return next();
        }
        return res.status(401).json({ message: "Invalid or expired token." });
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }
        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required roles: ${allowedRoles.join(", ")}`
            });
        }
        return next();
    };
}
exports.requireSuperAdmin = requireRole([client_1.UserRole.SUPERADMIN]);
exports.requireAdmin = requireRole([client_1.UserRole.SUPERADMIN]);
exports.requireClient = requireRole([client_1.UserRole.YOUTH, client_1.UserRole.SUPERADMIN]);
exports.requireAgent = requireRole([client_1.UserRole.ADOLESCENTS, client_1.UserRole.SUPERADMIN]);
exports.requireJovenes = requireRole([client_1.UserRole.YOUTH, client_1.UserRole.SUPERADMIN]);
exports.requireAdolescentes = requireRole([client_1.UserRole.ADOLESCENTS, client_1.UserRole.SUPERADMIN]);
exports.requireEmpresas = requireRole([client_1.UserRole.COMPANIES, client_1.UserRole.SUPERADMIN]);
exports.requireGobiernos = requireRole([client_1.UserRole.MUNICIPAL_GOVERNMENTS, client_1.UserRole.SUPERADMIN]);
exports.requireCentros = requireRole([client_1.UserRole.TRAINING_CENTERS, client_1.UserRole.SUPERADMIN]);
exports.requireOngs = requireRole([client_1.UserRole.NGOS_AND_FOUNDATIONS, client_1.UserRole.SUPERADMIN]);
exports.requireInstructor = requireRole([client_1.UserRole.INSTRUCTOR, client_1.UserRole.SUPERADMIN]);
exports.requireStudent = requireRole([
    client_1.UserRole.YOUTH,
    client_1.UserRole.ADOLESCENTS,
    client_1.UserRole.SUPERADMIN
]);
exports.requireOrganization = requireRole([
    client_1.UserRole.COMPANIES,
    client_1.UserRole.MUNICIPAL_GOVERNMENTS,
    client_1.UserRole.TRAINING_CENTERS,
    client_1.UserRole.NGOS_AND_FOUNDATIONS,
    client_1.UserRole.SUPERADMIN
]);
function requireEntityType(allowedTypes) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }
        if (!req.user.type || !allowedTypes.includes(req.user.type)) {
            return res.status(403).json({
                message: `Access denied. Required entity types: ${allowedTypes.join(", ")}`
            });
        }
        return next();
    };
}
exports.requireUser = requireEntityType(['user']);
exports.requireMunicipality = requireEntityType(['municipality']);
exports.requireCompany = requireEntityType(['company']);
exports.requireOrganizationEntity = requireEntityType(['municipality', 'company']);
async function optionalAuth(req, _res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return next();
        }
        const token = auth.replace("Bearer ", "");
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (payload.role) {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.id }
            });
            if (user && user.isActive && user.role === payload.role) {
                req.user = { id: user.id, username: user.username, role: user.role, type: 'user' };
            }
        }
        if (payload.type === 'municipality') {
            const municipality = await prisma_1.prisma.municipality.findUnique({
                where: { id: payload.id }
            });
            if (municipality && municipality.isActive) {
                req.user = { id: municipality.id, username: municipality.username, type: 'municipality' };
            }
        }
        if (payload.type === 'company') {
            const company = await prisma_1.prisma.company.findUnique({
                where: { id: payload.id }
            });
            if (company && company.isActive) {
                req.user = { id: company.id, username: company.username, type: 'company' };
            }
        }
        return next();
    }
    catch (error) {
        return next();
    }
}
function requireOwnership(resourceModel, idParam = "id") {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }
        if (req.user.role === client_1.UserRole.SUPERADMIN) {
            return next();
        }
        try {
            const resourceId = req.params[idParam];
            if (!resourceId) {
                return res.status(400).json({ message: "Resource ID required." });
            }
            const resource = await prisma_1.prisma[resourceModel].findUnique({
                where: { id: resourceId },
                select: { userId: true, studentId: true, authorId: true }
            });
            if (!resource) {
                return res.status(404).json({ message: "Resource not found." });
            }
            const ownerId = resource.userId || resource.studentId || resource.authorId;
            if (ownerId && ownerId === req.user.id) {
                return next();
            }
            return res.status(403).json({ message: "Access denied. You don't own this resource." });
        }
        catch (error) {
            console.error("Ownership check error:", error);
            return res.status(500).json({ message: "Internal server error." });
        }
    };
}
const rateLimitMap = new Map();
function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress || "unknown";
        const now = Date.now();
        const rateLimit = rateLimitMap.get(key);
        if (!rateLimit || now > rateLimit.resetTime) {
            rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (rateLimit.count >= maxRequests) {
            return res.status(429).json({
                message: "Too many requests. Please try again later."
            });
        }
        rateLimit.count++;
        next();
    };
}
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
}
function errorHandler(err, _req, res, _next) {
    console.error("Error:", err);
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: "Validation error", errors: err.errors });
    }
    if (err.name === "PrismaClientKnownRequestError") {
        return res.status(400).json({ message: "Database error", error: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
}
//# sourceMappingURL=auth.js.map