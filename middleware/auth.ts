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
      return res.status(401).json({ message: "No Bearer token provided." });
    }
    
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if it's a regular user token
    if (payload.role) {
      const user = await prisma.user.findUnique({
        where: { id: payload.id }
      });
      
      if (!user || !user.isActive || user.role !== payload.role) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
      
      req.user = { id: user.id, username: user.username, role: user.role, type: 'user' };
      return next();
    }
    
    // Check if it's a municipality token
    if (payload.type === 'municipality') {
      const municipality = await prisma.municipality.findUnique({
        where: { id: payload.id }
      });
      
      if (!municipality || !municipality.isActive) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
      
      req.user = { id: municipality.id, username: municipality.username, type: 'municipality' };
      return next();
    }
    
    // Check if it's a company token
    if (payload.type === 'company') {
      const company = await prisma.company.findUnique({
        where: { id: payload.id }
      });
      
      if (!company || !company.isActive) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }
      
      req.user = { id: company.id, username: company.username, type: 'company' };
      return next();
    }
    
    return res.status(401).json({ message: "Invalid or expired token." });
  } catch (error) {
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

// Specific entity type middleware functions
export const requireUser = requireEntityType(['user']);
export const requireMunicipality = requireEntityType(['municipality']);
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

// Logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
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