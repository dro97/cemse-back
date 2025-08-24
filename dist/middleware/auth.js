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
            console.log("🔍 AUTH DEBUG: No Bearer token provided");
            return res.status(401).json({ message: "No Bearer token provided." });
        }
        const token = auth.replace("Bearer ", "");
        console.log("🔍 AUTH DEBUG: Token received:", token.substring(0, 20) + "...");
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log("🔍 AUTH DEBUG: Token payload:", {
            id: payload.id,
            username: payload.username,
            type: payload.type,
            role: payload.role
        });
        if (payload.role) {
            console.log("🔍 AUTH DEBUG: Processing as regular user token");
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: payload.id }
            });
            if (!user || !user.isActive || user.role !== payload.role) {
                console.log("🔍 AUTH DEBUG: User validation failed:", {
                    userExists: !!user,
                    userActive: user?.isActive,
                    userRole: user?.role,
                    payloadRole: payload.role
                });
                return res.status(401).json({ message: "Invalid or expired token." });
            }
            console.log("🔍 AUTH DEBUG: User token validated successfully");
            let userType = payload.type || 'user';
            if (!payload.type) {
                if (user.role === 'MUNICIPAL_GOVERNMENTS') {
                    userType = 'municipality';
                }
                else if (user.role === 'COMPANIES') {
                    userType = 'company';
                }
            }
            req.user = { id: user.id, username: user.username, role: user.role, type: userType };
            return next();
        }
        if (payload.type === 'municipality') {
            console.log("🔍 AUTH DEBUG: Processing as municipality token");
            const municipality = await prisma_1.prisma.municipality.findUnique({
                where: { id: payload.id }
            });
            if (!municipality || !municipality.isActive) {
                console.log("🔍 AUTH DEBUG: Municipality validation failed:", {
                    municipalityExists: !!municipality,
                    municipalityActive: municipality?.isActive
                });
                return res.status(401).json({ message: "Invalid or expired token." });
            }
            console.log("🔍 AUTH DEBUG: Municipality token validated successfully");
            req.user = {
                id: municipality.id,
                username: municipality.username,
                type: 'municipality',
                role: payload.role || 'MUNICIPAL_GOVERNMENTS'
            };
            return next();
        }
        if (payload.type === 'company') {
            console.log("🔍 AUTH DEBUG: Processing as company token");
            const company = await prisma_1.prisma.company.findUnique({
                where: { id: payload.id }
            });
            if (!company || !company.isActive) {
                console.log("🔍 AUTH DEBUG: Company validation failed:", {
                    companyExists: !!company,
                    companyActive: company?.isActive
                });
                return res.status(401).json({ message: "Invalid or expired token." });
            }
            console.log("🔍 AUTH DEBUG: Company token validated successfully");
            req.user = {
                id: company.id,
                username: company.username,
                type: 'company',
                role: payload.role || 'COMPANIES'
            };
            return next();
        }
        console.log("🔍 AUTH DEBUG: Token type not recognized:", payload.type);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
    catch (error) {
        console.log("🔍 AUTH DEBUG: Token verification error:", error);
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
        console.log("🔍 ENTITY TYPE DEBUG: Checking entity type middleware");
        console.log("🔍 ENTITY TYPE DEBUG: Allowed types:", allowedTypes);
        console.log("🔍 ENTITY TYPE DEBUG: User object:", req.user);
        if (!req.user) {
            console.log("🔍 ENTITY TYPE DEBUG: No user found in request");
            return res.status(401).json({ message: "Authentication required." });
        }
        console.log("🔍 ENTITY TYPE DEBUG: User type:", req.user.type);
        console.log("🔍 ENTITY TYPE DEBUG: Is type allowed?", req.user.type ? allowedTypes.includes(req.user.type) : false);
        if (!req.user.type || !allowedTypes.includes(req.user.type)) {
            console.log("🔍 ENTITY TYPE DEBUG: Access denied - wrong entity type");
            return res.status(403).json({
                message: `Access denied. Required entity types: ${allowedTypes.join(", ")}`,
                debug: {
                    userType: req.user.type,
                    allowedTypes: allowedTypes,
                    userObject: req.user
                }
            });
        }
        console.log("🔍 ENTITY TYPE DEBUG: Entity type validation passed");
        return next();
    };
}
exports.requireUser = requireEntityType(['user']);
const requireMunicipality = (req, res, next) => {
    console.log("🔍 ENTITY TYPE DEBUG: Checking municipality middleware");
    console.log("🔍 ENTITY TYPE DEBUG: User object:", req.user);
    if (!req.user) {
        console.log("🔍 ENTITY TYPE DEBUG: No user found in request");
        return res.status(401).json({ message: "Authentication required." });
    }
    console.log("🔍 ENTITY TYPE DEBUG: User type:", req.user.type);
    console.log("🔍 ENTITY TYPE DEBUG: User role:", req.user.role);
    const isMunicipalityType = req.user.type === 'municipality';
    const isMunicipalGovernmentRole = req.user.role === client_1.UserRole.MUNICIPAL_GOVERNMENTS;
    console.log("🔍 ENTITY TYPE DEBUG: Is municipality type?", isMunicipalityType);
    console.log("🔍 ENTITY TYPE DEBUG: Is municipal government role?", isMunicipalGovernmentRole);
    if (isMunicipalityType || isMunicipalGovernmentRole) {
        console.log("🔍 ENTITY TYPE DEBUG: Municipality access granted");
        return next();
    }
    console.log("🔍 ENTITY TYPE DEBUG: Access denied - not municipality type or role");
    return res.status(403).json({
        message: "Access denied. Municipality access required.",
        debug: {
            userType: req.user.type,
            userRole: req.user.role,
            userObject: req.user
        }
    });
};
exports.requireMunicipality = requireMunicipality;
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