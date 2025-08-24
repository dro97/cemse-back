import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { UserRole } from "@prisma/client";

const JWT_SECRET = "supersecretkey";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role?: UserRole;
        type?: 'user' | 'municipality' | 'company';
      };
    }
  }
}

// Authentication middleware
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      console.log("🔍 AUTH DEBUG: No Bearer token provided");
      return res.status(401).json({ message: "No Bearer token provided." });
    }
    
    const token = auth.replace("Bearer ", "");
    console.log("🔍 AUTH DEBUG: Token received:", token.substring(0, 20) + "...");
    
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log("🔍 AUTH DEBUG: Token payload:", {
      id: payload.id,
      username: payload.username,
      type: payload.type,
      role: payload.role
    });
    
    // Check if it's a regular user token
    if (payload.role) {
      console.log("🔍 AUTH DEBUG: Processing as regular user token");
      const user = await prisma.user.findUnique({
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
      
      // Preserve original type from token if it exists, otherwise determine based on role
      let userType: 'user' | 'municipality' | 'company' = payload.type || 'user';
      if (!payload.type) {
        if (user.role === 'MUNICIPAL_GOVERNMENTS') {
          userType = 'municipality';
        } else if (user.role === 'COMPANIES') {
          userType = 'company';
        }
      }
      
      req.user = { id: user.id, username: user.username, role: user.role, type: userType };
      return next();
    }
    
    // Check if it's a municipality token
    if (payload.type === 'municipality') {
      console.log("🔍 AUTH DEBUG: Processing as municipality token");
      const municipality = await prisma.municipality.findUnique({
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
        role: payload.role || 'MUNICIPAL_GOVERNMENTS' // Include role from token or default to MUNICIPAL_GOVERNMENTS
      };
      return next();
    }
    
    // Check if it's a company token
    if (payload.type === 'company') {
      console.log("🔍 AUTH DEBUG: Processing as company token");
      const company = await prisma.company.findUnique({
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
        role: payload.role || 'COMPANIES' // Include role from token or default to COMPANIES
      };
      return next();
    }
    
    console.log("🔍 AUTH DEBUG: Token type not recognized:", payload.type);
    return res.status(401).json({ message: "Invalid or expired token." });
  } catch (error) {
    console.log("🔍 AUTH DEBUG: Token verification error:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Role-based authorization middleware
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Specific role middleware functions
export const requireSuperAdmin = requireRole([UserRole.SUPERADMIN]);
export const requireAdmin = requireRole([UserRole.SUPERADMIN]);
export const requireClient = requireRole([UserRole.YOUTH, UserRole.SUPERADMIN]);
export const requireAgent = requireRole([UserRole.ADOLESCENTS, UserRole.SUPERADMIN]);
export const requireJovenes = requireRole([UserRole.YOUTH, UserRole.SUPERADMIN]);
export const requireAdolescentes = requireRole([UserRole.ADOLESCENTS, UserRole.SUPERADMIN]);
export const requireEmpresas = requireRole([UserRole.COMPANIES, UserRole.SUPERADMIN]);
export const requireGobiernos = requireRole([UserRole.MUNICIPAL_GOVERNMENTS, UserRole.SUPERADMIN]);
export const requireCentros = requireRole([UserRole.TRAINING_CENTERS, UserRole.SUPERADMIN]);
export const requireOngs = requireRole([UserRole.NGOS_AND_FOUNDATIONS, UserRole.SUPERADMIN]);
export const requireInstructor = requireRole([UserRole.INSTRUCTOR, UserRole.SUPERADMIN]);

// Student role middleware (YOUTH, ADOLESCENTS)
export const requireStudent = requireRole([
  UserRole.YOUTH, 
  UserRole.ADOLESCENTS, 
  UserRole.SUPERADMIN
]);

// Organization role middleware (COMPANIES, MUNICIPAL_GOVERNMENTS, TRAINING_CENTERS, NGOS_AND_FOUNDATIONS)
export const requireOrganization = requireRole([
  UserRole.COMPANIES,
  UserRole.MUNICIPAL_GOVERNMENTS,
  UserRole.TRAINING_CENTERS,
  UserRole.NGOS_AND_FOUNDATIONS,
  UserRole.SUPERADMIN
]);

// Entity type middleware functions
export function requireEntityType(allowedTypes: ('user' | 'municipality' | 'company')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Specific entity type middleware functions
export const requireUser = requireEntityType(['user']);
export const requireMunicipality = (req: Request, res: Response, next: NextFunction) => {
  console.log("🔍 ENTITY TYPE DEBUG: Checking municipality middleware");
  console.log("🔍 ENTITY TYPE DEBUG: User object:", req.user);
  
  if (!req.user) {
    console.log("🔍 ENTITY TYPE DEBUG: No user found in request");
    return res.status(401).json({ message: "Authentication required." });
  }
  
  console.log("🔍 ENTITY TYPE DEBUG: User type:", req.user.type);
  console.log("🔍 ENTITY TYPE DEBUG: User role:", req.user.role);
  
  // Allow municipality type OR users with MUNICIPAL_GOVERNMENTS role
  const isMunicipalityType = req.user.type === 'municipality';
  const isMunicipalGovernmentRole = req.user.role === UserRole.MUNICIPAL_GOVERNMENTS;
  
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
export const requireCompany = requireEntityType(['company']);
export const requireOrganizationEntity = requireEntityType(['municipality', 'company']);

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return next(); // Continue without user
    }
    
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if it's a regular user token
    if (payload.role) {
      const user = await prisma.user.findUnique({
        where: { id: payload.id }
      });
      
      if (user && user.isActive && user.role === payload.role) {
        req.user = { id: user.id, username: user.username, role: user.role, type: 'user' };
      }
    }
    
    // Check if it's a municipality token
    if (payload.type === 'municipality') {
      const municipality = await prisma.municipality.findUnique({
        where: { id: payload.id }
      });
      
      if (municipality && municipality.isActive) {
        req.user = { id: municipality.id, username: municipality.username, type: 'municipality' };
      }
    }
    
    // Check if it's a company token
    if (payload.type === 'company') {
      const company = await prisma.company.findUnique({
        where: { id: payload.id }
      });
      
      if (company && company.isActive) {
        req.user = { id: company.id, username: company.username, type: 'company' };
      }
    }
    
    return next();
  } catch (error) {
    return next(); // Continue without user
  }
}

// Resource ownership middleware
export function requireOwnership(resourceModel: string, idParam: string = "id") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    
    // Super admin can access everything
    if (req.user.role === UserRole.SUPERADMIN) {
      return next();
    }
    
    try {
      const resourceId = req.params[idParam];
      if (!resourceId) {
        return res.status(400).json({ message: "Resource ID required." });
      }
      
      // Check if user owns the resource
      const resource = await (prisma as any)[resourceModel].findUnique({
        where: { id: resourceId },
        select: { userId: true, studentId: true, authorId: true }
      });
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }
      
      // Check ownership based on common field names
      const ownerId = resource.userId || resource.studentId || resource.authorId;
      
      if (ownerId && ownerId === req.user.id) {
        return next();
      }
      
      return res.status(403).json({ message: "Access denied. You don't own this resource." });
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
}

// Rate limiting middleware (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req as any).ip || (req as any).connection.remoteAddress || "unknown";
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

// Logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${(req as any).originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
}

// Error handling middleware
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("Error:", err);
  
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation error", errors: err.errors });
  }
  
  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({ message: "Database error", error: err.message });
  }
  
  return res.status(500).json({ message: "Internal server error" });
} 